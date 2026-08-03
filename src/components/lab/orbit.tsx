"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Crown, Pause, Play } from "lucide-react";
import type { LabNode } from "@/lib/lab-data";
import { build, flatten, name, byVotes, pathTo, px, medal, radius, ACCENT, type T } from "./tree";

/**
 * Orbit — the lineage as a solar system that never stops moving.
 *
 * Each generation is a ring around the original, turning slowly and alternating
 * direction so the whole reads as depth rather than one flat spin. Every fork
 * keeps a FIXED angle on its ring; only the ring rotates, so siblings never
 * drift into each other. Hovering holds the system still to read it, clicking
 * traces a fork's path home.
 */
export function Orbit({ nodes }: { nodes: LabNode[] }) {
  const root = useMemo(() => build(nodes), [nodes]);
  const [t, setT] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hot, setHot] = useState<string | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const frame = useRef(0);

  const model = useMemo(() => {
    if (!root) return null;
    const all = flatten(root);
    const ranked = [...all].sort(byVotes);
    const rank = new Map(ranked.map((n, i) => [n.id, i + 1]));

    const byDepth = new Map<number, T[]>();
    for (const n of all) {
      const list = byDepth.get(n.depth) ?? [];
      list.push(n);
      byDepth.set(n.depth, list);
    }
    // Oldest fork sits first on its ring, so the ring reads chronologically.
    const angle = new Map<string, number>();
    for (const list of byDepth.values()) {
      list.sort((a, b) => a.created_at - b.created_at);
      list.forEach((n, i) => angle.set(n.id, (i / list.length) * Math.PI * 2));
    }

    const byId = new Map(all.map((n) => [n.id, n]));
    const depth = Math.max(1, root.maxDepth);
    return { all, rank, angle, byId, depth, ringR: 190 / depth };
  }, [root]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (paused || hot) return;
    let last = performance.now();
    const tick = (now: number) => {
      setT((v) => v + (now - last) / 1000);
      last = now;
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [paused, hot]);

  if (!root || !model) return null;
  const { all, rank, angle, byId, depth, ringR } = model;

  // Outer rings turn slower, and every other one turns the other way.
  const spin = (d: number) => (d === 0 ? 0 : (t * 0.14 * (d % 2 === 0 ? 1 : -1)) / Math.sqrt(d));

  const place = (n: T) => {
    const a = (angle.get(n.id) ?? 0) + spin(n.depth);
    const r = n.depth * ringR;
    return { x: px(r * Math.cos(a)), y: px(r * Math.sin(a)) };
  };

  const active = hot ?? sel;
  const lit = new Set(sel ? pathTo(root, sel).map((n) => n.id) : []);
  const shown = active ? byId.get(active) : null;

  return (
    <div className="relative h-[420px] overflow-hidden bg-neutral-900/40 md:h-[600px]">
      <svg viewBox="-215 -215 430 430" className="h-full w-full">
        {Array.from({ length: depth }, (_, i) => (
          <circle
            key={`ring-${i}`}
            r={px((i + 1) * ringR)}
            fill="none"
            stroke="#2a3630"
            strokeWidth={0.5}
            strokeDasharray="2 4"
          />
        ))}

        {all.map((n) => {
          const parent = n.parent_id ? byId.get(n.parent_id) : null;
          if (!parent) return null;
          const a = place(n);
          const b = place(parent);
          const on = lit.has(n.id);
          return (
            <line
              key={`l-${n.id}`}
              x1={b.x}
              y1={b.y}
              x2={a.x}
              y2={a.y}
              stroke={on ? ACCENT : "#22302a"}
              strokeWidth={on ? 1.4 : 0.5}
            />
          );
        })}

        {all.map((n) => {
          const p = place(n);
          const rk = rank.get(n.id)!;
          const r = radius(rk);
          const on = active === n.id;
          const m = medal(rk);
          const isRoot = n.depth === 0;
          return (
            <g key={n.id}>
              {isRoot && (
                <circle cx={p.x} cy={p.y} r={r + 7} fill="none" stroke={ACCENT} strokeWidth={0.9}>
                  <animate attributeName="opacity" values="0.55;0.12;0.55" dur="3.5s" repeatCount="indefinite" />
                </circle>
              )}
              {m && <circle cx={p.x} cy={p.y} r={r + 3} fill="none" stroke={m} strokeWidth={1.2} />}
              <circle
                cx={p.x}
                cy={p.y}
                r={on ? r + 3 : r}
                fill={on ? "#fff" : isRoot ? ACCENT : `hsl(152 55% ${30 + Math.min(35, n.like_count / 4)}%)`}
                onMouseEnter={() => setHot(n.id)}
                onMouseLeave={() => setHot(null)}
                onClick={() => setSel(sel === n.id ? null : n.id)}
                className="cursor-pointer"
              />
              {(isRoot || rk <= 3 || on) && (
                <text
                  x={p.x}
                  y={p.y + r + 9}
                  textAnchor="middle"
                  fill={isRoot ? ACCENT : on ? "#fff" : "#a1a1aa"}
                  fontSize={9}
                  fontFamily="ui-monospace, monospace"
                  className="pointer-events-none"
                >
                  {isRoot ? `${n.base_name} · ORIGINAL` : name(n)}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <button
        onClick={() => setPaused((v) => !v)}
        aria-label={paused ? "Resume" : "Pause"}
        className="absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900/80 text-neutral-300 backdrop-blur transition hover:border-emerald-400/60 hover:text-emerald-300"
      >
        {paused ? <Play size={15} aria-hidden /> : <Pause size={15} aria-hidden />}
      </button>

      <div className="pointer-events-none absolute bottom-3 left-4 right-4 font-mono text-[11px]">
        {shown ? (
          <span className="text-neutral-300">
            {rank.get(shown.id) === 1 && <Crown size={11} className="mr-1 inline text-amber-300" aria-hidden />}
            <span className="text-white">{name(shown)}</span> · @{shown.github_login} ·{" "}
            {shown.like_count > 0 ? "+" : ""}
            {shown.like_count} · generation {shown.depth}
            {shown.total > 1 && ` · ${shown.total - 1} below`}
          </span>
        ) : (
          <span className="text-neutral-600">
            Each ring is a generation. Hover to hold it still, click to trace a fork home.
          </span>
        )}
      </div>
    </div>
  );
}
