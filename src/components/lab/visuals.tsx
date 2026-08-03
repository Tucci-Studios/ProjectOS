"use client";

import { useMemo, useState } from "react";
import { ChevronRight, ChevronDown, Crown, GitBranch } from "lucide-react";
import type { LineageNode } from "@/lib/queries";
import { build, name, flatten, spine, pathTo, byVotes, bySubtree, maxDepth, type T } from "./tree";

const A = "#34d399"; // accent

const votes = (n: number) => `${n > 0 ? "+" : ""}${n}`;

/** SVG coords get rounded: raw floats differ in the last digit between server
 *  and client and React reports it as a hydration mismatch. */
const px = (n: number) => Math.round(n * 100) / 100;

function Empty() {
  return <p className="px-2 py-6 font-mono text-xs text-neutral-600">No lineage.</p>;
}

/* ─────────────────────────── 1. Threadline (today) ─────────────────────────── */

export function VizThreadline({ nodes }: { nodes: LineageNode[] }) {
  const root = useMemo(() => build(nodes), [nodes]);
  if (!root) return <Empty />;
  return (
    <div className="max-h-[460px] overflow-y-auto px-2 py-1">
      <ThreadNode t={root} />
    </div>
  );
}

function ThreadNode({ t }: { t: T }) {
  const [collapsed, setCollapsed] = useState(false);
  const [hot, setHot] = useState(false);
  if (collapsed)
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="flex min-h-[28px] cursor-pointer items-center gap-2 rounded px-1 font-mono text-[12px] text-neutral-500 hover:text-neutral-200"
      >
        <span className="text-emerald-400">[+]</span> {name(t)} · {t.total - 1} hidden
      </button>
    );
  return (
    <div className="py-0.5">
      <div className="flex items-start gap-2.5 rounded px-1 py-1.5">
        <span
          className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border"
          style={{ borderColor: A }}
        >
          {t.children.length > 0 && <span className="h-1 w-1 rounded-full" style={{ background: A }} />}
        </span>
        <span className="min-w-0">
          <span className="font-mono text-[13px] text-neutral-100">{name(t)}</span>{" "}
          <span className="font-mono text-[11px] text-neutral-500">
            @{t.github_login} · {votes(t.like_count)}
          </span>
        </span>
      </div>
      {t.children.length > 0 && (
        <div className="flex">
          <button
            onMouseEnter={() => setHot(true)}
            onMouseLeave={() => setHot(false)}
            onClick={() => setCollapsed(true)}
            aria-label="Collapse thread"
            className="group relative flex w-[17px] shrink-0 cursor-pointer justify-center"
          >
            <span
              className="h-full w-px transition-colors"
              style={{ background: hot ? A : "#3f3f46" }}
            />
          </button>
          <div className="min-w-0 flex-1">
            {t.children.map((c) => (
              <ThreadNode key={c.id} t={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────── 2. Ranked + capped ("show 94 more") ──────────────────── */

export function VizRanked({ nodes }: { nodes: LineageNode[] }) {
  const root = useMemo(() => build(nodes), [nodes]);
  if (!root) return <Empty />;
  return (
    <div className="max-h-[460px] overflow-y-auto px-2 py-1">
      <RankedNode t={root} depth={0} />
    </div>
  );
}

const SHOW = 4;

function RankedNode({ t, depth }: { t: T; depth: number }) {
  const [all, setAll] = useState(false);
  const kids = useMemo(() => [...t.children].sort(byVotes), [t]);
  const shown = all ? kids : kids.slice(0, SHOW);
  const hidden = kids.length - shown.length;

  return (
    <div>
      <div className="flex items-baseline gap-2 rounded px-1 py-1.5" style={{ paddingLeft: depth * 14 + 4 }}>
        <span className="font-mono text-[13px] text-neutral-100">{name(t)}</span>
        <span className="font-mono text-[11px] text-neutral-500">@{t.github_login}</span>
        <span className="font-mono text-[11px]" style={{ color: t.like_count > 40 ? A : "#71717a" }}>
          {votes(t.like_count)}
        </span>
        {t.total > 1 && (
          <span className="font-mono text-[10px] text-neutral-600">{t.total - 1} below</span>
        )}
      </div>
      {shown.map((c) => (
        <RankedNode key={c.id} t={c} depth={depth + 1} />
      ))}
      {hidden > 0 && (
        <button
          onClick={() => setAll(true)}
          style={{ marginLeft: (depth + 1) * 14 + 4 }}
          className="my-0.5 cursor-pointer rounded border border-neutral-700 px-2 py-1 font-mono text-[11px] text-neutral-400 hover:border-emerald-400/50 hover:text-emerald-300"
        >
          show {hidden} more branch{hidden === 1 ? "" : "es"}
        </button>
      )}
    </div>
  );
}

/* ─────────────────────── 3. Indent guides (file tree) ─────────────────────── */

export function VizExplorer({ nodes }: { nodes: LineageNode[] }) {
  const root = useMemo(() => build(nodes), [nodes]);
  const [open, setOpen] = useState<Set<string>>(() => new Set(["lab-0"]));
  if (!root) return <Empty />;

  const toggle = (id: string) =>
    setOpen((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const rows: React.ReactNode[] = [];
  const walk = (t: T, depth: number) => {
    const isOpen = open.has(t.id);
    rows.push(
      <button
        key={t.id}
        onClick={() => t.children.length && toggle(t.id)}
        style={{ paddingLeft: depth * 13 + 6 }}
        className="flex h-[26px] w-full cursor-pointer items-center gap-1.5 pr-2 text-left font-mono text-[12px] hover:bg-neutral-800/60"
      >
        {t.children.length ? (
          isOpen ? (
            <ChevronDown size={12} className="shrink-0 text-neutral-500" aria-hidden />
          ) : (
            <ChevronRight size={12} className="shrink-0 text-neutral-500" aria-hidden />
          )
        ) : (
          <span className="w-3 shrink-0" />
        )}
        <span className="truncate text-neutral-200">{name(t)}</span>
        <span className="shrink-0 text-neutral-600">{votes(t.like_count)}</span>
        {t.children.length > 0 && (
          <span className="ml-auto shrink-0 text-[10px] text-neutral-600">{t.children.length}</span>
        )}
      </button>,
    );
    if (isOpen) for (const c of [...t.children].sort(byVotes)) walk(c, depth + 1);
  };
  walk(root, 0);

  return (
    <div className="max-h-[460px] overflow-y-auto py-1">
      <div className="mb-1 flex gap-2 px-2">
        <button
          onClick={() => setOpen(new Set(flatten(root).map((n) => n.id)))}
          className="cursor-pointer font-mono text-[10px] text-neutral-500 hover:text-emerald-300"
        >
          expand all
        </button>
        <button
          onClick={() => setOpen(new Set(["lab-0"]))}
          className="cursor-pointer font-mono text-[10px] text-neutral-500 hover:text-emerald-300"
        >
          collapse all
        </button>
      </div>
      {rows}
    </div>
  );
}

/* ──────────────────── 4. Miller columns (Finder drill-down) ──────────────────── */

export function VizColumns({ nodes }: { nodes: LineageNode[] }) {
  const root = useMemo(() => build(nodes), [nodes]);
  const [path, setPath] = useState<T[]>([]);
  if (!root) return <Empty />;

  const cols: T[][] = [[root]];
  let cur: T = root;
  for (const p of path) {
    if (!cur.children.length) break;
    cols.push([...cur.children].sort(byVotes));
    cur = p;
  }
  if (cur.children.length && cols.length === path.length + 1) cols.push([...cur.children].sort(byVotes));

  return (
    <div className="flex h-[460px] gap-px overflow-x-auto bg-neutral-800">
      {cols.map((col, i) => (
        <div key={i} className="min-w-[190px] flex-1 overflow-y-auto bg-neutral-900/60">
          <p className="sticky top-0 border-b border-neutral-800 bg-neutral-900 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
            {i === 0 ? "original" : `${col.length} branch${col.length === 1 ? "" : "es"}`}
          </p>
          {col.map((t) => {
            const active = i === 0 ? true : path[i - 1]?.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setPath([...path.slice(0, Math.max(0, i - 1)), ...(i === 0 ? [] : [t])])}
                className={`flex w-full cursor-pointer items-center gap-1.5 px-2.5 py-1.5 text-left font-mono text-[12px] ${
                  active ? "bg-emerald-400/10 text-emerald-200" : "text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                <span className="truncate">{name(t)}</span>
                <span className="ml-auto shrink-0 text-[10px] text-neutral-500">{votes(t.like_count)}</span>
                {t.children.length > 0 && (
                  <ChevronRight size={11} className="shrink-0 text-neutral-600" aria-hidden />
                )}
              </button>
            );
          })}
          {col.length === 0 && <p className="px-2.5 py-2 font-mono text-[11px] text-neutral-600">end of the line</p>}
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────── 5. Horizontal dendrogram ───────────────────────── */

export function VizDendrogram({ nodes }: { nodes: LineageNode[] }) {
  const root = useMemo(() => build(nodes), [nodes]);
  const laid = useMemo(() => {
    if (!root) return null;
    const ROW = 17;
    const COL = 132;
    let y = 0;
    const pts: { t: T; x: number; y: number }[] = [];
    const place = (t: T): number => {
      const x = t.depth * COL;
      if (!t.children.length) {
        const my = y;
        y += ROW;
        pts.push({ t, x, y: my });
        return my;
      }
      const ys = t.children.map(place);
      const my = (ys[0] + ys[ys.length - 1]) / 2;
      pts.push({ t, x, y: my });
      return my;
    };
    place(root);
    const byId = new Map(pts.map((p) => [p.t.id, p]));
    return { pts, byId, w: (maxDepth(root) + 1) * COL, h: y + ROW };
  }, [root]);

  if (!root || !laid) return <Empty />;

  return (
    <div className="max-h-[460px] overflow-auto p-3">
      <svg width={laid.w + 90} height={laid.h} className="block">
        {laid.pts.map(({ t, x, y }) => {
          const p = t.parent_id ? laid.byId.get(t.parent_id) : null;
          if (!p) return null;
          const mid = (p.x + x) / 2;
          return (
            <path
              key={`e-${t.id}`}
              d={`M${p.x + 4} ${p.y} H${mid} V${y} H${x - 4}`}
              fill="none"
              stroke="#3f3f46"
              strokeWidth={1}
            />
          );
        })}
        {laid.pts.map(({ t, x, y }) => (
          <g key={t.id}>
            <circle cx={x} cy={y} r={3} fill={t.like_count > 60 ? A : "#52525b"} />
            <text x={x + 7} y={y + 3.5} fill="#d4d4d8" fontSize={10} fontFamily="ui-monospace, monospace">
              {name(t).slice(0, 12)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ───────────────────────────── 6. Radial sunburst ───────────────────────────── */

export function VizSunburst({ nodes }: { nodes: LineageNode[] }) {
  const root = useMemo(() => build(nodes), [nodes]);
  const [hover, setHover] = useState<T | null>(null);

  const arcs = useMemo(() => {
    if (!root) return [];
    const depth = Math.max(1, maxDepth(root));
    const R = 200 / (depth + 1);
    const out: { t: T; d: string; fill: string }[] = [];
    const arc = (t: T, a0: number, a1: number) => {
      if (t.depth > 0) {
        const r0 = t.depth * R;
        const r1 = (t.depth + 1) * R - 1.5;
        const big = a1 - a0 > Math.PI ? 1 : 0;
        const pt = (r: number, a: number) => `${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`;
        out.push({
          t,
          d: `M${pt(r0, a0)} A${r0} ${r0} 0 ${big} 1 ${pt(r0, a1)} L${pt(r1, a1)} A${r1} ${r1} 0 ${big} 0 ${pt(r1, a0)} Z`,
          fill: `hsl(${152 + t.depth * 16} ${60 - t.depth * 5}% ${34 + Math.min(28, t.like_count / 5)}%)`,
        });
      }
      let a = a0;
      for (const c of t.children) {
        const span = ((a1 - a0) * c.total) / (t.total - 1 || 1);
        arc(c, a, a + span);
        a += span;
      }
    };
    arc(root, 0, Math.PI * 2);
    return out;
  }, [root]);

  if (!root) return <Empty />;

  return (
    <div className="relative flex h-[460px] items-center justify-center">
      <svg viewBox="-210 -210 420 420" className="h-full max-h-[420px]">
        <circle r={200 / (maxDepth(root) + 1) - 2} fill="#1f2a23" stroke={A} strokeWidth={1} />
        <text textAnchor="middle" y={4} fill={A} fontSize={11} fontFamily="ui-monospace, monospace">
          {root.base_name}
        </text>
        {arcs.map(({ t, d, fill }) => (
          <path
            key={t.id}
            d={d}
            fill={hover?.id === t.id ? A : fill}
            stroke="#0f1411"
            strokeWidth={0.5}
            onMouseEnter={() => setHover(t)}
            onMouseLeave={() => setHover(null)}
            className="cursor-pointer"
          />
        ))}
      </svg>
      <div className="pointer-events-none absolute bottom-2 left-2 right-2 font-mono text-[11px] text-neutral-400">
        {hover ? (
          <>
            <span className="text-white">{name(hover)}</span> · @{hover.github_login} · {votes(hover.like_count)} ·
            depth {hover.depth} · {hover.total - 1} below
          </>
        ) : (
          <span className="text-neutral-600">Ring = how far from the original. Slice size = how much grew from it.</span>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────── 7. Icicle bars ────────────────────────────── */

export function VizIcicle({ nodes }: { nodes: LineageNode[] }) {
  const root = useMemo(() => build(nodes), [nodes]);
  const [focus, setFocus] = useState<string | null>(null);
  if (!root) return <Empty />;

  const target = focus ? flatten(root).find((n) => n.id === focus) ?? root : root;
  const rows: React.ReactNode[] = [];
  const walk = (t: T, left: number, width: number, depth: number) => {
    if (width < 0.4) return;
    rows.push(
      <button
        key={t.id}
        onClick={() => setFocus(t.id === target.id ? t.parent_id : t.id)}
        title={`${name(t)} — ${t.total - 1} below, ${votes(t.like_count)}`}
        style={{
          left: `${left}%`,
          width: `${width}%`,
          top: depth * 26,
          background: `hsl(${152 + depth * 14} 45% ${20 + Math.min(24, t.like_count / 6)}%)`,
        }}
        className="absolute h-[24px] cursor-pointer overflow-hidden whitespace-nowrap rounded-sm border border-neutral-950 px-1.5 text-left font-mono text-[10px] text-neutral-200 hover:brightness-150"
      >
        {width > 5 ? name(t) : ""}
      </button>,
    );
    let x = left;
    for (const c of [...t.children].sort(bySubtree)) {
      const w = (width * c.total) / (t.total - 1 || 1);
      walk(c, x, w, depth + 1);
      x += w;
    }
  };
  walk(target, 0, 100, 0);

  return (
    <div className="max-h-[460px] overflow-y-auto p-3">
      <p className="mb-2 font-mono text-[11px] text-neutral-500">
        Bar width = how much of the lineage grew from it. Click to zoom in, click the top bar to back out.
        {focus && (
          <button onClick={() => setFocus(null)} className="ml-2 cursor-pointer text-emerald-400 hover:underline">
            reset
          </button>
        )}
      </p>
      <div className="relative" style={{ height: (maxDepth(target) + 1) * 26 }}>
        {rows}
      </div>
    </div>
  );
}

/* ─────────────────────── 8. Spine + tributaries ─────────────────────── */

export function VizSpine({ nodes }: { nodes: LineageNode[] }) {
  const root = useMemo(() => build(nodes), [nodes]);
  const [open, setOpen] = useState<string | null>(null);
  if (!root) return <Empty />;
  const line = spine(root);
  const onSpine = new Set(line.map((n) => n.id));

  return (
    <div className="max-h-[460px] overflow-y-auto p-3">
      <p className="mb-3 font-mono text-[11px] text-neutral-500">
        The <span style={{ color: A }}>bright line</span> is the strongest path through the lineage. Everything else is
        a side branch, folded until you want it.
      </p>
      {line.map((t, i) => {
        const side = t.children.filter((c) => !onSpine.has(c.id)).sort(byVotes);
        const isOpen = open === t.id;
        return (
          <div key={t.id} className="relative pl-6">
            {i < line.length - 1 && <span className="absolute left-[7px] top-4 h-full w-[2px]" style={{ background: A }} />}
            <span
              className="absolute left-[2px] top-[6px] h-3 w-3 rounded-full border-2"
              style={{ borderColor: A, background: "#0f1411" }}
            />
            <div className="pb-1">
              <span className="font-mono text-[13px] text-white">{name(t)}</span>{" "}
              <span className="font-mono text-[11px] text-neutral-500">
                @{t.github_login} · {votes(t.like_count)}
              </span>
            </div>
            {side.length > 0 && (
              <div className="mb-2">
                <button
                  onClick={() => setOpen(isOpen ? null : t.id)}
                  className="cursor-pointer rounded border border-neutral-700 px-2 py-0.5 font-mono text-[10px] text-neutral-400 hover:border-neutral-500 hover:text-neutral-200"
                >
                  {isOpen ? "hide" : `+${side.length} side branch${side.length === 1 ? "" : "es"}`}
                </button>
                {isOpen && (
                  <div className="mt-1.5 space-y-1 border-l border-neutral-700 pl-3">
                    {side.map((c) => (
                      <p key={c.id} className="font-mono text-[11px] text-neutral-400">
                        <span className="text-neutral-200">{name(c)}</span> · {votes(c.like_count)}
                        {c.total > 1 && <span className="text-neutral-600"> · {c.total - 1} below</span>}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────── 9. Constellation ─────────────────────────── */

export function VizConstellation({ nodes }: { nodes: LineageNode[] }) {
  const root = useMemo(() => build(nodes), [nodes]);
  const [hover, setHover] = useState<T | null>(null);

  const pts = useMemo(() => {
    if (!root) return null;
    const depth = Math.max(1, maxDepth(root));
    const R = 195 / depth;
    const pos = new Map<string, { x: number; y: number }>();
    const place = (t: T, a0: number, a1: number) => {
      const a = (a0 + a1) / 2;
      const r = t.depth * R;
      pos.set(t.id, { x: px(r * Math.cos(a)), y: px(r * Math.sin(a)) });
      let a2 = a0;
      for (const c of t.children) {
        const span = ((a1 - a0) * c.total) / (t.total - 1 || 1);
        place(c, a2, a2 + span);
        a2 += span;
      }
    };
    place(root, 0, Math.PI * 2);
    return { pos, all: flatten(root) };
  }, [root]);

  if (!root || !pts) return <Empty />;

  return (
    <div className="relative flex h-[460px] items-center justify-center">
      <svg viewBox="-215 -215 430 430" className="h-full max-h-[430px]">
        {pts.all.map((t) => {
          const p = t.parent_id && pts.pos.get(t.parent_id);
          const me = pts.pos.get(t.id)!;
          if (!p) return null;
          return <line key={`l-${t.id}`} x1={p.x} y1={p.y} x2={me.x} y2={me.y} stroke="#2f3a34" strokeWidth={0.6} />;
        })}
        {pts.all.map((t) => {
          const me = pts.pos.get(t.id)!;
          const r = px(1.8 + Math.min(6, Math.sqrt(Math.max(0, t.like_count)) / 1.6));
          const on = hover?.id === t.id;
          return (
            <circle
              key={t.id}
              cx={me.x}
              cy={me.y}
              r={on ? r + 2.5 : r}
              fill={on ? "#fff" : t.depth === 0 ? A : `hsl(152 55% ${30 + Math.min(35, t.like_count / 4)}%)`}
              onMouseEnter={() => setHover(t)}
              onMouseLeave={() => setHover(null)}
              className="cursor-pointer"
            />
          );
        })}
      </svg>
      <div className="pointer-events-none absolute bottom-2 left-2 right-2 font-mono text-[11px] text-neutral-400">
        {hover ? (
          <>
            <span className="text-white">{name(hover)}</span> · @{hover.github_login} · {votes(hover.like_count)} ·
            depth {hover.depth}
          </>
        ) : (
          <span className="text-neutral-600">Dot size = votes. Distance from centre = how far from the original.</span>
        )}
      </div>
    </div>
  );
}

/* ───────────────────── 10. Flat leaderboard (no tree) ───────────────────── */

export function VizLeaderboard({ nodes }: { nodes: LineageNode[] }) {
  const root = useMemo(() => build(nodes), [nodes]);
  const [n, setN] = useState(25);
  if (!root) return <Empty />;
  const all = flatten(root).sort(byVotes);

  return (
    <div className="max-h-[460px] overflow-y-auto p-3">
      <p className="mb-3 font-mono text-[11px] text-neutral-500">
        No tree at all — every branch ranked, with the path back to the original as a breadcrumb.
      </p>
      <div className="space-y-1">
        {all.slice(0, n).map((t, i) => {
          const trail = pathTo(root, t.id).slice(0, -1);
          return (
            <div key={t.id} className="flex items-start gap-3 rounded border border-neutral-800 px-2.5 py-2">
              <span className="w-6 shrink-0 pt-0.5 text-right font-mono text-[11px] text-neutral-600">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2">
                  <span className="font-mono text-[13px] text-neutral-100">{name(t)}</span>
                  <span className="font-mono text-[11px] text-neutral-500">@{t.github_login}</span>
                  {i === 0 && <Crown size={12} className="text-amber-300" aria-hidden />}
                  {t.children.length > 0 && (
                    <span className="flex items-center gap-1 font-mono text-[10px] text-neutral-500">
                      <GitBranch size={10} aria-hidden /> {t.children.length}
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block truncate font-mono text-[10px] text-neutral-600">
                  {trail.length === 0 ? "the original" : trail.map(name).join(" › ")}
                </span>
              </span>
              <span className="shrink-0 font-mono text-[12px]" style={{ color: t.like_count > 40 ? A : "#71717a" }}>
                {votes(t.like_count)}
              </span>
            </div>
          );
        })}
      </div>
      {n < all.length && (
        <button
          onClick={() => setN(n + 50)}
          className="mt-2 w-full cursor-pointer rounded border border-neutral-700 py-2 font-mono text-[11px] text-neutral-400 hover:border-emerald-400/50 hover:text-emerald-300"
        >
          show 50 more ({all.length - n} left)
        </button>
      )}
    </div>
  );
}
