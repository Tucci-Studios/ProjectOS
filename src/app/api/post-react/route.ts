import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Toggling a like or a save on a post. Both are the same shape, so one route. */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  let body: { postId?: string; kind?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const table = body.kind === "save" ? "post_saves" : body.kind === "like" ? "post_likes" : null;
  if (!table || !body.postId) return NextResponse.json({ error: "Bad request." }, { status: 400 });

  const { env } = getCloudflareContext();
  const post = await env.DB.prepare("SELECT id FROM posts WHERE id = ?1 AND status='live'").bind(body.postId).first();
  if (!post) return NextResponse.json({ error: "No such post." }, { status: 404 });

  const existing = await env.DB.prepare(`SELECT 1 FROM ${table} WHERE user_id = ?1 AND post_id = ?2`)
    .bind(user.id, body.postId)
    .first();

  if (existing) {
    await env.DB.prepare(`DELETE FROM ${table} WHERE user_id = ?1 AND post_id = ?2`).bind(user.id, body.postId).run();
  } else {
    await env.DB.prepare(`INSERT INTO ${table} (user_id, post_id, created_at) VALUES (?1, ?2, ?3)`)
      .bind(user.id, body.postId, Math.floor(Date.now() / 1000))
      .run();
  }

  const { n } = (await env.DB.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE post_id = ?1`)
    .bind(body.postId)
    .first<{ n: number }>()) ?? { n: 0 };

  return NextResponse.json({ on: !existing, count: n });
}
