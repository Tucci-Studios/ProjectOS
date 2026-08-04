import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import { Bookmark } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getUserVotes, getFollowedIds, getBadgesFor, getBlockedIds, getSavedIds } from "@/lib/queries";
import { ProjectCard, type ProjectFeedRow } from "@/components/project-card";
import { PageHeader } from "@/components/page-header";
import { ButtonLink } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Saves — Project OS" };

export default async function SavesPage() {
  const user = await getSessionUser();
  const { env } = getCloudflareContext();

  const [rows, votes, follows, blocked, savedIds] = user
    ? await Promise.all([
        env.DB.prepare(
          `SELECT p.id, p.base_name, p.variant_name, p.category, p.description, p.parent_id, p.created_at, p.image_url,
                  u.github_login, u.avatar_url, u.is_shadow, p.owner_id, p.source, p.stars, p.github_forks, p.language,
                  (SELECT COALESCE(SUM(l.value),0) FROM likes l WHERE l.project_id = p.id) AS like_count,
                  (SELECT COUNT(*) FROM projects f WHERE f.parent_id = p.id AND f.status='live') AS fork_count,
                  (SELECT COUNT(*) FROM project_comments pc WHERE pc.project_id = p.id AND pc.status='live') AS comment_count,
                  (SELECT GROUP_CONCAT(url, '|') FROM (SELECT url FROM project_images pi WHERE pi.project_id = p.id ORDER BY pi.position LIMIT 5)) AS image_urls,
                  (SELECT CASE WHEN pp.variant_name IS NULL THEN pp.base_name
                               ELSE pp.base_name || ' // ' || pp.variant_name END
                   FROM projects pp WHERE pp.id = p.parent_id) AS parent_display
           FROM saves s
           JOIN projects p ON p.id = s.project_id
           JOIN users u ON u.id = p.owner_id
           WHERE s.user_id = ?1 AND p.status='live'
           ORDER BY s.created_at DESC`,
        ).bind(user.id).all<ProjectFeedRow>().then((r) => r.results),
        getUserVotes(user.id),
        getFollowedIds(user.id),
        getBlockedIds(user.id),
        getSavedIds(user.id),
      ])
    : [[], new Map<string, number>(), new Set<string>(), new Set<string>(), new Set<string>()];

  const saved = rows.filter((p) => !blocked.has(p.owner_id ?? ""));
  const badges = await getBadgesFor(saved.map((p) => p.owner_id ?? ""));

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader
        crumbs={[{ label: "Saves" }]}
        title="Saves"
        purpose="Things you kept for later. Only you can see this list, and saving doesn't sign you up for any alerts — for that, follow it instead."
        Icon={Bookmark}
        accent="text-sky-400"
      />

      {!user ? (
        <Empty
          title="Sign in to save projects"
          body="Saving keeps a private shelf of things you want to come back to."
          cta={{ href: "/api/auth/login", label: "Sign in with GitHub" }}
        />
      ) : saved.length === 0 ? (
        <Empty
          title="Nothing saved yet"
          body="Hit the bookmark on any project and it lands here. Nobody is told, and the author never sees it."
          cta={{ href: "/explore", label: "Find something to save" }}
        />
      ) : (
        <div className="stagger space-y-3">
          {saved.map((p) => (
            <ProjectCard
              key={p.id}
              p={p}
              vote={votes.get(p.id) ?? 0}
              following={follows.has(p.id)}
              saved={savedIds.has(p.id)}
              canFollow
              badges={badges.get(p.owner_id ?? "")}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Empty({ title, body, cta }: { title: string; body: string; cta: { href: string; label: string } }) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-700 bg-neutral-900/30 p-10 text-center">
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800/60 text-neutral-400">
        <Bookmark size={20} aria-hidden />
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
