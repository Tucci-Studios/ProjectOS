import { getCloudflareContext } from "@opennextjs/cloudflare";

// Deliberately loose. A person having a great day never hits these; a script
// hits them in seconds. Tune from real traffic, not from fear.
const LIMITS: Record<string, { max: number; windowS: number; label: string }> = {
  publish: { max: 10, windowS: 3600, label: "projects published" },
  post: { max: 15, windowS: 3600, label: "posts" },
  comment: { max: 40, windowS: 3600, label: "comments" },
  update: { max: 20, windowS: 3600, label: "updates" },
  detect: { max: 30, windowS: 600, label: "repo checks" },
  idea: { max: 5, windowS: 3600, label: "ideas" },
  report: { max: 20, windowS: 3600, label: "reports" },

  // Keyed by IP rather than by user, for the endpoints anyone can reach
  // without signing in. These aren't account-takeover risks — sign-in is
  // GitHub's OAuth, so there is no password here to guess — they're
  // resource-exhaustion risks: someone hammering them burns the shared GitHub
  // hourly budget or fills a table.
  "tutorial-edit": { max: 30, windowS: 3600, label: "tutorial edits" },
  // Generous — this is one beacon per page a real person opens.
  view: { max: 300, windowS: 3600, label: "page views" },
  oops: { max: 60, windowS: 3600, label: "error reports" },
  contact: { max: 4, windowS: 3600, label: "messages" },
  waitlist: { max: 5, windowS: 3600, label: "waitlist signups" },
  "sync-forks": { max: 20, windowS: 3600, label: "fork refreshes" },
  readme: { max: 60, windowS: 3600, label: "readme fetches" },
  "auth-callback": { max: 20, windowS: 900, label: "sign-in attempts" },
};

export type RateResult = { ok: true } | { ok: false; retryAfterS: number; message: string };

/** Records the action and tells you whether it was allowed. */
export async function checkRate(userId: string, action: keyof typeof LIMITS): Promise<RateResult> {
  const rule = LIMITS[action];
  if (!rule) return { ok: true };

  const { env } = getCloudflareContext();
  const now = Math.floor(Date.now() / 1000);
  const since = now - rule.windowS;

  // Prune this user's expired rows while we're here — keeps the table small
  // without needing a cron. Only THIS action's rows: each action has its own
  // window, and a cutoff from the shortest one (detect, ten minutes) would
  // delete publish and post events that are still inside their hour, handing
  // anyone a rate-limit reset for the price of one extra request.
  await env.DB.prepare("DELETE FROM rate_events WHERE user_id = ?1 AND action = ?2 AND created_at < ?3")
    .bind(userId, action, since)
    .run();

  const row = await env.DB.prepare(
    "SELECT COUNT(*) AS n, MIN(created_at) AS oldest FROM rate_events WHERE user_id = ?1 AND action = ?2 AND created_at >= ?3",
  )
    .bind(userId, action, since)
    .first<{ n: number; oldest: number | null }>();

  if ((row?.n ?? 0) >= rule.max) {
    const retryAfterS = Math.max(60, (row?.oldest ?? now) + rule.windowS - now);
    const mins = Math.ceil(retryAfterS / 60);
    return {
      ok: false,
      retryAfterS,
      message: `Slow down a moment — that's ${rule.max} ${rule.label} in an hour. Try again in ${mins} minute${mins === 1 ? "" : "s"}.`,
    };
  }

  await env.DB.prepare("INSERT INTO rate_events (user_id, action, created_at) VALUES (?1, ?2, ?3)")
    .bind(userId, action, now)
    .run();
  return { ok: true };
}

/**
 * The caller's IP, as Cloudflare sees it.
 *
 * CF-Connecting-IP is set by the edge and cannot be spoofed by the client;
 * X-Forwarded-For can be, so it is deliberately not consulted. Falls back to a
 * single shared bucket when there is no header at all, which is the safe
 * direction — a local dev request gets limited rather than exempted.
 */
export function clientKey(request: Request): string {
  return `ip:${request.headers.get("CF-Connecting-IP") ?? "unknown"}`;
}
