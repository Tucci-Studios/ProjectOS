/**
 * The deployed worker: Next.js for requests, plus the scheduled jobs.
 *
 * OpenNext builds the request handler; this wraps it so Cloudflare's cron
 * triggers have somewhere to land. Each trigger calls the app's own job
 * endpoint with CRON_SECRET, which keeps the job logic in one place rather
 * than duplicating it against a second database binding.
 */
// @ts-expect-error — generated at build time by @opennextjs/cloudflare
import handler from "./.open-next/worker.js";

type Env = { CRON_SECRET?: string; SITE_URL?: string };

/** Which job runs on which schedule. Matches the crons in wrangler.jsonc. */
const SCHEDULE: Record<string, string> = {
  "17 3 * * *": "discover", // once a day, off the hour to avoid the stampede
  "37 4 * * *": "refresh", // numbers, plus the daily star reading
  "*/20 * * * *": "forks", // rolling, oldest first
};

export default {
  fetch: handler.fetch,

  async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext) {
    const job = SCHEDULE[event.cron];
    if (!job) return;

    const base = env.SITE_URL ?? "https://project-os.workers.dev";
    ctx.waitUntil(
      fetch(`${base}/api/cron/${job}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${env.CRON_SECRET ?? ""}` },
      }).then(
        async (r) => console.log(`[cron] ${job}`, r.status, await r.text()),
        (e) => console.error(`[cron] ${job} failed`, e),
      ),
    );
  },
};
