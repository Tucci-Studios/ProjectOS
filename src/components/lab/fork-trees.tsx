"use client";

import { GitFork, Star } from "lucide-react";

/**
 * The lineage tree, drawn from forks that actually exist.
 *
 * The site's premise is that lineage is visible, and the tree currently renders
 * on one project page out of 655 — because it only counts forks published back
 * to Project OS, and almost nobody has. Meanwhile 13,761 real fork rows sit
 * synced and unused.
 *
 * So this draws the root and its real GitHub forks, with anything not listed
 * here shown as unclaimed. Grey isn't a gap in the data; it's the ask.
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

const k = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toLocaleString());

/**
 * Four across, so the stems below the rail line up with the chips no matter how
 * long the names are. The earlier version let the chips wrap freely and the
 * connectors stopped making sense on the second row.
 */
const COLS = 4;

function Node({ n, weight }: { n: ForkNode; weight: number }) {
  return (
    <span className="flex min-w-0 flex-col items-center">
      {/* the stem up to the rail */}
      <span className="h-4 w-px shrink-0 bg-neutral-700" />
      <span
        className={`flex w-full min-w-0 flex-col gap-0.5 rounded-lg border px-2.5 py-1.5 text-center transition ${
          n.published
            ? "border-emerald-400/60 bg-emerald-400/[0.07]"
            : "border-neutral-700 bg-neutral-900/70 hover:border-neutral-500"
        }`}
        title={n.published ? n.full_name : `${n.full_name} — on GitHub, not listed here`}
        style={{ borderTopWidth: `${1 + weight * 2}px` }}
      >
        <span
          className={`truncate font-mono text-[11.5px] ${
            n.published ? "font-bold text-emerald-200" : "text-neutral-300"
          }`}
        >
          {n.owner_login}
        </span>
        <span className="flex items-center justify-center gap-1 font-mono text-[10px] text-amber-300/70">
          <Star size={8} className="fill-current" aria-hidden />
          {k(n.stars)}
        </span>
      </span>
    </span>
  );
}

/**
 * One row of forks: a rail, then a stem down to each chip.
 *
 * Every row hangs off the same trunk rather than off the row above it. They are
 * all siblings — twelve forks of one project, not four generations — and the
 * first version read as descent purely because the chips had to wrap.
 */
function Row({ nodes, top }: { nodes: ForkNode[]; top: number }) {
  return (
    <div className="relative w-full">
      <span
        className="absolute top-0 h-px bg-neutral-700"
        style={{
          left: `${(100 / COLS) * 0.5}%`,
          width: `${(100 / COLS) * (Math.min(nodes.length, COLS) - 1)}%`,
        }}
      />
      <div className="grid gap-x-2.5" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
        {nodes.map((n) => (
          <Node key={n.full_name} n={n} weight={Math.min(1, n.stars / top)} />
        ))}
      </div>
    </div>
  );
}

export function ForkTree({ root, forks }: { root: TreeRoot; forks: ForkNode[] }) {
  const shown = forks.slice(0, 12);
  const top = Math.max(1, shown[0]?.stars ?? 1);
  const rows: ForkNode[][] = [];
  for (let i = 0; i < shown.length; i += COLS) rows.push(shown.slice(i, i + COLS));

  const listed = forks.filter((f) => f.published).length;
  const rest = Math.max(0, root.totalForks - shown.length);

  return (
    <div className="flex flex-col items-center">
      <span className="inline-flex items-center gap-2.5 rounded-xl border border-emerald-400/60 bg-emerald-400/10 px-4 py-2.5">
        <span className="font-mono text-[14px] font-bold text-white">{root.name}</span>
        <span className="font-mono text-[12px] text-neutral-400">@{root.owner}</span>
        <span className="inline-flex items-center gap-1 font-mono text-[12px] text-amber-300/80">
          <Star size={10} className="fill-current" aria-hidden />
          {k(root.stars)}
        </span>
      </span>

      <span className="h-5 w-px bg-neutral-700" />

      {/* The trunk runs the whole height so each rail is visibly a branch off
          the root, not off the row above it. */}
      <div className="relative w-full">
        <span
          aria-hidden
          className="absolute left-1/2 top-0 w-px -translate-x-1/2 bg-neutral-700"
          style={{ height: `${Math.max(0, rows.length - 1) * 100}px` }}
        />
        <div className="w-full space-y-6">
          {rows.map((r, i) => (
            <Row key={i} nodes={r} top={top} />
          ))}
        </div>
      </div>

      {rest > 0 && (
        <p className="mt-5 flex items-center gap-1.5 font-mono text-[11.5px] text-neutral-400">
          <GitFork size={11} aria-hidden />
          {k(rest)} more forks on GitHub
        </p>
      )}

      <p className="mt-1.5 font-mono text-[11px] text-neutral-400">
        {listed > 0 ? (
          <>
            <span className="text-emerald-300">{listed}</span> of these are listed on Project OS
          </>
        ) : (
          "None of these are listed on Project OS yet"
        )}
      </p>
    </div>
  );
}
