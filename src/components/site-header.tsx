import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getSessionUser } from "@/lib/auth";
import { SiteHeaderClient } from "./site-header-client";
import type { SplashUpdate } from "./update-splash";

export async function SiteHeader() {
  const user = await getSessionUser();
  const { env } = getCloudflareContext();
  const latest = await env.DB.prepare(
    `SELECT u.id, u.version, u.title, u.intro, u.body_md, u.published_at, au.github_login
     FROM updates u JOIN users au ON au.id = u.author_id
     ORDER BY u.published_at DESC LIMIT 1`,
  ).first<SplashUpdate>();

  const unseen = !!user && !!latest && user.last_seen_update !== latest.id;
  const firstTime = !!user && user.last_seen_update === null;

  const unread = user
    ? await env.DB.prepare("SELECT COUNT(*) AS n FROM notifications WHERE user_id = ?1 AND read_at IS NULL")
        .bind(user.id)
        .first<{ n: number }>()
    : null;

  return (
    <SiteHeaderClient
      user={user}
      latestUpdate={latest ?? null}
      unseenUpdate={unseen}
      firstTime={firstTime}
      unreadCount={unread?.n ?? 0}
    />
  );
}
