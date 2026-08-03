#!/usr/bin/env node
/**
 * Fill Project OS with real projects from GitHub.
 *
 *   node scripts/import-github.mjs            # dry run, prints what it'd add
 *   node scripts/import-github.mjs --write    # actually writes to the local D1
 *   node scripts/import-github.mjs --write --remote
 *
 * These land as `indexed`, not `claimed`: we found them, the author has never
 * heard of Project OS and agreed to nothing. Each gets a shadow user row keyed
 * gh_<github id> — the same key OAuth uses — so when the real author signs in,
 * their projects claim themselves.
 *
 * Set GITHUB_TOKEN to lift the rate limit from 60 requests/hour to 5,000.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const WRITE = process.argv.includes("--write");
const REMOTE = process.argv.includes("--remote");
const PER_QUERY = Number(process.env.PER_QUERY ?? 25);

// Read a token from the environment or .dev.vars, if there is one.
const token =
  process.env.GITHUB_TOKEN ??
  (fs.existsSync(".dev.vars")
    ? fs.readFileSync(".dev.vars", "utf8").match(/^GITHUB_TOKEN=(.+)$/m)?.[1]?.trim()
    : undefined);

const HEADERS = {
  Accept: "application/vnd.github+json",
  "User-Agent": "project-os-import",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

/**
 * Which searches feed which section. Keep these narrow: a vague query drags in
 * every repo that merely mentions the words, and the site is only worth reading
 * if what's in a section actually belongs there.
 */
const SOURCES = [
  { category: "claude-skills", q: "topic:claude-skills", min: 3 },
  { category: "claude-skills", q: "topic:claude-skill", min: 3 },
  { category: "claude-md", q: "topic:claude-md", min: 2 },
  { category: "claude-md", q: '"CLAUDE.md" in:name,description', min: 5 },
  { category: "mcp-servers", q: "topic:mcp-server", min: 8 },
  { category: "mcp-servers", q: "topic:model-context-protocol", min: 8 },
  { category: "claude-code", q: "topic:claude-code", min: 8 },
  { category: "codex", q: "topic:openai-codex", min: 3 },
  { category: "grok", q: "topic:grok", min: 3 },
  { category: "local-llms", q: "topic:local-llm", min: 5 },
  { category: "local-llms", q: "topic:ollama", min: 20 },
  { category: "scripts-tools", q: "topic:developer-tools topic:cli", min: 30 },
  { category: "apps", q: "topic:ai-app", min: 10 },
  { category: "games", q: "topic:ai-game", min: 3 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function search(q, minStars) {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(
    `${q} stars:>=${minStars} is:public archived:false`,
  )}&sort=stars&order=desc&per_page=${PER_QUERY}`;
  const res = await fetch(url, { headers: HEADERS });
  if (res.status === 403 || res.status === 429) {
    console.error(`  rate limited — ${token ? "even with a token" : "set GITHUB_TOKEN to get 5,000/hour"}`);
    return [];
  }
  if (!res.ok) {
    console.error(`  HTTP ${res.status} for "${q}"`);
    return [];
  }
  const body = await res.json();
  return Array.isArray(body.items) ? body.items : [];
}

const esc = (v) => (v === null || v === undefined ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);
const ts = (s) => (s ? Math.floor(new Date(s).getTime() / 1000) : "NULL");

/** Repos with no description tell a reader nothing, so they don't earn a card. */
function usable(r) {
  return (
    r.description &&
    r.description.trim().length >= 20 &&
    !r.private &&
    !r.archived &&
    r.owner?.type !== undefined
  );
}

const seen = new Set();
const rows = [];

for (const { category, q, min } of SOURCES) {
  process.stdout.write(`${category.padEnd(15)} ${q}\n`);
  const items = await search(q, min);
  let kept = 0;

  for (const r of items) {
    if (seen.has(r.full_name.toLowerCase())) continue;
    if (!usable(r)) continue;
    seen.add(r.full_name.toLowerCase());
    rows.push({
      id: `gh_${r.id}`,
      category,
      repo: r.full_name,
      name: r.name,
      description: r.description.trim().slice(0, 500),
      license: r.license?.spdx_id ?? "NOASSERTION",
      stars: r.stargazers_count ?? 0,
      language: r.language ?? null,
      homepage: r.homepage && /^https?:\/\//.test(r.homepage) ? r.homepage : null,
      pushed_at: r.pushed_at,
      created_at: r.created_at,
      owner_id: `gh_${r.owner.id}`,
      owner_login: r.owner.login,
      owner_avatar: r.owner.avatar_url ?? null,
    });
    kept++;
  }
  console.log(`  ${items.length} found, ${kept} kept`);
  await sleep(1200); // GitHub's search endpoint is stricter than the rest
}

console.log(`\n${rows.length} projects across ${new Set(rows.map((r) => r.category)).size} sections.`);

if (!WRITE) {
  console.log("\nDry run. Add --write to insert. Sample:");
  for (const r of rows.slice(0, 8)) console.log(`  [${r.category}] ${r.repo} — ${r.stars}★ — ${r.description.slice(0, 60)}`);
  process.exit(0);
}

// Shadow users first, then projects. Both are idempotent: re-running refreshes
// stars and descriptions without disturbing anything a real person has claimed.
const sql = [];
const owners = new Map(rows.map((r) => [r.owner_id, r]));
for (const o of owners.values()) {
  sql.push(
    `INSERT INTO users (id, github_login, display_name, avatar_url, github_created_at, created_at, is_shadow)
     VALUES (${esc(o.owner_id)}, ${esc(o.owner_login)}, ${esc(o.owner_login)}, ${esc(o.owner_avatar)}, 0, strftime('%s','now'), 1)
     ON CONFLICT(id) DO UPDATE SET github_login = excluded.github_login, avatar_url = excluded.avatar_url;`,
  );
}
for (const r of rows) {
  sql.push(
    `INSERT INTO projects (id, owner_id, base_name, variant_name, category, description, license, github_repo,
       manifest_json, parent_id, root_id, status, created_at, updated_at, source, stars, language, pushed_at, homepage)
     VALUES (${esc(r.id)}, ${esc(r.owner_id)}, ${esc(r.name)}, NULL, ${esc(r.category)}, ${esc(r.description)},
       ${esc(r.license)}, ${esc(r.repo)}, '{}', NULL, ${esc(r.id)}, 'live', ${ts(r.created_at)}, ${ts(r.pushed_at)},
       'indexed', ${r.stars}, ${esc(r.language)}, ${ts(r.pushed_at)}, ${esc(r.homepage)})
     ON CONFLICT(id) DO UPDATE SET
       description = excluded.description, stars = excluded.stars, language = excluded.language,
       pushed_at = excluded.pushed_at, updated_at = excluded.updated_at
     WHERE projects.source = 'indexed';`,
  );
}

fs.writeFileSync("/tmp/pos-import.sql", sql.join("\n"));
console.log(`\nWriting ${rows.length} projects + ${owners.size} authors to ${REMOTE ? "REMOTE" : "local"} D1...`);
execFileSync(
  "npx",
  ["wrangler", "d1", "execute", "project-os", REMOTE ? "--remote" : "--local", "--file=/tmp/pos-import.sql"],
  { stdio: "inherit" },
);
console.log("Done.");
