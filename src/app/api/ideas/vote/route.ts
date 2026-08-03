import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

const MIN_ACCOUNT_AGE_S = 30 * 24 * 60 * 60;

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to vote." }, { status: 401 });

  const now = Math.floor(Date.now() / 1000);
  if (now - user.github_created_at < MIN_ACCOUNT_AGE_S)
    return NextResponse.json({ error: "Votes need a GitHub account at least 30 days old." }, { status: 403 });

  let ideaId: unknown, direction: unknown;
  try {
    ({ ideaId, direction } = (await request.json()) as { ideaId?: unknown; direction?: unknown });
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  if (typeof ideaId !== "string") return NextResponse.json({ error: "Bad request." }, { status: 400 });
  const value = direction === "down" ? -1 : 1;

  const { env } = getCloudflareContext();
  const idea = await env.DB.prepare("SELECT id FROM ideas WHERE id = ?1").bind(ideaId).first();
  if (!idea) return NextResponse.json({ error: "No such idea." }, { status: 404 });

  const existing = await env.DB.prepare("SELECT value FROM idea_votes WHERE idea_id = ?1 AND user_id = ?2")
    .bind(ideaId, user.id)
    .first<{ value: number }>();

  if (existing?.value === value) {
    await env.DB.prepare("DELETE FROM idea_votes WHERE idea_id = ?1 AND user_id = ?2").bind(ideaId, user.id).run();
  } else if (existing) {
    await env.DB.prepare("UPDATE idea_votes SET value = ?3, created_at = ?4 WHERE idea_id = ?1 AND user_id = ?2")
      .bind(ideaId, user.id, value, now)
      .run();
  } else {
    await env.DB.prepare("INSERT INTO idea_votes (idea_id, user_id, value, created_at) VALUES (?1, ?2, ?3, ?4)")
      .bind(ideaId, user.id, value, now)
      .run();
  }

  const count = await env.DB.prepare("SELECT COALESCE(SUM(value),0) AS n FROM idea_votes WHERE idea_id = ?1")
    .bind(ideaId)
    .first<{ n: number }>();

  return NextResponse.json({ vote: existing?.value === value ? 0 : value, count: count?.n ?? 0 });
}
