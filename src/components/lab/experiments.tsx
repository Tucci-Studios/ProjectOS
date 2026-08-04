"use client";

import { useState } from "react";
import { GitFork, Star, ChevronUp, Users } from "lucide-react";
import { cleanDescription, clampWords } from "@/lib/describe";
import { GroupTile } from "@/components/project-card";

/** Before and after, on real rows, so the cleaner can be judged by its damage. */
export function DescriptionLab({ rows }: { rows: { name: string; description: string }[] }) {
  const [max, setMax] = useState(120);
  return (
    <div>
      <label className="mb-4 flex flex-wrap items-center gap-3 font-mono text-[12px] text-neutral-400">
        Cut at
        <input
          type="range"
          min={60}
          max={200}
          step={10}
          value={max}
          onChange={(e) => setMax(Number(e.target.value))}
          className="h-1 w-48 accent-emerald-400"
        />
        <span className="text-neutral-200">{max} characters</span>
      </label>

      <div className="space-y-2.5">
        {rows.map((r) => {
          const after = clampWords(cleanDescription(r.description, r.name), max);
          const changed = after !== r.description;
          return (
            <div key={r.name} className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-3.5">
              <p className="mb-2 font-mono text-[11px] font-bold text-white">
                {r.name}
                {!changed && <span className="ml-2 font-normal text-neutral-400">unchanged</span>}
              </p>
              <p className="text-[12.5px] leading-relaxed text-neutral-400 line-through decoration-rose-400/40">
                {r.description}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-emerald-200">{after}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const Stat = ({ Icon, n, label, tone }: { Icon: typeof Star; n: number; label: string; tone?: string }) => (
  <span className="inline-flex items-baseline gap-1.5">
    <Icon size={13} className={`self-center ${tone ?? "text-neutral-400"} ${tone ? "fill-current" : ""}`} aria-hidden />
    <span className={`font-mono text-[15px] font-bold ${tone ?? "text-neutral-200"}`}>{n.toLocaleString()}</span>
    <span className="font-mono text-[12px] text-neutral-400">{label}</span>
  </span>
);

/** The same stat row with and without its empty counters. */
export function ZeroStateLab({ stars, forks }: { stars: number; forks: number }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1.5 font-mono text-[11px] uppercase tracking-widest text-neutral-400">Today</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-3">
          <Stat Icon={GitFork} n={forks} label="forks" tone="text-emerald-400" />
          <Stat Icon={ChevronUp} n={0} label="votes" />
          <Stat Icon={Users} n={0} label="followers" />
          <Stat Icon={Star} n={stars} label="stars" tone="text-amber-300" />
        </div>
        <p className="mt-1.5 text-[12px] text-neutral-400">
          Two of the four numbers are zero on all 655 pages, which reads as &ldquo;nobody is here&rdquo;.
        </p>
      </div>

      <div>
        <p className="mb-1.5 font-mono text-[11px] uppercase tracking-widest text-neutral-400">Zeros hidden</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-3">
          <Stat Icon={GitFork} n={forks} label="forks" tone="text-emerald-400" />
          <Stat Icon={Star} n={stars} label="stars" tone="text-amber-300" />
        </div>
        <p className="mt-1.5 text-[12px] text-neutral-400">
          A counter appears the moment it has something to say. Nothing lies; the empty ones just wait their turn.
        </p>
      </div>
    </div>
  );
}

type Row = {
  id: string;
  base_name: string;
  description: string;
  category: string;
  stars: number;
  github_forks: number;
  language: string | null;
};

/** Current card height against a compact one, on the same projects. */
export function DensityLab({ rows }: { rows: Row[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div>
        <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-neutral-400">Today — 2-line description</p>
        <div className="space-y-3">
          {rows.map((p) => (
            <article key={p.id} className="flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-900/40 p-3">
              <GroupTile category={p.category} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-[14px] font-bold text-white">{p.base_name}</p>
                <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-neutral-400">{p.description}</p>
                <p className="mt-1.5 flex items-center gap-3 font-mono text-[11px] text-neutral-400">
                  <span className="text-amber-300/65">{p.stars.toLocaleString()}★</span>
                  <span className="font-bold text-emerald-400">{p.github_forks.toLocaleString()} forks</span>
                  {p.language && <span>{p.language}</span>}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-neutral-400">Compact — one line, cleaned</p>
        <div className="space-y-1.5">
          {rows.map((p) => (
            <article key={p.id} className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900/40 px-3 py-2">
              <span className="shrink-0">
                <GroupTile category={p.category} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2">
                  <span className="truncate font-mono text-[13.5px] font-bold text-white">{p.base_name}</span>
                  <span className="shrink-0 font-mono text-[10.5px] text-amber-300/65">{p.stars.toLocaleString()}★</span>
                  <span className="shrink-0 font-mono text-[10.5px] font-bold text-emerald-400">
                    {p.github_forks.toLocaleString()}⑂
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-[12.5px] text-neutral-400">
                  {clampWords(cleanDescription(p.description, p.base_name), 110)}
                </span>
              </span>
            </article>
          ))}
        </div>
        <p className="mt-2 text-[12px] text-neutral-400">
          Roughly twice as many projects per screen, and the descriptions have been through the cleaner.
        </p>
      </div>
    </div>
  );
}
