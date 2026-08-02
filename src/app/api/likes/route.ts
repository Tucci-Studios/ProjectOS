import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

const MIN_ACCOUNT_AGE_S = 30 * 24 * 60 * 60; // 30-day GitHub account age gate (bot defense)

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to like." }, { status: 401 });

  const now = Math.floor(Date.now() / 1000);
  if (now - user.github_created_at < MIN_ACCOUNT_AGE_S) {
    return NextResponse.json(
      { error: "Likes need a GitHub account at least 30 days old." },
      { status: 403 },
    );
  }

  let projectId: unknown;
  try {
    ({ projectId } = (await request.json()) as { projectId?: unknown });
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  if (typeof projectId !== "string") return NextResponse.json({ error: "Bad request." }, { status: 400 });

  const { env } = getCloudflareContext();
  const project = await env.DB.prepare("SELECT id FROM projects WHERE id = ?1 AND status = 'live'")
    .bind(projectId)
    .first();
  if (!project) return NextResponse.json({ error: "No such project." }, { status: 404 });

  const existing = await env.DB.prepare("SELECT 1 FROM likes WHERE user_id = ?1 AND project_id = ?2")
    .bind(user.id, projectId)
    .first();
  if (existing) {
    await env.DB.prepare("DELETE FROM likes WHERE user_id = ?1 AND project_id = ?2").bind(user.id, projectId).run();
  } else {
    await env.DB.prepare("INSERT INTO likes (user_id, project_id, created_at) VALUES (?1, ?2, ?3)")
      .bind(user.id, projectId, now)
      .run();
  }

  const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM likes WHERE project_id = ?1")
    .bind(projectId)
    .first<{ n: number }>();
  return NextResponse.json({ liked: !existing, count: count?.n ?? 0 });
}
