import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { headers as ghHeaders } from "@/lib/github";

export const dynamic = "force-dynamic";

/**
 * Everything GitHub knows about one repo that Project OS doesn't store yet.
 *
 * Fetched on demand for a single project in the lab, never during a page
 * render — a project page waiting on GitHub is the mistake that took the dev
 * server down once already. Three calls, one repo, only when somebody asks.
 *
 * The point is to see this against a real repo before deciding whether it earns
 * a place on every project page. Releases in particular will be empty for most
 * of the catalogue, and that's the thing worth finding out now.
 */
export async function GET(request: Request) {
  const projectId = new URL(request.url).searchParams.get("projectId") ?? "";
  const { env } = getCloudflareContext();

  const p = await env.DB.prepare(
    "SELECT id, base_name, github_repo, stars, github_forks, language, pushed_at, license, archived FROM projects WHERE id = ?1 AND status='live'",
  )
    .bind(projectId)
    .first<{
      id: string;
      base_name: string;
      github_repo: string;
      stars: number;
      github_forks: number;
      language: string | null;
      pushed_at: number | null;
      license: string;
      archived: number;
    }>();
  if (!p) return NextResponse.json({ error: "No such project." }, { status: 404 });

  const h = ghHeaders();
  const get = async (path: string) => {
    try {
      const res = await fetch(`https://api.github.com/repos/${p.github_repo}${path}`, { headers: h });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  const [repo, release, contributors, languages] = await Promise.all([
    get(""),
    get("/releases/latest"),
    get("/contributors?per_page=6"),
    get("/languages"),
  ]);

  const r = repo as {
    topics?: string[];
    open_issues_count?: number;
    subscribers_count?: number;
    created_at?: string;
    size?: number;
  } | null;

  const rel = release as { tag_name?: string; published_at?: string; name?: string } | null;

  return NextResponse.json({
    project: p,
    topics: r?.topics ?? [],
    openIssues: r?.open_issues_count ?? null,
    watchers: r?.subscribers_count ?? null,
    createdAt: r?.created_at ?? null,
    release: rel?.tag_name ? { tag: rel.tag_name, name: rel.name ?? null, at: rel.published_at ?? null } : null,
    contributors: Array.isArray(contributors)
      ? (contributors as { login: string; contributions: number; avatar_url: string | null }[])
          .slice(0, 6)
          .map((c) => ({ login: c.login, commits: c.contributions, avatar: c.avatar_url }))
      : [],
    languages: languages && typeof languages === "object" ? (languages as Record<string, number>) : {},
  });
}
