import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

/** Hide someone's projects and posts from your view. Mutual invisibility isn't
 *  the goal — this is just "I don't want to see this person". */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  let blockedLogin: unknown;
  try {
    ({ blockedLogin } = (await request.json()) as { blockedLogin?: unknown });
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  if (typeof blockedLogin !== "string") return NextResponse.json({ error: "Bad request." }, { status: 400 });

  const { env } = getCloudflareContext();
  const target = await env.DB.prepare("SELECT id FROM users WHERE github_login = ?1")
    .bind(blockedLogin)
    .first<{ id: string }>();
  if (!target) return NextResponse.json({ error: "No such person." }, { status: 404 });
  if (target.id === user.id) return NextResponse.json({ error: "You can't block yourself." }, { status: 400 });

  const existing = await env.DB.prepare("SELECT 1 FROM blocks WHERE user_id = ?1 AND blocked_id = ?2")
    .bind(user.id, target.id)
    .first();

  if (existing) {
    await env.DB.prepare("DELETE FROM blocks WHERE user_id = ?1 AND blocked_id = ?2").bind(user.id, target.id).run();
  } else {
    await env.DB.prepare("INSERT INTO blocks (user_id, blocked_id, created_at) VALUES (?1, ?2, ?3)")
      .bind(user.id, target.id, Math.floor(Date.now() / 1000))
      .run();
  }

  return NextResponse.json({ blocked: !existing });
}
