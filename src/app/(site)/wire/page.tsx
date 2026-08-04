import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { Radio } from "lucide-react";
import { timeAgo } from "@/lib/categories";
import { PageHeader } from "@/components/page-header";
import { ButtonLink } from "@/components/ui";
import { TutorialCard } from "@/components/tutorial-body";

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

export default async function WirePage() {
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
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Community feed" }]}
        title="Community feed"
        purpose="Devlogs, tips, questions, and tutorials from people building here. Post an update, ask for help, or share what you learned."
        Icon={Radio}
        accent="text-sky-400"
        action={
          <ButtonLink href="/wire/new" variant="outline">
            + New post
          </ButtonLink>
        }
      />
      <div className="space-y-3">
        {results.map((post) =>
          post.kind === "tutorial" ? (
            <TutorialCard
              key={post.id}
              id={post.id}
              title={post.title}
              bodyMd={post.body_md}
              author={post.github_login}
              when={timeAgo(post.created_at)}
              comments={post.comment_count}
            />
          ) : (
          <article
            key={post.id}
            className="rounded-xl border border-neutral-700 bg-neutral-900/60 p-4 transition hover:border-emerald-400/40 hover:bg-neutral-800/40 hover:shadow-[0_0_24px_rgba(52,211,153,0.07)]"
          >
            <div className="flex flex-wrap items-center gap-2.5">
              <Link href={`/wire/${post.id}`} className="font-mono text-lg font-bold tracking-tight text-white transition hover:text-emerald-400">
                {post.title ?? "(untitled)"}
              </Link>
              {post.kind === "request" && (
                <span className="rounded-md border border-violet-400/30 bg-neutral-800/80 px-2 py-0.5 font-mono text-xs text-violet-400">
                  request
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
            <p className="mt-1 font-mono text-xs text-neutral-500">
              by <span className="text-neutral-400">@{post.github_login}</span> · {timeAgo(post.created_at)} ·{" "}
              <Link href={`/wire/${post.id}`} className="transition hover:text-neutral-300">
                {post.comment_count} comment{post.comment_count === 1 ? "" : "s"}
              </Link>
            </p>
            <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-neutral-300">{post.body_md}</p>
          </article>
          ),
        )}
      </div>
    </div>
  );
}
