"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Crown, GitBranch, Plus, Minus, Maximize2, Sparkle } from "lucide-react";
import type { LineageNode } from "@/lib/queries";
import { build, name, flatten, pathTo, byVotes, maxDepth, type T } from "./tree";

const A = "#34d399"; // accent
const GOLD = "#fcd34d";
const SILVER = "#cbd5e1";
const BRONZE = "#d4a373";

const votes = (n: number) => `${n > 0 ? "+" : ""}${n}`;

/** SVG coords get rounded: raw floats differ in the last digit between server
 *  and client and React reports it as a hydration mismatch. */
const px = (n: number) => Math.round(n * 100) / 100;

/** Podium colour for the top three, null for everyone else. */
const medal = (rank: number) => (rank === 1 ? GOLD : rank === 2 ? SILVER : rank === 3 ? BRONZE : null);

/**
 * Planet size comes from RANK, not raw votes: #1 is always visibly the biggest
 * and it steps down from there. Raw votes would make the top ten look identical
 * whenever their scores happen to be close.
 */
const radius = (rank: number) => px(4 + 12 * Math.pow(1 / rank, 0.35));

const VIEW = 430; // viewBox is -215..215 in both axes
const MIN_K = 0.6;
const MAX_K = 12;

function Empty() {
  return <p className="px-2 py-6 font-mono text-xs text-neutral-600">No lineage.</p>;
}

/* ─────────── Galaxy — the constellation and the leaderboard, linked ─────────── */

/**
 * The picture answers "what shape is this lineage"; the list answers "what
 * should I actually go look at". Neither is much use alone, so they share a
 * selection: hover a row and its planet lights up, click a planet and the list
 * jumps to it and traces the path back to the original.
 */
export function VizGalaxy({ nodes }: { nodes: LineageNode[] }) {
  const root = useMemo(() => build(nodes), [nodes]);
  const [hot, setHot] = useState<string | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const [n, setN] = useState(30);

  // pan/zoom — k is scale, (x,y) is the translation in viewBox units
  const [view, setView] = useState({ k: 1, x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
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
    const all = flatten(root);
    const ranked = [...all].sort(byVotes);

    // How much room each planet has: distance to its nearest neighbour. Labels
    // only render once zoom has pulled that gap far enough apart to read.
    const gap = new Map<string, number>();
    for (const a of all) {
      const pa = pos.get(a.id)!;
      let best = Infinity;
      for (const b of all) {
        if (a.id === b.id) continue;
        const pb = pos.get(b.id)!;
        const d = Math.hypot(pa.x - pb.x, pa.y - pb.y);
        if (d < best) best = d;
      }
      gap.set(a.id, best);
    }
    return { pos, all, ranked, gap, rank: new Map(ranked.map((t, i) => [t.id, i + 1])) };
  }, [root]);

  /** Screen pixels -> viewBox units. */
  const toView = useCallback((clientX: number, clientY: number) => {
    const r = svgRef.current!.getBoundingClientRect();
    const side = Math.min(r.width, r.height); // preserveAspectRatio keeps it square
    return {
      x: ((clientX - r.left - (r.width - side) / 2) / side) * VIEW - VIEW / 2,
      y: ((clientY - r.top - (r.height - side) / 2) / side) * VIEW - VIEW / 2,
    };
  }, []);

  const zoomAt = useCallback(
    (factor: number, atX: number, atY: number) => {
      setView((v) => {
        const k = Math.min(MAX_K, Math.max(MIN_K, v.k * factor));
        if (k === v.k) return v;
        // keep the point under the cursor pinned
        return { k, x: atX - ((atX - v.x) * k) / v.k, y: atY - ((atY - v.y) * k) / v.k };
      });
    },
    [],
  );

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault(); // otherwise the page scrolls while you zoom
      const p = toView(e.clientX, e.clientY);
      zoomAt(e.deltaY < 0 ? 1.16 : 1 / 1.16, p.x, p.y);
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [toView, zoomAt]);

  if (!root || !model) return <Empty />;

  const active = hot ?? sel;
  const lit = new Set(sel ? pathTo(root, sel).map((t) => t.id) : []);
  const shown = model.ranked.find((t) => t.id === active) ?? null;
  const inv = 1 / view.k; // counter-scale so labels and badges stay readable

  const pick = (id: string) => {
    setSel(id);
    rows.current[id]?.scrollIntoView({ block: "nearest" });
  };

  const btn =
    "flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-700 bg-neutral-900/80 text-neutral-300 outline-none backdrop-blur transition hover:border-emerald-400/60 hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-40";

  return (
    <div className="grid gap-px bg-neutral-800 md:grid-cols-[1fr_340px]">
      {/* the picture */}
      <div className="relative h-[340px] overflow-hidden bg-neutral-900/40 md:h-[560px]">
        <svg
          ref={svgRef}
          viewBox={`${-VIEW / 2} ${-VIEW / 2} ${VIEW} ${VIEW}`}
          className={`h-full w-full touch-none ${drag.current ? "cursor-grabbing" : "cursor-grab"}`}
          onPointerDown={(e) => {
            const p = toView(e.clientX, e.clientY);
            drag.current = { x: p.x, y: p.y, vx: view.x, vy: view.y };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            const p = toView(e.clientX, e.clientY);
            setView((v) => ({ ...v, x: drag.current!.vx + (p.x - drag.current!.x), y: drag.current!.vy + (p.y - drag.current!.y) }));
          }}
          onPointerUp={(e) => {
            drag.current = null;
            e.currentTarget.releasePointerCapture(e.pointerId);
          }}
        >
          <g transform={`translate(${px(view.x)} ${px(view.y)}) scale(${px(view.k)})`}>
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
                  strokeWidth={(on ? 1.6 : 0.6) * inv}
                />
              );
            })}

            {model.all.map((t) => {
              const me = model.pos.get(t.id)!;
              const rank = model.rank.get(t.id)!;
              const r = radius(rank);
              const on = active === t.id;
              const m = medal(rank);
              const isRoot = t.depth === 0;
              return (
                <g key={t.id}>
                  {/* the original wears an orbit ring so it reads as the source */}
                  {isRoot && (
                    <>
                      <circle cx={me.x} cy={me.y} r={r + 7} fill="none" stroke={A} strokeWidth={1.1 * inv} opacity={0.55} />
                      <circle cx={me.x} cy={me.y} r={r + 12} fill="none" stroke={A} strokeWidth={0.6 * inv} opacity={0.25} />
                    </>
                  )}
                  {m && <circle cx={me.x} cy={me.y} r={r + 3} fill="none" stroke={m} strokeWidth={1.3 * inv} />}
                  <circle
                    cx={me.x}
                    cy={me.y}
                    r={on ? r + 2.5 : r}
                    fill={on ? "#fff" : isRoot ? A : `hsl(152 55% ${30 + Math.min(35, t.like_count / 4)}%)`}
                    onMouseEnter={() => setHot(t.id)}
                    onMouseLeave={() => setHot(null)}
                    onClick={() => pick(t.id)}
                    className="cursor-pointer"
                  />

                  {/* podium badges — crown for #1, numeral for #2 and #3 */}
                  {rank === 1 && (
                    <path
                      d="M-7 3.2 L-7 -3.4 L-3.4 0.4 L0 -5.2 L3.4 0.4 L7 -3.4 L7 3.2 Z"
                      fill={GOLD}
                      transform={`translate(${me.x} ${me.y - r - 8 * inv}) scale(${px(inv)})`}
                      className="pointer-events-none"
                    />
                  )}
                  {(rank === 2 || rank === 3) && (
                    <text
                      x={me.x}
                      y={me.y - r - 5 * inv}
                      textAnchor="middle"
                      fill={m!}
                      fontSize={11 * inv}
                      fontWeight="bold"
                      fontFamily="ui-monospace, monospace"
                      className="pointer-events-none"
                    >
                      {rank}
                    </text>
                  )}

                  {/* names appear once you've zoomed in, plus always for the original */}
                  {(isRoot || rank <= 3 || on || (model.gap.get(t.id) ?? 0) * view.k >= 26) && (
                    <text
                      x={me.x}
                      y={me.y + r + 9 * inv}
                      textAnchor="middle"
                      fill={isRoot ? A : on ? "#fff" : "#a1a1aa"}
                      fontSize={9.5 * inv}
                      fontFamily="ui-monospace, monospace"
                      className="pointer-events-none"
                    >
                      {isRoot ? `${t.base_name} · ORIGINAL` : name(t)}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* zoom controls */}
        <div className="absolute right-2 top-2 flex flex-col gap-1">
          <button onClick={() => zoomAt(1.35, 0, 0)} aria-label="Zoom in" disabled={view.k >= MAX_K} className={btn}>
            <Plus size={15} aria-hidden />
          </button>
          <button onClick={() => zoomAt(1 / 1.35, 0, 0)} aria-label="Zoom out" disabled={view.k <= MIN_K} className={btn}>
            <Minus size={15} aria-hidden />
          </button>
          <button onClick={() => setView({ k: 1, x: 0, y: 0 })} aria-label="Reset view" className={btn}>
            <Maximize2 size={14} aria-hidden />
          </button>
        </div>
        <span className="pointer-events-none absolute right-2 bottom-2 rounded bg-neutral-900/70 px-1.5 py-0.5 font-mono text-[10px] text-neutral-500">
          {view.k.toFixed(1)}×
        </span>

        <div className="pointer-events-none absolute bottom-2 left-3 right-16 font-mono text-[11px]">
          {shown ? (
            <span className="text-neutral-300">
              <span className="text-neutral-600">#{model.rank.get(shown.id)}</span>{" "}
              <span className="text-white">{name(shown)}</span> · @{shown.github_login} · {votes(shown.like_count)} ·
              depth {shown.depth}
              {shown.total > 1 && ` · ${shown.total - 1} below`}
            </span>
          ) : (
            <span className="text-neutral-600">Scroll to zoom, drag to move. Biggest planet = most votes.</span>
          )}
        </div>
      </div>

      {/* the list */}
      <div className="max-h-[560px] overflow-y-auto bg-neutral-900/60">
        <p className="sticky top-0 z-[1] flex items-center gap-2 border-b border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
          <Crown size={11} style={{ color: GOLD }} aria-hidden /> Ranked
          {sel && (
            <button
              onClick={() => setSel(null)}
              className="ml-auto cursor-pointer normal-case text-neutral-500 hover:text-emerald-300"
            >
              clear
            </button>
          )}
        </p>
        {model.ranked.slice(0, n).map((t, i) => {
          const rank = i + 1;
          const on = active === t.id;
          const m = medal(rank);
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
              <span className="flex w-5 shrink-0 justify-end pt-px">
                {rank === 1 ? (
                  <Crown size={13} style={{ color: GOLD }} aria-hidden />
                ) : (
                  <span className="font-mono text-[11px]" style={{ color: m ?? "#525252" }}>
                    {rank}
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate font-mono text-[12px] text-neutral-100">{name(t)}</span>
                  {t.depth === 0 && <Sparkle size={10} style={{ color: A }} className="shrink-0" aria-hidden />}
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
