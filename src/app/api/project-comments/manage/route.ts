import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

/** Edit or remove your own comment. */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  let body: { commentId?: unknown; action?: unknown; body?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const commentId = typeof body.commentId === "string" ? body.commentId : "";
  const { env } = getCloudflareContext();
  const comment = await env.DB.prepare("SELECT id, author_id FROM project_comments WHERE id = ?1")
    .bind(commentId)
    .first<{ id: string; author_id: string }>();
  if (!comment) return NextResponse.json({ error: "No such comment." }, { status: 404 });
  if (comment.author_id !== user.id && user.role !== "admin")
    return NextResponse.json({ error: "That isn't yours." }, { status: 403 });

  if (body.action === "delete") {
    await env.DB.prepare("UPDATE project_comments SET status='removed' WHERE id = ?1").bind(commentId).run();
    return NextResponse.json({ ok: true, deleted: true });
  }

  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (text.length < 1 || text.length > 2000)
    return NextResponse.json({ error: "Comment must be 1-2000 characters." }, { status: 400 });

  await env.DB.prepare("UPDATE project_comments SET body_md = ?2 WHERE id = ?1").bind(commentId, text).run();
  return NextResponse.json({ ok: true });
}
