import Link from "next/link";
import { GitBranch, Heart } from "lucide-react";
import { categoryMeta, groupOf, timeAgo } from "@/lib/categories";
import { LikeButton } from "./like-button";
import { ProjectMark } from "./project-mark";
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

// Scan order: colored edge + type icon (what IS it) → PROJECT chip → name →
// one line. Identify the box before reading a word.
export function ProjectCard({ p, liked }: { p: ProjectFeedRow; liked: boolean }) {
  const meta = categoryMeta(p.category);
  const g = groupOf(p.category);
  const fullName = p.variant_name ? `${p.base_name} // ${p.variant_name}` : p.base_name;

  return (
    <article className="group relative overflow-hidden rounded-xl border border-neutral-700/70 bg-neutral-900/40 transition duration-200 hover:border-neutral-500 hover:bg-neutral-800/40">
      {/* type edge */}
      <span className="absolute inset-y-0 left-0 w-1" style={{ background: g.hex, opacity: 0.75 }} aria-hidden />

      <div className="flex items-start gap-4 py-4 pl-5 pr-4">
        <ProjectMark category={p.category} size={52} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-400/25 bg-emerald-400/[0.07] py-0.5 pl-1 pr-2">
              <BrandMark size={16} className="!border-0 !bg-transparent" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-300/90">Project</span>
            </span>
            <span className={`rounded-md border ${g.border} px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${g.text}`}>
              {meta.kind}
            </span>
            {p.parent_display && (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-neutral-500">
                <GitBranch size={11} aria-hidden /> branch of {p.parent_display}
              </span>
            )}
          </div>

          <h3 className="mt-2 font-mono text-[17px] font-bold leading-tight tracking-tight text-white transition group-hover:text-emerald-300">
            {p.base_name}
            {p.variant_name && (
              <>
                <span className="text-neutral-500"> // </span>
                <span className="text-neutral-200">{p.variant_name}</span>
              </>
            )}
          </h3>

          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-neutral-400">{p.description}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-neutral-500">
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
      </div>

      <Link
        href={`/p/${p.id}`}
        aria-label={`Open ${fullName}`}
        className="absolute inset-0 z-[1] rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      />
    </article>
  );
}
