#!/usr/bin/env node
/**
 * Signed-in smoke test — exercises the write paths a real person uses.
 * Mints a session cookie locally from SESSION_SECRET; no AI, no tokens.
 *
 *   node scripts/smoketest.mjs
 */
import crypto from "node:crypto";
import fs from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3000";
const vars = Object.fromEntries(
  fs.readFileSync(".dev.vars", "utf8").split("\n").filter(Boolean).map((l) => {
    const i = l.indexOf("=");
    return [l.slice(0, i), l.slice(i + 1)];
  }),
);
const UID = process.env.UID_OVERRIDE ?? "gh_120062744";

const b64 = (b) => b.toString("base64").replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
const payload = b64(Buffer.from(JSON.stringify({ uid: UID, exp: Math.floor(Date.now() / 1000) + 3600 })));
const sig = b64(crypto.createHmac("sha256", vars.SESSION_SECRET).update(payload).digest());
const cookie = `pos_session=${payload}.${sig}`;

// The database holds real, re-importable data, so nothing may be assumed about
// which ids exist. Find something live to poke at, and skip cleanly if the
// table is empty rather than reporting a failure the app isn't responsible for.
const pick = async (path, key) => {
  const res = await fetch(`${BASE}${path}`, { headers: { Cookie: cookie } });
  if (!res.ok) return null;
  const body = await res.json();
  return body?.[key] ?? null;
};

const fails = [];
const ok = [];
const skipped = [];

async function api(path, body, { expect = 200, label } = {}) {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify(body),
    redirect: "manual",
  });
  let data = null;
  try {
    data = await res.json();
  } catch {}
  const name = label ?? path;
  const expected = Array.isArray(expect) ? expect : [expect];
  if (!expected.includes(res.status)) {
    fails.push(`${name} → HTTP ${res.status} ${JSON.stringify(data)?.slice(0, 120)}`);
  } else {
    ok.push(`${name} → ${res.status}`);
  }
  return data;
}

async function page(path, { expect = 200 } = {}) {
  const res = await fetch(BASE + path, { headers: { Cookie: cookie } });
  if (res.status !== expect) fails.push(`GET ${path} → HTTP ${res.status}`);
  else ok.push(`GET ${path} → ${res.status}`);
  return res.text();
}

console.log("Signed-in smoke test...\n");

// Read paths that only exist for a signed-in user
await page("/me");
await page("/settings");
await page("/notifications");
await page("/submit");
await page("/mod");

// Voting
const PROJECT = await pick("/api/smoke-target", "projectId");
const IDEA = await pick("/api/smoke-target", "ideaId");

if (!PROJECT) {
  skipped.push("project write paths — no live projects in the database");
} else {
await api("/api/likes", { projectId: PROJECT, direction: "up" }, { label: "vote up" });
await api("/api/likes", { projectId: PROJECT, direction: "down" }, { label: "switch to down" });
await api("/api/likes", { projectId: PROJECT, direction: "down" }, { label: "clear vote" });
await api("/api/likes", { projectId: "does-not-exist", direction: "up" }, { expect: 404, label: "vote on missing project" });

// Follow
await api("/api/follows", { projectId: PROJECT }, { label: "follow" });
await api("/api/follows", { projectId: PROJECT }, { label: "unfollow" });

// Comments — cleaned up at the end so the site isn't littered with test data.
const c = await api("/api/project-comments", { projectId: PROJECT, body: "smoke test comment" }, { label: "comment" });
await api("/api/project-comments", { projectId: PROJECT, body: "" }, { expect: 400, label: "empty comment rejected" });
}

// Ideas
if (!IDEA) {
  skipped.push("idea voting — no ideas in the database");
} else {
  await api("/api/ideas/vote", { ideaId: IDEA, direction: "up" }, { label: "idea upvote" });
  await api("/api/ideas/vote", { ideaId: IDEA, direction: "down" }, { label: "idea downvote" });
}

// Reports
await api("/api/reports", { targetType: "project", targetId: PROJECT, reason: "smoke test report" }, { label: "report" });

// Validation guards
await api("/api/projects", { repo: "not a repo" }, { expect: 400, label: "bad repo rejected" });
// Editing someone else's project must be refused for non-admins; admins are
// allowed, so only assert the guard when this account isn't one.
const meRes = await fetch(BASE + "/api/whoami", { headers: { Cookie: cookie } });
const me = meRes.ok ? await meRes.json() : { role: "user" };
if (me.role !== "admin") {
  await api("/api/projects/manage", { projectId: PROJECT, description: "x".repeat(30) }, { expect: 403, label: "cannot edit someone else's project" });
} else {
  ok.push("skipped owner-guard check (this account is an admin)");
}
await api("/api/mod", { reportId: "nope", action: "dismiss" }, { expect: [403, 404], label: "mod guard" });

// Undo anything this run created.
await fetch(BASE + "/api/smoke-cleanup", { method: "POST", headers: { Cookie: cookie } }).catch(() => {});

console.log(`${ok.length} passed`);
for (const sk of skipped) console.log(`  skipped: ${sk}`);
if (fails.length) {
  console.log(`\n${fails.length} FAILED:`);
  for (const f of fails) console.log("  ✗ " + f);
  process.exitCode = 1;
} else {
  console.log("Nothing failed.");
}
