#!/usr/bin/env node
/**
 * The audit bot.
 *
 * bughunt.mjs asks "does the page load?" This asks the harder question: is the
 * thing that loaded actually right? It crawls every route, then checks the site
 * against itself — links that go nowhere, pages nothing links to, features
 * reading from tables nothing writes, empty states shipped as finished screens,
 * accessibility basics, and anything slow enough to notice.
 *
 *   node scripts/audit.mjs
 */
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3000";

/**
 * Crawl as somebody.
 *
 * Signed out, half the site is a login wall — /me, /settings, /notifications
 * and every follow, save and comment control are simply absent, so a clean run
 * proved nothing about them. Same locally-minted session the smoke test uses.
 */
const vars = Object.fromEntries(
  fs.readFileSync(".dev.vars", "utf8").split("\n").filter(Boolean).map((l) => {
    const i = l.indexOf("=");
    return [l.slice(0, i), l.slice(i + 1)];
  }),
);
const b64 = (b) => b.toString("base64").replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
const payload = b64(Buffer.from(JSON.stringify({ uid: "gh_120062744", exp: Math.floor(Date.now() / 1000) + 3600 })));
const sig = b64(crypto.createHmac("sha256", vars.SESSION_SECRET).update(payload).digest());
const COOKIE = { Cookie: `pos_session=${payload}.${sig}` };
const d1 = (sql) =>
  JSON.parse(
    execFileSync("npx", ["wrangler", "d1", "execute", "project-os", "--local", "--json", "--command", sql], {
      encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024 * 1024,
    }),
  )[0].results;

const findings = [];
const empties = [];
const add = (level, area, what) => findings.push({ level, area, what });

// ── crawl ────────────────────────────────────────────────────────────────
const seen = new Map(); // path -> { status, ms, html }
const linkedFrom = new Map(); // path -> Set of pages linking to it
const queue = ["/"];
const seedPaths = ["/explore", "/updates", "/ideas", "/saves", "/lab", "/mod", "/wire", "/submit", "/settings", "/me", "/notifications", "/terms", "/search?q=agent"];
queue.push(...seedPaths);

const rows = d1("SELECT id FROM projects WHERE status='live' ORDER BY stars DESC LIMIT 12");
queue.push(...rows.map((r) => `/p/${r.id}`));

while (queue.length) {
  const path = queue.shift();
  if (seen.has(path) || !path.startsWith("/") || path.startsWith("//")) continue;

  const t0 = Date.now();
  let res, html = "";
  try {
    res = await fetch(BASE + path, { redirect: "manual", headers: COOKIE });
    if (res.status < 300 || res.status >= 400) html = await res.text();
  } catch (e) {
    add("bug", path, `request failed: ${e.message}`);
    seen.set(path, { status: 0, ms: 0, html: "" });
    continue;
  }
  const ms = Date.now() - t0;
  seen.set(path, { status: res.status, ms, html });

  if (res.status >= 400) {
    const from = [...(linkedFrom.get(path) ?? [])];
    add("bug", path, `HTTP ${res.status}${from.length ? ` — linked from ${from.slice(0, 3).join(", ")}` : ""}`);
    continue;
  }
  if (res.status >= 300) continue;
  if (ms > 1200) add("slow", path, `${ms}ms`);
  if (/Application error|Internal Server Error|__NEXT_ERROR/i.test(html))
    add("bug", path, "error boundary rendered");

  // follow internal links, one level past the seeds
  for (const m of html.matchAll(/href="(\/[^"#]*)"/g)) {
    const href = m[1].split("?")[0].replace(/\/$/, "") || "/";
    if (href.startsWith("/api/") || href.startsWith("/_next")) continue;
    if (!linkedFrom.has(href)) linkedFrom.set(href, new Set());
    linkedFrom.get(href).add(path);
    if (!seen.has(href) && seen.size < 160) queue.push(href);
  }
}

// ── orphan routes: a page you can only reach by typing the URL ────────────
const routes = execFileSync("find", ["src/app", "-name", "page.tsx"], { encoding: "utf8" })
  .trim().split("\n")
  .map((f) => f.replace(/^src\/app/, "").replace(/\/\([^)]+\)/g, "").replace(/\/page\.tsx$/, "") || "/")
  .filter((r) => !r.includes("["));
// Reachable, just not from server-rendered HTML: two live behind the avatar
// dropdown, one is a redirect kept for old links, one is the pre-launch page
// that is unlinked on purpose.
const REACHABLE = new Set(["/me", "/settings", "/popular", "/news", "/coming-soon"]);
for (const r of routes) {
  if (r === "/" || REACHABLE.has(r)) continue;
  if (!linkedFrom.has(r) || linkedFrom.get(r).size === 0) add("orphan", r, "no page links here");
}

// ── data the UI reads but nothing writes ─────────────────────────────────
const tables = d1("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '\\_%' ESCAPE '\\'").map((t) => t.name);
const src = execFileSync("grep", ["-rho", "-E", "(FROM|JOIN|INTO|UPDATE) [a-z_]+", "src", "scripts"], { encoding: "utf8" });
// A trigger both reads and writes — without this, every FTS index looks
// abandoned and project_tags looks dead when it's holding up publishing.
const triggerSrc = d1("SELECT COALESCE(GROUP_CONCAT(sql, ' '), '') AS s FROM sqlite_master WHERE type='trigger'")[0].s;
const schemaSrc = d1("SELECT COALESCE(GROUP_CONCAT(sql, ' '), '') AS s FROM sqlite_master WHERE type IN ('view','index','table')")[0].s;
const fts = new Set(
  d1("SELECT name FROM sqlite_master WHERE type='table' AND sql LIKE '%fts5%'").flatMap((r) => [
    r.name, `${r.name}_data`, `${r.name}_idx`, `${r.name}_content`, `${r.name}_docsize`, `${r.name}_config`,
  ]),
);
for (const t of tables) {
  if (["d1_migrations", "sqlite_sequence"].includes(t) || fts.has(t)) continue;
  // Known-empty and deliberately so. project_tags is read by the search-index
  // triggers on every project write, so it has to exist — dropping it once
  // broke publishing outright — but nothing fills it, because GitHub topics
  // were looked at in the lab and cut. Empty forever, on purpose.
  if (t === "project_tags") continue;
  const n = d1(`SELECT COUNT(*) AS n FROM ${t}`)[0].n;
  const reads = new RegExp(`(FROM|JOIN) ${t}\\b`).test(src + triggerSrc);
  const writes = new RegExp(`(INTO|UPDATE) ${t}\\b`).test(src + triggerSrc);
  if (reads && !writes) add("hollow", t, `read by the UI, never written (${n} rows)`);
  // "dead" is a suggestion to delete something, so it has to be right. Check
  // views and indexes as well as triggers before saying nothing needs it.
  else if (!reads && !writes && !schemaSrc.includes(t))
    add("dead", t, `nothing references this table (${n} rows)`);
  else if (reads && n === 0) empties.push(t);
}

// ── data integrity ───────────────────────────────────────────────────────
const checks = [
  ["projects with no owner", "SELECT COUNT(*) AS n FROM projects p LEFT JOIN users u ON u.id=p.owner_id WHERE u.id IS NULL"],
  ["live projects with no description", "SELECT COUNT(*) AS n FROM projects WHERE status='live' AND (description IS NULL OR description='')"],
  ["live projects with no category", "SELECT COUNT(*) AS n FROM projects WHERE status='live' AND (category IS NULL OR category='')"],
  ["projects pointing at a missing parent", "SELECT COUNT(*) AS n FROM projects p WHERE p.parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM projects x WHERE x.id=p.parent_id)"],
  ["duplicate github repos", "SELECT COUNT(*) AS n FROM (SELECT github_repo FROM projects WHERE github_repo IS NOT NULL GROUP BY lower(github_repo) HAVING COUNT(*)>1)"],
];
for (const [label, sql] of checks) {
  const n = d1(sql)[0].n;
  if (n > 0) add("data", label, `${n} row${n === 1 ? "" : "s"}`);
}

// ── category coverage: an empty section is a dead end ────────────────────
for (const c of d1("SELECT category, COUNT(*) AS n FROM projects WHERE status='live' GROUP BY category")) {
  if (c.n < 5) add("thin", `/explore?in=${c.category}`, `only ${c.n} project${c.n === 1 ? "" : "s"}`);
}
const known = new Set(d1("SELECT DISTINCT category AS c FROM projects WHERE status='live'").map((r) => r.c));
const declared = [...execFileSync("grep", ["-o", '-E', 'slug: "[a-z-]+"', "src/lib/categories.ts"], { encoding: "utf8" })
  .matchAll(/slug: "([a-z-]+)"/g)].map((m) => m[1]);
for (const c of declared) if (!known.has(c)) add("thin", `/explore?in=${c}`, "zero projects — section is empty");

// ── accessibility + polish, on the pages we actually fetched ─────────────
for (const [path, { html, status }] of seen) {
  if (status !== 200 || /\.(ico|png|svg|txt|xml)$/.test(path)) continue;
  const imgs = [...html.matchAll(/<img\b[^>]*>/g)];
  const noAlt = imgs.filter((m) => !/\balt=/.test(m[0])).length;
  if (noAlt) add("a11y", path, `${noAlt} image${noAlt === 1 ? "" : "s"} with no alt text`);
  const bare = [...html.matchAll(/<button\b([^>]*)>([\s\S]{0,600}?)<\/button>/g)].filter(
    ([, attrs, inner]) =>
      !/aria-label=|aria-labelledby=/.test(attrs) &&
      /<svg/.test(inner) &&
      !inner.replace(/<svg[\s\S]*?<\/svg>/g, "").replace(/<[^>]+>/g, "").trim(),
  ).length;
  if (bare) add("a11y", path, `${bare} icon-only button(s) with no accessible name`);
  if (!/<h1\b/.test(html)) add("a11y", path, "no h1 on the page");
  for (const word of ["TODO", "FIXME", "Lorem ipsum", "coming soon", "placeholder"])
    if (new RegExp(`>${word}`, "i").test(html)) add("polish", path, `visible "${word}"`);
}

// ── report ───────────────────────────────────────────────────────────────
const ok = [...seen.values()].filter((v) => v.status >= 200 && v.status < 400).length;
const slowest = [...seen.entries()].filter(([, v]) => v.status === 200).sort((a, b) => b[1].ms - a[1].ms)[0];
console.log(`\nCrawled ${seen.size} pages — ${ok} fine. Slowest: ${slowest?.[0]} at ${slowest?.[1].ms}ms.\n`);

if (empties.length)
  console.log(
    `${empties.length} table${empties.length === 1 ? "" : "s"} queried but empty — expected until people arrive: ${empties.join(", ")}\n`,
  );

const ORDER = ["bug", "data", "hollow", "dead", "empty", "orphan", "a11y", "polish", "slow", "thin"];
for (const level of ORDER) {
  const group = findings.filter((f) => f.level === level);
  if (!group.length) continue;
  console.log(`${level.toUpperCase()} (${group.length})`);
  const shown = group.slice(0, 12);
  for (const f of shown) console.log(`  ${f.area} — ${f.what}`);
  if (group.length > shown.length) console.log(`  ...and ${group.length - shown.length} more`);
  console.log("");
}
if (!findings.length) console.log("Nothing found.");
