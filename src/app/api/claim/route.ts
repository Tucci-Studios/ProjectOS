import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Claiming work we indexed before you ever heard of us.
 *
 * Signing in already takes ownership of anything keyed to your GitHub id — that
 * happens in the OAuth callback and needs no page. What it can't catch is a
 * project indexed under a different shadow row: a repo that moved account, or
 * one we resolved to an org. Those still carry your login in the repo path, so
 * they're findable, and the login is also what makes claiming them safe.
 *
 * The check is the whole security model: you may claim a repo only when the
 * owner segment of its path equals the GitHub login on your session. Nothing
 * the client sends is trusted for that.
 */
function ownerOf(repo: string) {
  return repo.split("/")[0]?.toLowerCase() ?? "";
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const { env } = getCloudflareContext();

  const [mine, claimable] = await Promise.all([
    env.DB.prepare(
      `SELECT id, base_name, github_repo, stars, category FROM projects
       WHERE owner_id = ?1 AND status = 'live' ORDER BY stars DESC LIMIT 30`,
    )
      .bind(user.id)
      .all<{ id: string; base_name: string; github_repo: string; stars: number; category: string }>(),
    env.DB.prepare(
      `SELECT p.id, p.base_name, p.github_repo, p.stars, p.category FROM projects p
       JOIN users u ON u.id = p.owner_id
       WHERE p.status = 'live' AND u.is_shadow = 1 AND p.owner_id != ?1
         AND lower(substr(p.github_repo, 1, instr(p.github_repo, '/') - 1)) = lower(?2)
       ORDER BY p.stars DESC LIMIT 30`,
    )
      .bind(user.id, user.github_login)
      .all<{ id: string; base_name: string; github_repo: string; stars: number; category: string }>(),
  ]);

  return NextResponse.json({ mine: mine.results, claimable: claimable.results });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  let body: { projectIds?: string[] };
  try {
    body = (await request.json()) as { projectIds?: string[] };
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const ids = (body.projectIds ?? []).filter((v) => typeof v === "string").slice(0, 50);
  if (!ids.length) return NextResponse.json({ error: "Nothing to claim." }, { status: 400 });

  const { env } = getCloudflareContext();
  const placeholders = ids.map((_, i) => `?${i + 1}`).join(",");
  const { results } = await env.DB.prepare(
    `SELECT id, github_repo FROM projects WHERE status='live' AND id IN (${placeholders})`,
  )
    .bind(...ids)
    .all<{ id: string; github_repo: string }>();

  const allowed = results.filter((r) => ownerOf(r.github_repo) === user.github_login.toLowerCase());
  if (!allowed.length) return NextResponse.json({ error: "Those aren't yours." }, { status: 403 });

  await env.DB.batch(
    allowed.map((r) =>
      env.DB.prepare("UPDATE projects SET owner_id = ?1, source = 'claimed' WHERE id = ?2").bind(user.id, r.id),
    ),
  );

  return NextResponse.json({ ok: true, claimed: allowed.length });
}
