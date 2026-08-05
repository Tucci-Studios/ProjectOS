import { getCloudflareContext } from "@opennextjs/cloudflare";
import { syncForks } from "./forks";
import { getReadme } from "./github";
import { snapshotStars } from "./ranking";

/**
 * The work that keeps the catalogue current without anybody pressing anything.
 *
 * Three jobs, each safe to run again at any time:
 *   discover — find projects that appeared on GitHub since last time
 *   refresh  — update stars, forks and descriptions, and record today's reading
 *   forks    — re-read fork lists, oldest first, so nothing goes stale forever
 *
 * They never touch a claimed project's own words. Someone who signed in and
 * took ownership has final say over their description; we only ever refresh
 * numbers underneath them.
 */

export type JobResult = { job: string; ok: boolean; detail: string };

const GH = "https://api.github.com";

function headers() {
  const h: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "project-os" };
  const token = (getCloudflareContext().env as { GITHUB_TOKEN?: string }).GITHUB_TOKEN;
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

/** Which searches feed which section. Mirrors scripts/import-github.mjs. */
const SOURCES: { category: string; q: string; min: number }[] = [
  { category: "claude-skills", q: "topic:claude-skills", min: 5 },
  { category: "claude-md", q: "topic:claude-md", min: 5 },
  { category: "mcp-servers", q: "topic:mcp-server", min: 20 },
  { category: "claude-code", q: "topic:claude-code", min: 20 },
  { category: "codex", q: "topic:openai-codex", min: 5 },
  { category: "grok", q: "topic:grok", min: 5 },
  { category: "local-llms", q: "topic:ollama", min: 30 },
  { category: "scripts-tools", q: "topic:developer-tools topic:cli", min: 50 },
  { category: "apps", q: "topic:ai-app", min: 15 },
  { category: "games", q: "topic:ai-game", min: 5 },
];

type Repo = {
  id: number;
  full_name: string;
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  homepage: string | null;
  pushed_at: string | null;
  created_at: string;
  archived: boolean;
  private: boolean;
  license: { spdx_id: string | null } | null;
  owner: { id: number; login: string; avatar_url: string | null };
};

/** A repo with no description tells a reader nothing, so it doesn't earn a card. */
const usable = (r: Repo) => !!r.description && r.description.trim().length >= 20 && !r.archived && !r.private;

const ts = (s: string | null) => (s ? Math.floor(new Date(s).getTime() / 1000) : null);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch a repo AND report why it failed.
 *
 * The distinction matters enormously: a 404 means the repo is genuinely gone,
 * but a 403 means GitHub is throttling us. Treating those the same once
 * delisted 244 perfectly healthy projects in a single run.
 */
async function fetchRepo(
  repo: string,
): Promise<{ state: "ok"; repo: Repo } | { state: "gone" } | { state: "throttled" } | { state: "error" }> {
  let res: Response;
  try {
    res = await fetch(`${GH}/repos/${repo}`, { headers: headers() });
  } catch {
    return { state: "error" };
  }
  if (res.status === 404) return { state: "gone" };
  if (res.status === 403 || res.status === 429) return { state: "throttled" };
  if (!res.ok) return { state: "error" };
  return { state: "ok", repo: (await res.json()) as Repo };
}

/** Look for projects that have appeared since last time. */
export async function discover(perQuery = 30): Promise<JobResult> {
  const { env } = getCloudflareContext();
  let added = 0;
  let seen = 0;

  for (const src of SOURCES) {
    // Newest first — anything older we already have from a previous run.
    const url =
      `${GH}/search/repositories?q=` +
      encodeURIComponent(`${src.q} stars:>=${src.min} is:public archived:false`) +
      `&sort=updated&order=desc&per_page=${perQuery}`;
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) continue;
    const body = (await res.json()) as { items?: Repo[] };
    for (const r of body.items ?? []) {
      seen++;
      if (!usable(r)) continue;
      const id = `gh_${r.id}`;
      const existing = await env.DB.prepare("SELECT id FROM projects WHERE id = ?1 OR github_repo = ?2")
        .bind(id, r.full_name)
        .first();
      if (existing) continue;

      await env.DB.prepare(
        `INSERT INTO users (id, github_login, display_name, avatar_url, github_created_at, created_at, is_shadow)
         VALUES (?1, ?2, ?2, ?3, 0, ?4, 1)
         ON CONFLICT(id) DO UPDATE SET github_login = ?2, avatar_url = ?3`,
      )
        .bind(`gh_${r.owner.id}`, r.owner.login, r.owner.avatar_url, Math.floor(Date.now() / 1000))
        .run();

      await env.DB.prepare(
        `INSERT INTO projects (id, owner_id, base_name, variant_name, category, description, license, github_repo,
           manifest_json, parent_id, root_id, status, created_at, updated_at, source, stars, github_forks,
           language, pushed_at, homepage)
         VALUES (?1, ?2, ?3, NULL, ?4, ?5, ?6, ?7, '{}', NULL, ?1, 'live', ?8, ?9, 'indexed', ?10, ?11, ?12, ?9, ?13)`,
      )
        .bind(
          id,
          `gh_${r.owner.id}`,
          r.name,
          src.category,
          r.description!.trim().slice(0, 500),
          r.license?.spdx_id ?? "NOASSERTION",
          r.full_name,
          ts(r.created_at),
          ts(r.pushed_at),
          r.stargazers_count ?? 0,
          r.forks_count ?? 0,
          r.language,
          r.homepage && /^https?:\/\//.test(r.homepage) ? r.homepage : null,
        )
        .run();
      added++;
    }
  }

  return { job: "discover", ok: true, detail: `${added} new from ${seen} seen` };
}

/**
 * Refresh the numbers on projects we already hold, oldest-checked first, then
 * record today's star reading so the Popular charts have history to measure.
 */
export async function refresh(batch = 150): Promise<JobResult> {
  const { env } = getCloudflareContext();
  const { results } = await env.DB.prepare(
    `SELECT id, github_repo, source, readme_at FROM projects
     WHERE status='live' ORDER BY updated_at ASC LIMIT ?1`,
  )
    .bind(batch)
    .all<{ id: string; github_repo: string; source: string; readme_at: number | null }>();

  const now = Math.floor(Date.now() / 1000);
  let updated = 0;
  let gone = 0;

  let throttled = false;
  let skipped = 0;

  for (const p of results) {
    const got = await fetchRepo(p.github_repo);

    if (got.state === "throttled") {
      // Stop the whole run. Carrying on would just collect more failures and
      // the next run picks up where this one left off anyway.
      throttled = true;
      break;
    }
    if (got.state === "error") {
      skipped++;
      continue;
    }
    if (got.state === "gone") {
      // A 404 is the only thing that means gone. Anything else leaves the
      // project alone.
      await env.DB.prepare("UPDATE projects SET status='delisted', updated_at=?1 WHERE id=?2")
        .bind(now, p.id)
        .run();
      gone++;
      continue;
    }
    const info = got.repo;
    // A claimed project's description belongs to its owner; only numbers move.
    if (p.source === "claimed") {
      await env.DB.prepare(
        `UPDATE projects SET stars=?1, github_forks=?2, language=?3, pushed_at=?4, updated_at=?5,
           archived=?6, license=?7 WHERE id=?8`,
      )
        .bind(
          info.stargazers_count ?? 0,
          info.forks_count ?? 0,
          info.language,
          ts(info.pushed_at),
          now,
          info.archived ? 1 : 0,
          info.license?.spdx_id ?? "NOASSERTION",
          p.id,
        )
        .run();
    } else {
      await env.DB.prepare(
        `UPDATE projects SET stars=?1, github_forks=?2, language=?3, pushed_at=?4, updated_at=?5,
           archived=?6, license=?7,
           description = COALESCE(NULLIF(?8,''), description) WHERE id=?9`,
      )
        .bind(
          info.stargazers_count ?? 0,
          info.forks_count ?? 0,
          info.language,
          ts(info.pushed_at),
          now,
          info.archived ? 1 : 0,
          info.license?.spdx_id ?? "NOASSERTION",
          info.description?.trim().slice(0, 500) ?? "",
          p.id,
        )
        .run();
    }
    // Warm the README while we're here, so the first person to open the page
    // isn't the one who pays for fetching it.
    if (!p.readme_at) {
      const md = await getReadme(p.github_repo);
      await env.DB.prepare("UPDATE projects SET readme_md = ?1, readme_at = ?2 WHERE id = ?3")
        .bind(md, now, p.id)
        .run();
    }

    updated++;
    // GitHub throttles bursts even well inside the hourly budget.
    await sleep(90);
  }

  const snapped = await snapshotStars();
  const detail = `${updated} updated, ${gone} delisted, ${skipped} skipped, ${snapped} snapshotted${
    throttled ? " (stopped early — throttled)" : ""
  }`;
  return { job: "refresh", ok: true, detail };
}

/** Re-read fork lists, oldest first, so the whole set stays fresh in rotation. */
export async function forkRound(batch = 200): Promise<JobResult> {
  const { env } = getCloudflareContext();
  const { results } = await env.DB.prepare(
    `SELECT p.id, p.github_repo FROM projects p
     LEFT JOIN fork_sync fs ON fs.project_id = p.id
     WHERE p.status='live' AND p.github_forks > 0
     ORDER BY COALESCE(fs.synced_at, 0) ASC LIMIT ?1`,
  )
    .bind(batch)
    .all<{ id: string; github_repo: string }>();

  let done = 0;
  for (const p of results) {
    const picture = await syncForks(p.id, p.github_repo);
    if (picture) done++;
  }
  return { job: "forks", ok: true, detail: `${done}/${results.length} synced` };
}

export const JOBS: Record<string, () => Promise<JobResult>> = {
  discover: () => discover(),
  refresh: () => refresh(),
  forks: () => forkRound(),
};
