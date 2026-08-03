"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * One fork, flattened to only what the drawing needs.
 *
 * Deliberately not tied to LineageNode or UnpublishedFork: a project's orbit is
 * built from BOTH — the forks published here, which have votes and a page, and
 * the ones that only exist on GitHub, which don't.
 */
export type OrbitNode = {
  id: string;
  label: string;
  parentId: string | null;
  depth: number;
  /** Ranks the node and sets its brightness. Votes here, stars from GitHub. */
  score: number;
  /** Published forks are solid; GitHub-only ones are hollow. */
  published: boolean;
  meta?: string;
};

const ACCENT = "#34d399";
const GOLD = "#fcd34d";
const px = (n: number) => Math.round(n * 100) / 100;

/**
 * A project's forks, drawn as a system that quietly keeps moving.
 *
 * Rings are generations out from the original. Each ring turns slowly and
 * alternates direction; each fork also breathes on its own sine so nothing
 * moves in lockstep. Animated by writing to the DOM inside one rAF loop — going
 * through React at sixty frames a second would stutter with this many nodes.
 */
export function ForkOrbit({
  nodes,
  size = 150,
  interactive = false,
}: {
  nodes: OrbitNode[];
  size?: number;
  interactive?: boolean;
}) {
  const [hot, setHot] = useState<string | null>(null);
  const nodeRefs = useRef(new Map<string, SVGGElement>());
  const edgeRef = useRef<SVGPathElement | null>(null);
  const frozen = useRef(false);

  const model = useMemo(() => {
    if (nodes.length === 0) return null;
    const ranked = [...nodes].sort((a, b) => b.score - a.score);
    const rank = new Map(ranked.map((n, i) => [n.id, i + 1]));
    const byId = new Map(nodes.map((n) => [n.id, n]));

    const byDepth = new Map<number, OrbitNode[]>();
    for (const n of nodes) {
      const list = byDepth.get(n.depth) ?? [];
      list.push(n);
      byDepth.set(n.depth, list);
    }
    // Fixed angle per fork so siblings hold their spacing while the ring turns.
    const angle = new Map<string, number>();
    for (const list of byDepth.values()) {
      list.forEach((n, i) => angle.set(n.id, (i / list.length) * Math.PI * 2));
    }

    // A per-node signature, so nothing drifts in step with anything else.
    const drift = new Map<string, { phase: number; speed: number; amp: number }>();
    nodes.forEach((n, i) => {
      const h = (i * 2654435761) % 1000;
      drift.set(n.id, { phase: (h / 1000) * Math.PI * 2, speed: 0.3 + (h % 47) / 100, amp: 1.2 + (h % 31) / 18 });
    });

    const maxDepth = Math.max(1, ...nodes.map((n) => n.depth));
    const edges = nodes.filter((n) => n.parentId && byId.has(n.parentId));
    // One generation shouldn't push the only ring hard against the frame.
    const ringR = maxDepth === 1 ? 130 : 180 / maxDepth;
    return { ranked, rank, byId, angle, drift, maxDepth, ringR, edges };
  }, [nodes]);

  useEffect(() => {
    if (!model) return;
    const reduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const { angle, drift, ringR, edges } = model;
    const pos = new Map<string, { x: number; y: number }>();

    const place = (t: number) => {
      for (const n of nodes) {
        const d = drift.get(n.id)!;
        const spin = n.depth === 0 ? 0 : (t * 0.09 * (n.depth % 2 === 0 ? 1 : -1)) / Math.sqrt(n.depth);
        const wobble = n.depth === 0 ? 0 : Math.sin(t * d.speed + d.phase) * d.amp;
        const a = (angle.get(n.id) ?? 0) + spin;
        const r = n.depth * ringR + wobble;
        pos.set(n.id, { x: r * Math.cos(a), y: r * Math.sin(a) });
      }
    };

    const paint = () => {
      for (const n of nodes) {
        const p = pos.get(n.id)!;
        nodeRefs.current.get(n.id)?.setAttribute("transform", `translate(${px(p.x)} ${px(p.y)})`);
      }
      let d = "";
      for (const e of edges) {
        const a = pos.get(e.parentId!)!;
        const b = pos.get(e.id)!;
        d += `M${px(a.x)} ${px(a.y)}L${px(b.x)} ${px(b.y)}`;
      }
      edgeRef.current?.setAttribute("d", d);
    };

    place(0);
    paint();
    if (reduced) return;

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      if (!frozen.current) {
        place((now - start) / 1000);
        paint();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [model, nodes]);

  useEffect(() => {
    frozen.current = hot !== null;
  }, [hot]);

  if (!model) return null;
  const { rank, byId, maxDepth, ringR } = model;
  const shown = hot ? byId.get(hot) : null;

  // #1 is always visibly biggest, stepping down from there.
  const radius = (rk: number) => px(5 + 11 * Math.pow(1 / rk, 0.35));

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="-215 -215 430 430" className="h-full w-full">
        <defs>
          <radialGradient id="fork-orbit-core">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.22" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle r={135} fill="url(#fork-orbit-core)" />

        {Array.from({ length: maxDepth }, (_, i) => (
          <circle key={i} r={px((i + 1) * ringR)} fill="none" stroke="#243029" strokeWidth={0.5} />
        ))}

        <path ref={edgeRef} fill="none" stroke="#25332c" strokeWidth={0.6} />

        {nodes.map((n) => {
          const rk = rank.get(n.id)!;
          const r = radius(rk);
          const isRoot = n.depth === 0;
          const on = hot === n.id;
          return (
            <g
              key={n.id}
              ref={(el) => {
                if (el) nodeRefs.current.set(n.id, el);
              }}
            >
              {isRoot && (
                <circle r={r + 7} fill="none" stroke={ACCENT} strokeWidth={0.8}>
                  <animate attributeName="opacity" values="0.6;0.12;0.6" dur="4s" repeatCount="indefinite" />
                  <animate attributeName="r" values={`${r + 5};${r + 10};${r + 5}`} dur="4s" repeatCount="indefinite" />
                </circle>
              )}
              {rk === 1 && !isRoot && <circle r={r + 3} fill="none" stroke={GOLD} strokeWidth={1.1} />}
              <circle
                r={on ? r + 2.5 : r}
                fill={
                  on
                    ? "#fff"
                    : isRoot
                      ? ACCENT
                      : n.published
                        ? `hsl(152 60% ${40 + Math.min(28, rk <= 5 ? 24 : 8)}%)`
                        : "rgba(52,211,153,0.22)"
                }
                stroke={n.published || isRoot ? "none" : "rgba(52,211,153,0.55)"}
                strokeWidth={0.9}
                onMouseEnter={interactive ? () => setHot(n.id) : undefined}
                onMouseLeave={interactive ? () => setHot(null) : undefined}
                className={interactive ? "cursor-pointer" : ""}
              />
            </g>
          );
        })}
      </svg>

      {interactive && shown && (
        <p className="pointer-events-none absolute inset-x-0 bottom-0 truncate text-center font-mono text-[10px] text-neutral-300">
          {shown.label}
          {shown.meta && <span className="text-neutral-500"> · {shown.meta}</span>}
        </p>
      )}
    </div>
  );
}
