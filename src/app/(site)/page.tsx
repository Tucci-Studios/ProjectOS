import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { MessageCircle, BookOpen, HelpCircle, Megaphone, Plus } from "lucide-react";
import { timeAgo } from "@/lib/categories";
import { FeaturedStrip, type FeaturedProject } from "@/components/featured-strip";
import { ButtonLink } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type PostRow = {
  id: string;
  title: string | null;
  body_md: string;
  kind: string;
  created_at: number;
  github_login: string;
  avatar_url: string | null;
  comment_count: number;
  project_display: string | null;
  project_id: string | null;
};

const KIND_META: Record<string, { label: string; Icon: typeof MessageCircle; text: string; border: string }> = {
  post: { label: "Update", Icon: Megaphone, text: "text-neutral-300", border: "border-neutral-600" },
  tutorial: { label: "Tutorial", Icon: BookOpen, text: "text-amber-300", border: "border-amber-400/40" },
  request: { label: "Question", Icon: HelpCircle, text: "text-sky-300", border: "border-sky-400/40" },
};

export default async function FeedPage() {
  const { env } = getCloudflareContext();
  const user = await getSessionUser();
  const now = Math.floor(Date.now() / 1000);

  const [featured, { results: posts }] = await Promise.all([
    env.DB.prepare(
      `SELECT p.id, p.base_name, p.variant_name, p.category, p.description, u.github_login,
              (SELECT COALESCE(SUM(l.value),0) FROM likes l WHERE l.project_id = p.id AND l.created_at > ?1) AS week_likes,
              (SELECT COALESCE(SUM(l.value),0) FROM likes l WHERE l.project_id = p.id) AS like_count,
              (SELECT COUNT(*) FROM projects f WHERE f.parent_id = p.id AND f.status='live') AS fork_count
       FROM projects p JOIN users u ON u.id = p.owner_id
       WHERE p.status='live' ORDER BY week_likes DESC, like_count DESC LIMIT 1`,
    )
      .bind(now - 7 * 86400)
      .first<FeaturedProject & { week_likes: number }>(),
    env.DB.prepare(
      `SELECT po.id, po.title, po.body_md, po.kind, po.created_at, po.project_id,
              u.github_login, u.avatar_url,
              (SELECT COUNT(*) FROM comments c WHERE c.post_id = po.id AND c.status='live') AS comment_count,
              (SELECT CASE WHEN pp.variant_name IS NULL THEN pp.base_name
                           ELSE pp.base_name || ' // ' || pp.variant_name END
               FROM projects pp WHERE pp.id = po.project_id) AS project_display
       FROM posts po JOIN users u ON u.id = po.author_id
       WHERE po.status='live' ORDER BY po.created_at DESC LIMIT 30`,
    ).all<PostRow>(),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {featured && <FeaturedStrip p={featured} />}

      {/* Composer prompt */}
      <div className="flex items-center gap-3 rounded-xl border border-neutral-700/80 bg-neutral-900/50 p-3">
        {user?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar_url} alt="" className="h-9 w-9 shrink-0 rounded-full border border-neutral-600" />
        ) : (
          <span className="h-9 w-9 shrink-0 rounded-full border border-neutral-600 bg-neutral-800" aria-hidden />
        )}
        <Link
          href={user ? "/wire/new" : "/api/auth/login"}
          className="min-w-0 flex-1 rounded-lg border border-neutral-700 bg-neutral-800/60 px-4 py-2.5 text-sm text-neutral-500 outline-none transition hover:border-emerald-400/50 hover:text-neutral-300 focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          {user ? "Share an update, ask a question, write a tutorial..." : "Sign in to post"}
        </Link>
        <ButtonLink href={user ? "/wire/new" : "/api/auth/login"} variant="primary" className="!min-h-[40px] !px-3">
          <Plus size={16} aria-hidden />
        </ButtonLink>
      </div>

      {posts.map((post) => {
        const k = KIND_META[post.kind] ?? KIND_META.post;
        return (
          <article
            key={post.id}
            className="group relative rounded-xl border border-neutral-700/80 bg-neutral-900/50 p-4 transition duration-200 hover:border-neutral-500 hover:bg-neutral-800/40"
          >
            <div className="flex items-center gap-2.5">
              {post.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.avatar_url} alt="" className="h-8 w-8 rounded-full border border-neutral-700" />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 font-mono text-[11px] text-neutral-400">
                  {post.github_login.slice(0, 2)}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs text-neutral-300">@{post.github_login}</p>
                <p className="font-mono text-[11px] text-neutral-500">{timeAgo(post.created_at)}</p>
              </div>
              <span className={`inline-flex items-center gap-1 rounded border ${k.border} px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${k.text}`}>
                <k.Icon size={11} aria-hidden /> {k.label}
              </span>
            </div>

            <h2 className="mt-3 font-mono text-base font-bold leading-snug text-white transition group-hover:text-emerald-300">
              <Link href={`/wire/${post.id}`} className="outline-none after:absolute after:inset-0 after:content-['']">
                {post.title ?? "(untitled)"}
              </Link>
            </h2>
            <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-neutral-400">{post.body_md}</p>

            <div className="relative z-[1] mt-3 flex flex-wrap items-center gap-3 font-mono text-[11px] text-neutral-500">
              <span className="inline-flex items-center gap-1">
                <MessageCircle size={12} aria-hidden /> {post.comment_count}
              </span>
              {post.project_display && post.project_id && (
                <Link
                  href={`/p/${post.project_id}`}
                  className="rounded border border-neutral-700 px-1.5 py-0.5 text-neutral-300 transition hover:border-emerald-400/50 hover:text-emerald-300"
                >
                  {post.project_display}
                </Link>
              )}
            </div>
          </article>
        );
      })}

      {posts.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-700 p-10 text-center text-sm text-neutral-500">
          Nothing posted yet. Be the first — share what you&apos;re building.
        </p>
      )}
    </div>
  );
}
