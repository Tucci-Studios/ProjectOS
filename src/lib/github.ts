const GH = "https://api.github.com";
const HEADERS = {
  Accept: "application/vnd.github+json",
  "User-Agent": "project-os",
};

export type RepoInfo = {
  full_name: string;
  default_branch: string;
  fork: boolean;
  parent?: { full_name: string };
  license: { spdx_id: string | null } | null;
  private: boolean;
  forks_count?: number;
};

export type ForkInfo = {
  full_name: string;
  owner_login: string;
  stars: number;
  pushed_at: number | null;
};

/**
 * Every fork GitHub knows about, whether or not its owner ever published here.
 *
 * This is public data and needs no scopes — GitHub records a fork the moment
 * someone clicks the button, so this is how Project OS finds out about work
 * nobody told it about.
 */
export async function listForks(repo: string, max = 100): Promise<{ forks: ForkInfo[]; total: number } | null> {
  const info = await getRepo(repo);
  if (!info) return null;

  const res = await fetch(`${GH}/repos/${repo}/forks?sort=newest&per_page=${Math.min(100, max)}`, {
    headers: HEADERS,
  });
  if (!res.ok) return null;

  const raw = (await res.json()) as {
    full_name: string;
    owner: { login: string };
    stargazers_count: number;
    pushed_at: string | null;
  }[];
  if (!Array.isArray(raw)) return null;

  return {
    total: info.forks_count ?? raw.length,
    forks: raw.map((f) => ({
      full_name: f.full_name,
      owner_login: f.owner.login,
      stars: f.stargazers_count ?? 0,
      pushed_at: f.pushed_at ? Math.floor(new Date(f.pushed_at).getTime() / 1000) : null,
    })),
  };
}

export async function getRepo(repo: string): Promise<RepoInfo | null> {
  const res = await fetch(`${GH}/repos/${repo}`, { headers: HEADERS });
  if (!res.ok) return null;
  return (await res.json()) as RepoInfo;
}

/** Fetch a file's text content from the repo's default branch, or null if missing. */
export async function getFileText(repo: string, path: string): Promise<string | null> {
  const res = await fetch(`${GH}/repos/${repo}/contents/${path}`, { headers: HEADERS });
  if (!res.ok) return null;
  const body = (await res.json()) as { content?: string; encoding?: string };
  if (!body.content || body.encoding !== "base64") return null;
  try {
    return new TextDecoder().decode(
      Uint8Array.from(atob(body.content.replace(/\n/g, "")), (c) => c.charCodeAt(0)),
    );
  } catch {
    return null;
  }
}
