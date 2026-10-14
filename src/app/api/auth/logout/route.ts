import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";
import { sessionCookieName, verifySession } from "@/lib/auth";

export async function POST(request: Request) {
  const res = NextResponse.redirect(`${new URL(request.url).origin}/projects`, 303);

  // Deleting the cookie only clears this browser's copy. Bumping the user's
  // session_version is what kills the token itself, everywhere it exists.
  const token = (await cookies()).get(sessionCookieName)?.value;
  if (token) {
    const { env } = getCloudflareContext();
    const claim = await verifySession(token, env.SESSION_SECRET);
    if (claim) {
      await env.DB.prepare("UPDATE users SET session_version = session_version + 1 WHERE id = ?1")
        .bind(claim.uid)
        .run();
    }
  }

  res.cookies.delete(sessionCookieName);
  return res;
}
