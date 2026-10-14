import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { checkRate, clientKey } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  // Open to anyone, so limit by IP.
  const rate = await checkRate(clientKey(request), "waitlist");
  if (!rate.ok) return NextResponse.json({ error: rate.message }, { status: 429 });

  let email: unknown;
  try {
    const body = (await request.json()) as { email?: unknown };
    email = body.email;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (typeof email !== "string" || !EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "That doesn't look like an email." }, { status: 400 });
  }

  const { env } = getCloudflareContext();
  await env.DB.prepare(
    "INSERT INTO waitlist (email, created_at, source) VALUES (?1, ?2, 'landing') ON CONFLICT(email) DO NOTHING",
  )
    .bind(email.toLowerCase().trim(), Math.floor(Date.now() / 1000))
    .run();

  return NextResponse.json({ ok: true });
}
