import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getSessionUser } from "@/lib/auth";
import { checkRate, clientKey } from "@/lib/rate-limit";

const KINDS = new Set(["takedown", "privacy", "other"]);

/** Open to anyone — a takedown request can't require an account. */
export async function POST(request: Request) {
  const rate = await checkRate(clientKey(request), "contact");
  if (!rate.ok) return NextResponse.json({ error: rate.message }, { status: 429 });

  let b: { kind?: string; body?: string; replyTo?: string };
  try {
    b = (await request.json()) as typeof b;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const kind = KINDS.has(b.kind ?? "") ? b.kind! : "other";
  const body = (b.body ?? "").trim();
  if (body.length < 20) return NextResponse.json({ error: "Tell us a bit more than that." }, { status: 400 });
  if (body.length > 4000) return NextResponse.json({ error: "That's too long — trim it down." }, { status: 400 });

  // Optional. Someone reporting a takedown may not want to hand over an address,
  // and requiring one would defeat the point of having this route at all.
  const replyTo = (b.replyTo ?? "").trim().slice(0, 200) || null;
  if (replyTo && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(replyTo)) {
    return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });
  }

  const user = await getSessionUser();
  const { env } = getCloudflareContext();
  await env.DB.prepare(
    `INSERT INTO contact_messages (id, created_at, kind, reply_to, body, user_id)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
  )
    .bind(crypto.randomUUID(), Math.floor(Date.now() / 1000), kind, replyTo, body, user?.id ?? null)
    .run();

  return NextResponse.json({ ok: true });
}
