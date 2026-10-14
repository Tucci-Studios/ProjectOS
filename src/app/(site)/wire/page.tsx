import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { Radio, MessageSquare, HelpCircle } from "lucide-react";
import { timeAgo } from "@/lib/categories";
import { PageHeader } from "@/components/page-header";
import { ButtonLink } from "@/components/ui";

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
     WHERE po.status = 'live' AND po.kind != 'tutorial'
     ORDER BY po.created_at DESC`,
  ).all<PostRow>();

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Community feed" }]}
        title="Community feed"
        Icon={Radio}
        accent="text-sky-400"
        action={
          <ButtonLink href="/wire/new" variant="outline">
            + New post
          </ButtonLink>
        }
      />
      {results.length === 0 && (
        <div className="rounded-xl border border-dashed border-sky-400/25 p-10 text-center">
          <Radio size={22} className="mx-auto text-sky-400/50" aria-hidden />
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-neutral-400">
            Nothing posted yet. This is where people say what they&apos;re building, what broke, and what they worked
            out — the things a repo never tells you.
          </p>
          <Link
            href="/wire/new"
            className="mt-4 inline-block font-mono text-[13px] font-bold text-sky-300 hover:underline"
          >
            Start it off →
          </Link>
        </div>
      )}

      <div className="stagger grid gap-2.5 sm:grid-cols-2">
        {results.map((post) => {
          // A dot per kind, so you can tell a question from a devlog while
          // scanning rather than after reading the title.
          const isRequest = post.kind === "request";
          const hex = isRequest ? "#a78bfa" : "#38bdf8";
          return (
            <article
              key={post.id}
              className="group relative flex gap-3 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/40 p-3 transition hover:border-neutral-600 hover:bg-neutral-800/40"
              style={{ borderLeftColor: hex, borderLeftWidth: 3 }}
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border"
                style={{ borderColor: `${hex}44`, backgroundColor: `${hex}14`, color: hex }}
                aria-hidden
              >
                {isRequest ? <HelpCircle size={17} /> : <MessageSquare size={17} />}
              </div>

              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-1.5 font-mono text-[10px] font-bold uppercase tracking-widest">
                  <span style={{ color: hex }}>{isRequest ? "Help wanted" : "Devlog"}</span>
                  {post.project_display && post.project_id && (
                    <span className="font-normal tracking-normal text-neutral-400">· @{post.project_display}</span>
                  )}
                </p>
                <h3 className="mt-1 line-clamp-2 font-mono text-[13.5px] font-bold leading-snug tracking-tight text-white">
                  {post.title ?? "(untitled)"}
                </h3>
                <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-neutral-400">{post.body_md}</p>
                <p className="mt-1.5 truncate font-mono text-[11px] text-neutral-400">
                  @{post.github_login} · {timeAgo(post.created_at)}
                  {post.comment_count > 0 &&
                    ` · ${post.comment_count} comment${post.comment_count === 1 ? "" : "s"}`}
                </p>
              </div>
              <Link href={`/wire/${post.id}`} aria-label={post.title ?? "post"} className="absolute inset-0" />
            </article>
          );
        })}
      </div>
    </div>
  );
}
