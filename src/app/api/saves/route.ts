import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

/** Toggle a bookmark. Saving is private — nobody is told, and no count is public. */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to save projects." }, { status: 401 });

  let body: { projectId?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const projectId = typeof body.projectId === "string" ? body.projectId : "";

  const { env } = getCloudflareContext();
  const project = await env.DB.prepare("SELECT id FROM projects WHERE id = ?1 AND status='live'")
    .bind(projectId)
    .first();
  if (!project) return NextResponse.json({ error: "No such project." }, { status: 404 });

  const existing = await env.DB.prepare("SELECT 1 FROM saves WHERE user_id = ?1 AND project_id = ?2")
    .bind(user.id, projectId)
    .first();

  if (existing) {
    await env.DB.prepare("DELETE FROM saves WHERE user_id = ?1 AND project_id = ?2")
      .bind(user.id, projectId)
      .run();
    return NextResponse.json({ saved: false });
  }

  await env.DB.prepare("INSERT INTO saves (user_id, project_id, created_at) VALUES (?1, ?2, ?3)")
    .bind(user.id, projectId, Math.floor(Date.now() / 1000))
    .run();
  return NextResponse.json({ saved: true });
}
