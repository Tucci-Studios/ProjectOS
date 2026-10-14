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
      // LEFT JOIN rather than NOT IN: the subquery form re-ran the projects
      // scan for each candidate fork, which on 68k fork rows was the single
      // most expensive read on the project page.
      `SELECT gf.full_name, gf.owner_login, gf.stars, gf.pushed_at
       FROM github_forks gf
       LEFT JOIN projects pr ON pr.github_repo = gf.full_name AND pr.status = 'live'
       WHERE gf.project_id = ?1 AND pr.id IS NULL
       ORDER BY gf.stars DESC, gf.pushed_at DESC NULLS LAST
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

  // Diff before overwriting. Replacing the list blindly loses the only signal
  // that tells an author their work is spreading, which is the whole point of
  // watching in the first place.
  const { results: before } = await env.DB.prepare(
    "SELECT full_name FROM github_forks WHERE project_id = ?1",
  )
    .bind(projectId)
    .all<{ full_name: string }>();
  const known = new Set(before.map((r) => r.full_name));
  const firstEverSync = known.size === 0;
  const arrivals = data.forks.filter((f) => !known.has(f.full_name));

  const incoming = new Set(data.forks.map((f) => f.full_name));
  const departures = before.map((r) => r.full_name).filter((n) => !incoming.has(n));

  // Write the difference, not the whole list.
  //
  // This used to DELETE every fork row for the project and re-INSERT all of
  // them on each run. With ~1,400 forks on a popular project and the job
  // running every 20 minutes, that was north of a million row writes a day
  // against a 100,000/day allowance -- to record, almost always, that nothing
  // had changed. Fork lists barely move, so a run that finds no arrivals and no
  // departures now writes a single timestamp row.
  //
  // One batch, not one call per row: every D1 statement counts against the
  // Worker's subrequest limit, and a project with fifty forks was spending
  // fifty of them on its own.
  await env.DB.batch([
    ...departures.map((name) =>
      env.DB
        .prepare("DELETE FROM github_forks WHERE project_id = ?1 AND full_name = ?2")
        .bind(projectId, name),
    ),
    ...arrivals.map((f) =>
      env.DB
        .prepare(
          "INSERT OR REPLACE INTO github_forks (project_id, full_name, owner_login, stars, pushed_at) VALUES (?1, ?2, ?3, ?4, ?5)",
        )
        .bind(projectId, f.full_name, f.owner_login, f.stars, f.pushed_at),
    ),
    env.DB
      .prepare(
        "INSERT INTO fork_sync (project_id, total, synced_at) VALUES (?1, ?2, ?3) ON CONFLICT(project_id) DO UPDATE SET total = ?2, synced_at = ?3",
      )
      .bind(projectId, data.total, now),
  ]);

  // Everything looks new the first time we look, so that run stays quiet.
  if (!firstEverSync && arrivals.length > 0) await announceForks(projectId, arrivals.length, now);

  return getForkPicture(projectId, repo);
}

/** Tell the people following a project that it just got forked again. */
async function announceForks(projectId: string, count: number, now: number) {
  const { env } = getCloudflareContext();
  const project = await env.DB.prepare(
    `SELECT owner_id, CASE WHEN variant_name IS NULL THEN base_name
                           ELSE base_name || ' // ' || variant_name END AS display
     FROM projects WHERE id = ?1`,
  )
    .bind(projectId)
    .first<{ owner_id: string; display: string }>();
  if (!project) return;

  const body =
    count === 1
      ? `${project.display} was forked on GitHub`
      : `${project.display} picked up ${count} new forks on GitHub`;

  // The owner hears about it even if they never followed their own project.
  await env.DB.prepare(
    `INSERT INTO notifications (id, user_id, kind, body, href, created_at)
     SELECT 'n_' || lower(hex(randomblob(4))), u.user_id, 'fork', ?1, ?2, ?3
     FROM (
       SELECT user_id FROM follows WHERE project_id = ?4
       UNION
       SELECT ?5 AS user_id
     ) u
     -- Join on the primary key rather than IN (SELECT ...), which re-scanned
     -- every user row for each recipient.
     JOIN users us ON us.id = u.user_id AND us.is_shadow = 0`,
  )
    .bind(body, `/p/${projectId}`, now, projectId, project.owner_id)
    .run();
}
