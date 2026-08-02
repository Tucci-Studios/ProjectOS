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
};

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
