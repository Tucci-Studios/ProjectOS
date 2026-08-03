import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { Flame, TrendingUp } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getUserVotes, getFollowedIds, getBadgesFor, getBlockedIds, getSavedIds } from "@/lib/queries";
import { ProjectCard, type ProjectFeedRow } from "@/components/project-card";
import { WINDOWS, windowSql, fallbackSql, windowIsReady, historyDepth, type Window } from "@/lib/ranking";

export const dynamic = "force-dynamic";

const TOP_N = 15;

export default async function PopularPage({ searchParams }: { searchParams: Promise<{ w?: string }> }) {
  const { w: raw } = await searchParams;
  const win: Window = WINDOWS.some((x) => x.key === raw) ? (raw as Window) : "week";
  const meta = WINDOWS.find((x) => x.key === win)!;

  const user = await getSessionUser();
  const { env } = getCloudflareContext();

  // A window can only rank by movement once we've watched for that long.
  const depth = await historyDepth();
  const ready = windowIsReady(win, depth);
  const { select, order } = ready ? windowSql(win) : fallbackSql(win);

  const [{ results: allTop }, votes, follows, blocked, savedIds] = await Promise.all([
    env.DB.prepare(
      `SELECT p.id, p.base_name, p.variant_name, p.category, p.description, p.parent_id, p.created_at, p.image_url,
              u.github_login, u.avatar_url, u.is_shadow, p.owner_id, p.source, p.stars, p.github_forks, p.language,
              (SELECT COALESCE(SUM(l.value),0) FROM likes l WHERE l.project_id = p.id) AS like_count,
              (SELECT COUNT(*) FROM projects f WHERE f.parent_id = p.id AND f.status='live') AS fork_count,
              (SELECT COUNT(*) FROM project_comments pc WHERE pc.project_id = p.id AND pc.status='live') AS comment_count,
              (SELECT GROUP_CONCAT(url, '|') FROM (SELECT url FROM project_images pi WHERE pi.project_id = p.id ORDER BY pi.position LIMIT 5)) AS image_urls,
              (SELECT CASE WHEN pp.variant_name IS NULL THEN pp.base_name
                           ELSE pp.base_name || ' // ' || pp.variant_name END
               FROM projects pp WHERE pp.id = p.parent_id) AS parent_display,
              ${select}
       FROM projects p JOIN users u ON u.id = p.owner_id
       WHERE p.status='live'
       ORDER BY ${order}
       LIMIT ${TOP_N}`,
    ).all<ProjectFeedRow & { gained: number }>(),
    getUserVotes(user?.id),
    getFollowedIds(user?.id),
    getBlockedIds(user?.id),
    getSavedIds(user?.id),
  ]);

  const top = allTop.filter((p) => !blocked.has(p.owner_id ?? ""));
  const badges = await getBadgesFor(top.map((p) => p.owner_id ?? ""));

  return (
    <div className="mx-auto w-full max-w-4xl">
      <header className="mb-4">
        <h1 className="flex items-center gap-2.5 font-mono text-2xl font-bold tracking-tight text-white">
          <Flame size={22} className="text-emerald-400" aria-hidden /> Popular
        </h1>
        <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
          The top {TOP_N}, by how much they moved. Want everything instead?{" "}
          <Link href="/explore" className="text-emerald-300 transition hover:underline">
            Browse it all
          </Link>
          .
        </p>
      </header>

      <div className="mb-2 flex gap-1 overflow-x-auto border-b border-neutral-800">
        {WINDOWS.map(({ key, label, blurb }) => {
          const on = key === win;
          return (
            <Link
              key={key}
              href={key === "week" ? "/popular" : `/popular?w=${key}`}
              aria-current={on ? "page" : undefined}
              title={blurb}
              className={`-mb-px flex min-h-[42px] shrink-0 items-center border-b-2 px-3.5 font-mono text-[13px] outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                on ? "border-emerald-400 font-bold text-white" : "border-transparent text-neutral-500 hover:text-neutral-200"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Never imply a chart measures something it can't yet see. */}
      <p className="mb-5 font-mono text-[11px] leading-relaxed text-neutral-500">
        {win === "all" ? (
          <>Ranked by community votes, then total stars on GitHub.</>
        ) : ready ? (
          <>
            <TrendingUp size={11} className="mr-1 inline text-emerald-400" aria-hidden />
            {meta.blurb}.
          </>
        ) : (
          <>
            Not enough history to measure {meta.label.toLowerCase()} yet — we started watching{" "}
            {depth <= 1 ? "today" : `${depth} days ago`}. Showing what&apos;s been worked on recently instead.
          </>
        )}
      </p>

      {top.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-700 p-10 text-center">
          <p className="font-mono text-base font-bold text-white">Nothing here yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-400">
            Publish something, or open Explore to see everything as it arrives.
          </p>
        </div>
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
                <ProjectCard
                  p={p}
                  vote={votes.get(p.id) ?? 0}
                  following={follows.has(p.id)}
                  saved={savedIds.has(p.id)}
                  canFollow={!!user}
                  badges={badges.get(p.owner_id ?? "")}
                  gained={ready && win !== "all" ? p.gained : undefined}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
