import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { CATEGORY_SLUGS } from "@/lib/categories";

/** Edit or delist your own project. Admins can delist anyone's. */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  let body: {
    projectId?: unknown;
    action?: unknown;
    description?: unknown;
    changeSummary?: unknown;
    category?: unknown;
    images?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const projectId = typeof body.projectId === "string" ? body.projectId : "";
  const { env } = getCloudflareContext();
  const project = await env.DB.prepare("SELECT id, owner_id FROM projects WHERE id = ?1")
    .bind(projectId)
    .first<{ id: string; owner_id: string }>();
  if (!project) return NextResponse.json({ error: "No such project." }, { status: 404 });

  const isOwner = project.owner_id === user.id;
  if (!isOwner && user.role !== "admin")
    return NextResponse.json({ error: "That isn't yours." }, { status: 403 });

  if (body.action === "delete") {
    // Delist rather than hard-delete: forks below it keep their history.
    await env.DB.prepare("UPDATE projects SET status = 'delisted', updated_at = ?2 WHERE id = ?1")
      .bind(projectId, Math.floor(Date.now() / 1000))
      .run();
    return NextResponse.json({ ok: true, deleted: true });
  }

  const description = typeof body.description === "string" ? body.description.trim() : "";
  const changeSummary = typeof body.changeSummary === "string" ? body.changeSummary.trim() : "";
  const category = typeof body.category === "string" && CATEGORY_SLUGS.includes(body.category) ? body.category : null;

  if (description && (description.length < 20 || description.length > 500))
    return NextResponse.json({ error: "Description must be 20-500 characters." }, { status: 400 });

  await env.DB.prepare(
    `UPDATE projects SET
       description = COALESCE(NULLIF(?2,''), description),
       change_summary = COALESCE(NULLIF(?3,''), change_summary),
       category = COALESCE(?4, category),
       updated_at = ?5
     WHERE id = ?1`,
  )
    .bind(projectId, description, changeSummary, category, Math.floor(Date.now() / 1000))
    .run();

  if (Array.isArray(body.images)) {
    // A gallery row is keyed on (project_id, url), so the same picture listed
    // twice used to break the insert halfway — after the delete had already
    // emptied the gallery, leaving the project with fewer images than it had.
    const urls = [
      ...new Set(body.images.filter((u): u is string => typeof u === "string" && u.length > 0)),
    ].slice(0, 6);
    await env.DB.prepare("DELETE FROM project_images WHERE project_id = ?1").bind(projectId).run();
    for (const [i, url] of urls.entries()) {
      await env.DB.prepare("INSERT INTO project_images (project_id, url, position) VALUES (?1, ?2, ?3)")
        .bind(projectId, url, i)
        .run();
    }
    await env.DB.prepare("UPDATE projects SET image_url = ?2 WHERE id = ?1").bind(projectId, urls[0] ?? null).run();
  }

  return NextResponse.json({ ok: true });
}
