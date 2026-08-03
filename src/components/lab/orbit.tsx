"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Crown } from "lucide-react";
import type { LabNode } from "@/lib/lab-data";
import { build, flatten, name, byVotes, pathTo, medal, radius, ACCENT, type T } from "./tree";

/**
 * A lineage that is simply alive — no play button, no scrubber, nothing to
 * operate. It drifts on its own and keeps drifting.
 *
 * Three motions layered so it never looks like one mechanical spin:
 *   · each generation's ring turns slowly, alternating direction outwards
 *   · every fork breathes on its own sine, with its own phase and speed
 *   · light travels down the branches, parent to child, forever
 *
 * The whole thing is animated by writing straight to the DOM inside one rAF
 * loop. Four hundred nodes re-rendering through React sixty times a second
 * would stutter; moving them by hand costs one attribute write each.
 */
export function Orbit({
  nodes,
  height = 620,
  chrome = true,
  labels = true,
  dim = 1,
}: {
  nodes: LabNode[];
  /** Rendered height in px. The drawing scales to fit whatever it's given. */
  height?: number;
  /** Show the hover readout and let it be clicked. Off for decorative use. */
  chrome?: boolean;
  labels?: boolean;
  /** Overall opacity, for when it sits behind other content. */
  dim?: number;
}) {
  const root = useMemo(() => build(nodes), [nodes]);
  const [hot, setHot] = useState<string | null>(null);
  const [sel, setSel] = useState<string | null>(null);

  const nodeRefs = useRef(new Map<string, SVGGElement>());
  const edgeRef = useRef<SVGPathElement | null>(null);
  const litRef = useRef<SVGPathElement | null>(null);
  const sparkRefs = useRef<SVGCircleElement[]>([]);
  const frozen = useRef(false);

  const model = useMemo(() => {
    if (!root) return null;
    const all = flatten(root);
    const ranked = [...all].sort(byVotes);
    const rank = new Map(ranked.map((n, i) => [n.id, i + 1]));
    const byId = new Map(all.map((n) => [n.id, n]));

    const byDepth = new Map<number, T[]>();
    for (const n of all) {
      const list = byDepth.get(n.depth) ?? [];
      list.push(n);
      byDepth.set(n.depth, list);
    }
    // Fixed angle per fork, so siblings hold their spacing while the ring turns.
    const angle = new Map<string, number>();
    for (const list of byDepth.values()) {
      list.sort((a, b) => a.created_at - b.created_at);
      list.forEach((n, i) => angle.set(n.id, (i / list.length) * Math.PI * 2));
    }

    // A per-node signature, so nothing moves in lockstep with anything else.
    const drift = new Map<string, { phase: number; speed: number; amp: number }>();
    all.forEach((n, i) => {
      const h = (i * 2654435761) % 1000; // cheap deterministic hash
      drift.set(n.id, {
        phase: (h / 1000) * Math.PI * 2,
        speed: 0.35 + (h % 47) / 90,
        amp: 1.6 + (h % 31) / 14,
      });
    });

    const depth = Math.max(1, root.maxDepth);
    const ringR = 188 / depth;

    // Light runs down the strongest branches only — every edge at once is noise.
    const edges = all.filter((n) => n.parent_id).map((n) => ({ from: n.parent_id!, to: n.id }));
    const sparkEdges = [...all]
      .filter((n) => n.parent_id)
      .sort((a, b) => b.best - a.best)
      .slice(0, 26)
      .map((n) => ({ from: n.parent_id!, to: n.id, offset: ((n.id.length * 37) % 100) / 100 }));

    return { all, ranked, rank, byId, angle, drift, depth, ringR, edges, sparkEdges };
  }, [root]);

  useEffect(() => {
    if (!model) return;
    const reduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const { all, byId, angle, drift, ringR, edges, sparkEdges } = model;
    const pos = new Map<string, { x: number; y: number }>();

    const place = (t: number) => {
      for (const n of all) {
        const d = drift.get(n.id)!;
        const spin = n.depth === 0 ? 0 : (t * 0.1 * (n.depth % 2 === 0 ? 1 : -1)) / Math.sqrt(n.depth);
        // Breathing pushes each fork gently in and out along its own radius.
        const wobble = n.depth === 0 ? 0 : Math.sin(t * d.speed + d.phase) * d.amp;
        const a = (angle.get(n.id) ?? 0) + spin + Math.sin(t * d.speed * 0.6 + d.phase) * 0.012;
        const r = n.depth * ringR + wobble;
        pos.set(n.id, { x: r * Math.cos(a), y: r * Math.sin(a) });
      }
    };

    const paint = () => {
      for (const n of all) {
        const p = pos.get(n.id)!;
        const el = nodeRefs.current.get(n.id);
        if (el) el.setAttribute("transform", `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`);
      }
      // Every edge in one path — one write instead of four hundred.
      let d = "";
      for (const e of edges) {
        const a = pos.get(e.from)!;
        const b = pos.get(e.to)!;
        d += `M${a.x.toFixed(1)} ${a.y.toFixed(1)}L${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
      }
      edgeRef.current?.setAttribute("d", d);
    };

    // Static first paint, so the tree is there before any motion starts.
    place(0);
    paint();
    if (reduced) return;

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      if (!frozen.current) {
        const t = (now - start) / 1000;
        place(t);
        paint();

        // Light sliding from parent to child, looping forever.
        sparkEdges.forEach((e, i) => {
          const el = sparkRefs.current[i];
          if (!el) return;
          const a = pos.get(e.from)!;
          const b = pos.get(e.to)!;
          const k = (t * 0.28 + e.offset) % 1;
          el.setAttribute("cx", (a.x + (b.x - a.x) * k).toFixed(2));
          el.setAttribute("cy", (a.y + (b.y - a.y) * k).toFixed(2));
          // Fade in and out at the ends so nothing pops.
          el.setAttribute("opacity", (Math.sin(k * Math.PI) * 0.85).toFixed(2));
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [model]);

  // Hovering settles the system so you can actually read what you're pointing at.
  useEffect(() => {
    frozen.current = hot !== null;
  }, [hot]);

  // Keep the traced path in sync without re-running the animation.
  useEffect(() => {
    if (!model || !root) return;
    const ids = sel ? new Set(pathTo(root, sel).map((n) => n.id)) : new Set<string>();
    const el = litRef.current;
    if (!el) return;
    if (ids.size === 0) {
      el.setAttribute("d", "");
      return;
    }
    const draw = () => {
      let d = "";
      for (const e of model.edges) {
        if (!ids.has(e.to)) continue;
        const a = nodeRefs.current.get(e.from);
        const b = nodeRefs.current.get(e.to);
        if (!a || !b) continue;
        const pa = a.getAttribute("transform")!.match(/-?[\d.]+/g)!;
        const pb = b.getAttribute("transform")!.match(/-?[\d.]+/g)!;
        d += `M${pa[0]} ${pa[1]}L${pb[0]} ${pb[1]}`;
      }
      el.setAttribute("d", d);
    };
    draw();
    const id = setInterval(draw, 60);
    return () => clearInterval(id);
  }, [sel, model, root]);

  if (!root || !model) return null;
  const { all, rank, byId, depth, ringR, sparkEdges } = model;

  const active = hot ?? sel;
  const shown = active ? byId.get(active) : null;

  return (
    <div
      className="relative overflow-hidden"
      style={{ height, opacity: dim }}
    >
      <svg viewBox="-215 -215 430 430" className="h-full w-full" style={{ pointerEvents: chrome ? "auto" : "none" }}>
        <defs>
          <radialGradient id="orbit-core">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.28" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle r={140} fill="url(#orbit-core)" />

        {Array.from({ length: depth }, (_, i) => (
          <circle key={`ring-${i}`} r={(i + 1) * ringR} fill="none" stroke="#243029" strokeWidth={0.4} />
        ))}

        <path ref={edgeRef} fill="none" stroke="#25332c" strokeWidth={0.5} />
        <path ref={litRef} fill="none" stroke={ACCENT} strokeWidth={1.5} opacity={0.9} />

        {sparkEdges.map((e, i) => (
          <circle
            key={`spark-${e.to}`}
            ref={(el) => {
              if (el) sparkRefs.current[i] = el;
            }}
            r={1.5}
            fill={ACCENT}
            opacity={0}
            className="pointer-events-none"
          />
        ))}

        {all.map((n) => {
          const rk = rank.get(n.id)!;
          const r = radius(rk);
          const on = active === n.id;
          const m = medal(rk);
          const isRoot = n.depth === 0;
          return (
            <g
              key={n.id}
              ref={(el) => {
                if (el) nodeRefs.current.set(n.id, el);
              }}
            >
              {isRoot && (
                <circle r={r + 8} fill="none" stroke={ACCENT} strokeWidth={0.8}>
                  <animate attributeName="opacity" values="0.6;0.1;0.6" dur="4s" repeatCount="indefinite" />
                  <animate attributeName="r" values={`${r + 6};${r + 11};${r + 6}`} dur="4s" repeatCount="indefinite" />
                </circle>
              )}
              {m && <circle r={r + 3} fill="none" stroke={m} strokeWidth={1.1} />}
              <circle
                r={on ? r + 3 : r}
                fill={on ? "#fff" : isRoot ? ACCENT : `hsl(152 55% ${30 + Math.min(35, n.like_count / 4)}%)`}
                onMouseEnter={() => setHot(n.id)}
                onMouseLeave={() => setHot(null)}
                onClick={() => setSel(sel === n.id ? null : n.id)}
                className="cursor-pointer transition-[r] duration-200"
              />
              {labels && (isRoot || rk <= 3 || on) && (
                <text
                  y={r + 9}
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

      {chrome && (
      <div className="pointer-events-none absolute bottom-3 left-4 right-4 font-mono text-[11px]">
        {shown ? (
          <span className="text-neutral-300">
            {rank.get(shown.id) === 1 && <Crown size={11} className="mr-1 inline text-amber-400" aria-hidden />}
            <span className="text-white">{name(shown)}</span> · @{shown.github_login} ·{" "}
            {shown.like_count > 0 ? "+" : ""}
            {shown.like_count} · generation {shown.depth}
            {shown.total > 1 && ` · ${shown.total - 1} below`}
          </span>
        ) : (
          <span className="text-neutral-600">
            Each ring is a generation. Hover to settle it, click a fork to trace it home.
          </span>
        )}
      </div>
      )}
    </div>
  );
}
