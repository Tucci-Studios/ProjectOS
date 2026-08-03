import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

/**
 * A claimed fork says "this came from your project" but GitHub has no fork
 * edge to prove it. Only the PARENT's owner can settle that — confirm it and
 * the claim becomes real, deny it and the edge is cut.
 */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  let body: { projectId?: unknown; confirm?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const projectId = typeof body.projectId === "string" ? body.projectId : "";
  const confirm = body.confirm !== false;

  const { env } = getCloudflareContext();
  const child = await env.DB.prepare(
    `SELECT p.id, p.parent_id, p.lineage_source, p.base_name, p.variant_name, p.owner_id,
            parent.owner_id AS parent_owner_id
     FROM projects p LEFT JOIN projects parent ON parent.id = p.parent_id
     WHERE p.id = ?1 AND p.status='live'`,
  )
    .bind(projectId)
    .first<{
      id: string;
      parent_id: string | null;
      lineage_source: string | null;
      base_name: string;
      variant_name: string | null;
      owner_id: string;
      parent_owner_id: string | null;
    }>();

  if (!child || !child.parent_id) return NextResponse.json({ error: "No such fork." }, { status: 404 });
  if (child.lineage_source !== "declared")
    return NextResponse.json({ error: "Nothing to confirm — this lineage isn't a claim." }, { status: 400 });
  if (child.parent_owner_id !== user.id && user.role !== "admin")
    return NextResponse.json({ error: "Only the parent's owner can settle this." }, { status: 403 });

  const now = Math.floor(Date.now() / 1000);
  const display = child.variant_name ? `${child.base_name} // ${child.variant_name}` : child.base_name;

  if (confirm) {
    await env.DB.prepare("UPDATE projects SET parent_confirmed_at = ?1 WHERE id = ?2").bind(now, child.id).run();
  } else {
    // Denied: cut the edge and let it stand on its own as an original.
    await env.DB.prepare(
      "UPDATE projects SET parent_id = NULL, root_id = id, lineage_source = NULL, change_summary = NULL WHERE id = ?1",
    )
      .bind(child.id)
      .run();
  }

  await env.DB.prepare(
    "INSERT INTO notifications (id, user_id, kind, body, href, created_at) VALUES (?1, ?2, 'fork', ?3, ?4, ?5)",
  )
    .bind(
      `n_${crypto.randomUUID().slice(0, 8)}`,
      child.owner_id,
      confirm
        ? `Your claim was confirmed — ${display} is now on the tree`
        : `Your claim on ${display} was turned down, so it stands as its own project`,
      `/p/${child.id}`,
      now,
    )
    .run();

  return NextResponse.json({ ok: true, confirmed: confirm });
}
