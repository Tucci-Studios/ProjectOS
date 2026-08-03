import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

/**
 * Hands the smoke test a live project and idea id to exercise.
 *
 * The database holds real, re-importable data, so the test can't hardcode ids —
 * they go stale the moment the import runs again. Admin-only; it exposes
 * nothing that isn't already on the public feed.
 */
export async function GET() {
  const user = await getSessionUser();
  if (user?.role !== "admin") return NextResponse.json({ error: "Not found." }, { status: 404 });

  const { env } = getCloudflareContext();
  const [project, idea] = await Promise.all([
    env.DB.prepare("SELECT id FROM projects WHERE status='live' AND owner_id != ?1 ORDER BY created_at LIMIT 1")
      .bind(user.id)
      .first<{ id: string }>(),
    env.DB.prepare("SELECT id FROM ideas ORDER BY created_at LIMIT 1").first<{ id: string }>(),
  ]);

  return NextResponse.json({ projectId: project?.id ?? null, ideaId: idea?.id ?? null });
}
