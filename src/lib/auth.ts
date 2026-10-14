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

/**
 * Compare two strings without leaking where they differ.
 *
 * `!==` returns as soon as it hits a mismatched byte, so how long it takes is a
 * function of how much of the signature the caller got right. Over the open
 * internet that signal is buried in jitter, but it costs nothing to not emit it.
 */
function sameSignature(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function signSession(userId: string, secret: string, version = 0): Promise<string> {
  const payload = b64url(
    new TextEncoder().encode(
      JSON.stringify({ uid: userId, sv: version, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_S }),
    ),
  );
  return `${payload}.${await hmac(secret, payload)}`;
}

/** The user id and the session generation the token claims, or null. */
export async function verifySession(
  token: string,
  secret: string,
): Promise<{ uid: string; sv: number } | null> {
  const parts = token.split(".");
  // Exactly two. Accepting `payload.sig.anything` isn't forgeable, but a token
  // with more than one valid spelling is a trap for anything that ever keys
  // off the string itself.
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  if (!payload || !sig) return null;
  // Verified before the payload is parsed — nothing inside an unsigned token
  // is allowed to influence anything, including the JSON parser.
  if (!sameSignature(await hmac(secret, payload), sig)) return null;
  try {
    const data = JSON.parse(atob(payload.replaceAll("-", "+").replaceAll("_", "/"))) as {
      uid: string;
      sv?: number;
      exp: number;
    };
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return { uid: data.uid, sv: data.sv ?? 0 };
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
  github_created_at: number;
  last_seen_update: string | null;
};

/** Current signed-in user, or null. Call from server components / route handlers. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const { env } = getCloudflareContext();
  const claim = await verifySession(token, env.SESSION_SECRET);
  if (!claim) return null;
  // session_version is the revocation check: signing out increments it, so a
  // token copied off the machine beforehand stops working immediately instead
  // of lasting the full 30 days.
  return await env.DB.prepare(
    "SELECT id, github_login, display_name, avatar_url, role, tos_accepted_at, github_created_at, last_seen_update FROM users WHERE id = ?1 AND banned_at IS NULL AND session_version = ?2",
  )
    .bind(claim.uid, claim.sv)
    .first<SessionUser>();
}

export const sessionCookieName = SESSION_COOKIE;
export const sessionTtlSeconds = SESSION_TTL_S;
