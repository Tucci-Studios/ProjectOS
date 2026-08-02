import Link from "next/link";
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

export function ProjectCard({ p, liked }: { p: ProjectFeedRow; liked: boolean }) {
  const meta = categoryMeta(p.category);

  return (
    <article className="group flex gap-3 rounded-xl border border-neutral-700 bg-neutral-900/60 p-4 transition hover:border-emerald-400/40 hover:bg-neutral-800/40 hover:shadow-[0_0_24px_rgba(52,211,153,0.07)]">
      <LikeButton projectId={p.id} initialCount={p.like_count} initialLiked={liked} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href={`/p/${p.id}`}
            className="font-mono text-lg font-bold tracking-tight text-white transition group-hover:text-emerald-400"
          >
            {p.base_name}
            {p.variant_name && (
              <>
                <span className="text-emerald-400"> // </span>
                {p.variant_name}
              </>
            )}
          </Link>
          <Link
            href={`/s/${meta.slug}`}
            className={`rounded-md border ${meta.border} bg-neutral-800/80 px-2 py-0.5 font-mono text-xs ${meta.text}`}
          >
            {meta.label}
          </Link>
        </div>
        <p className="mt-1 font-mono text-xs text-neutral-500">
          by <span className="text-neutral-400">@{p.github_login}</span> · {timeAgo(p.created_at)}
          {p.parent_display && (
            <>
              {" "}
              · ⑂ from <span className="text-neutral-300">{p.parent_display}</span>
            </>
          )}
          {p.fork_count > 0 && (
            <>
              {" "}
              · <span className="text-emerald-400">{p.fork_count}</span> fork{p.fork_count === 1 ? "" : "s"}
            </>
          )}
        </p>
        <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-neutral-300">{p.description}</p>
      </div>
    </article>
  );
}
