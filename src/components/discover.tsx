import Link from "next/link";
import { ArrowRight, GitFork, Star } from "lucide-react";
import { GroupTile } from "./project-card";
import type { ProjectFeedRow } from "./project-card";
import { SetupChip } from "@/components/setup-mark";

/**
 * A compact tile for the curated strips.
 *
 * Deliberately smaller than a project card: a strip is for deciding whether to
 * look, and a card is for deciding whether to use. Name, one line, and the two
 * numbers that matter.
 */
export function DiscoverTile({ p }: { p: ProjectFeedRow }) {
  return (
    <article className="group relative flex min-w-0 items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-900/40 p-3 transition duration-200 hover:border-neutral-600 hover:bg-neutral-800/40">
      <GroupTile category={p.category} />

      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-[14px] font-bold text-white transition group-hover:text-emerald-300">
          {p.base_name}
        </p>
        <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-neutral-400">{p.description}</p>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 font-mono text-[11px] text-neutral-400">
          {p.stars ? (
            <span className="inline-flex items-center gap-1 text-amber-300/65">
              <Star size={10} className="fill-amber-300/65" aria-hidden />
              {p.stars >= 1000 ? `${(p.stars / 1000).toFixed(1)}k` : p.stars}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
            <GitFork size={10} aria-hidden />
            {(p.github_forks ?? 0) >= 1000
              ? `${((p.github_forks ?? 0) / 1000).toFixed(1)}k`
              : (p.github_forks ?? 0)}
          </span>
          {p.language && <span className="truncate text-neutral-400">{p.language}</span>}
          <SetupChip tier={p.setup_tier} />
        </p>
      </div>

      <Link href={`/p/${p.id}`} aria-label={`Open ${p.base_name}`} className="absolute inset-0 rounded-xl" />
    </article>
  );
}

/** A titled row of tiles with a way through to the full list behind it. */
export function Strip({
  title,
  blurb,
  href,
  items,
}: {
  title: string;
  blurb: string;
  href: string;
  items: ProjectFeedRow[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-7">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <h2 className="font-mono text-[15px] font-bold text-white">{title}</h2>
          <p className="mt-0.5 text-[13px] leading-relaxed text-neutral-400">{blurb}</p>
        </div>
        <Link
          href={href}
          className="flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-lg px-2 font-mono text-[12px] text-neutral-400 outline-none transition hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          See all <ArrowRight size={12} aria-hidden />
        </Link>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {items.map((p) => (
          <DiscoverTile key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}
