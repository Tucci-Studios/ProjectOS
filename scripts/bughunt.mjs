#!/usr/bin/env node
/**
 * Bug hunter — a plain crawler, no AI, no tokens.
 *
 * Walks every internal link from a set of seeds, records HTTP failures, missing
 * pages, broken images, and dead links, then prints a report.
 *
 *   node scripts/bughunt.mjs [baseUrl]
 */
const BASE = process.argv[2] ?? "http://localhost:3000";
const SEEDS = ["/", "/popular", "/explore", "/news", "/ideas", "/ideas/build", "/ideas/new", "/submit", "/submit/wizard", "/me", "/settings", "/notifications", "/terms", "/search?q=fridge", "/mod"];

const seen = new Set();
const queue = [...SEEDS];
const issues = [];
const checkedAssets = new Set();

const isInternal = (href) => href && !href.startsWith("http") && !href.startsWith("mailto:") && !href.startsWith("#");

function note(kind, page, detail) {
  issues.push({ kind, page, detail });
}

async function head(url) {
  try {
    const res = await fetch(url, { method: "GET", redirect: "manual" });
    return res.status;
  } catch (e) {
    return `fetch failed: ${e.message}`;
  }
}

async function visit(path) {
  if (seen.has(path) || seen.size > 120) return;
  seen.add(path);

  let res, html;
  try {
    res = await fetch(BASE + path, { redirect: "manual" });
    html = await res.text();
  } catch (e) {
    note("unreachable", path, e.message);
    return;
  }

  if (res.status >= 500) note("server-error", path, `HTTP ${res.status}`);
  else if (res.status === 404) note("not-found", path, "HTTP 404");

  // Next.js renders its error overlay markup on runtime errors
  if (/__next_error__|Runtime Error|Application error: a server-side exception/i.test(html))
    note("runtime-error", path, "error boundary rendered");

  // Only look at what a person actually sees — strip scripts and the RSC payload.
  const visible = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");

  if (/PLACEHOLDER_RUN_wrangler/.test(visible)) note("config", path, "placeholder config leaked into page");
  for (const bad of ["undefined", "NaN", "[object Object]", "null null"]) {
    if (visible.includes(bad)) {
      const i = visible.indexOf(bad);
      note("bad-text", path, visible.slice(Math.max(0, i - 40), i + 40).trim());
    }
  }
  // Placeholder/empty rendering that suggests missing data
  if (/\bInvalid Date\b/.test(visible)) note("bad-date", path, "Invalid Date rendered");

  // Follow internal links
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const href = m[1];
    if (!isInternal(href)) continue;
    const clean = href.split("#")[0];
    if (!clean || clean.startsWith("/api/") || clean.startsWith("/_next/")) continue;
    if (!seen.has(clean)) queue.push(clean);
  }

  // Check images resolve
  for (const m of html.matchAll(/<img[^>]+src="([^"]+)"/g)) {
    const src = m[1];
    if (checkedAssets.has(src) || checkedAssets.size > 40) continue;
    checkedAssets.add(src);
    const url = src.startsWith("http") ? src : BASE + src;
    const status = await head(url);
    if (typeof status !== "number" || status >= 400) note("broken-image", path, `${status} ${src.slice(0, 70)}`);
  }
}

console.log(`Crawling ${BASE} ...`);
while (queue.length) await visit(queue.shift());

console.log(`\nVisited ${seen.size} pages, checked ${checkedAssets.size} images.\n`);
if (issues.length === 0) {
  console.log("No issues found.");
} else {
  const byKind = {};
  for (const i of issues) (byKind[i.kind] ??= []).push(i);
  for (const [kind, list] of Object.entries(byKind)) {
    console.log(`## ${kind} (${list.length})`);
    for (const i of list.slice(0, 12)) console.log(`  ${i.page}  —  ${i.detail}`);
    if (list.length > 12) console.log(`  ...and ${list.length - 12} more`);
    console.log();
  }
}
