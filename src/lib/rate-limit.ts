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
  // without needing a cron.
  await env.DB.prepare("DELETE FROM rate_events WHERE user_id = ?1 AND created_at < ?2")
    .bind(userId, since)
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
