import Link from "next/link";
import { GitBranch, Heart } from "lucide-react";
import { categoryMeta, timeAgo } from "@/lib/categories";
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
        <BrandMark size={15} className="!border-neutral-600 !bg-transparent" mono />
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

/** What you DO with it — plain words, no color coding. */
export function UseTag({ category }: { category: string }) {
  const { use, Icon } = categoryMeta(category);
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-neutral-700 bg-neutral-800/60 px-2 py-1 font-mono text-[11px] text-neutral-300">
      <Icon size={12} strokeWidth={2} className="text-neutral-400" aria-hidden />
      {use}
    </span>
  );
}

export function ProjectCard({ p, liked }: { p: ProjectFeedRow; liked: boolean }) {
  const fullName = p.variant_name ? `${p.base_name} // ${p.variant_name}` : p.base_name;

  return (
    <article className="group relative overflow-hidden rounded-xl border border-neutral-700/70 bg-neutral-900/40 transition duration-200 hover:border-neutral-500 hover:bg-neutral-800/40">
      <div className="flex items-start gap-4 py-4 px-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <ProjectHeadline baseName={p.base_name} variantName={p.variant_name} />
            <UseTag category={p.category} />
          </div>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-400">{p.description}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-neutral-500">
            <span className="text-neutral-400">@{p.github_login}</span>
            <span>{timeAgo(p.created_at)}</span>
            <span className="inline-flex items-center gap-1">
              <Heart size={11} aria-hidden /> {p.like_count}
            </span>
            <span className={`inline-flex items-center gap-1 ${p.fork_count > 0 ? "text-emerald-400" : ""}`}>
              <GitBranch size={11} aria-hidden /> {p.fork_count} branch{p.fork_count === 1 ? "" : "es"}
            </span>
            {p.parent_display && (
              <span className="inline-flex items-center gap-1 text-neutral-600">
                branched from <span className="text-neutral-400">{p.parent_display}</span>
              </span>
            )}
          </div>
        </div>

        <div className="relative z-[2] shrink-0">
          <LikeButton projectId={p.id} initialCount={p.like_count} initialLiked={liked} />
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
