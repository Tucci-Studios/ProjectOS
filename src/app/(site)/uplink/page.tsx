import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { timeAgo } from "@/lib/categories";

export const dynamic = "force-dynamic";

type PostRow = {
  id: string;
  title: string | null;
  body_md: string;
  kind: string;
  created_at: number;
  github_login: string;
  comment_count: number;
  project_display: string | null;
  project_id: string | null;
};

export default async function UplinkPage() {
  const { env } = getCloudflareContext();
  const { results } = await env.DB.prepare(
    `SELECT po.id, po.title, po.body_md, po.kind, po.created_at, po.project_id, u.github_login,
            (SELECT COUNT(*) FROM comments c WHERE c.post_id = po.id AND c.status = 'live') AS comment_count,
            (SELECT CASE WHEN pp.variant_name IS NULL THEN pp.base_name
                         ELSE pp.base_name || ' // ' || pp.variant_name END
             FROM projects pp WHERE pp.id = po.project_id) AS project_display
     FROM posts po JOIN users u ON u.id = po.author_id
     WHERE po.status = 'live'
     ORDER BY po.created_at DESC`,
  ).all<PostRow>();

  return (
    <div className="max-w-3xl">
      <div className="mb-1 flex items-center justify-between">
        <h1 className="font-mono text-2xl font-bold tracking-tight text-white">
          Uplink <span className="text-neutral-600">({results.length})</span>
        </h1>
        <Link
          href="/uplink/new"
          className="rounded-lg border border-cyan-400/50 px-4 py-2 font-mono text-sm font-semibold text-cyan-400 transition hover:bg-cyan-400/10 hover:shadow-[0_0_16px_rgba(34,211,238,0.25)]"
        >
          + new post
        </Link>
      </div>
      <p className="mb-5 font-mono text-sm text-neutral-500">posts, tips, devlogs, tutorials — the feed IS the community</p>
      <div className="space-y-3">
        {results.map((post) => (
          <article
            key={post.id}
            className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 transition hover:border-cyan-400/40 hover:bg-neutral-900/40 hover:shadow-[0_0_24px_rgba(34,211,238,0.07)]"
          >
            <div className="flex flex-wrap items-center gap-2.5">
              <Link href={`/uplink/${post.id}`} className="font-mono text-lg font-bold tracking-tight text-white transition hover:text-cyan-400">
                {post.title ?? "(untitled)"}
              </Link>
              {post.kind === "tutorial" && (
                <span className="rounded-md border border-amber-400/30 bg-neutral-900/80 px-2 py-0.5 font-mono text-xs text-amber-400">
                  tutorial
                </span>
              )}
              {post.project_display && post.project_id && (
                <Link
                  href={`/p/${post.project_id}`}
                  className="rounded-md border border-neutral-700 bg-neutral-900/80 px-2 py-0.5 font-mono text-xs text-neutral-300 transition hover:border-neutral-500"
                >
                  @{post.project_display}
                </Link>
              )}
            </div>
            <p className="mt-1 font-mono text-xs text-neutral-500">
              by <span className="text-neutral-400">@{post.github_login}</span> · {timeAgo(post.created_at)} ·{" "}
              <Link href={`/uplink/${post.id}`} className="transition hover:text-neutral-300">
                {post.comment_count} comment{post.comment_count === 1 ? "" : "s"}
              </Link>
            </p>
            <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-neutral-300">{post.body_md}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
