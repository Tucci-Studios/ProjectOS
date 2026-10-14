/**
 * The deployed worker: Next.js for requests, plus the scheduled jobs.
 *
 * OpenNext builds the request handler; this wraps it so Cloudflare's cron
 * triggers have somewhere to land. Each trigger calls the app's own job
 * endpoint with CRON_SECRET, which keeps the job logic in one place rather
 * than duplicating it against a second database binding.
 */
// Generated at build time by @opennextjs/cloudflare, so it exists after a
// build and not before. ts-ignore rather than ts-expect-error: the latter
// errors on a clean checkout AND after a build, just for opposite reasons.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
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

    // Handed straight to the app handler rather than fetched over the network.
    // Going out to https://<our own domain> means the subrequest leaves the
    // Worker, hits the edge, and loops back into this same Worker — which
    // times out and returns 522. That is exactly what was happening: the
    // schedule fired every night and every run died at the self-fetch, which
    // is why star_history sat at a single day. Calling handler.fetch keeps it
    // in-process, so there is no loop and no network to fail.
    const base = env.SITE_URL ?? "https://project-open-source.com";
    const req = new Request(`${base}/api/cron/${job}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.CRON_SECRET ?? ""}` },
    });

    ctx.waitUntil(
      handler
        .fetch(req, env, ctx)
        .then(
          async (r: Response) => console.log(`[cron] ${job}`, r.status, (await r.text()).slice(0, 300)),
          (e: unknown) => console.error(`[cron] ${job} failed`, e),
        ),
    );
  },
};
