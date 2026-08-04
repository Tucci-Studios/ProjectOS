#!/usr/bin/env node
/**
 * Warm the fork cache, so trophies are there before anyone visits.
 *
 *   node scripts/sync-forks.mjs            # dry run — what it'd fetch
 *   node scripts/sync-forks.mjs --write
 *   node scripts/sync-forks.mjs --write --remote
 *
 * Syncing is otherwise lazy: a project's forks are only fetched the first time
 * someone opens its page. That leaves almost every project without a trophy
 * until it happens to get a visitor, which is a poor first impression.
 *
 * GitHub allows 60 requests an hour unauthenticated and 5,000 with a token, so
 * this stops when the budget runs out and says exactly where it got to rather
 * than hammering a closed door.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const WRITE = process.argv.includes("--write");
const REMOTE = process.argv.includes("--remote");
const LIMIT = Number(process.env.LIMIT ?? 0); // 0 = as many as the budget allows

const token =
  process.env.GITHUB_TOKEN ??
  (fs.existsSync(".dev.vars")
    ? fs.readFileSync(".dev.vars", "utf8").match(/^GITHUB_TOKEN=(.+)$/m)?.[1]?.trim()
    : undefined);

const HEADERS = {
  Accept: "application/vnd.github+json",
  "User-Agent": "project-os-sync",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

const d1 = (sql, json = true) => {
  const out = execFileSync(
    "npx",
    ["wrangler", "d1", "execute", "project-os", REMOTE ? "--remote" : "--local", "--json", "--command", sql],
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024 * 1024 },
  );
  return json ? JSON.parse(out)[0].results : null;
};

const esc = (v) => (v === null || v === undefined ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);

async function budget() {
  const res = await fetch("https://api.github.com/rate_limit", { headers: HEADERS });
  if (!res.ok) return { remaining: 0, resetMin: 60 };
  const j = await res.json();
  return {
    remaining: j.resources.core.remaining,
    resetMin: Math.max(0, Math.round((j.resources.core.reset - Date.now() / 1000) / 60)),
  };
}

const { remaining, resetMin } = await budget();
console.log(`GitHub budget: ${remaining} requests left${token ? " (token)" : " (no token — 60/hour)"}`);

// Oldest-synced first, so repeat runs keep the whole set fresh rather than
// re-fetching the same handful.
const pending = d1(`
  SELECT p.id, p.github_repo
  FROM projects p
  LEFT JOIN fork_sync fs ON fs.project_id = p.id
  WHERE p.status = 'live' AND p.github_forks > 0
  ORDER BY COALESCE(fs.synced_at, 0) ASC
  LIMIT ${LIMIT || Math.max(0, remaining - 2)}
`);

console.log(`${pending.length} project${pending.length === 1 ? "" : "s"} to sync.\n`);
if (!WRITE) {
  for (const p of pending.slice(0, 10)) console.log(`  ${p.github_repo}`);
  if (pending.length > 10) console.log(`  ...and ${pending.length - 10} more`);
  console.log("\nDry run. Add --write to fetch and store.");
  process.exit(0);
}

const now = Math.floor(Date.now() / 1000);
let done = 0;
let stoppedEarly = null;
const sql = [];

for (const p of pending) {
  const res = await fetch(`https://api.github.com/repos/${p.github_repo}/forks?sort=stargazers&per_page=50`, {
    headers: HEADERS,
  });
  if (res.status === 403 || res.status === 429) {
    stoppedEarly = `rate limited after ${done}`;
    break;
  }
  if (!res.ok) {
    console.log(`  skip ${p.github_repo} — HTTP ${res.status}`);
    continue;
  }
  const raw = await res.json();
  if (!Array.isArray(raw)) continue;

  sql.push(`DELETE FROM github_forks WHERE project_id = ${esc(p.id)};`);
  for (const f of raw) {
    sql.push(
      `INSERT OR REPLACE INTO github_forks (project_id, full_name, owner_login, stars, pushed_at)
       VALUES (${esc(p.id)}, ${esc(f.full_name)}, ${esc(f.owner.login)}, ${f.stargazers_count ?? 0},
         ${f.pushed_at ? Math.floor(new Date(f.pushed_at).getTime() / 1000) : "NULL"});`,
    );
  }
  // github_forks on the project row is GitHub's own total; the listing is capped.
  sql.push(
    `INSERT INTO fork_sync (project_id, total, synced_at)
     VALUES (${esc(p.id)}, (SELECT github_forks FROM projects WHERE id = ${esc(p.id)}), ${now})
     ON CONFLICT(project_id) DO UPDATE SET total = excluded.total, synced_at = ${now};`,
  );

  done++;
  if (done % 20 === 0) console.log(`  ${done}/${pending.length}...`);
  await new Promise((r) => setTimeout(r, 120));
}

if (sql.length) {
  fs.writeFileSync("/tmp/pos-forks.sql", sql.join("\n"));
  execFileSync(
    "npx",
    ["wrangler", "d1", "execute", "project-os", REMOTE ? "--remote" : "--local", "--file=/tmp/pos-forks.sql"],
    { stdio: ["ignore", "ignore", "inherit"] },
  );
}

console.log(`\nSynced ${done} project${done === 1 ? "" : "s"}.`);
if (stoppedEarly) {
  console.log(`Stopped early: ${stoppedEarly}. Budget resets in ~${resetMin} min.`);
  if (!token) console.log("Set GITHUB_TOKEN to raise the ceiling from 60/hour to 5,000.");
}
