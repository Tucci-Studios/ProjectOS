import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { checkRate } from "@/lib/rate-limit";
import { parseGuide } from "@/lib/tutorial-guide";
import { CATEGORY_SLUGS } from "@/lib/categories";

export const dynamic = "force-dynamic";

/**
 * Publishing a tutorial an AI wrote.
 *
 * Deliberately not a form. The author's assistant produces the JSON, the author
 * pastes it — or a link to it — and a signed-in human presses the button. That
 * last part is the whole security model: an agent can draft anything, but only
 * a person with a session can put it on the site.
 *
 * A URL is fetched server-side rather than in the browser so a raw GitHub link
 * works without CORS getting in the way.
 */
/** Shared by both verbs: turn what was pasted into a guide, or say why not. */
async function readGuide(raw0: string) {
  let raw = raw0.trim();
  if (!raw) return { error: "Paste what your AI wrote, or a link to it." };

  if (/^https:\/\/\S+$/.test(raw)) {
    try {
      const res = await fetch(raw, { headers: { Accept: "application/json, text/plain" } });
      if (!res.ok) return { error: `That link returned ${res.status}.` };
      raw = (await res.text()).trim();
    } catch {
      return { error: "Couldn't fetch that link." };
    }
  }

  const fence = /```(?:json)?\s*([\s\S]*?)```/.exec(raw);
  if (fence) raw = fence[1].trim();

  const guide = parseGuide(raw);
  if (!guide)
    return {
      error:
        "That isn't a tutorial in our format — it needs at least a title and one step. Point your AI at /tutorial-template.md.",
    };
  if (guide.category && !CATEGORY_SLUGS.includes(guide.category))
    return { error: `"${guide.category}" isn't one of our sections.` };

  // Verification is a moderator's to give, never the author's to claim.
  delete guide.verified;
  return { guide };
}

/**
 * Editing one.
 *
 * A tutorial published with a wrong path or a broken step is worse than no
 * tutorial, and until this existed the only fix was posting a second copy. The
 * author owns theirs; a moderator can fix anyone's, because they're the ones
 * who put a Checked badge on it.
 *
 * A moderator's own badge survives an edit — the author rewriting the body
 * shouldn't silently keep a stamp for content nobody has re-read, so it's
 * cleared unless a moderator is the one saving.
 */
export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  let body: { id?: string; text?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "Which tutorial?" }, { status: 400 });

  const { env } = getCloudflareContext();
  const post = await env.DB.prepare(
    "SELECT id, author_id, body_md FROM posts WHERE id = ?1 AND kind='tutorial' AND status='live'",
  )
    .bind(body.id)
    .first<{ id: string; author_id: string; body_md: string }>();
  if (!post) return NextResponse.json({ error: "No such tutorial." }, { status: 404 });

  const isMod = user.role === "admin" || user.role === "mod";
  if (post.author_id !== user.id && !isMod)
    return NextResponse.json({ error: "That isn't yours to edit." }, { status: 403 });

  const read = await readGuide(body.text ?? "");
  if (!read.guide) return NextResponse.json({ error: read.error }, { status: 400 });

  // Keep an existing badge only when a moderator is the one saving.
  const previous = parseGuide(post.body_md);
  if (isMod && previous?.verified) read.guide.verified = previous.verified;

  await env.DB.prepare("UPDATE posts SET title = ?1, body_md = ?2, category = ?3, edited_at = ?4 WHERE id = ?5")
    .bind(
      read.guide.title.slice(0, 200),
      JSON.stringify(read.guide),
      read.guide.category || null,
      Math.floor(Date.now() / 1000),
      post.id,
    )
    .run();

  /**
   * Tell whoever left a verdict that the guide has changed underneath it.
   *
   * Without this, a correction sits on a tutorial that may already be fixed and
   * the only person who can lift it never finds out. The author edits, the
   * owner never looks again, and a stale red banner does permanent damage to
   * work that was put right days ago.
   */
  const mark = await env.DB.prepare(
    "SELECT kind, by_user_id FROM tutorial_owner_marks WHERE post_id = ?1",
  )
    .bind(post.id)
    .first<{ kind: string; by_user_id: string }>();

  if (mark && mark.by_user_id !== user.id)
    await env.DB.prepare(
      `INSERT INTO notifications (id, user_id, kind, body, href, created_at)
       VALUES (?1, ?2, 'tutorial_edited', ?3, ?4, ?5)`,
    )
      .bind(
        crypto.randomUUID(),
        mark.by_user_id,
        mark.kind === "disputed"
          ? `"${read.guide.title}" was edited after your correction. Does it still stand?`
          : `"${read.guide.title}" was edited after you approved it. Your approval now shows as out of date.`,
        `/wire/${post.id}`,
        Math.floor(Date.now() / 1000),
      )
      .run();

  return NextResponse.json({ ok: true, id: post.id });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const rate = await checkRate(user.id, "post");
  if (!rate.ok) return NextResponse.json({ error: rate.message }, { status: 429 });

  let body: { text?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const read = await readGuide(body.text ?? "");
  if (!read.guide) return NextResponse.json({ error: read.error }, { status: 400 });
  const guide = read.guide;

  const { env } = getCloudflareContext();
  const id = `t_${crypto.randomUUID().slice(0, 12)}`;
  await env.DB.prepare(
    `INSERT INTO posts (id, author_id, title, body_md, kind, status, created_at, category)
     VALUES (?1, ?2, ?3, ?4, 'tutorial', 'live', ?5, ?6)`,
  )
    .bind(id, user.id, guide.title.slice(0, 200), JSON.stringify(guide), Math.floor(Date.now() / 1000), guide.category || null)
    .run();

  return NextResponse.json({ ok: true, id });
}
