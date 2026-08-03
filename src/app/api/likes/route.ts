import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

const MIN_ACCOUNT_AGE_S = 30 * 24 * 60 * 60; // bot defense

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to vote." }, { status: 401 });

  const now = Math.floor(Date.now() / 1000);
  if (now - user.github_created_at < MIN_ACCOUNT_AGE_S)
    return NextResponse.json({ error: "Voting needs a GitHub account at least 30 days old." }, { status: 403 });

  let projectId: unknown, direction: unknown;
  try {
    ({ projectId, direction } = (await request.json()) as { projectId?: unknown; direction?: unknown });
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  if (typeof projectId !== "string") return NextResponse.json({ error: "Bad request." }, { status: 400 });
  const value = direction === "down" ? -1 : 1;

  const { env } = getCloudflareContext();
  const project = await env.DB.prepare("SELECT id FROM projects WHERE id = ?1 AND status = 'live'")
    .bind(projectId)
    .first();
  if (!project) return NextResponse.json({ error: "No such project." }, { status: 404 });

  const existing = await env.DB.prepare("SELECT value FROM likes WHERE user_id = ?1 AND project_id = ?2")
    .bind(user.id, projectId)
    .first<{ value: number }>();

  if (existing?.value === value) {
    // Clicking the same arrow again clears your vote.
    await env.DB.prepare("DELETE FROM likes WHERE user_id = ?1 AND project_id = ?2").bind(user.id, projectId).run();
  } else if (existing) {
    await env.DB.prepare("UPDATE likes SET value = ?3, created_at = ?4 WHERE user_id = ?1 AND project_id = ?2")
      .bind(user.id, projectId, value, now)
      .run();
  } else {
    await env.DB.prepare("INSERT INTO likes (user_id, project_id, value, created_at) VALUES (?1, ?2, ?3, ?4)")
      .bind(user.id, projectId, value, now)
      .run();
  }

  const score = await env.DB.prepare("SELECT COALESCE(SUM(value),0) AS n FROM likes WHERE project_id = ?1")
    .bind(projectId)
    .first<{ n: number }>();

  return NextResponse.json({ vote: existing?.value === value ? 0 : value, count: score?.n ?? 0 });
}
