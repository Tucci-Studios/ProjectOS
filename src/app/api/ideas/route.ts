import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { checkRate } from "@/lib/rate-limit";
import { currentCycle } from "@/lib/cycles";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to post an idea." }, { status: 401 });

  const rate = await checkRate(user.id, "idea");
  if (!rate.ok)
    return NextResponse.json({ error: rate.message }, { status: 429, headers: { "Retry-After": String(rate.retryAfterS) } });


  let body: { title?: unknown; body?: unknown; demoUrl?: unknown; repoUrl?: unknown; shotUrl?: unknown };
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

  // Optional links. Only https, so nothing can smuggle javascript: or data: URLs.
  const httpsOnly = (v: unknown): string | null => {
    if (typeof v !== "string" || !v.trim()) return null;
    try {
      const u = new URL(v.trim());
      return u.protocol === "https:" ? u.toString() : null;
    } catch {
      return null;
    }
  };
  const demoUrl = httpsOnly(body.demoUrl);
  const repoUrl = httpsOnly(body.repoUrl);
  const shotUrl = httpsOnly(body.shotUrl);
  if (body.demoUrl && !demoUrl)
    return NextResponse.json({ error: "Demo link must be a full https:// URL." }, { status: 400 });
  if (body.repoUrl && !repoUrl)
    return NextResponse.json({ error: "Code link must be a full https:// URL." }, { status: 400 });

  const { env } = getCloudflareContext();
  const now = Math.floor(Date.now() / 1000);
  const cycle = currentCycle(now).n;
  const id = `idea_${crypto.randomUUID().slice(0, 8)}`;

  await env.DB.prepare(
    `INSERT INTO ideas (id, author_id, title, body_md, status, demo_url, repo_url, shot_url, cycle, created_at, updated_at)
     VALUES (?1, ?2, ?3, ?4, 'open', ?5, ?6, ?7, ?8, ?9, ?9)`,
  )
    .bind(id, user.id, title, text, demoUrl, repoUrl, shotUrl, cycle, now)
    .run();

  // Author's own vote seeds it at 1.
  await env.DB.prepare("INSERT INTO idea_votes (idea_id, user_id, created_at) VALUES (?1, ?2, ?3)")
    .bind(id, user.id, now)
    .run();

  return NextResponse.json({ ok: true, id });
}
