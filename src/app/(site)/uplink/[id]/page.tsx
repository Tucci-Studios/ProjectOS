import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { timeAgo } from "@/lib/categories";
import { RichBody, type ProjectRef } from "@/components/rich-body";
import { CommentForm } from "./comment-form";

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
  const user = await getSessionUser();
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

  const [{ results: comments }, { results: projectRefs }] = await Promise.all([
    env.DB.prepare(
      `SELECT c.id, c.body_md, c.created_at, u.github_login
       FROM comments c JOIN users u ON u.id = c.author_id
       WHERE c.post_id = ?1 AND c.status = 'live'
       ORDER BY c.created_at ASC`,
    )
      .bind(id)
      .all<CommentRow>(),
    env.DB.prepare(
      `SELECT id, base_name, CASE WHEN variant_name IS NULL THEN base_name
                                  ELSE base_name || ' // ' || variant_name END AS display
       FROM projects WHERE status = 'live'`,
    ).all<ProjectRef>(),
  ]);

  return (
    <div className="max-w-3xl">
      <p className="mb-3 font-mono text-sm">
        <Link href="/uplink" className="text-neutral-500 transition hover:text-neutral-300">
          &larr; uplink
        </Link>
      </p>
      <article className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="font-mono text-xl font-bold tracking-tight text-white">{post.title ?? "(untitled)"}</h1>
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
          <span className="text-neutral-600">#{post.id}</span>
        </p>
        <div className="mt-4 text-[15px] leading-relaxed text-neutral-200">
          <RichBody text={post.body_md} projects={projectRefs} />
        </div>
      </article>

      <section className="mt-6">
        <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-600">
          {comments.length} comment{comments.length === 1 ? "" : "s"}
        </h2>
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-xl border border-neutral-800/60 bg-neutral-950/40 p-4">
              <p className="font-mono text-xs text-neutral-500">
                <span className="text-neutral-400">@{c.github_login}</span> · {timeAgo(c.created_at)}
              </p>
              <div className="mt-1.5 text-[15px] leading-relaxed text-neutral-300">
                <RichBody text={c.body_md} projects={projectRefs} />
              </div>
            </div>
          ))}
        </div>
        <CommentForm postId={post.id} signedIn={!!user} />
      </section>
    </div>
  );
}
