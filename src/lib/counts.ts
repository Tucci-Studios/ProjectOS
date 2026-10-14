import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Page counts, deliberately unable to identify anyone.
 *
 * One row per path per day holding a number. No id, no IP, no session, no user
 * agent, nothing that joins one view to the next — so it can say a tutorial was
 * opened forty times on Tuesday and can never say by whom. That's not a policy
 * we promise to keep; it's the only information the table has room for.
 *
 * Deliberately not a third-party analytics product: nothing leaves our servers,
 * there is no tracking cookie, and there's nothing to put behind a banner.
 */

/** Cap the key space so a crawler hitting junk URLs can't grow the table. */
const MAX_PATH = 120;

export async function countView(path: string): Promise<void> {
  if (!path.startsWith("/") || path.length > MAX_PATH) return;
  const { env } = getCloudflareContext();
  const day = Math.floor(Date.now() / 86400000);
  try {
    await env.DB.prepare(
      `INSERT INTO page_views (path, day, views) VALUES (?1, ?2, 1)
       ON CONFLICT(path, day) DO UPDATE SET views = views + 1`,
    )
      .bind(path, day)
      .run();
  } catch {
    // A count is never worth failing a page render over.
  }
}

export type TopPage = { path: string; views: number };

/** What's been opened most over the last `days` days. Admin-facing. */
export async function topPages(days = 7, limit = 25): Promise<{ rows: TopPage[]; total: number }> {
  const { env } = getCloudflareContext();
  const since = Math.floor(Date.now() / 86400000) - Math.floor(days);
  const [rows, total] = await Promise.all([
    env.DB.prepare(
      `SELECT path, SUM(views) AS views FROM page_views WHERE day >= ?1
       GROUP BY path ORDER BY views DESC LIMIT ?2`,
    )
      .bind(since, Math.floor(limit))
      .all<TopPage>(),
    env.DB.prepare("SELECT COALESCE(SUM(views),0) AS n FROM page_views WHERE day >= ?1")
      .bind(since)
      .first<{ n: number }>(),
  ]);
  return { rows: rows.results, total: total?.n ?? 0 };
}
