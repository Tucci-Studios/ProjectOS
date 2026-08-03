"use client";

import { useMemo, useRef, useState } from "react";
import { Crown, GitBranch } from "lucide-react";
import type { LineageNode } from "@/lib/queries";
import { build, name, flatten, pathTo, byVotes, maxDepth, type T } from "./tree";

const A = "#34d399"; // accent

const votes = (n: number) => `${n > 0 ? "+" : ""}${n}`;

/** SVG coords get rounded: raw floats differ in the last digit between server
 *  and client and React reports it as a hydration mismatch. */
const px = (n: number) => Math.round(n * 100) / 100;

function Empty() {
  return <p className="px-2 py-6 font-mono text-xs text-neutral-600">No lineage.</p>;
}

/* ─────────── Galaxy — the constellation and the leaderboard, linked ─────────── */

/**
 * The picture answers "what shape is this lineage"; the list answers "what
 * should I actually go look at". Neither is much use alone, so they share a
 * selection: hover a row and its star lights up, click a star and the list
 * jumps to it and traces the path back to the original.
 */
export function VizGalaxy({ nodes }: { nodes: LineageNode[] }) {
  const root = useMemo(() => build(nodes), [nodes]);
  const [hot, setHot] = useState<string | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const [n, setN] = useState(30);
  const rows = useRef<Record<string, HTMLButtonElement | null>>({});

  const model = useMemo(() => {
    if (!root) return null;
    const depth = Math.max(1, maxDepth(root));
    const R = 195 / depth;
    const pos = new Map<string, { x: number; y: number }>();
    const place = (t: T, a0: number, a1: number) => {
      const a = (a0 + a1) / 2;
      const r = t.depth * R;
      pos.set(t.id, { x: px(r * Math.cos(a)), y: px(r * Math.sin(a)) });
      let c0 = a0;
      for (const c of t.children) {
        const span = ((a1 - a0) * c.total) / (t.total - 1 || 1);
        place(c, c0, c0 + span);
        c0 += span;
      }
    };
    place(root, 0, Math.PI * 2);
    const ranked = flatten(root).sort(byVotes);
    return { pos, all: flatten(root), ranked, rank: new Map(ranked.map((t, i) => [t.id, i + 1])) };
  }, [root]);

  if (!root || !model) return <Empty />;

  const active = hot ?? sel;
  const lit = new Set(sel ? pathTo(root, sel).map((t) => t.id) : []);
  const shown = model.ranked.find((t) => t.id === active) ?? null;

  const pick = (id: string) => {
    setSel(id);
    rows.current[id]?.scrollIntoView({ block: "nearest" });
  };

  return (
    <div className="grid gap-px bg-neutral-800 md:grid-cols-[1fr_340px]">
      {/* the picture */}
      <div className="relative flex h-[340px] items-center justify-center bg-neutral-900/40 md:h-[560px]">
        <svg viewBox="-215 -215 430 430" className="h-full">
          {model.all.map((t) => {
            const p = t.parent_id && model.pos.get(t.parent_id);
            const me = model.pos.get(t.id)!;
            if (!p) return null;
            const on = lit.has(t.id);
            return (
              <line
                key={`l-${t.id}`}
                x1={p.x}
                y1={p.y}
                x2={me.x}
                y2={me.y}
                stroke={on ? A : "#2f3a34"}
                strokeWidth={on ? 1.6 : 0.6}
              />
            );
          })}
          {model.all.map((t) => {
            const me = model.pos.get(t.id)!;
            const rank = model.rank.get(t.id)!;
            const r = px(1.8 + Math.min(6, Math.sqrt(Math.max(0, t.like_count)) / 1.6));
            const on = active === t.id;
            return (
              <g key={t.id}>
                {rank <= 3 && <circle cx={me.x} cy={me.y} r={r + 3.5} fill="none" stroke="#fcd34d" strokeWidth={0.9} />}
                <circle
                  cx={me.x}
                  cy={me.y}
                  r={on ? r + 3 : r}
                  fill={on ? "#fff" : t.depth === 0 ? A : `hsl(152 55% ${30 + Math.min(35, t.like_count / 4)}%)`}
                  onMouseEnter={() => setHot(t.id)}
                  onMouseLeave={() => setHot(null)}
                  onClick={() => pick(t.id)}
                  className="cursor-pointer"
                />
              </g>
            );
          })}
        </svg>

        <div className="pointer-events-none absolute bottom-2 left-3 right-3 font-mono text-[11px]">
          {shown ? (
            <span className="text-neutral-300">
              <span className="text-neutral-600">#{model.rank.get(shown.id)}</span>{" "}
              <span className="text-white">{name(shown)}</span> · @{shown.github_login} · {votes(shown.like_count)} ·
              depth {shown.depth}
              {shown.total > 1 && ` · ${shown.total - 1} below`}
            </span>
          ) : (
            <span className="text-neutral-600">
              Size = votes, distance from centre = depth, gold rings = the top 3. Click a star to trace it back.
            </span>
          )}
        </div>
      </div>

      {/* the list */}
      <div className="max-h-[560px] overflow-y-auto bg-neutral-900/60">
        <p className="sticky top-0 z-[1] flex items-center gap-2 border-b border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
          <Crown size={11} className="text-amber-300" aria-hidden /> Ranked
          {sel && (
            <button onClick={() => setSel(null)} className="ml-auto cursor-pointer normal-case text-neutral-500 hover:text-emerald-300">
              clear
            </button>
          )}
        </p>
        {model.ranked.slice(0, n).map((t, i) => {
          const on = active === t.id;
          return (
            <button
              key={t.id}
              ref={(el) => {
                rows.current[t.id] = el;
              }}
              onMouseEnter={() => setHot(t.id)}
              onMouseLeave={() => setHot(null)}
              onClick={() => setSel(t.id)}
              className={`flex w-full cursor-pointer items-start gap-2.5 border-b border-neutral-800/70 px-3 py-2 text-left transition-colors ${
                on ? "bg-emerald-400/10" : "hover:bg-neutral-800/60"
              }`}
            >
              <span className="w-5 shrink-0 pt-px text-right font-mono text-[11px] text-neutral-600">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate font-mono text-[12px] text-neutral-100">{name(t)}</span>
                  {t.children.length > 0 && (
                    <span className="flex shrink-0 items-center gap-0.5 font-mono text-[10px] text-neutral-500">
                      <GitBranch size={9} aria-hidden />
                      {t.children.length}
                    </span>
                  )}
                </span>
                <span className="block truncate font-mono text-[10px] text-neutral-600">
                  {t.depth === 0 ? "the original" : `@${t.github_login} · depth ${t.depth}`}
                </span>
              </span>
              <span
                className="shrink-0 pt-px font-mono text-[12px]"
                style={{ color: t.like_count > 40 ? A : "#71717a" }}
              >
                {votes(t.like_count)}
              </span>
            </button>
          );
        })}
        {n < model.ranked.length && (
          <button
            onClick={() => setN(n + 50)}
            className="w-full cursor-pointer py-2.5 font-mono text-[11px] text-neutral-400 hover:text-emerald-300"
          >
            show 50 more ({model.ranked.length - n} left)
          </button>
        )}
      </div>
    </div>
  );
}
