import Link from "next/link";
import { GitBranch, Heart } from "lucide-react";
import { categoryMeta, groupOf, timeAgo } from "@/lib/categories";
import { LikeButton } from "./like-button";
import { ProjectSigil } from "./project-sigil";

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

// Scan order: sigil (which project) → kind badge (what IS it) → name → one-line
// description. You should know if a card is for you without reading a sentence.
export function ProjectCard({ p, liked }: { p: ProjectFeedRow; liked: boolean }) {
  const meta = categoryMeta(p.category);
  const g = groupOf(p.category);
  const fullName = p.variant_name ? `${p.base_name} // ${p.variant_name}` : p.base_name;

  return (
    <article className="group relative flex items-start gap-4 rounded-xl border border-neutral-700/80 bg-neutral-900/50 p-4 transition duration-200 hover:border-neutral-500 hover:bg-neutral-800/50">
      <ProjectSigil name={fullName} category={p.category} size={48} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded border ${g.border} px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${g.text}`}
          >
            {meta.kind}
          </span>
          {p.parent_display && (
            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-neutral-500">
              <GitBranch size={11} aria-hidden /> branch of {p.parent_display}
            </span>
          )}
        </div>

        <h3 className="mt-1 font-mono text-[17px] font-bold leading-tight tracking-tight text-white transition group-hover:text-emerald-300">
          {p.base_name}
          {p.variant_name && (
            <>
              <span className="text-neutral-500"> // </span>
              <span className="text-neutral-200">{p.variant_name}</span>
            </>
          )}
        </h3>

        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-neutral-400">{p.description}</p>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-neutral-500">
          <span className="text-neutral-400">@{p.github_login}</span>
          <span>{timeAgo(p.created_at)}</span>
          <span className="inline-flex items-center gap-1">
            <Heart size={11} aria-hidden /> {p.like_count}
          </span>
          {p.fork_count > 0 && (
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <GitBranch size={11} aria-hidden /> {p.fork_count}
            </span>
          )}
        </div>
      </div>

      <div className="relative z-[2] shrink-0">
        <LikeButton projectId={p.id} initialCount={p.like_count} initialLiked={liked} />
      </div>

      <Link
        href={`/p/${p.id}`}
        aria-label={`Open ${fullName}`}
        className="absolute inset-0 z-[1] rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      />
    </article>
  );
}
