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

  let raw = (body.text ?? "").trim();
  if (!raw) return NextResponse.json({ error: "Paste what your AI wrote, or a link to it." }, { status: 400 });

  // A link instead of the text itself.
  if (/^https:\/\/\S+$/.test(raw)) {
    try {
      const res = await fetch(raw, { headers: { Accept: "application/json, text/plain" } });
      if (!res.ok) return NextResponse.json({ error: `That link returned ${res.status}.` }, { status: 400 });
      raw = (await res.text()).trim();
    } catch {
      return NextResponse.json({ error: "Couldn't fetch that link." }, { status: 400 });
    }
  }

  // Tolerate a fenced block, since that's how models hand JSON over.
  const fence = /```(?:json)?\s*([\s\S]*?)```/.exec(raw);
  if (fence) raw = fence[1].trim();

  const guide = parseGuide(raw);
  if (!guide)
    return NextResponse.json(
      { error: "That isn't a tutorial in our format — it needs at least a title and one step. Point your AI at /tutorial-template.md." },
      { status: 400 },
    );

  if (guide.category && !CATEGORY_SLUGS.includes(guide.category))
    return NextResponse.json({ error: `"${guide.category}" isn't one of our sections.` }, { status: 400 });

  // Verification is a moderator's to give, never the author's to claim.
  delete guide.verified;

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
