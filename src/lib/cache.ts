import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Read-through cache for the queries that scan whole tables.
 *
 * D1's free tier bills rows READ, not queries run. Several of our reads scan
 * every project to produce four cards or a single count — the feed strips were
 * reading ~4,700 rows each to return four, and the header's project/fork totals
 * re-scanned the table on every page load. Caching collapses each of those into
 * a single-row primary-key lookup.
 *
 * Deliberately not a general cache: keys are fixed strings chosen here, never
 * built from user input, so nothing a visitor types can poison or enumerate it.
 */
export async function cached<T>(key: string, ttlSeconds: number, load: () => Promise<T>): Promise<T> {
  const { env } = getCloudflareContext();
  const now = Math.floor(Date.now() / 1000);

  try {
    const hit = await env.DB.prepare("SELECT value FROM kv_cache WHERE key = ?1 AND expires_at > ?2")
      .bind(key, now)
      .first<{ value: string }>();
    if (hit) return JSON.parse(hit.value) as T;
  } catch {
    // A broken cache must never take the page down with it.
  }

  const fresh = await load();

  try {
    await env.DB.prepare(
      "INSERT INTO kv_cache (key, value, expires_at) VALUES (?1, ?2, ?3) " +
        "ON CONFLICT(key) DO UPDATE SET value = excluded.value, expires_at = excluded.expires_at",
    )
      .bind(key, JSON.stringify(fresh), now + ttlSeconds)
      .run();
  } catch {
    // Serving the page matters more than remembering it.
  }

  return fresh;
}

/** Drop cached entries so the next request recomputes. Used after writes. */
export async function bustCache(prefix: string): Promise<void> {
  try {
    const { env } = getCloudflareContext();
    await env.DB.prepare("DELETE FROM kv_cache WHERE key LIKE ?1").bind(`${prefix}%`).run();
  } catch {
    /* best effort */
  }
}
