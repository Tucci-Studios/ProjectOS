import Link from "next/link";
import { GitBranch } from "lucide-react";
import { groupOf, timeAgo } from "@/lib/categories";
import { LikeButton } from "./like-button";
import { BrandMark } from "./brand";

export type ProjectFeedRow = {
  id: string;
  base_name: string;
  variant_name: string | null;
  category: string;
  description: string;
  github_login: string;
  like_count: number;
  parent_id: string | null;
  parent_display: string | null;
  fork_count: number;
  created_at: number;
};

/** Monochrome "PROJECT /" byline, then the name. The headliner. */
export function ProjectHeadline({
  baseName,
  variantName,
  size = "md",
}: {
  baseName: string;
  variantName?: string | null;
  size?: "md" | "lg";
}) {
  return (
    <span className="flex flex-wrap items-baseline gap-x-2">
      <span className="inline-flex items-center gap-1.5">
        <BrandMark size={16} className="!border-neutral-600 !bg-transparent" />
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">Project</span>
      </span>
      <span className="text-neutral-700">/</span>
      <span
        className={`font-mono font-bold tracking-tight text-white ${size === "lg" ? "text-2xl" : "text-[17px]"}`}
      >
        {baseName}
        {variantName && (
          <>
            <span className="text-neutral-600"> // </span>
            <span className="text-neutral-200">{variantName}</span>
          </>
        )}
      </span>
    </span>
  );
}

/** Minimal group symbol — AI, Build, or Play — sitting quietly on the right. */
export function GroupGlyph({ category, size = 30 }: { category: string; size?: number }) {
  const g = groupOf(category);
  return (
    <span
      title={`${g.label} — ${g.blurb}`}
      aria-label={g.label}
      className="flex shrink-0 items-center justify-center opacity-80 transition-opacity duration-200 group-hover:opacity-100"
    >
      <g.Icon size={size} strokeWidth={1.6} style={{ color: g.hex }} aria-hidden />
    </span>
  );
}

export function ProjectCard({ p, vote = 0 }: { p: ProjectFeedRow; vote?: number }) {
  const fullName = p.variant_name ? `${p.base_name} // ${p.variant_name}` : p.base_name;

  return (
    <article className="group relative overflow-hidden rounded-xl border border-neutral-700/70 bg-neutral-900/40 transition duration-200 hover:border-neutral-500 hover:bg-neutral-800/40">
      <div className="flex items-start gap-3 px-4 py-4">
        <div className="relative z-[2] flex shrink-0 self-center">
          <LikeButton projectId={p.id} initialCount={p.like_count} initialVote={vote} />
        </div>

        <div className="min-w-0 flex-1">
          <ProjectHeadline baseName={p.base_name} variantName={p.variant_name} />

          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-neutral-400">{p.description}</p>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-neutral-500">
            <span className="text-neutral-400">@{p.github_login}</span>
            <span>{timeAgo(p.created_at)}</span>
            <span className="inline-flex items-center gap-1">
              <GitBranch size={11} aria-hidden /> {p.fork_count}
            </span>
            {p.parent_display && (
              <span className="inline-flex items-center gap-1 text-neutral-600">
                branched from <span className="text-neutral-400">{p.parent_display}</span>
              </span>
            )}
          </div>
        </div>

        <div className="relative z-[2] shrink-0 self-start pt-0.5">
          <GroupGlyph category={p.category} size={32} />
        </div>
      </div>

      <Link
        href={`/p/${p.id}`}
        aria-label={`Open ${fullName}`}
        className="absolute inset-0 z-[1] rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      />
    </article>
  );
}
