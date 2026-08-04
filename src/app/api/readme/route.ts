import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getReadme } from "@/lib/github";

export const dynamic = "force-dynamic";

/**
 * A project's README, fetched on demand.
 *
 * Deliberately not part of the page render: a project page must never wait on
 * GitHub. This runs when somebody actually asks to read it, and the answer is
 * stored so nobody pays for it twice.
 */
export async function GET(request: Request) {
  const projectId = new URL(request.url).searchParams.get("projectId") ?? "";
  const { env } = getCloudflareContext();

  const p = await env.DB.prepare(
    "SELECT id, github_repo, readme_md, readme_at FROM projects WHERE id = ?1 AND status='live'",
  )
    .bind(projectId)
    .first<{ id: string; github_repo: string; readme_md: string | null; readme_at: number | null }>();
  if (!p) return NextResponse.json({ error: "No such project." }, { status: 404 });

  if (p.readme_at) return NextResponse.json({ md: p.readme_md, repo: p.github_repo });

  const md = await getReadme(p.github_repo);
  // Only cache a real answer. Stamping readme_at on a failed fetch turned one
  // bad minute at GitHub into "this project has no readme" forever.
  if (md)
    await env.DB.prepare("UPDATE projects SET readme_md = ?1, readme_at = ?2 WHERE id = ?3")
      .bind(md, Math.floor(Date.now() / 1000), p.id)
      .run();

  return NextResponse.json({ md, repo: p.github_repo });
}
