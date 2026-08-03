import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to post an idea." }, { status: 401 });

  let body: { title?: unknown; body?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (title.length < 5 || title.length > 120)
    return NextResponse.json({ error: "Title must be 5-120 characters." }, { status: 400 });
  if (text.length < 20 || text.length > 4000)
    return NextResponse.json({ error: "Describe the idea in at least 20 characters." }, { status: 400 });

  const { env } = getCloudflareContext();
  const now = Math.floor(Date.now() / 1000);
  const id = `idea_${crypto.randomUUID().slice(0, 8)}`;

  await env.DB.prepare(
    "INSERT INTO ideas (id, author_id, title, body_md, status, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, 'open', ?5, ?5)",
  )
    .bind(id, user.id, title, text, now)
    .run();

  // Author's own vote seeds it at 1.
  await env.DB.prepare("INSERT INTO idea_votes (idea_id, user_id, created_at) VALUES (?1, ?2, ?3)")
    .bind(id, user.id, now)
    .run();

  return NextResponse.json({ ok: true, id });
}
