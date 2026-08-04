"use client";

import { GitFork, Star } from "lucide-react";

/**
 * Five ways to draw a lineage.
 *
 * The first attempt was a top-down family tree and it didn't land. These aren't
 * variations on it — each one answers the question differently. A tree says
 * "descent". A rail says "history". A terminal listing says "structure". A
 * field says "scale". A timeline says "when".
 *
 * All five run on the same real rows: one root and its actual GitHub forks,
 * green where the fork is listed on Project OS and grey where it isn't.
 */

export type ForkNode = {
  full_name: string;
  owner_login: string;
  stars: number;
  pushedAt: number | null;
  published: boolean;
};

export type TreeRoot = {
  name: string;
  owner: string;
  stars: number;
  totalForks: number;
};

const k = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toLocaleString());
const year = (t: number | null) => (t ? new Date(t * 1000).getFullYear() : null);

function Root({ root }: { root: TreeRoot }) {
  return (
    <span className="inline-flex items-center gap-2.5 rounded-xl border border-emerald-400/60 bg-emerald-400/10 px-3.5 py-2">
      <span className="font-mono text-[13.5px] font-bold text-white">{root.name}</span>
      <span className="font-mono text-[11.5px] text-neutral-400">@{root.owner}</span>
      <span className="inline-flex items-center gap-1 font-mono text-[11.5px] text-amber-300/80">
        <Star size={9} className="fill-current" aria-hidden />
        {k(root.stars)}
      </span>
    </span>
  );
}

function Tail({ root, shown }: { root: TreeRoot; shown: number }) {
  const rest = Math.max(0, root.totalForks - shown);
  if (!rest) return null;
  return (
    <p className="mt-4 flex items-center gap-1.5 font-mono text-[11.5px] text-neutral-400">
      <GitFork size={11} aria-hidden /> {k(rest)} more on GitHub
    </p>
  );
}

/* ── A · Rail ──────────────────────────────────────────────────────────────
   A git graph. The trunk runs down the left and every fork peels off it, the
   way the history actually looks in a terminal. No wrapping, no ambiguity
   about who descends from whom, and it takes any number of forks. */
export function RailTree({ root, forks }: { root: TreeRoot; forks: ForkNode[] }) {
  const shown = forks.slice(0, 10);
  return (
    <div>
      <Root root={root} />
      <div className="relative mt-1 pl-[13px]">
        <span className="absolute bottom-4 left-[13px] top-0 w-px bg-neutral-700" aria-hidden />
        {shown.map((n) => (
          <div key={n.full_name} className="relative flex items-center gap-2.5 py-[3px] pl-5">
            <span className="absolute left-0 top-1/2 h-px w-4 bg-neutral-700" aria-hidden />
            <span
              className={`absolute left-[-3px] top-1/2 h-[7px] w-[7px] -translate-y-1/2 rounded-full ${
                n.published ? "bg-emerald-400" : "bg-neutral-600"
              }`}
              aria-hidden
            />
            <span
              className={`truncate font-mono text-[12.5px] ${
                n.published ? "font-bold text-emerald-200" : "text-neutral-300"
              }`}
            >
              {n.owner_login}
            </span>
            <span className="ml-auto shrink-0 font-mono text-[11px] text-amber-300/70">{k(n.stars)}★</span>
          </div>
        ))}
      </div>
      <Tail root={root} shown={shown.length} />
    </div>
  );
}

/* ── B · Terminal ──────────────────────────────────────────────────────────
   The listing a developer already reads a hundred times a day. Costs nothing
   to understand, survives any depth, and it is the same voice as the mark. */
export function TerminalTree({ root, forks }: { root: TreeRoot; forks: ForkNode[] }) {
  const shown = forks.slice(0, 10);
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-800 bg-[#0f1411] p-4 font-mono text-[12.5px] leading-[1.75]">
      <p className="text-white">
        <span className="text-emerald-400">{root.name}</span>
        <span className="text-neutral-400">/ @{root.owner}</span>
      </p>
      {shown.map((n, i) => {
        const last = i === shown.length - 1 && root.totalForks <= shown.length;
        return (
          <p key={n.full_name} className="whitespace-pre">
            <span className="text-neutral-600">{last ? "└── " : "├── "}</span>
            <span className={n.published ? "font-bold text-emerald-300" : "text-neutral-300"}>{n.owner_login}</span>
            <span className="text-neutral-600">
              {"  "}
              {k(n.stars)}★
            </span>
            {!n.published && <span className="text-neutral-600">{"  ·  not listed"}</span>}
          </p>
        );
      })}
      {root.totalForks > shown.length && (
        <p className="whitespace-pre text-neutral-600">
          └── <span className="text-neutral-400">…{k(root.totalForks - shown.length)} more</span>
        </p>
      )}
    </div>
  );
}

/* ── C · Field ─────────────────────────────────────────────────────────────
   Every fork as one cell, the way a contribution graph shows a year. Useless
   for reading names, unbeatable for feeling how many there are. */
export function FieldTree({ root, forks }: { root: TreeRoot; forks: ForkNode[] }) {
  const CELLS = 120;
  const top = Math.max(1, forks[0]?.stars ?? 1);
  const cells = Array.from({ length: CELLS }, (_, i) => forks[i] ?? null);

  return (
    <div>
      <Root root={root} />
      <div className="mt-4 flex flex-wrap gap-[3px]">
        {cells.map((n, i) => {
          if (!n)
            return <span key={i} className="h-[13px] w-[13px] rounded-[2px] bg-neutral-800/70" aria-hidden />;
          const heat = 0.25 + Math.min(1, n.stars / top) * 0.75;
          return (
            <span
              key={n.full_name}
              title={`${n.full_name} — ${n.stars.toLocaleString()} stars`}
              className="h-[13px] w-[13px] rounded-[2px]"
              style={{
                background: n.published ? `rgba(74,222,128,${heat})` : `rgba(163,163,163,${heat * 0.55})`,
              }}
            />
          );
        })}
      </div>
      <p className="mt-3 font-mono text-[11.5px] text-neutral-400">
        {k(root.totalForks)} forks · brighter means more stars · green means listed here
      </p>
    </div>
  );
}

/* ── D · Timeline ──────────────────────────────────────────────────────────
   Lineage is a thing that happened over time, and none of the other four say
   when. Position is the year the fork was last touched. */
export function TimelineTree({ root, forks }: { root: TreeRoot; forks: ForkNode[] }) {
  const dated = forks.filter((f) => f.pushedAt).slice(0, 12);
  if (!dated.length) return <RailTree root={root} forks={forks} />;

  const years = dated.map((f) => year(f.pushedAt)!);
  const min = Math.min(...years);
  const max = Math.max(...years);
  const span = Math.max(1, max - min);
  const top = Math.max(1, dated[0].stars);

  return (
    <div>
      <Root root={root} />
      <div className="relative mt-6 h-[190px] w-full">
        <span className="absolute left-0 right-0 top-2 h-px bg-neutral-700" aria-hidden />
        {dated.map((n, i) => {
          const x = ((year(n.pushedAt)! - min) / span) * 88 + 4;
          const y = 26 + (i % 6) * 27;
          return (
            <span key={n.full_name} className="absolute" style={{ left: `${x}%`, top: `${y}px` }}>
              <span className="absolute bottom-full left-[5px] w-px bg-neutral-800" style={{ height: `${y - 8}px` }} aria-hidden />
              <span
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-md border px-1.5 py-0.5 font-mono text-[10.5px] ${
                  n.published
                    ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200"
                    : "border-neutral-700 bg-neutral-900 text-neutral-400"
                }`}
                style={{ opacity: 0.55 + (n.stars / top) * 0.45 }}
              >
                {n.owner_login}
              </span>
            </span>
          );
        })}
        <span className="absolute left-0 top-0 -translate-y-full font-mono text-[10px] text-neutral-400">{min}</span>
        <span className="absolute right-0 top-0 -translate-y-full font-mono text-[10px] text-neutral-400">{max}</span>
      </div>
      <p className="font-mono text-[11.5px] text-neutral-400">Placed by the year each fork was last pushed to</p>
    </div>
  );
}

/* ── E · Weight ────────────────────────────────────────────────────────────
   Not a diagram at all. One bar per fork, sized by stars — the least clever
   option and the only one that says at a glance which fork actually matters. */
export function WeightTree({ root, forks }: { root: TreeRoot; forks: ForkNode[] }) {
  const shown = forks.slice(0, 10);
  const top = Math.max(1, shown[0]?.stars ?? 1);
  return (
    <div>
      <Root root={root} />
      <div className="mt-4 space-y-[5px]">
        {shown.map((n) => (
          <div key={n.full_name} className="group flex items-center gap-3">
            <span className="w-32 shrink-0 truncate text-right font-mono text-[11.5px] text-neutral-300">
              {n.owner_login}
            </span>
            <span className="relative h-5 flex-1 overflow-hidden rounded-r-md bg-neutral-800/60">
              <span
                className={`block h-full rounded-r-md ${
                  n.published ? "bg-emerald-400/80" : "bg-neutral-600/70"
                }`}
                style={{ width: `${Math.max(2, (n.stars / top) * 100)}%` }}
              />
            </span>
            <span className="w-12 shrink-0 font-mono text-[10.5px] text-amber-300/70">{k(n.stars)}★</span>
          </div>
        ))}
      </div>
      <Tail root={root} shown={shown.length} />
    </div>
  );
}
