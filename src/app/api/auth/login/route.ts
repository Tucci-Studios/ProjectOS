import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { env } = getCloudflareContext();
  const origin = new URL(request.url).origin;

  // Where to land afterwards. Only same-site paths, or this becomes an open
  // redirect: ?next=https://evil.example would send people off the site
  // wearing a fresh session.
  const requested = new URL(request.url).searchParams.get("next") ?? "";
  const next = requested.startsWith("/") && !requested.startsWith("//") ? requested : "";

  const state = crypto.randomUUID();
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  authorize.searchParams.set("redirect_uri", `${origin}/api/auth/callback`);
  authorize.searchParams.set("scope", "read:user"); // read-only; no write scopes until MCP phase
  authorize.searchParams.set("state", state);

  const res = NextResponse.redirect(authorize.toString());
  if (next)
    res.cookies.set("pos_oauth_next", next, {
      httpOnly: true,
      sameSite: "lax",
      secure: origin.startsWith("https"),
      maxAge: 600,
      path: "/api/auth",
    });
  res.cookies.set("pos_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: origin.startsWith("https"),
    maxAge: 600,
    path: "/api/auth",
  });
  return res;
}
