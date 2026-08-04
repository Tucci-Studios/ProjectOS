import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Post an update.
 *
 * This table was read in two places — the Updates page and the header banner —
 * and written by nobody, so the only way to announce anything was to hand-write
 * SQL. Admins only: it's the site speaking, not a user.
 */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admins only." }, { status: 403 });

  let payload: Record<string, string | undefined>;
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const { version, title, intro, body } = payload;

  const t = (title ?? "").trim();
  const b = (body ?? "").trim();
  if (t.length < 3) return NextResponse.json({ error: "Give it a title." }, { status: 400 });
  if (!b) return NextResponse.json({ error: "An update with no lines isn't an update." }, { status: 400 });
  if (b.length > 8000) return NextResponse.json({ error: "Keep it under 8,000 characters." }, { status: 400 });

  const { env } = getCloudflareContext();
  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO updates (id, version, title, intro, body_md, author_id, published_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
  )
    .bind(id, (version ?? "").trim().slice(0, 40) || null, t.slice(0, 200), (intro ?? "").trim().slice(0, 500) || null, b, user.id, Math.floor(Date.now() / 1000))
    .run();

  return NextResponse.json({ ok: true, id });
}
