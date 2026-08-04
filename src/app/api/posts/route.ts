import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { checkRate } from "@/lib/rate-limit";
import { CATEGORY_SLUGS } from "@/lib/categories";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to post." }, { status: 401 });

  const rate = await checkRate(user.id, "post");
  if (!rate.ok)
    return NextResponse.json({ error: rate.message }, { status: 429, headers: { "Retry-After": String(rate.retryAfterS) } });


  let body: { title?: unknown; body?: unknown; kind?: unknown; projectId?: unknown; category?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const text = typeof body.body === "string" ? body.body.trim() : "";
  const kind = body.kind === "tutorial" ? "tutorial" : body.kind === "request" ? "request" : "post";
  const projectId = typeof body.projectId === "string" && body.projectId ? body.projectId : null;
  const category = typeof body.category === "string" && body.category ? body.category : null;

  if ((kind === "tutorial" || kind === "request") && !category)
    return NextResponse.json({ error: "Tutorials and requests need a section." }, { status: 400 });
  // Section pages look posts up by this exact slug, so an unrecognised one is
  // written happily and then never appears anywhere.
  if (category && !CATEGORY_SLUGS.includes(category))
    return NextResponse.json({ error: "That isn't a section." }, { status: 400 });

  if (title.length < 3 || title.length > 120)
    return NextResponse.json({ error: "Title must be 3-120 characters." }, { status: 400 });
  if (text.length < 10 || text.length > 5000)
    return NextResponse.json({ error: "Body must be 10-5000 characters." }, { status: 400 });

  const { env } = getCloudflareContext();
  if (projectId) {
    const project = await env.DB.prepare("SELECT id FROM projects WHERE id = ?1 AND status = 'live'")
      .bind(projectId)
      .first();
    if (!project) return NextResponse.json({ error: "No such project." }, { status: 400 });
  }

  const id = `post_${crypto.randomUUID().slice(0, 8)}`;
  await env.DB.prepare(
    "INSERT INTO posts (id, author_id, project_id, title, body_md, kind, category, status, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 'live', ?8)",
  )
    .bind(id, user.id, projectId, title, text, kind, category, Math.floor(Date.now() / 1000))
    .run();

  return NextResponse.json({ ok: true, id });
}
