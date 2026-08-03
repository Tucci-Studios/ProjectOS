import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { checkRate } from "@/lib/rate-limit";

const TARGETS = new Set(["project", "post", "comment", "user"]);

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to report." }, { status: 401 });

  const rate = await checkRate(user.id, "report");
  if (!rate.ok)
    return NextResponse.json({ error: rate.message }, { status: 429, headers: { "Retry-After": String(rate.retryAfterS) } });


  let body: { targetType?: unknown; targetId?: unknown; reason?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const targetType = typeof body.targetType === "string" ? body.targetType : "";
  const targetId = typeof body.targetId === "string" ? body.targetId : "";
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  if (!TARGETS.has(targetType) || !targetId) return NextResponse.json({ error: "Bad request." }, { status: 400 });
  if (reason.length < 4 || reason.length > 500)
    return NextResponse.json({ error: "Tell us what's wrong (4-500 characters)." }, { status: 400 });

  const { env } = getCloudflareContext();
  const dupe = await env.DB.prepare(
    "SELECT 1 FROM reports WHERE reporter_id = ?1 AND target_type = ?2 AND target_id = ?3 AND status = 'open'",
  )
    .bind(user.id, targetType, targetId)
    .first();
  if (dupe) return NextResponse.json({ ok: true, already: true });

  await env.DB.prepare(
    "INSERT INTO reports (id, reporter_id, target_type, target_id, reason, status, created_at) VALUES (?1, ?2, ?3, ?4, ?5, 'open', ?6)",
  )
    .bind(`rep_${crypto.randomUUID().slice(0, 8)}`, user.id, targetType, targetId, reason, Math.floor(Date.now() / 1000))
    .run();

  return NextResponse.json({ ok: true });
}
