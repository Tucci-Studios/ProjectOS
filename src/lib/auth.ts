import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";

const SESSION_COOKIE = "pos_session";
const SESSION_TTL_S = 60 * 60 * 24 * 30; // 30 days

function b64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return b64url(new Uint8Array(sig));
}

export async function signSession(userId: string, secret: string): Promise<string> {
  const payload = b64url(
    new TextEncoder().encode(JSON.stringify({ uid: userId, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_S })),
  );
  return `${payload}.${await hmac(secret, payload)}`;
}

export async function verifySession(token: string, secret: string): Promise<string | null> {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  if ((await hmac(secret, payload)) !== sig) return null;
  try {
    const data = JSON.parse(atob(payload.replaceAll("-", "+").replaceAll("_", "/"))) as {
      uid: string;
      exp: number;
    };
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return data.uid;
  } catch {
    return null;
  }
}

export type SessionUser = {
  id: string;
  github_login: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
  tos_accepted_at: number | null;
};

/** Current signed-in user, or null. Call from server components / route handlers. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const { env } = getCloudflareContext();
  const uid = await verifySession(token, env.SESSION_SECRET);
  if (!uid) return null;
  return await env.DB.prepare(
    "SELECT id, github_login, display_name, avatar_url, role, tos_accepted_at FROM users WHERE id = ?1 AND banned_at IS NULL",
  )
    .bind(uid)
    .first<SessionUser>();
}

export const sessionCookieName = SESSION_COOKIE;
export const sessionTtlSeconds = SESSION_TTL_S;
