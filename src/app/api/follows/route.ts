import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to follow." }, { status: 401 });

  let projectId: unknown;
  try {
    ({ projectId } = (await request.json()) as { projectId?: unknown });
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  if (typeof projectId !== "string") return NextResponse.json({ error: "Bad request." }, { status: 400 });

  const { env } = getCloudflareContext();
  const project = await env.DB.prepare("SELECT id FROM projects WHERE id = ?1 AND status='live'")
    .bind(projectId)
    .first();
  if (!project) return NextResponse.json({ error: "No such project." }, { status: 404 });

  const existing = await env.DB.prepare("SELECT 1 FROM follows WHERE user_id = ?1 AND project_id = ?2")
    .bind(user.id, projectId)
    .first();

  if (existing) {
    await env.DB.prepare("DELETE FROM follows WHERE user_id = ?1 AND project_id = ?2").bind(user.id, projectId).run();
  } else {
    await env.DB.prepare("INSERT INTO follows (user_id, project_id, created_at) VALUES (?1, ?2, ?3)")
      .bind(user.id, projectId, Math.floor(Date.now() / 1000))
      .run();
  }

  const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM follows WHERE project_id = ?1")
    .bind(projectId)
    .first<{ n: number }>();

  return NextResponse.json({ following: !existing, count: count?.n ?? 0 });
}
