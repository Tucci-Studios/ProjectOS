import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

/** Edit or remove your own feed post. */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  let body: { postId?: unknown; action?: unknown; title?: unknown; body?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const postId = typeof body.postId === "string" ? body.postId : "";
  const { env } = getCloudflareContext();
  const post = await env.DB.prepare("SELECT id, author_id FROM posts WHERE id = ?1")
    .bind(postId)
    .first<{ id: string; author_id: string }>();
  if (!post) return NextResponse.json({ error: "No such post." }, { status: 404 });
  if (post.author_id !== user.id && user.role !== "admin")
    return NextResponse.json({ error: "That isn't yours." }, { status: 403 });

  if (body.action === "delete") {
    await env.DB.prepare("UPDATE posts SET status='removed' WHERE id = ?1").bind(postId).run();
    return NextResponse.json({ ok: true, deleted: true });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (title && (title.length < 3 || title.length > 120))
    return NextResponse.json({ error: "Title must be 3-120 characters." }, { status: 400 });
  if (text && (text.length < 10 || text.length > 5000))
    return NextResponse.json({ error: "Body must be 10-5000 characters." }, { status: 400 });

  await env.DB.prepare(
    "UPDATE posts SET title = COALESCE(NULLIF(?2,''), title), body_md = COALESCE(NULLIF(?3,''), body_md) WHERE id = ?1",
  )
    .bind(postId, title, text)
    .run();
  return NextResponse.json({ ok: true });
}
