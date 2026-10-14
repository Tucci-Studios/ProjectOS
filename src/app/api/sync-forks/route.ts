import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { checkRate, clientKey } from "@/lib/rate-limit";
import { forksAreStale, syncForks, getForkPicture } from "@/lib/forks";

/**
 * Refresh a project's GitHub fork list.
 *
 * Called from the client after the page has already rendered, so a slow or
 * rate-limited GitHub never delays anyone's page. Cached for 6 hours; asking
 * again inside that window is a no-op.
 */
export async function POST(request: Request) {
  // Open to anyone, so limit by IP.
  const rate = await checkRate(clientKey(request), "sync-forks");
  if (!rate.ok) return NextResponse.json({ error: rate.message }, { status: 429 });

  let body: { projectId?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const projectId = typeof body.projectId === "string" ? body.projectId : "";

  const { env } = getCloudflareContext();
  const project = await env.DB.prepare("SELECT id, github_repo FROM projects WHERE id = ?1 AND status='live'")
    .bind(projectId)
    .first<{ id: string; github_repo: string }>();
  if (!project) return NextResponse.json({ error: "No such project." }, { status: 404 });

  if (!(await forksAreStale(project.id)))
    return NextResponse.json({ ok: true, fresh: true, ...(await getForkPicture(project.id, project.github_repo)) });

  const picture = await syncForks(project.id, project.github_repo);
  if (!picture) return NextResponse.json({ error: "GitHub didn't answer." }, { status: 502 });

  return NextResponse.json({ ok: true, fresh: false, ...picture });
}
