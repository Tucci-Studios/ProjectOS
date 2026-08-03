import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { Rss, Compass } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getUserVotes, getFollowedIds, getBadgesFor, getBlockedIds , getSavedIds } from "@/lib/queries";
import { ProjectCard, type ProjectFeedRow } from "@/components/project-card";
import { UpdateCard, type FeedUpdate } from "@/components/update-card";
import { ButtonLink } from "@/components/ui";

export const dynamic = "force-dynamic";

// Feed = what you follow. Empty for new people, so it explains itself and
// points at Popular rather than showing a blank page.
export default async function FeedPage() {
  const user = await getSessionUser();
  const { env } = getCloudflareContext();

  const FEED_COLS = `p.id, p.base_name, p.variant_name, p.category, p.description, p.parent_id, p.created_at, p.image_url,
    u.github_login, u.avatar_url, p.owner_id, p.source, p.stars, p.language,
    (SELECT COALESCE(SUM(l.value),0) FROM likes l WHERE l.project_id = p.id) AS like_count,
    (SELECT COUNT(*) FROM projects f WHERE f.parent_id = p.id AND f.status='live') AS fork_count,
              (SELECT COUNT(*) FROM project_comments pc WHERE pc.project_id = p.id AND pc.status='live') AS comment_count,
            (SELECT GROUP_CONCAT(url, '|') FROM (SELECT url FROM project_images pi WHERE pi.project_id = p.id ORDER BY pi.position LIMIT 5)) AS image_urls,
    (SELECT CASE WHEN pp.variant_name IS NULL THEN pp.base_name
                 ELSE pp.base_name || ' // ' || pp.variant_name END
     FROM projects pp WHERE pp.id = p.parent_id) AS parent_display`;

  const [followedRaw, votes, follows, blocked, updateRows, savedIds] = user
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
        getBlockedIds(user.id),
        // Updates the owner posted to anything you follow. Forks are rare;
        // this is what keeps the feed alive between them.
        env.DB.prepare(
          `SELECT pu.id, pu.project_id, pu.version, pu.body_md, pu.created_at, u.github_login, p.owner_id,
                  CASE WHEN p.variant_name IS NULL THEN p.base_name
                       ELSE p.base_name || ' // ' || p.variant_name END AS project_display
           FROM project_updates pu
           JOIN projects p ON p.id = pu.project_id
           JOIN users u ON u.id = pu.author_id
           WHERE pu.status='live' AND p.status='live'
             AND pu.project_id IN (SELECT project_id FROM follows WHERE user_id = ?1)
           ORDER BY pu.created_at DESC LIMIT 30`,
        ).bind(user.id).all<FeedUpdate & { owner_id: string }>().then((r) => r.results),
        getSavedIds(user.id),
      ])
    : [[], new Map<string, number>(), new Set<string>(), new Set<string>(), [], new Set<string>()];

  const followed = followedRaw.filter((p) => !blocked.has(p.owner_id ?? ""));
  const badges = await getBadgesFor(followed.map((p) => p.owner_id ?? ""));

  // One timeline: new forks and updates interleaved by when they happened.
  const timeline = [
    ...followed.map((p) => ({ kind: "project" as const, at: p.created_at, p })),
    ...updateRows.filter((u) => !blocked.has(u.owner_id)).map((u) => ({ kind: "update" as const, at: u.created_at, u })),
  ].sort((a, b) => b.at - a.at);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="flex items-center gap-2.5 font-mono text-2xl font-bold tracking-tight text-white">
            <Rss size={22} className="text-emerald-400" aria-hidden /> Feed
          </h1>
          <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
            Projects you follow — the updates their owners post, and every new fork someone makes of them.
          </p>
        </div>
      </header>

      {!user ? (
        <EmptyHome
          title="Sign in to build your feed"
          body="Follow projects and forks you care about and they'll show up here — every update their owner posts, and every fork someone makes of them."
          cta={{ href: "/api/auth/login", label: "Sign in with GitHub" }}
        />
      ) : timeline.length === 0 ? (
        <EmptyHome
          title="You're not following anything yet"
          body="Open any project and hit Follow. Its updates and any new forks of it land here automatically, so you can watch an idea evolve without checking back."
          cta={{ href: "/popular", label: "Find something to follow" }}
        />
      ) : (
        <div className="stagger space-y-3">
          {timeline.map((item) =>
            item.kind === "project" ? (
              <ProjectCard
                key={item.p.id}
                p={item.p}
                vote={votes.get(item.p.id) ?? 0}
                following={follows.has(item.p.id)} saved={savedIds.has(item.p.id)}
                canFollow={!!user}
                badges={badges.get(item.p.owner_id ?? "")}
              />
            ) : (
              <UpdateCard key={item.u.id} u={item.u} />
            ),
          )}
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
