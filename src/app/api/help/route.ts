import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { checkRate } from "@/lib/rate-limit";
import { roleByKey } from "@/lib/help-roles";

export const dynamic = "force-dynamic";

/** Apply to help. */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const { role, body, contact } = (await request.json()) as {
    role?: string;
    body?: string;
    contact?: string;
  };
  if (!roleByKey(role ?? "")) return NextResponse.json({ error: "Unknown role." }, { status: 400 });

  const text = (body ?? "").trim();
  if (text.length < 20) return NextResponse.json({ error: "Tell us a bit more than that." }, { status: 400 });
  if (text.length > 2000) return NextResponse.json({ error: "Keep it under 2,000 characters." }, { status: 400 });

  const rate = await checkRate(user.id, "idea");
  if (!rate.ok) return NextResponse.json({ error: rate.message }, { status: 429 });

  const { env } = getCloudflareContext();
  // Reapplying replaces the open one rather than adding to the pile.
  await env.DB.prepare("DELETE FROM help_applications WHERE user_id = ?1 AND role = ?2 AND status = 'open'")
    .bind(user.id, role)
    .run();
  await env.DB.prepare(
    `INSERT INTO help_applications (id, user_id, role, body, contact, status, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5, 'open', ?6)`,
  )
    .bind(crypto.randomUUID(), user.id, role, text, (contact ?? "").trim().slice(0, 200) || null, Math.floor(Date.now() / 1000))
    .run();

  return NextResponse.json({ ok: true });
}

/** Accept or decline one. Admins only. */
export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const { id, action } = (await request.json()) as { id?: string; action?: string };
  if (!id || !["accepted", "declined"].includes(action ?? ""))
    return NextResponse.json({ error: "Bad request." }, { status: 400 });

  const { env } = getCloudflareContext();
  await env.DB.prepare("UPDATE help_applications SET status = ?1, decided_at = ?2 WHERE id = ?3")
    .bind(action, Math.floor(Date.now() / 1000), id)
    .run();

  return NextResponse.json({ ok: true });
}
