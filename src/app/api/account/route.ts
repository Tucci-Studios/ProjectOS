import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getSessionUser, sessionCookieName } from "@/lib/auth";

/**
 * Delete your own account.
 *
 * Eighteen tables reference users, and a plain DELETE would either fail on a
 * foreign key or, worse, succeed and cut the lineage other people's forks hang
 * off. So this does the thing that's actually right for a site whose whole
 * point is history:
 *
 *   erased — every private signal that only describes you: saves, follows,
 *            blocks, notifications, votes, reports you filed, applications,
 *            and the identity fields on your user row.
 *   kept   — what you published in public, reattributed to a tombstone with
 *            your name stripped off it.
 *
 * The kept half is spelled out on /privacy before the button exists, and the
 * confirmation makes you type the words. It is not reversible.
 */
export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  let body: { confirm?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  // Typed, not clicked. Deleting an account by accident should be impossible.
  if (body.confirm !== "delete my account") {
    return NextResponse.json({ error: "Type the confirmation exactly to continue." }, { status: 400 });
  }

  const { env } = getCloudflareContext();
  const now = Math.floor(Date.now() / 1000);

  // Rows that describe you, rather than anything you said in public.
  // `updates` is deliberately absent — that's the site changelog, not yours.
  const wipe = [
    "DELETE FROM saves WHERE user_id = ?1",
    "DELETE FROM post_saves WHERE user_id = ?1",
    "DELETE FROM follows WHERE user_id = ?1",
    "DELETE FROM blocks WHERE user_id = ?1 OR blocked_id = ?1",
    "DELETE FROM notifications WHERE user_id = ?1",
    "DELETE FROM likes WHERE user_id = ?1",
    "DELETE FROM post_likes WHERE user_id = ?1",
    "DELETE FROM idea_votes WHERE user_id = ?1",
    "DELETE FROM reports WHERE reporter_id = ?1",
    "DELETE FROM help_applications WHERE user_id = ?1",
    "DELETE FROM rate_events WHERE user_id = ?1",
  ];

  // A tombstone that can't collide and can't be traced back to the old handle.
  const tag = crypto.randomUUID().slice(0, 8);

  await env.DB.batch([
    ...wipe.map((sql) => env.DB.prepare(sql).bind(user.id)),
    env.DB.prepare(
      `UPDATE users
          SET github_login = ?2,
              display_name = NULL,
              avatar_url = NULL,
              deleted_at = ?3,
              session_version = session_version + 1
        WHERE id = ?1`,
    ).bind(user.id, `deleted-${tag}`, now),
  ]);

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(sessionCookieName);
  return res;
}
