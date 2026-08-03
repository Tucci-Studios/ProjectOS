import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { Flame, Plus } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getUserVotes, getFollowedIds, getBadgesFor } from "@/lib/queries";
import { ProjectCard, type ProjectFeedRow } from "@/components/project-card";
import { ButtonLink } from "@/components/ui";

export const dynamic = "force-dynamic";

const TOP_N = 15;

export default async function PopularPage() {
  const user = await getSessionUser();
  const { env } = getCloudflareContext();

  const [{ results: top }, votes, follows] = await Promise.all([
    env.DB.prepare(
      `SELECT p.id, p.base_name, p.variant_name, p.category, p.description, p.parent_id, p.created_at, p.image_url,
              u.github_login, u.avatar_url, p.owner_id,
              (SELECT COALESCE(SUM(l.value),0) FROM likes l WHERE l.project_id = p.id) AS like_count,
              (SELECT COUNT(*) FROM projects f WHERE f.parent_id = p.id AND f.status='live') AS fork_count,
              (SELECT COUNT(*) FROM project_comments pc WHERE pc.project_id = p.id AND pc.status='live') AS comment_count,
              (SELECT CASE WHEN pp.variant_name IS NULL THEN pp.base_name
                           ELSE pp.base_name || ' // ' || pp.variant_name END
               FROM projects pp WHERE pp.id = p.parent_id) AS parent_display
       FROM projects p JOIN users u ON u.id = p.owner_id
       WHERE p.status='live'
       ORDER BY like_count DESC, fork_count DESC, p.created_at DESC
       LIMIT ${TOP_N}`,
    ).all<ProjectFeedRow>(),
    getUserVotes(user?.id),
    getFollowedIds(user?.id),
  ]);

  const badges = await getBadgesFor(top.map((p) => p.owner_id ?? ""));

  return (
    <div className="mx-auto w-full max-w-4xl">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="flex items-center gap-2.5 font-mono text-2xl font-bold tracking-tight text-white">
            <Flame size={22} className="text-emerald-400" aria-hidden /> Popular
          </h1>
          <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
            The top {TOP_N} on Project OS right now, by votes. Want the firehose?{" "}
            <Link href="/explore" className="text-emerald-300 transition hover:underline">
              See what&apos;s new
            </Link>
            .
          </p>
        </div>
        <ButtonLink href={user ? "/submit" : "/api/auth/login"} variant="primary">
          <Plus size={16} aria-hidden /> Publish
        </ButtonLink>
      </header>

      {top.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-700 p-10 text-center text-sm text-neutral-500">
          Nothing published yet. Be the first.
        </p>
      ) : (
        <ol className="space-y-3">
          {top.map((p, i) => (
            <li key={p.id} className="flex items-center gap-3">
              <span
                className={`w-8 shrink-0 text-right font-mono text-lg font-bold tabular-nums ${
                  i === 0 ? "text-emerald-400" : i < 3 ? "text-neutral-300" : "text-neutral-600"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <ProjectCard p={p} vote={votes.get(p.id) ?? 0} following={follows.has(p.id)} canFollow={!!user} badges={badges.get(p.owner_id ?? "")} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
