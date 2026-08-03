"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import type { LabNode } from "@/lib/lab-data";
import { build, flatten, name, byVotes, px, medal, radius, ACCENT, type T } from "./tree";

/**
 * Growth — press play and watch the lineage actually happen.
 *
 * Every fork has a date, so the tree can be replayed in the order it was really
 * made: the original alone, then the first fork, then forks of forks. New
 * arrivals flash and settle. This is the view someone screenshots — it turns a
 * static diagram into the story of a project spreading.
 */
export function Growth({ nodes }: { nodes: LabNode[] }) {
  const root = useMemo(() => build(nodes), [nodes]);
  const [cursor, setCursor] = useState(1); // how many forks exist, in date order
  const [playing, setPlaying] = useState(true);
  const frame = useRef(0);
  const acc = useRef(0);

  const model = useMemo(() => {
    if (!root) return null;
    const all = flatten(root);
    // Chronological, so replay matches the real order of events.
    const order = [...all].sort((a, b) => a.created_at - b.created_at);
    const ranked = [...all].sort(byVotes);
    const rank = new Map(ranked.map((n, i) => [n.id, i + 1]));
    const byId = new Map(all.map((n) => [n.id, n]));

    // Fixed layout: a node never moves once placed, so replay doesn't reshuffle
    // what's already on screen.
    const byDepth = new Map<number, T[]>();
    for (const n of all) {
      const list = byDepth.get(n.depth) ?? [];
      list.push(n);
      byDepth.set(n.depth, list);
    }
    const pos = new Map<string, { x: number; y: number }>();
    const depth = Math.max(1, root.maxDepth);
    const ringR = 190 / depth;
    for (const list of byDepth.values()) {
      list.sort((a, b) => a.created_at - b.created_at);
      list.forEach((n, i) => {
        const a = (i / list.length) * Math.PI * 2;
        const r = n.depth * ringR;
        pos.set(n.id, { x: px(r * Math.cos(a)), y: px(r * Math.sin(a)) });
      });
    }
    return { all, order, rank, byId, pos, depth, ringR };
  }, [root]);

  const total = model?.order.length ?? 0;

  useEffect(() => {
    if (!playing || !total) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCursor(total);
      setPlaying(false);
      return;
    }
    let last = performance.now();
    const tick = (now: number) => {
      acc.current += (now - last) / 1000;
      last = now;
      // Big trees replay faster, so the whole thing always lands in ~12 seconds.
      const perSecond = Math.max(3, total / 12);
      const step = Math.floor(acc.current * perSecond);
      if (step > 0) {
        acc.current -= step / perSecond;
        setCursor((c) => {
          const next = c + step;
          if (next >= total) {
            setPlaying(false);
            return total;
          }
          return next;
        });
      }
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [playing, total]);

  if (!root || !model) return null;
  const { order, rank, byId, pos, depth, ringR } = model;

  const visible = order.slice(0, cursor);
  const visibleIds = new Set(visible.map((n) => n.id));
  const newest = visible[visible.length - 1];
  const day = 86_400;
  const elapsed = newest ? Math.round((newest.created_at - order[0].created_at) / day) : 0;

  const restart = () => {
    setCursor(1);
    acc.current = 0;
    setPlaying(true);
  };

  return (
    <div className="bg-neutral-900/40">
      <div className="relative h-[380px] overflow-hidden md:h-[520px]">
        <svg viewBox="-215 -215 430 430" className="h-full w-full">
          {Array.from({ length: depth }, (_, i) => (
            <circle
              key={`ring-${i}`}
              r={px((i + 1) * ringR)}
              fill="none"
              stroke="#243029"
              strokeWidth={0.5}
              strokeDasharray="2 5"
            />
          ))}

          {visible.map((n) => {
            const parent = n.parent_id ? byId.get(n.parent_id) : null;
            if (!parent || !visibleIds.has(parent.id)) return null;
            const a = pos.get(n.id)!;
            const b = pos.get(parent.id)!;
            return <line key={`l-${n.id}`} x1={b.x} y1={b.y} x2={a.x} y2={a.y} stroke="#2a3a33" strokeWidth={0.6} />;
          })}

          {visible.map((n, i) => {
            const p = pos.get(n.id)!;
            const rk = rank.get(n.id)!;
            const r = radius(rk);
            const isRoot = n.depth === 0;
            const isNew = i >= visible.length - 3; // the last few flash in
            const m = medal(rk);
            return (
              <g key={n.id}>
                {m && <circle cx={p.x} cy={p.y} r={r + 3} fill="none" stroke={m} strokeWidth={1.1} />}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={r}
                  fill={isRoot ? ACCENT : `hsl(152 55% ${30 + Math.min(35, n.like_count / 4)}%)`}
                />
                {isNew && (
                  <circle cx={p.x} cy={p.y} r={r} fill="none" stroke="#fff" strokeWidth={1.2}>
                    <animate attributeName="r" from={r} to={r + 14} dur="0.9s" fill="freeze" />
                    <animate attributeName="opacity" from="0.9" to="0" dur="0.9s" fill="freeze" />
                  </circle>
                )}
                {isRoot && (
                  <text
                    x={p.x}
                    y={p.y + r + 10}
                    textAnchor="middle"
                    fill={ACCENT}
                    fontSize={9}
                    fontFamily="ui-monospace, monospace"
                  >
                    {n.base_name} · ORIGINAL
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* the running tally, big enough to be the thing you screenshot */}
        <div className="pointer-events-none absolute left-4 top-4">
          <p className="font-mono text-[40px] font-bold leading-none text-white tabular-nums">{cursor - 1}</p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400">
            fork{cursor - 1 === 1 ? "" : "s"}
          </p>
          <p className="mt-2 font-mono text-[11px] text-neutral-500">
            day {elapsed} · generation {newest?.depth ?? 0}
          </p>
        </div>

        {newest && cursor > 1 && (
          <div className="pointer-events-none absolute bottom-4 left-4 right-4 font-mono text-[11px] text-neutral-400">
            <span className="text-white">{name(newest)}</span> by @{newest.github_login}
            {newest.change_summary && <span className="text-neutral-500"> — {newest.change_summary}</span>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-neutral-800 px-4 py-3">
        <button
          onClick={() => (cursor >= total ? restart() : setPlaying((v) => !v))}
          aria-label={cursor >= total ? "Replay" : playing ? "Pause" : "Play"}
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-emerald-400/50 bg-emerald-400/10 text-emerald-300 outline-none transition hover:bg-emerald-400/20 focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          {cursor >= total ? <RotateCcw size={15} aria-hidden /> : playing ? <Pause size={15} aria-hidden /> : <Play size={15} aria-hidden />}
        </button>

        <input
          type="range"
          min={1}
          max={total}
          value={cursor}
          onChange={(e) => {
            setPlaying(false);
            setCursor(Number(e.target.value));
          }}
          aria-label="Scrub through the lineage"
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-neutral-700 accent-emerald-400"
        />

        <span className="shrink-0 font-mono text-[11px] tabular-nums text-neutral-500">
          {cursor}/{total}
        </span>
      </div>
    </div>
  );
}
