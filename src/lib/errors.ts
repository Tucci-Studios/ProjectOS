import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Record an error somewhere we can actually look at it.
 *
 * Deliberately not a third-party service: the whole point of the privacy page
 * is that nothing about a visitor leaves this account, and an error report is
 * one of the leakiest things a site can send elsewhere. So it lands in our own
 * D1 and is read from /mod.
 *
 * Never throws. An error in the error handler must not become the error.
 */
export async function logError(e: {
  source: "server" | "client";
  message: string;
  path?: string | null;
  digest?: string | null;
  stack?: string | null;
}): Promise<void> {
  try {
    const { env } = getCloudflareContext();
    await env.DB.prepare(
      `INSERT INTO error_log (id, created_at, source, path, message, digest, stack)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
    )
      .bind(
        crypto.randomUUID(),
        Math.floor(Date.now() / 1000),
        e.source,
        e.path?.slice(0, 200) ?? null,
        (e.message || "Unknown error").slice(0, 500),
        e.digest?.slice(0, 100) ?? null,
        // Enough to find the line, not so much that one bad loop fills the table.
        e.stack?.slice(0, 4000) ?? null,
      )
      .run();
  } catch {
    /* swallowed on purpose */
  }
}

export type LoggedError = {
  id: string;
  created_at: number;
  source: string;
  path: string | null;
  message: string;
  digest: string | null;
  stack: string | null;
};

export async function recentErrors(limit = 30): Promise<LoggedError[]> {
  const { env } = getCloudflareContext();
  const { results } = await env.DB.prepare(
    "SELECT id, created_at, source, path, message, digest, stack FROM error_log ORDER BY created_at DESC LIMIT ?1",
  )
    .bind(Math.floor(limit))
    .all<LoggedError>();
  return results;
}
