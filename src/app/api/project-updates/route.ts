import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { checkRate } from "@/lib/rate-limit";

/** Post an update to a project. Owner only — this is a changelog, not a comment thread. */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const rate = await checkRate(user.id, "update");
  if (!rate.ok)
    return NextResponse.json({ error: rate.message }, { status: 429, headers: { "Retry-After": String(rate.retryAfterS) } });

  let body: { projectId?: unknown; version?: unknown; body?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const projectId = typeof body.projectId === "string" ? body.projectId : "";
  const text = typeof body.body === "string" ? body.body.trim() : "";
  const version = typeof body.version === "string" ? body.version.trim().slice(0, 24) : "";
  if (text.length < 3 || text.length > 2000)
    return NextResponse.json({ error: "Say what changed — 3 to 2000 characters." }, { status: 400 });

  const { env } = getCloudflareContext();
  const project = await env.DB.prepare(
    "SELECT id, owner_id, base_name, variant_name FROM projects WHERE id = ?1 AND status='live'",
  )
    .bind(projectId)
    .first<{ id: string; owner_id: string; base_name: string; variant_name: string | null }>();
  if (!project) return NextResponse.json({ error: "No such project." }, { status: 404 });
  if (project.owner_id !== user.id)
    return NextResponse.json({ error: "Only the owner can post updates to a project." }, { status: 403 });

  const now = Math.floor(Date.now() / 1000);
  const id = `pu_${crypto.randomUUID().slice(0, 8)}`;
  await env.DB.prepare(
    "INSERT INTO project_updates (id, project_id, author_id, version, body_md, status, created_at) VALUES (?1, ?2, ?3, ?4, ?5, 'live', ?6)",
  )
    .bind(id, projectId, user.id, version || null, text, now)
    .run();

  await env.DB.prepare("UPDATE projects SET updated_at = ?1 WHERE id = ?2").bind(now, projectId).run();

  // Everyone following this project hears about it.
  const display = project.variant_name ? `${project.base_name} // ${project.variant_name}` : project.base_name;
  await env.DB.prepare(
    `INSERT INTO notifications (id, user_id, kind, body, href, created_at)
     SELECT 'n_' || lower(hex(randomblob(4))), f.user_id, 'update', ?1, ?2, ?3
     FROM follows f WHERE f.project_id = ?4 AND f.user_id != ?5`,
  )
    .bind(`${display} posted an update`, `/p/${projectId}`, now, projectId, user.id)
    .run();

  return NextResponse.json({ ok: true, id });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId") ?? "";
  const limit = Math.min(50, Number(url.searchParams.get("limit")) || 10);

  const { env } = getCloudflareContext();
  const { results } = await env.DB.prepare(
    `SELECT pu.id, pu.version, pu.body_md, pu.created_at, u.github_login, u.avatar_url
     FROM project_updates pu JOIN users u ON u.id = pu.author_id
     WHERE pu.project_id = ?1 AND pu.status='live' ORDER BY pu.created_at DESC LIMIT ?2`,
  )
    .bind(projectId, limit)
    .all();

  return NextResponse.json({ results });
}

/** The owner can retract an update they posted. */
export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const url = new URL(request.url);
  const id = url.searchParams.get("id") ?? "";

  const { env } = getCloudflareContext();
  const row = await env.DB.prepare("SELECT author_id FROM project_updates WHERE id = ?1").bind(id).first<{ author_id: string }>();
  if (!row) return NextResponse.json({ error: "No such update." }, { status: 404 });
  if (row.author_id !== user.id && user.role !== "admin")
    return NextResponse.json({ error: "Not yours to delete." }, { status: 403 });

  await env.DB.prepare("UPDATE project_updates SET status='deleted' WHERE id = ?1").bind(id).run();
  return NextResponse.json({ ok: true });
}
