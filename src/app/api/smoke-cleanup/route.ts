import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

/** Removes rows the smoke test creates. Admin-only, and only ever touches
 *  rows whose text marks them as test data. */
export async function POST() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const { env } = getCloudflareContext();
  await env.DB.batch([
    env.DB.prepare("DELETE FROM project_comments WHERE body_md = 'smoke test comment'"),
    env.DB.prepare("DELETE FROM reports WHERE reason = 'smoke test report'"),
  ]);
  return NextResponse.json({ ok: true });
}
