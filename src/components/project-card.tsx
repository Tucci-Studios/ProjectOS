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
  const display = p.variant_name ? `${p.base_name} // ${p.variant_name}` : p.base_name;

  return (
    <article className="flex gap-2 rounded-lg border border-neutral-800 bg-neutral-950/60 p-3 transition hover:border-neutral-700">
      <LikeButton projectId={p.id} initialCount={p.like_count} initialLiked={liked} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/p/${p.id}`} className="font-mono text-sm font-bold text-white hover:text-cyan-400">
            {p.base_name}
            {p.variant_name && (
              <>
                <span className="text-cyan-400"> // </span>
                {p.variant_name}
              </>
            )}
          </Link>
          <Link
            href={`/s/${meta.slug}`}
            className={`rounded border ${meta.border} bg-neutral-900/60 px-1.5 py-0.5 font-mono text-[10px] ${meta.text}`}
          >
            {meta.label}
          </Link>
        </div>
        <p className="mt-0.5 font-mono text-[11px] text-neutral-500">
          by @{p.github_login} · {timeAgo(p.created_at)}
          {p.parent_display && (
            <>
              {" "}
              · forked from <span className="text-neutral-300">{p.parent_display}</span>
            </>
          )}
          {p.fork_count > 0 && (
            <>
              {" "}
              · <span className="text-neutral-300">{p.fork_count}</span> fork{p.fork_count === 1 ? "" : "s"}
            </>
          )}
        </p>
        <p className="mt-1.5 truncate text-sm text-neutral-400" title={display}>
          {p.description}
        </p>
      </div>
    </article>
  );
}
