import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { User, Boxes, Heart, MessageCircle, Megaphone, Plus } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getUserVotes } from "@/lib/queries";
import { ProjectCard, type ProjectFeedRow } from "@/components/project-card";
import { PageHeader } from "@/components/page-header";
import { ButtonLink } from "@/components/ui";
import { timeAgo } from "@/lib/categories";

export const dynamic = "force-dynamic";

const FEED_COLS = `p.id, p.base_name, p.variant_name, p.category, p.description, p.parent_id, p.created_at, p.image_url,
  u.github_login, u.avatar_url,
  (SELECT COALESCE(SUM(l.value),0) FROM likes l WHERE l.project_id = p.id) AS like_count,
  (SELECT COUNT(*) FROM projects f WHERE f.parent_id = p.id AND f.status='live') AS fork_count,
  (SELECT CASE WHEN pp.variant_name IS NULL THEN pp.base_name
               ELSE pp.base_name || ' // ' || pp.variant_name END
   FROM projects pp WHERE pp.id = p.parent_id) AS parent_display`;

export default async function MyStuffPage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-lg">
        <PageHeader
          crumbs={[{ label: "You" }]}
          title="You"
          purpose="Your projects, your posts, and the replies you've gotten — all in one place."
          Icon={User}
        />
        <div className="rounded-xl border border-neutral-700 bg-neutral-900/50 p-10 text-center">
          <p className="text-sm text-neutral-400">Sign in to see everything you&apos;ve made and everything people said back.</p>
          <div className="mt-5 flex justify-center">
            <ButtonLink href="/api/auth/login" variant="primary">
              Sign in with GitHub
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  const { env } = getCloudflareContext();
  const [myProjects, myPosts, repliesToMe, myLikes, votes] = await Promise.all([
    env.DB.prepare(
      `SELECT ${FEED_COLS} FROM projects p JOIN users u ON u.id = p.owner_id
       WHERE p.owner_id = ?1 AND p.status='live' ORDER BY p.created_at DESC`,
    ).bind(user.id).all<ProjectFeedRow>().then((r) => r.results),
    env.DB.prepare(
      `SELECT po.id, po.title, po.kind, po.created_at,
              (SELECT COUNT(*) FROM comments c WHERE c.post_id = po.id AND c.status='live') AS comment_count
       FROM posts po WHERE po.author_id = ?1 AND po.status='live' ORDER BY po.created_at DESC`,
    ).bind(user.id).all<{ id: string; title: string | null; kind: string; created_at: number; comment_count: number }>().then((r) => r.results),
    env.DB.prepare(
      `SELECT c.id, c.body_md, c.created_at, c.post_id, u.github_login, po.title AS post_title
       FROM comments c
       JOIN posts po ON po.id = c.post_id
       JOIN users u ON u.id = c.author_id
       WHERE po.author_id = ?1 AND c.author_id != ?1 AND c.status='live'
       ORDER BY c.created_at DESC LIMIT 20`,
    ).bind(user.id).all<{ id: string; body_md: string; created_at: number; post_id: string; github_login: string; post_title: string | null }>().then((r) => r.results),
    env.DB.prepare(
      `SELECT ${FEED_COLS} FROM likes l
       JOIN projects p ON p.id = l.project_id
       JOIN users u ON u.id = p.owner_id
       WHERE l.user_id = ?1 AND p.status='live' ORDER BY l.created_at DESC`,
    ).bind(user.id).all<ProjectFeedRow>().then((r) => r.results),
    getUserVotes(user.id),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        crumbs={[{ label: "You" }]}
        title={`@${user.github_login}`}
        purpose="Everything you've published, posted, liked — and what people said back."
        Icon={User}
        action={
          <ButtonLink href="/submit" variant="primary">
            <Plus size={16} aria-hidden /> Publish a project
          </ButtonLink>
        }
      />

      {/* Replies to you */}
      <Section title="Replies to you" Icon={MessageCircle} count={repliesToMe.length}>
        {repliesToMe.length === 0 ? (
          <Empty text="No replies yet. Post something on the feed and see who bites." />
        ) : (
          <div className="space-y-2">
            {repliesToMe.map((c) => (
              <Link
                key={c.id}
                href={`/wire/${c.post_id}`}
                className="block rounded-xl border border-neutral-700/80 bg-neutral-900/50 p-3.5 outline-none transition hover:border-neutral-500 hover:bg-neutral-800/40 focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <p className="font-mono text-[11px] text-neutral-500">
                  <span className="text-neutral-300">@{c.github_login}</span> on{" "}
                  <span className="text-neutral-300">{c.post_title}</span> · {timeAgo(c.created_at)}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-neutral-300">{c.body_md}</p>
              </Link>
            ))}
          </div>
        )}
      </Section>

      {/* Your projects */}
      <Section title="Your projects" Icon={Boxes} count={myProjects.length}>
        {myProjects.length === 0 ? (
          <Empty text="You haven't published anything yet. Hit Publish and put your first project up." />
        ) : (
          <div className="space-y-3">
            {myProjects.map((p) => (
              <ProjectCard key={p.id} p={p} vote={votes.get(p.id) ?? 0} />
            ))}
          </div>
        )}
      </Section>

      {/* Your posts */}
      <Section title="Your posts" Icon={Megaphone} count={myPosts.length}>
        {myPosts.length === 0 ? (
          <Empty text="Nothing posted yet." />
        ) : (
          <div className="space-y-2">
            {myPosts.map((post) => (
              <Link
                key={post.id}
                href={`/wire/${post.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-neutral-700/80 bg-neutral-900/50 p-3.5 outline-none transition hover:border-neutral-500 hover:bg-neutral-800/40 focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <span className="min-w-0">
                  <span className="block truncate font-mono text-sm text-neutral-200">{post.title ?? "(untitled)"}</span>
                  <span className="font-mono text-[11px] text-neutral-500">
                    {post.kind} · {timeAgo(post.created_at)}
                  </span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[11px] text-neutral-500">
                  <MessageCircle size={12} aria-hidden /> {post.comment_count}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Section>

      {/* Liked */}
      <Section title="Liked projects" Icon={Heart} count={myLikes.length}>
        {myLikes.length === 0 ? (
          <Empty text="Nothing liked yet. Explore and tap the arrow on anything good." />
        ) : (
          <div className="space-y-3">
            {myLikes.map((p) => (
              <ProjectCard key={p.id} p={p} vote={votes.get(p.id) ?? 0} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  Icon,
  count,
  children,
}: {
  title: string;
  Icon: typeof Boxes;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 flex items-center gap-2 font-mono text-sm font-bold text-neutral-200">
        <Icon size={15} className="text-neutral-500" aria-hidden />
        {title}
        <span className="font-normal text-neutral-500">{count}</span>
      </h2>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-neutral-700 p-6 text-center text-sm text-neutral-500">{text}</p>
  );
}
