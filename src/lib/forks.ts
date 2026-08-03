import { getCloudflareContext } from "@opennextjs/cloudflare";
import { listForks } from "./github";

/**
 * The gap between "forked on GitHub" and "published on Project OS".
 *
 * Someone can fork a project and never tell us. GitHub knows, so we ask — but
 * an unpublished fork is NOT a project: no page, no votes, no tree node. It's
 * a name and a link, shown so the author can see their real reach and so we
 * can nudge the forker into publishing.
 */

/** GitHub's unauthenticated budget is 60 requests/hour, so we cache hard. */
const TTL_S = 6 * 3600;

export type UnpublishedFork = {
  full_name: string;
  owner_login: string;
  stars: number;
  pushed_at: number | null;
};

export type ForkPicture = {
  /** Forks GitHub knows about that nobody published here. */
  unpublished: UnpublishedFork[];
  /** GitHub's own total, which counts forks-of-forks we don't list. */
  total: number;
  /** How many of GitHub's forks did get published on Project OS. */
  published: number;
  syncedAt: number | null;
};

/**
 * Read the cached picture. Never calls GitHub — page renders must not depend on
 * a third party being up or within rate limit.
 */
export async function getForkPicture(projectId: string, repo: string): Promise<ForkPicture> {
  const { env } = getCloudflareContext();

  const [sync, rows, publishedRow] = await Promise.all([
    env.DB.prepare("SELECT total, synced_at FROM fork_sync WHERE project_id = ?1")
      .bind(projectId)
      .first<{ total: number; synced_at: number }>(),
    env.DB.prepare(
      `SELECT gf.full_name, gf.owner_login, gf.stars, gf.pushed_at
       FROM github_forks gf
       WHERE gf.project_id = ?1
         AND gf.full_name NOT IN (SELECT github_repo FROM projects WHERE status='live')
       ORDER BY gf.pushed_at DESC NULLS LAST, gf.stars DESC
       LIMIT 50`,
    )
      .bind(projectId)
      .all<UnpublishedFork>(),
    env.DB.prepare(
      "SELECT COUNT(*) AS n FROM projects WHERE parent_id = ?1 AND status='live'",
    )
      .bind(projectId)
      .first<{ n: number }>(),
  ]);

  return {
    unpublished: rows.results,
    total: sync?.total ?? 0,
    published: publishedRow?.n ?? 0,
    syncedAt: sync?.synced_at ?? null,
  };
}

/** True when the cache is old enough to be worth a GitHub call. */
export async function forksAreStale(projectId: string): Promise<boolean> {
  const { env } = getCloudflareContext();
  const row = await env.DB.prepare("SELECT synced_at FROM fork_sync WHERE project_id = ?1")
    .bind(projectId)
    .first<{ synced_at: number }>();
  return !row || Math.floor(Date.now() / 1000) - row.synced_at > TTL_S;
}

/** Ask GitHub who forked this, and write the answer down. */
export async function syncForks(projectId: string, repo: string): Promise<ForkPicture | null> {
  const { env } = getCloudflareContext();
  const data = await listForks(repo);
  if (!data) return null;

  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare("DELETE FROM github_forks WHERE project_id = ?1").bind(projectId).run();

  for (const f of data.forks) {
    await env.DB.prepare(
      "INSERT OR REPLACE INTO github_forks (project_id, full_name, owner_login, stars, pushed_at) VALUES (?1, ?2, ?3, ?4, ?5)",
    )
      .bind(projectId, f.full_name, f.owner_login, f.stars, f.pushed_at)
      .run();
  }

  await env.DB.prepare(
    "INSERT INTO fork_sync (project_id, total, synced_at) VALUES (?1, ?2, ?3) ON CONFLICT(project_id) DO UPDATE SET total = ?2, synced_at = ?3",
  )
    .bind(projectId, data.total, now)
    .run();

  return getForkPicture(projectId, repo);
}
