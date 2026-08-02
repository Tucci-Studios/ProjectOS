import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to comment." }, { status: 401 });

  let body: { postId?: unknown; body?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const postId = typeof body.postId === "string" ? body.postId : "";
  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (text.length < 1 || text.length > 2000)
    return NextResponse.json({ error: "Comment must be 1-2000 characters." }, { status: 400 });

  const { env } = getCloudflareContext();
  const post = await env.DB.prepare("SELECT id FROM posts WHERE id = ?1 AND status = 'live'")
    .bind(postId)
    .first();
  if (!post) return NextResponse.json({ error: "No such post." }, { status: 404 });

  const id = `c_${crypto.randomUUID().slice(0, 8)}`;
  await env.DB.prepare(
    "INSERT INTO comments (id, post_id, author_id, body_md, status, created_at) VALUES (?1, ?2, ?3, ?4, 'live', ?5)",
  )
    .bind(id, postId, user.id, text, Math.floor(Date.now() / 1000))
    .run();

  return NextResponse.json({ ok: true, id });
}
