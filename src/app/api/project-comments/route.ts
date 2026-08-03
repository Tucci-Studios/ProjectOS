import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { checkRate } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to comment." }, { status: 401 });

  const rate = await checkRate(user.id, "comment");
  if (!rate.ok)
    return NextResponse.json({ error: rate.message }, { status: 429, headers: { "Retry-After": String(rate.retryAfterS) } });

  let body: { projectId?: unknown; body?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const projectId = typeof body.projectId === "string" ? body.projectId : "";
  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (text.length < 1 || text.length > 2000)
    return NextResponse.json({ error: "Comment must be 1-2000 characters." }, { status: 400 });

  const { env } = getCloudflareContext();
  const project = await env.DB.prepare("SELECT id, owner_id FROM projects WHERE id = ?1 AND status='live'")
    .bind(projectId)
    .first<{ id: string; owner_id: string }>();
  if (!project) return NextResponse.json({ error: "No such project." }, { status: 404 });

  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare(
    "INSERT INTO project_comments (id, project_id, author_id, body_md, status, created_at) VALUES (?1, ?2, ?3, ?4, 'live', ?5)",
  )
    .bind(`pc_${crypto.randomUUID().slice(0, 8)}`, projectId, user.id, text, now)
    .run();

  // Tell the owner, unless they're talking to themselves.
  if (project.owner_id !== user.id) {
    await env.DB.prepare(
      "INSERT INTO notifications (id, user_id, kind, body, href, created_at) VALUES (?1, ?2, 'reply', ?3, ?4, ?5)",
    )
      .bind(
        `n_${crypto.randomUUID().slice(0, 8)}`,
        project.owner_id,
        `@${user.github_login} commented on your project`,
        `/p/${projectId}`,
        now,
      )
      .run();
  }

  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId") ?? "";
  const limit = Math.min(20, Number(url.searchParams.get("limit")) || 5);

  const { env } = getCloudflareContext();
  const [{ results }, total] = await Promise.all([
    env.DB.prepare(
      `SELECT c.id, c.body_md, c.created_at, u.github_login, u.avatar_url
       FROM project_comments c JOIN users u ON u.id = c.author_id
       WHERE c.project_id = ?1 AND c.status='live' ORDER BY c.created_at DESC LIMIT ?2`,
    )
      .bind(projectId, limit)
      .all(),
    env.DB.prepare("SELECT COUNT(*) AS n FROM project_comments WHERE project_id = ?1 AND status='live'")
      .bind(projectId)
      .first<{ n: number }>(),
  ]);

  return NextResponse.json({ comments: results, total: total?.n ?? 0 });
}
