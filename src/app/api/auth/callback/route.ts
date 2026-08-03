import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { signSession, sessionCookieName, sessionTtlSeconds } from "@/lib/auth";

type GitHubUser = {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export async function GET(request: Request) {
  const { env } = getCloudflareContext();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = request.headers
    .get("cookie")
    ?.match(/pos_oauth_state=([^;]+)/)?.[1];

  if (!code || !state || state !== cookieState) {
    return NextResponse.redirect(`${url.origin}/?auth_error=state`);
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${url.origin}/api/auth/callback`,
    }),
  });
  const { access_token } = (await tokenRes.json()) as { access_token?: string };
  if (!access_token) {
    return NextResponse.redirect(`${url.origin}/?auth_error=token`);
  }

  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${access_token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "project-os",
    },
  });
  if (!userRes.ok) {
    return NextResponse.redirect(`${url.origin}/?auth_error=user`);
  }
  const gh = (await userRes.json()) as GitHubUser;

  const now = Math.floor(Date.now() / 1000);
  const userId = `gh_${gh.id}`;
  // Was this person already real before now? Anyone who wasn't gets the mark
  // granted to them on arrival, whether or not we'd indexed their work.
  const before = await env.DB.prepare("SELECT is_shadow FROM users WHERE id = ?1")
    .bind(userId)
    .first<{ is_shadow: number }>();
  const firstTime = !before || before.is_shadow === 1;

  // Indexing creates a shadow user under this exact id, so the row may already
  // exist before its owner has ever heard of Project OS. Signing in turns that
  // shadow into a real account rather than making a second one.
  await env.DB.prepare(
    `INSERT INTO users (id, github_login, display_name, avatar_url, github_created_at, created_at, is_shadow)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, 0)
     ON CONFLICT(id) DO UPDATE SET github_login = ?2, display_name = ?3, avatar_url = ?4,
       github_created_at = ?5, is_shadow = 0`,
  )
    .bind(
      userId,
      gh.login,
      gh.name,
      gh.avatar_url,
      Math.floor(new Date(gh.created_at).getTime() / 1000),
      now,
    )
    .run();

  // ...and anything of theirs we indexed is genuinely theirs now. They arrive to
  // find their own work already here, with nothing to fill in.
  const claimed = await env.DB.prepare(
    "UPDATE projects SET source = 'claimed', claimed_at = ?1 WHERE owner_id = ?2 AND source = 'indexed'",
  )
    .bind(now, userId)
    .run();
  const claimedCount = claimed.meta?.changes ?? 0;

  const res = NextResponse.redirect(
    firstTime
      ? `${url.origin}/me?verified=1${claimedCount > 0 ? `&claimed=${claimedCount}` : ""}`
      : `${url.origin}/projects`,
  );
  res.cookies.set(sessionCookieName, await signSession(userId, env.SESSION_SECRET), {
    httpOnly: true,
    sameSite: "lax",
    secure: url.origin.startsWith("https"),
    maxAge: sessionTtlSeconds,
    path: "/",
  });
  res.cookies.delete("pos_oauth_state");
  return res;
}
