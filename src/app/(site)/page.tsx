import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { Rss, Compass, Plus } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getUserVotes, getFollowedIds } from "@/lib/queries";
import { ProjectCard, type ProjectFeedRow } from "@/components/project-card";
import { ButtonLink } from "@/components/ui";

export const dynamic = "force-dynamic";

// Feed = what you follow. Empty for new people, so it explains itself and
// points at Popular rather than showing a blank page.
export default async function FeedPage() {
  const user = await getSessionUser();
  const { env } = getCloudflareContext();

  const FEED_COLS = `p.id, p.base_name, p.variant_name, p.category, p.description, p.parent_id, p.created_at,
    u.github_login, u.avatar_url,
    (SELECT COALESCE(SUM(l.value),0) FROM likes l WHERE l.project_id = p.id) AS like_count,
    (SELECT COUNT(*) FROM projects f WHERE f.parent_id = p.id AND f.status='live') AS fork_count,
    (SELECT CASE WHEN pp.variant_name IS NULL THEN pp.base_name
                 ELSE pp.base_name || ' // ' || pp.variant_name END
     FROM projects pp WHERE pp.id = p.parent_id) AS parent_display`;

  const [followed, votes, follows] = user
    ? await Promise.all([
        env.DB.prepare(
          `SELECT ${FEED_COLS} FROM projects p
           JOIN users u ON u.id = p.owner_id
           WHERE p.status='live' AND (
             p.id IN (SELECT project_id FROM follows WHERE user_id = ?1)
             OR p.parent_id IN (SELECT project_id FROM follows WHERE user_id = ?1)
             OR p.root_id IN (SELECT project_id FROM follows WHERE user_id = ?1)
           )
           ORDER BY p.created_at DESC LIMIT 30`,
        ).bind(user.id).all<ProjectFeedRow>().then((r) => r.results),
        getUserVotes(user.id),
        getFollowedIds(user.id),
      ])
    : [[], new Map<string, number>(), new Set<string>()];

  return (
    <div className="mx-auto w-full max-w-4xl">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="flex items-center gap-2.5 font-mono text-2xl font-bold tracking-tight text-white">
            <Rss size={22} className="text-emerald-400" aria-hidden /> Feed
          </h1>
          <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
            Projects you follow, and every new branch that grows off them.
          </p>
        </div>
        <ButtonLink href={user ? "/submit" : "/api/auth/login"} variant="primary">
          <Plus size={16} aria-hidden /> Publish
        </ButtonLink>
      </header>

      {!user ? (
        <EmptyHome
          title="Sign in to build your feed"
          body="Follow projects and branches you care about and they'll show up here — including every new branch someone grows off them."
          cta={{ href: "/api/auth/login", label: "Sign in with GitHub" }}
        />
      ) : followed.length === 0 ? (
        <EmptyHome
          title="You're not following anything yet"
          body="Open any project and hit Follow. New branches off it will land here automatically, so you can watch an idea evolve without checking back."
          cta={{ href: "/popular", label: "Find something to follow" }}
        />
      ) : (
        <div className="stagger space-y-3">
          {followed.map((p) => (
            <ProjectCard key={p.id} p={p} vote={votes.get(p.id) ?? 0} following={follows.has(p.id)} canFollow={!!user} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyHome({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-700 bg-neutral-900/30 p-10 text-center">
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800/60 text-neutral-400">
        <Compass size={20} aria-hidden />
      </span>
      <p className="font-mono text-base font-bold text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-400">{body}</p>
      <div className="mt-5 flex justify-center">
        <ButtonLink href={cta.href} variant="primary">
          {cta.label}
        </ButtonLink>
      </div>
    </div>
  );
}
