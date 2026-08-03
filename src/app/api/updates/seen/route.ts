import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: true });

  let updateId: unknown;
  try {
    ({ updateId } = (await request.json()) as { updateId?: unknown });
  } catch {
    return NextResponse.json({ ok: true });
  }
  if (typeof updateId !== "string") return NextResponse.json({ ok: true });

  const { env } = getCloudflareContext();
  await env.DB.prepare("UPDATE users SET last_seen_update = ?1 WHERE id = ?2").bind(updateId, user.id).run();
  return NextResponse.json({ ok: true });
}
