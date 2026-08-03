import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const user = await getSessionUser();
  if (!user) return NextResponse.redirect(`${origin}/`, 303);

  const { env } = getCloudflareContext();
  await env.DB.prepare("UPDATE users SET tos_accepted_at = ?1 WHERE id = ?2 AND tos_accepted_at IS NULL")
    .bind(Math.floor(Date.now() / 1000), user.id)
    .run();

  return NextResponse.redirect(`${origin}/`, 303);
}
