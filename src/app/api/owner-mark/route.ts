import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * A project owner's verdict on a tutorial written for their project.
 *
 * Only the owner of the project the tutorial is attached to, or a moderator,
 * can leave one — otherwise "disputed by the owner" is a label anyone could
 * hang on a rival's guide.
 *
 * A dispute must say why. A public note calling someone's work wrong without a
 * reason is just a downvote with authority behind it, and the author can't act
 * on it.
 */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  let body: { postId?: string; kind?: string; note?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const kind = body.kind;
  if (!body.postId || !["approved", "disputed", "clear"].includes(kind ?? ""))
    return NextResponse.json({ error: "Bad request." }, { status: 400 });

  const { env } = getCloudflareContext();
  const post = await env.DB.prepare(
    `SELECT po.id, po.project_id, po.author_id, p.owner_id
     FROM posts po LEFT JOIN projects p ON p.id = po.project_id
     WHERE po.id = ?1 AND po.kind = 'tutorial' AND po.status = 'live'`,
  )
    .bind(body.postId)
    .first<{ id: string; project_id: string | null; author_id: string; owner_id: string | null }>();

  if (!post) return NextResponse.json({ error: "No such tutorial." }, { status: 404 });
  if (!post.project_id)
    return NextResponse.json({ error: "That tutorial isn't attached to a project." }, { status: 400 });

  const isMod = user.role === "admin" || user.role === "mod";
  if (post.owner_id !== user.id && !isMod)
    return NextResponse.json({ error: "Only the project's owner can do that." }, { status: 403 });

  if (kind === "clear") {
    await env.DB.prepare("DELETE FROM tutorial_owner_marks WHERE post_id = ?1").bind(post.id).run();
    return NextResponse.json({ ok: true, kind: null });
  }

  const note = (body.note ?? "").trim().slice(0, 500);
  if (kind === "disputed" && note.length < 10)
    return NextResponse.json(
      { error: "Say what's wrong with it — a correction with no reason isn't one." },
      { status: 400 },
    );

  await env.DB.prepare(
    `INSERT INTO tutorial_owner_marks (post_id, project_id, kind, note, by_user_id, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6)
     ON CONFLICT(post_id) DO UPDATE SET kind = excluded.kind, note = excluded.note,
       by_user_id = excluded.by_user_id, created_at = excluded.created_at`,
  )
    .bind(post.id, post.project_id, kind, note || null, user.id, Math.floor(Date.now() / 1000))
    .run();

  // The author should hear it from us, not from a reader.
  if (post.author_id !== user.id)
    await env.DB.prepare(
      `INSERT INTO notifications (id, user_id, kind, body, href, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
    )
      .bind(
        crypto.randomUUID(),
        post.author_id,
        "owner_mark",
        kind === "approved"
          ? "The project owner approved your tutorial."
          : `The project owner left a correction on your tutorial: ${note}`,
        `/wire/${post.id}`,
        Math.floor(Date.now() / 1000),
      )
      .run();

  return NextResponse.json({ ok: true, kind });
}
