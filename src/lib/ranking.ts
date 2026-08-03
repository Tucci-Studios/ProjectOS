import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * How Project OS decides what's on top.
 *
 * The trap with time windows is that GitHub only tells you a project's CURRENT
 * star total. Sorting "this week" by that returns the biggest projects forever —
 * n8n wins every week because it has 199k stars, not because anything happened.
 *
 * So a window ranks by MOVEMENT: stars gained inside it, read from daily
 * snapshots we take ourselves. That can't be backfilled, which means a window is
 * only honest once it has data — until then we say so and fall back to
 * something true (recent activity) rather than faking a chart.
 */

export type Window = "today" | "week" | "month" | "all";

export const WINDOWS: { key: Window; label: string; blurb: string }[] = [
  { key: "today", label: "Today", blurb: "Stars gained in the last day" },
  { key: "week", label: "This week", blurb: "Stars gained in the last seven days" },
  { key: "month", label: "This month", blurb: "Stars gained in the last thirty days" },
  { key: "all", label: "All time", blurb: "Votes first, then total stars" },
];

const DAYS: Record<Exclude<Window, "all">, number> = { today: 1, week: 7, month: 30 };

/** How many days of readings we actually hold. A window needs its full span. */
export async function historyDepth(): Promise<number> {
  const { env } = getCloudflareContext();
  const row = await env.DB.prepare(
    "SELECT MIN(day) AS first, MAX(day) AS last FROM star_history",
  ).first<{ first: number | null; last: number | null }>();
  if (!row?.first || !row?.last) return 0;
  return row.last - row.first + 1;
}

/** True when a window has enough history behind it to mean what it says. */
export function windowIsReady(w: Window, depth: number): boolean {
  if (w === "all") return true;
  return depth > DAYS[w];
}

/**
 * The ORDER BY for a window, plus the extra select it needs.
 *
 * `gained` is the star delta across the window. Ties fall through to votes and
 * then total stars, so a quiet week still produces a sensible list rather than
 * an arbitrary one.
 */
export function windowSql(w: Window): { select: string; order: string } {
  if (w === "all") {
    return {
      select: "0 AS gained",
      order: "like_count DESC, p.stars DESC, p.created_at DESC",
    };
  }
  const days = DAYS[w];
  return {
    // Baseline = where this project stood when the window opened. Prefer the
    // most recent reading on or before that moment; if we weren't watching yet,
    // fall back to the earliest reading we do have. Looking only INSIDE the
    // window would score everything zero whenever readings are sparse.
    select: `COALESCE(p.stars - COALESCE(
        (SELECT sh.stars FROM star_history sh
          WHERE sh.project_id = p.id
            AND sh.day <= (CAST(strftime('%s','now') AS INTEGER) / 86400) - ${days}
          ORDER BY sh.day DESC LIMIT 1),
        (SELECT sh.stars FROM star_history sh
          WHERE sh.project_id = p.id
          ORDER BY sh.day ASC LIMIT 1)
      ), 0) AS gained`,
    order: "gained DESC, like_count DESC, p.stars DESC",
  };
}

/**
 * What to show when a window has no history yet: what's genuinely moved
 * recently on GitHub. Honest, and useful on day one.
 */
export function fallbackSql(w: Window): { select: string; order: string } {
  const days = w === "all" ? 3650 : DAYS[w];
  return {
    select: "0 AS gained",
    order: `CASE WHEN p.pushed_at >= CAST(strftime('%s','now') AS INTEGER) - ${days * 86400}
              THEN 0 ELSE 1 END, p.stars DESC, p.created_at DESC`,
  };
}

/** Records where every project stands today. Safe to run more than once a day. */
export async function snapshotStars(): Promise<number> {
  const { env } = getCloudflareContext();
  const res = await env.DB.prepare(
    `INSERT OR REPLACE INTO star_history (project_id, day, stars, forks)
     SELECT id, CAST(strftime('%s','now') AS INTEGER) / 86400, stars, github_forks
     FROM projects WHERE status = 'live'`,
  ).run();
  return res.meta?.changes ?? 0;
}
