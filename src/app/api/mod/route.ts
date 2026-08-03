import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

/** Act on a report: remove the thing, or dismiss the complaint. */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admins only." }, { status: 403 });

  let body: { reportId?: unknown; action?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const reportId = typeof body.reportId === "string" ? body.reportId : "";
  const action = body.action === "remove" ? "remove" : "dismiss";

  const { env } = getCloudflareContext();
  const report = await env.DB.prepare("SELECT id, target_type, target_id FROM reports WHERE id = ?1 AND status='open'")
    .bind(reportId)
    .first<{ id: string; target_type: string; target_id: string }>();
  if (!report) return NextResponse.json({ error: "No such open report." }, { status: 404 });

  if (action === "remove") {
    const stmt: Record<string, string> = {
      project: "UPDATE projects SET status='delisted' WHERE id = ?1",
      post: "UPDATE posts SET status='removed' WHERE id = ?1",
      comment: "UPDATE project_comments SET status='removed' WHERE id = ?1",
      user: "UPDATE users SET banned_at = strftime('%s','now') WHERE id = ?1",
    };
    const sql = stmt[report.target_type];
    if (sql) await env.DB.prepare(sql).bind(report.target_id).run();
  }

  await env.DB.prepare("UPDATE reports SET status = ?2, resolved_by = ?3, resolved_at = ?4 WHERE id = ?1")
    .bind(reportId, action === "remove" ? "resolved" : "dismissed", user.id, Math.floor(Date.now() / 1000))
    .run();

  return NextResponse.json({ ok: true });
}
