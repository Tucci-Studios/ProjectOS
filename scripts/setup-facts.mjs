#!/usr/bin/env node
/**
 * Backfill "can I run this?" facts for every indexed project.
 *
 * One GitHub call per repo — the root contents listing — which is enough to see
 * whether there's a Dockerfile, a lockfile, a dependency manifest and an
 * example config. We deliberately don't clone or read file contents: the file
 * names alone answer the question, and anything more would be slow and nosy.
 *
 *   node scripts/setup-facts.mjs [--limit N] [--local]
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const LOCAL = process.argv.includes("--local");
const LIMIT = Number(process.argv[process.argv.indexOf("--limit") + 1]) || 0;

const token =
  process.env.GITHUB_TOKEN ??
  readFileSync(".dev.vars", "utf8").match(/^GITHUB_TOKEN=(.+)$/m)?.[1]?.trim();
if (!token) {
  console.error("No GITHUB_TOKEN — 60 requests/hour won't get through 766 repos.");
  process.exit(1);
}
const headers = { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "User-Agent": "project-os" };

function sql(command) {
  const out = execFileSync(
    "npx",
    ["wrangler", "d1", "execute", "project-os", LOCAL ? "--local" : "--remote", "--json", "--command", command],
    { encoding: "utf8", maxBuffer: 128 * 1024 * 1024 },
  );
  return JSON.parse(out.slice(out.indexOf("[")))[0].results;
}

const esc = (s) => String(s).replace(/'/g, "''");

// Inlined from src/lib/setup.ts — this script runs in plain node, no bundler.
const LOCKFILES = ["package-lock.json","yarn.lock","pnpm-lock.yaml","bun.lockb","poetry.lock","pdm.lock","uv.lock","cargo.lock","go.sum","gemfile.lock","composer.lock","requirements.txt"];
const MANIFESTS = [["package.json","Node"],["pyproject.toml","Python"],["requirements.txt","Python"],["setup.py","Python"],["cargo.toml","Rust"],["go.mod","Go"],["gemfile","Ruby"],["composer.json","PHP"],["pom.xml","Java"],["build.gradle","Java"],["pubspec.yaml","Dart"]];
const CONFIG_HINTS = [".env.example",".env.sample",".env.template","config.example.yml","config.example.yaml","config.example.json",".env.local.example"];

function facts(names, readmeBytes) {
  const has = (n) => names.includes(n);
  return {
    containerized: has("dockerfile") || names.some((n) => n.startsWith("docker-compose") || n === "compose.yml" || n === "compose.yaml"),
    pinnedDeps: LOCKFILES.some(has),
    installs: MANIFESTS.some(([f]) => has(f)),
    needsConfig: CONFIG_HINTS.some(has),
    hasCommands: has("makefile") || has("justfile") || has("taskfile.yml") || has("package.json"),
    documented: readmeBytes > 800,
    stack: MANIFESTS.find(([f]) => has(f))?.[1] ?? null,
  };
}
function tier(f) {
  if (!f.installs && !f.containerized) return "unknown";
  if (f.containerized && f.documented) return "easy";
  if (f.installs && f.pinnedDeps && f.documented) return "easy";
  if (f.installs && (f.pinnedDeps || f.containerized)) return "some";
  return "rough";
}

const rows = sql(
  `SELECT id, github_repo FROM projects WHERE status='live' AND github_repo IS NOT NULL AND setup_at IS NULL${LIMIT ? ` LIMIT ${LIMIT}` : ""}`,
);
console.log(`${rows.length} to look at\n`);

let done = 0, failed = 0;
const counts = {};
const pending = [];

for (const r of rows) {
  try {
    const res = await fetch(`https://api.github.com/repos/${r.github_repo}/contents/`, { headers });
    if (res.status === 403 || res.status === 429) {
      const reset = Number(res.headers.get("x-ratelimit-reset")) * 1000;
      const waitMs = Math.max(5000, reset - Date.now() + 2000);
      console.log(`rate limited — waiting ${Math.round(waitMs / 1000)}s`);
      await new Promise((s) => setTimeout(s, waitMs));
      continue;
    }
    if (!res.ok) { failed++; continue; }

    const entries = await res.json();
    if (!Array.isArray(entries)) { failed++; continue; }

    const names = entries.filter((e) => e.type === "file").map((e) => e.name.toLowerCase());
    const readme = entries.find((e) => e.name.toLowerCase().startsWith("readme"));
    const f = facts(names, readme?.size ?? 0);
    const t = tier(f);
    counts[t] = (counts[t] ?? 0) + 1;

    pending.push(
      `UPDATE projects SET setup_json='${esc(JSON.stringify(f))}', setup_tier='${t}', setup_at=strftime('%s','now') WHERE id='${esc(r.id)}';`,
    );
    done++;
  } catch {
    failed++;
  }

  // Batch the writes — one wrangler call per repo would take longer than the
  // GitHub requests do.
  if (pending.length >= 40) {
    sql(pending.join(" "));
    pending.length = 0;
    process.stdout.write(`\r${done}/${rows.length}`);
  }
}
if (pending.length) sql(pending.join(" "));

console.log(`\n\ndone: ${done}  failed: ${failed}`);
console.log(counts);
