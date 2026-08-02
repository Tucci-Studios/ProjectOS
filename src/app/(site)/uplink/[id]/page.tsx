import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { notFound } from "next/navigation";
import { timeAgo } from "@/lib/categories";

export const dynamic = "force-dynamic";

type PostRow = {
  id: string;
  title: string | null;
  body_md: string;
  kind: string;
  created_at: number;
  github_login: string;
  project_display: string | null;
  project_id: string | null;
};
type CommentRow = { id: string; body_md: string; created_at: number; github_login: string };

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { env } = getCloudflareContext();
  const post = await env.DB.prepare(
    `SELECT po.id, po.title, po.body_md, po.kind, po.created_at, po.project_id, u.github_login,
            (SELECT CASE WHEN pp.variant_name IS NULL THEN pp.base_name
                         ELSE pp.base_name || ' // ' || pp.variant_name END
             FROM projects pp WHERE pp.id = po.project_id) AS project_display
     FROM posts po JOIN users u ON u.id = po.author_id
     WHERE po.id = ?1 AND po.status = 'live'`,
  )
    .bind(id)
    .first<PostRow>();
  if (!post) notFound();

  const { results: comments } = await env.DB.prepare(
    `SELECT c.id, c.body_md, c.created_at, u.github_login
     FROM comments c JOIN users u ON u.id = c.author_id
     WHERE c.post_id = ?1 AND c.status = 'live'
     ORDER BY c.created_at ASC`,
  )
    .bind(id)
    .all<CommentRow>();

  return (
    <div className="max-w-3xl">
      <p className="mb-3 font-mono text-xs">
        <Link href="/uplink" className="text-neutral-500 hover:text-neutral-300">
          &larr; uplink
        </Link>
      </p>
      <article className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-mono text-lg font-bold text-white">{post.title ?? "(untitled)"}</h1>
          {post.kind === "tutorial" && (
            <span className="rounded border border-amber-400/30 bg-neutral-900/60 px-1.5 py-0.5 font-mono text-[10px] text-amber-400">
              tutorial
            </span>
          )}
          {post.project_display && post.project_id && (
            <Link
              href={`/p/${post.project_id}`}
              className="rounded border border-neutral-700 bg-neutral-900/60 px-1.5 py-0.5 font-mono text-[10px] text-neutral-300 hover:border-neutral-500"
            >
              @{post.project_display}
            </Link>
          )}
        </div>
        <p className="mt-1 font-mono text-[11px] text-neutral-500">
          by @{post.github_login} · {timeAgo(post.created_at)}
        </p>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-neutral-300">{post.body_md}</p>
      </article>

      <section className="mt-6">
        <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600">
          {comments.length} comment{comments.length === 1 ? "" : "s"}
        </h2>
        <div className="space-y-2">
          {comments.map((c) => (
            <div key={c.id} className="rounded-lg border border-neutral-800/60 bg-neutral-950/40 p-3">
              <p className="font-mono text-[11px] text-neutral-500">
                @{c.github_login} · {timeAgo(c.created_at)}
              </p>
              <p className="mt-1 text-sm text-neutral-300">{c.body_md}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 font-mono text-[10px] text-neutral-700">(posting + commenting UI lands with the scrubber)</p>
      </section>
    </div>
  );
}
