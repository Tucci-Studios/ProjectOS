"use client";

import { GitFork, Star } from "lucide-react";

/**
 * The lineage tree, three ways, drawn from real GitHub forks.
 *
 * The site's whole premise is that lineage is visible, and today the tree
 * renders on one project page out of 655 — because it only counts forks that
 * were published back to Project OS, and almost nobody has. Meanwhile 13,761
 * real fork rows are already synced and sitting unused.
 *
 * So each of these draws the same thing: the root, then its actual GitHub
 * forks, with the ones not listed here shown as unclaimed. The question isn't
 * whether the data exists — it's which shape makes a stranger understand what
 * they're looking at in about a second.
 */

export type ForkNode = {
  full_name: string;
  owner_login: string;
  stars: number;
  published: boolean;
};

export type TreeRoot = {
  name: string;
  owner: string;
  stars: number;
  totalForks: number;
};

const k = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

function Chip({ n }: { n: ForkNode }) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 truncate rounded-lg border px-2 py-1 font-mono text-[11px] ${
        n.published
          ? "border-emerald-400/50 bg-emerald-400/[0.07] text-emerald-200"
          : "border-neutral-700 bg-neutral-900/60 text-neutral-400"
      }`}
      title={`${n.full_name}${n.published ? "" : " — not listed on Project OS"}`}
    >
      <span className="truncate">{n.owner_login}</span>
      {n.stars > 0 && (
        <span className="inline-flex shrink-0 items-center gap-0.5 text-amber-300/70">
          <Star size={8} className="fill-current" aria-hidden />
          {k(n.stars)}
        </span>
      )}
    </span>
  );
}

function RootBadge({ root, size = "big" }: { root: TreeRoot; size?: "big" | "small" }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-xl border border-emerald-400/60 bg-emerald-400/10 font-mono font-bold text-white ${
        size === "big" ? "px-3.5 py-2 text-[13px]" : "px-2.5 py-1.5 text-[12px]"
      }`}
    >
      {root.name}
      <span className="inline-flex items-center gap-1 font-normal text-emerald-300">
        <GitFork size={11} aria-hidden />
        {k(root.totalForks)}
      </span>
    </span>
  );
}

/** A — the family tree everyone pictures: root on top, children hanging below. */
export function TreeVertical({ root, forks }: { root: TreeRoot; forks: ForkNode[] }) {
  const shown = forks.slice(0, 12);
  return (
    <div className="flex flex-col items-center py-2">
      <RootBadge root={root} />
      <span className="h-5 w-px bg-neutral-700" />
      <div className="relative w-full">
        <span className="absolute left-[8%] right-[8%] top-0 h-px bg-neutral-700" />
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-2.5 px-2 pt-5">
          {shown.map((n) => (
            <span key={n.full_name} className="relative flex flex-col items-center">
              <span className="absolute -top-5 h-5 w-px bg-neutral-700" />
              <Chip n={n} />
            </span>
          ))}
        </div>
      </div>
      {forks.length > shown.length && (
        <p className="mt-3 font-mono text-[11px] text-neutral-400">
          and {k(root.totalForks - shown.length)} more
        </p>
      )}
    </div>
  );
}

/** B — a ring. Reads as one thing with many descendants rather than a hierarchy. */
export function TreeRadial({ root, forks }: { root: TreeRoot; forks: ForkNode[] }) {
  const shown = forks.slice(0, 10);
  const R = 116;
  return (
    <div className="relative mx-auto h-[300px] w-full max-w-[420px]">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 420 300" aria-hidden>
        {shown.map((_, i) => {
          const a = (i / shown.length) * Math.PI * 2 - Math.PI / 2;
          return (
            <line
              key={i}
              x1={210}
              y1={150}
              x2={Math.round(210 + Math.cos(a) * R)}
              y2={Math.round(150 + Math.sin(a) * R)}
              stroke="#404040"
              strokeWidth="1"
            />
          );
        })}
      </svg>
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <RootBadge root={root} size="small" />
      </span>
      {shown.map((n, i) => {
        const a = (i / shown.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <span
            key={n.full_name}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${210 + Math.cos(a) * R}px`, top: `${150 + Math.sin(a) * R}px` }}
          >
            <Chip n={n} />
          </span>
        );
      })}
    </div>
  );
}

/** C — a ranked list. Least pretty, most readable, survives a phone. */
export function TreeList({ root, forks }: { root: TreeRoot; forks: ForkNode[] }) {
  const shown = forks.slice(0, 8);
  const top = Math.max(1, shown[0]?.stars ?? 1);
  return (
    <div className="py-1">
      <RootBadge root={root} />
      <div className="mt-3 space-y-1 border-l border-neutral-700 pl-3">
        {shown.map((n) => (
          <div key={n.full_name} className="flex items-center gap-2.5">
            <span className="w-24 shrink-0 truncate font-mono text-[11.5px] text-neutral-300">{n.owner_login}</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-800">
              <span
                className={`block h-full rounded-full ${n.published ? "bg-emerald-400" : "bg-neutral-600"}`}
                style={{ width: `${Math.max(4, (n.stars / top) * 100)}%` }}
              />
            </span>
            <span className="w-10 shrink-0 text-right font-mono text-[10.5px] text-neutral-400">{k(n.stars)}</span>
          </div>
        ))}
      </div>
      <p className="mt-2.5 pl-3 font-mono text-[11px] text-neutral-400">
        {k(root.totalForks)} forks on GitHub · showing the {shown.length} most starred
      </p>
    </div>
  );
}
