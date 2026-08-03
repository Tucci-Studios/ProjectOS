import Link from "next/link";
import { GitFork } from "lucide-react";
import { categoryMeta, timeAgo } from "@/lib/categories";
import { LikeButton } from "./like-button";

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

// The whole card is one click target (a stretched link over the card), with the
// like button raised above it so it stays independently clickable.
export function ProjectCard({ p, liked }: { p: ProjectFeedRow; liked: boolean }) {
  const meta = categoryMeta(p.category);

  return (
    <article className="group relative flex gap-3 rounded-xl border border-neutral-700 bg-neutral-900/60 p-4 transition duration-200 hover:border-emerald-400/50 hover:bg-neutral-800/60 hover:shadow-[0_0_24px_rgba(52,211,153,0.08)] focus-within:border-emerald-400/50">
      <div className="relative z-[2]">
        <LikeButton projectId={p.id} initialCount={p.like_count} initialLiked={liked} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="font-mono text-lg font-bold tracking-tight text-white transition group-hover:text-emerald-300">
            {p.base_name}
            {p.variant_name && (
              <>
                <span className="text-emerald-400"> // </span>
                {p.variant_name}
              </>
            )}
          </h3>
          <span className={`rounded-md border ${meta.border} bg-neutral-800/80 px-2 py-0.5 font-mono text-xs ${meta.text}`}>
            {meta.label}
          </span>
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 font-mono text-xs text-neutral-500">
          <span className="text-neutral-400">@{p.github_login}</span>
          <span>·</span>
          <span>{timeAgo(p.created_at)}</span>
          {p.parent_display && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <GitFork size={12} aria-hidden /> remix of <span className="text-neutral-300">{p.parent_display}</span>
              </span>
            </>
          )}
          {p.fork_count > 0 && (
            <>
              <span>·</span>
              <span className="text-emerald-400">
                {p.fork_count} remix{p.fork_count === 1 ? "" : "es"}
              </span>
            </>
          )}
        </p>
        <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-neutral-300">{p.description}</p>
      </div>
      {/* Whole-card click target, painted above the text but below the like button. */}
      <Link
        href={`/p/${p.id}`}
        aria-label={`Open ${p.base_name}${p.variant_name ? ` // ${p.variant_name}` : ""}`}
        className="absolute inset-0 z-[1] rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      />
    </article>
  );
}
