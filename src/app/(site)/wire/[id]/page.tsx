import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { TutorialView } from "@/components/tutorial-view";
import type { OwnerMark } from "@/components/owner-mark";
import { parseGuide, TUTORIAL_SPEC } from "@/lib/tutorial-guide";
import { siteUrl } from "@/lib/site";
import { timeAgo } from "@/lib/categories";
import { RichBody, type ProjectRef } from "@/components/rich-body";
import { TutorialBody } from "@/components/tutorial-body";
import { CommentForm } from "./comment-form";

export const dynamic = "force-dynamic";

type PostRow = {
  author_id: string;
  edited_at: number | null;
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
    `SELECT po.id, po.title, po.body_md, po.kind, po.created_at, po.edited_at, po.project_id, po.author_id, u.github_login,
            (SELECT CASE WHEN pp.variant_name IS NULL THEN pp.base_name
                         ELSE pp.base_name || ' // ' || pp.variant_name END
             FROM projects pp WHERE pp.id = po.project_id) AS project_display
     FROM posts po JOIN users u ON u.id = po.author_id
     WHERE po.id = ?1 AND po.status = 'live'`,
  )
    .bind(id)
    .first<PostRow>();
  if (!post) notFound();

  // Guide-format tutorials render themselves; the page only supplies the
  // things that live outside the body — who wrote it, and the reactions.
  const guide = post.kind === "tutorial" ? parseGuide(post.body_md) : null;

  // The project owner's verdict, and whether the person reading is that owner.
  const ownerRow = post.project_id
    ? await env.DB.prepare(
        `SELECT m.kind, m.note, m.created_at AS marked_at, u.github_login AS by, p.owner_id
         FROM projects p
         LEFT JOIN tutorial_owner_marks m ON m.post_id = ?1
         LEFT JOIN users u ON u.id = m.by_user_id
         WHERE p.id = ?2`,
      )
        .bind(post.id, post.project_id)
        .first<{ kind: string | null; note: string | null; marked_at: number | null; by: string | null; owner_id: string }>()
    : null;

  const ownerMark: OwnerMark =
    ownerRow?.kind === "approved" || ownerRow?.kind === "disputed"
      ? {
          kind: ownerRow.kind as "approved" | "disputed",
          note: ownerRow.note,
          by: ownerRow.by ?? "the owner",
          // The verdict is stale once the guide changed after it was given.
          stale: !!post.edited_at && !!ownerRow.marked_at && post.edited_at > ownerRow.marked_at,
        }
      : null;
  const writtenByOwner = !!ownerRow && ownerRow.owner_id === post.author_id;
  const viewerOwnsProject = !!user && !!ownerRow && ownerRow.owner_id === user.id;

  const [likeRow, likedRow, savedRow] = await Promise.all([
    env.DB.prepare("SELECT COUNT(*) AS n FROM post_likes WHERE post_id = ?1").bind(post.id).first<{ n: number }>(),
    user
      ? env.DB.prepare("SELECT 1 FROM post_likes WHERE user_id = ?1 AND post_id = ?2").bind(user.id, post.id).first()
      : Promise.resolve(null),
    user
      ? env.DB.prepare("SELECT 1 FROM post_saves WHERE user_id = ?1 AND post_id = ?2").bind(user.id, post.id).first()
      : Promise.resolve(null),
  ]);
  const likeCount = likeRow?.n ?? 0;
  const hasLiked = !!likedRow;
  const hasSaved = !!savedRow;

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
        <Link href="/wire" className="text-neutral-400 transition hover:text-neutral-300">
          &larr; wire
        </Link>
      </p>
      {guide ? (
        <TutorialView
          t={guide}
          spec={TUTORIAL_SPEC}
          specUrl={`${siteUrl()}/tutorial-template.md`}
          post={{
            id: post.id,
            author: post.github_login,
            when: timeAgo(post.created_at),
            editedWhen: post.edited_at ? timeAgo(post.edited_at) : null,
            likes: likeCount,
            liked: hasLiked,
            saved: hasSaved,
            canReact: !!user,
            canEdit: !!user && (user.id === post.author_id || user.role === "admin" || user.role === "mod"),
          }}
          owner={{ mark: ownerMark, writtenByOwner, viewerIsOwner: viewerOwnsProject }}
        />
      ) : (
      <article className="rounded-xl border border-neutral-700 bg-neutral-900/60 p-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="font-mono text-xl font-bold tracking-tight text-white">{post.title ?? "(untitled)"}</h1>
          {post.kind === "tutorial" && (
            <span className="rounded-md border border-amber-400/30 bg-neutral-800/80 px-2 py-0.5 font-mono text-xs text-amber-400">
              tutorial
            </span>
          )}
          {post.kind === "request" && (
            <span className="rounded-md border border-violet-400/30 bg-neutral-800/80 px-2 py-0.5 font-mono text-xs text-violet-400">
              tutorial request
            </span>
          )}
          {post.project_display && post.project_id && (
            <Link
              href={`/p/${post.project_id}`}
              className="rounded-md border border-neutral-700 bg-neutral-800/80 px-2 py-0.5 font-mono text-xs text-neutral-300 transition hover:border-neutral-500"
            >
              @{post.project_display}
            </Link>
          )}
        </div>
        <p className="mt-1 font-mono text-xs text-neutral-400">
          by <span className="text-neutral-400">@{post.github_login}</span> · {timeAgo(post.created_at)} ·{" "}
          <span className="text-neutral-400">#{post.id}</span>
        </p>
        <div className="mt-4 text-[15px] leading-relaxed text-neutral-200">
          {post.kind === "tutorial" ? (
            <TutorialBody text={post.body_md} projects={projectRefs} />
          ) : (
            <RichBody text={post.body_md} projects={projectRefs} />
          )}
        </div>
      </article>
      )}

      <section id="comments" className="mt-6 scroll-mt-24">
        <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-400">
          {comments.length} comment{comments.length === 1 ? "" : "s"}
        </h2>
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-xl border border-neutral-700/60 bg-neutral-900/40 p-4">
              <p className="font-mono text-xs text-neutral-400">
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
