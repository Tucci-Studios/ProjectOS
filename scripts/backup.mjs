#!/usr/bin/env node
/**
 * A backup you own.
 *
 * `wrangler d1 export` refuses to run on this database because FTS5 virtual
 * tables can't be exported, which means the built-in path gives us nothing and
 * the only copy is Cloudflare's 30-day time travel. That's not a backup, it's a
 * grace period on someone else's infrastructure.
 *
 * So this dumps every real table to JSON, page by page. The FTS tables are
 * skipped deliberately: they're derived from the content tables by triggers and
 * rebuild themselves, so copying them would be storing the same data twice in a
 * form that can't be restored anyway.
 *
 *   node scripts/backup.mjs            # remote (production)
 *   node scripts/backup.mjs --local
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const LOCAL = process.argv.includes("--local");
const DB = "project-os";
const PAGE = 2000;

/** Derived from content tables by triggers — rebuilt, never restored. */
const isDerived = (t) =>
  t === "_cf_KV" || /_(config|content|data|docsize|idx)$/.test(t) || /^(project|post)_search$/.test(t);

function sql(command) {
  const out = execFileSync(
    "npx",
    ["wrangler", "d1", "execute", DB, LOCAL ? "--local" : "--remote", "--json", "--command", command],
    { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 },
  );
  // Wrangler prints banners around the JSON; take the first array or object.
  const start = out.indexOf("[");
  return JSON.parse(out.slice(start))[0].results;
}

const tables = sql("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
  .map((r) => r.name)
  .filter((t) => !isDerived(t));

const stamp = new Date().toISOString().slice(0, 10);
const dir = `backups/${stamp}${LOCAL ? "-local" : ""}`;
mkdirSync(dir, { recursive: true });

let grand = 0;
const manifest = {};

for (const table of tables) {
  const rows = [];
  for (;;) {
    const page = sql(`SELECT * FROM ${table} LIMIT ${PAGE} OFFSET ${rows.length}`);
    rows.push(...page);
    if (page.length < PAGE) break;
  }
  writeFileSync(`${dir}/${table}.json`, JSON.stringify(rows));
  manifest[table] = rows.length;
  grand += rows.length;
  console.log(`${String(rows.length).padStart(7)}  ${table}`);
}

writeFileSync(
  `${dir}/manifest.json`,
  JSON.stringify({ takenAt: new Date().toISOString(), source: LOCAL ? "local" : "remote", tables: manifest, rows: grand }, null, 2),
);
console.log(`\n${grand.toLocaleString()} rows across ${tables.length} tables → ${dir}`);
