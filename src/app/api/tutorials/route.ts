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
/** A project id, if it names one that exists. Attaching to nothing is fine. */
async function resolveProject(
  env: { DB: D1Database },
  projectId: string | null | undefined,
): Promise<{ id: string | null } | { error: string }> {
  if (!projectId) return { id: null };
  const p = await env.DB.prepare("SELECT id FROM projects WHERE id = ?1 AND status='live'").bind(projectId).first();
  return p ? { id: projectId } : { error: "That project isn't on Project OS." };
}

/**
 * Where we're willing to go and get a file.
 *
 * Without this, anyone signed in could point the Worker at any address the
 * Cloudflare network can reach — internal services, cloud metadata, a port
 * scan — and read the answer back out of our own error message. The template
 * tells authors to use a raw GitHub URL, so that's the whole list.
 */
const FETCHABLE_HOSTS = new Set([
  "raw.githubusercontent.com",
  "gist.githubusercontent.com",
  "gist.github.com",
]);

const MAX_FETCH_BYTES = 512 * 1024;

/** One message for every failure, so this can't be used to probe what exists. */
const GENERIC_FETCH_FAIL = "Couldn't read that link. Paste the JSON in directly instead.";

function isFetchableHost(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && FETCHABLE_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

/** Shared by both verbs: turn what was pasted into a guide, or say why not. */
async function readGuide(raw0: string) {
  let raw = raw0.trim();
  if (!raw) return { error: "Paste what your AI wrote, or a link to it." };

  if (/^https:\/\/\S+$/.test(raw)) {
    if (!isFetchableHost(raw)) {
      return {
        error: "Link it from a GitHub raw URL or a gist — or just paste the JSON straight in.",
      };
    }
    try {
      const res = await fetch(raw, {
        headers: { Accept: "application/json, text/plain" },
        // Nothing decides where this request goes except the allowlist above,
        // so a redirect off the allowlisted host is a refusal, not a hop.
        redirect: "manual",
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return { error: GENERIC_FETCH_FAIL };
      const body = await res.text();
      // A tutorial is a few KB. Anything past this is either the wrong link or
      // someone trying to make us hold a large response in memory.
      if (body.length > MAX_FETCH_BYTES) return { error: "That file is too big to be a tutorial." };
      raw = body.trim();
    } catch {
      return { error: GENERIC_FETCH_FAIL };
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

  // Editing goes through the same link-fetching path as posting, so it needs
  // the same ceiling — otherwise it's the cheaper way to hammer it.
  const rate = await checkRate(user.id, "tutorial-edit");
  if (!rate.ok) return NextResponse.json({ error: rate.message }, { status: 429 });

  let body: { id?: string; text?: string; projectId?: string | null };
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

  const linked = await resolveProject(env, body.projectId);
  if ("error" in linked) return NextResponse.json({ error: linked.error }, { status: 400 });

  await env.DB.prepare(
    "UPDATE posts SET title = ?1, body_md = ?2, category = ?3, edited_at = ?4, project_id = ?6 WHERE id = ?5",
  )
    .bind(
      read.guide.title.slice(0, 200),
      JSON.stringify(read.guide),
      read.guide.category || null,
      Math.floor(Date.now() / 1000),
      post.id,
      linked.id,
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

  let body: { text?: string; projectId?: string | null };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const read = await readGuide(body.text ?? "");
  if (!read.guide) return NextResponse.json({ error: read.error }, { status: 400 });
  const guide = read.guide;

  const { env } = getCloudflareContext();
  const linked = await resolveProject(env, body.projectId);
  if ("error" in linked) return NextResponse.json({ error: linked.error }, { status: 400 });

  const id = `t_${crypto.randomUUID().slice(0, 12)}`;
  await env.DB.prepare(
    `INSERT INTO posts (id, author_id, title, body_md, kind, status, created_at, category, project_id)
     VALUES (?1, ?2, ?3, ?4, 'tutorial', 'live', ?5, ?6, ?7)`,
  )
    .bind(
      id,
      user.id,
      guide.title.slice(0, 200),
      JSON.stringify(guide),
      Math.floor(Date.now() / 1000),
      guide.category || null,
      linked.id,
    )
    .run();

  return NextResponse.json({ ok: true, id });
}

/**
 * Taking one down.
 *
 * Delisted rather than deleted: comments, saves and an owner's verdict all
 * point at it, and a hard delete would take an argument's context with it. The
 * author or a moderator; nobody else.
 */
export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!id) return NextResponse.json({ error: "Which tutorial?" }, { status: 400 });

  const { env } = getCloudflareContext();
  const post = await env.DB.prepare(
    "SELECT id, author_id FROM posts WHERE id = ?1 AND kind='tutorial' AND status='live'",
  )
    .bind(id)
    .first<{ id: string; author_id: string }>();
  if (!post) return NextResponse.json({ error: "No such tutorial." }, { status: 404 });

  const isMod = user.role === "admin" || user.role === "mod";
  if (post.author_id !== user.id && !isMod)
    return NextResponse.json({ error: "That isn't yours to delete." }, { status: 403 });

  await env.DB.prepare("UPDATE posts SET status = 'removed' WHERE id = ?1").bind(post.id).run();
  return NextResponse.json({ ok: true });
}

/**
 * The Checked badge.
 *
 * A moderator saying they followed the steps themselves, which is the only
 * thing that makes the badge worth anything. Never the author's to give — the
 * intake strips it on the way in, and this is the one path that sets it.
 */
export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  if (user.role !== "admin" && user.role !== "mod")
    return NextResponse.json({ error: "Moderators only." }, { status: 403 });

  let body: { id?: string; checked?: boolean };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "Which tutorial?" }, { status: 400 });

  const { env } = getCloudflareContext();
  const post = await env.DB.prepare(
    "SELECT id, body_md, author_id FROM posts WHERE id = ?1 AND kind='tutorial' AND status='live'",
  )
    .bind(body.id)
    .first<{ id: string; body_md: string; author_id: string }>();
  if (!post) return NextResponse.json({ error: "No such tutorial." }, { status: 404 });

  const guide = parseGuide(post.body_md);
  if (!guide) return NextResponse.json({ error: "That tutorial isn't in the guide format." }, { status: 400 });

  if (body.checked === false) delete guide.verified;
  else guide.verified = { by: user.github_login, at: Math.floor(Date.now() / 1000) };

  await env.DB.prepare("UPDATE posts SET body_md = ?1 WHERE id = ?2").bind(JSON.stringify(guide), post.id).run();

  if (body.checked !== false && post.author_id !== user.id)
    await env.DB.prepare(
      `INSERT INTO notifications (id, user_id, kind, body, href, created_at)
       VALUES (?1, ?2, 'tutorial_checked', ?3, ?4, ?5)`,
    )
      .bind(
        crypto.randomUUID(),
        post.author_id,
        `A moderator followed "${guide.title}" and marked it Checked.`,
        `/wire/${post.id}`,
        Math.floor(Date.now() / 1000),
      )
      .run();

  return NextResponse.json({ ok: true, checked: body.checked !== false });
}
