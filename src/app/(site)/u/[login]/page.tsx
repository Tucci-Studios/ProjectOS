import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Boxes, Megaphone, GitBranch, Heart, ExternalLink } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getUserVotes, getBadges } from "@/lib/queries";
import { ProjectCard, type ProjectFeedRow } from "@/components/project-card";
import { ReportButton } from "@/components/report-button";
import { UserBadges } from "@/components/user-badges";
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

export default async function ProfilePage({ params }: { params: Promise<{ login: string }> }) {
  const { login } = await params;
  const viewer = await getSessionUser();
  const { env } = getCloudflareContext();

  const person = await env.DB.prepare(
    "SELECT id, github_login, display_name, avatar_url, role, created_at FROM users WHERE github_login = ?1 AND banned_at IS NULL",
  )
    .bind(login)
    .first<{ id: string; github_login: string; display_name: string | null; avatar_url: string | null; role: string; created_at: number }>();
  if (!person) notFound();

  const [projects, posts, stats, ideasShipped, votes, badges] = await Promise.all([
    env.DB.prepare(
      `SELECT ${FEED_COLS} FROM projects p JOIN users u ON u.id = p.owner_id
       WHERE p.owner_id = ?1 AND p.status='live' ORDER BY like_count DESC, p.created_at DESC`,
    ).bind(person.id).all<ProjectFeedRow>().then((r) => r.results),
    env.DB.prepare(
      `SELECT id, title, kind, created_at FROM posts WHERE author_id = ?1 AND status='live'
       ORDER BY created_at DESC LIMIT 10`,
    ).bind(person.id).all<{ id: string; title: string | null; kind: string; created_at: number }>().then((r) => r.results),
    env.DB.prepare(
      `SELECT
        (SELECT COUNT(*) FROM projects WHERE owner_id = ?1 AND status='live') AS projects,
        (SELECT COALESCE(SUM(l.value),0) FROM likes l JOIN projects p ON p.id = l.project_id WHERE p.owner_id = ?1) AS votes,
        (SELECT COUNT(*) FROM projects f JOIN projects par ON par.id = f.parent_id
          WHERE par.owner_id = ?1 AND f.status='live') AS branches_of_theirs`,
    ).bind(person.id).first<{ projects: number; votes: number; branches_of_theirs: number }>(),
    env.DB.prepare("SELECT COUNT(*) AS n FROM ideas WHERE author_id = ?1 AND status = 'shipped'")
      .bind(person.id)
      .first<{ n: number }>(),
    getUserVotes(viewer?.id),
    getBadges(person.id),
  ]);

  const isYou = viewer?.id === person.id;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Profile header */}
      <header className="mb-7 border-b border-neutral-800 pb-6">
        <div className="flex flex-wrap items-start gap-4">
          {person.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={person.avatar_url}
              alt=""
              className="h-16 w-16 rounded-full border border-neutral-600"
            />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-neutral-600 bg-neutral-800 font-mono text-lg text-neutral-300">
              {person.github_login.slice(0, 2)}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="flex flex-wrap items-center gap-2 font-mono text-2xl font-bold tracking-tight text-white">
              @{person.github_login}
              <UserBadges badges={badges} size="md" showTree />
            </h1>
            {person.display_name && <p className="text-sm text-neutral-400">{person.display_name}</p>}
            <p className="mt-1 font-mono text-[11px] text-neutral-500">
              on Project OS since {new Date(person.created_at * 1000).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-4 font-mono text-[13px]">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <Boxes size={14} className="text-neutral-500" aria-hidden /> {stats?.projects ?? 0} projects
              </span>
              <span className="flex items-center gap-1.5 text-neutral-300">
                <Heart size={14} className="text-neutral-500" aria-hidden /> {stats?.votes ?? 0} votes
              </span>
              <span className="flex items-center gap-1.5 text-neutral-300">
                <GitBranch size={14} className="text-neutral-500" aria-hidden /> {stats?.branches_of_theirs ?? 0} branches off their work
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <ButtonLink href={`https://github.com/${person.github_login}`} variant="ghost" external className="!min-h-[38px]">
              GitHub <ExternalLink size={14} aria-hidden />
            </ButtonLink>
            {isYou ? (
              <Link href="/me" className="font-mono text-[11px] text-neutral-500 transition hover:text-neutral-300">
                This is you — go to your page
              </Link>
            ) : (
              <ReportButton targetType="user" targetId={person.id} signedIn={!!viewer} label="Report user" />
            )}
          </div>
        </div>
      </header>

      <section className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 font-mono text-sm font-bold text-neutral-200">
          <Boxes size={15} className="text-neutral-500" aria-hidden /> Projects
          <span className="font-normal text-neutral-500">{projects.length}</span>
        </h2>
        {projects.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-700 p-6 text-center text-sm text-neutral-500">
            Nothing published yet.
          </p>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} p={p} vote={votes.get(p.id) ?? 0} />
            ))}
          </div>
        )}
      </section>

      {posts.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-mono text-sm font-bold text-neutral-200">
            <Megaphone size={15} className="text-neutral-500" aria-hidden /> Recent posts
          </h2>
          <div className="space-y-2">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/wire/${post.id}`}
                className="block rounded-xl border border-neutral-700/70 bg-neutral-900/40 p-3.5 outline-none transition hover:border-neutral-500 hover:bg-neutral-800/40 focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <span className="block truncate font-mono text-sm text-neutral-200">{post.title ?? "(untitled)"}</span>
                <span className="font-mono text-[11px] text-neutral-500">
                  {post.kind} · {timeAgo(post.created_at)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
