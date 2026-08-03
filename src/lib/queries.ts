import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { ProjectFeedRow } from "@/components/project-card";

/** Feed rows, optionally filtered by category. sort: "top" (likes) or "new". */
export async function getProjectFeed(category?: string, sort: "top" | "new" = "new"): Promise<ProjectFeedRow[]> {
  const { env } = getCloudflareContext();
  const where = category ? "p.status = 'live' AND p.category = ?1" : "p.status = 'live'";
  const order = sort === "top" ? "like_count DESC, p.created_at DESC" : "p.created_at DESC";
  const stmt = env.DB.prepare(
    `SELECT p.id, p.base_name, p.variant_name, p.category, p.description, p.parent_id, p.created_at,
            u.github_login, u.avatar_url,
            (SELECT COALESCE(SUM(l.value),0) FROM likes l WHERE l.project_id = p.id) AS like_count,
            (SELECT COUNT(*) FROM projects f WHERE f.parent_id = p.id AND f.status = 'live') AS fork_count,
            (SELECT CASE WHEN pp.variant_name IS NULL THEN pp.base_name
                         ELSE pp.base_name || ' // ' || pp.variant_name END
             FROM projects pp WHERE pp.id = p.parent_id) AS parent_display
     FROM projects p JOIN users u ON u.id = p.owner_id
     WHERE ${where}
     ORDER BY ${order}`,
  );
  const { results } = await (category ? stmt.bind(category) : stmt).all<ProjectFeedRow>();
  return results;
}

/** How this user voted on each project: 1 up, -1 down, absent = no vote. */
export async function getUserVotes(userId: string | undefined): Promise<Map<string, number>> {
  if (!userId) return new Map();
  const { env } = getCloudflareContext();
  const { results } = await env.DB.prepare("SELECT project_id, value FROM likes WHERE user_id = ?1")
    .bind(userId)
    .all<{ project_id: string; value: number }>();
  return new Map(results.map((r) => [r.project_id, r.value]));
}

/** Project ids this user follows. */
export async function getFollowedIds(userId: string | undefined): Promise<Set<string>> {
  if (!userId) return new Set();
  const { env } = getCloudflareContext();
  const { results } = await env.DB.prepare("SELECT project_id FROM follows WHERE user_id = ?1")
    .bind(userId)
    .all<{ project_id: string }>();
  return new Set(results.map((r) => r.project_id));
}

/** Whole lineage for a root, ordered for indented tree rendering (DFS). */
export type LineageNode = {
  id: string;
  base_name: string;
  variant_name: string | null;
  parent_id: string | null;
  change_summary: string | null;
  child_count: number;
  github_login: string;
  like_count: number;
  depth: number;
};

export async function getLineage(rootId: string): Promise<LineageNode[]> {
  const { env } = getCloudflareContext();
  const { results } = await env.DB.prepare(
    `SELECT p.id, p.base_name, p.variant_name, p.parent_id, p.change_summary, u.github_login, u.avatar_url,
            (SELECT COALESCE(SUM(l.value),0) FROM likes l WHERE l.project_id = p.id) AS like_count,
            (SELECT COUNT(*) FROM projects c WHERE c.parent_id = p.id AND c.status='live') AS child_count
     FROM projects p JOIN users u ON u.id = p.owner_id
     WHERE p.root_id = ?1 AND p.status = 'live'
     ORDER BY p.created_at ASC`,
  )
    .bind(rootId)
    .all<Omit<LineageNode, "depth">>();

  // DFS from the root to get display order + depth
  const byParent = new Map<string | null, typeof results>();
  for (const r of results) {
    const list = byParent.get(r.parent_id) ?? [];
    list.push(r);
    byParent.set(r.parent_id, list);
  }
  const out: LineageNode[] = [];
  const walk = (parentId: string | null, depth: number) => {
    for (const node of byParent.get(parentId) ?? []) {
      out.push({ ...node, depth });
      walk(node.id, depth + 1);
    }
  };
  // The root has parent_id NULL; orphaned parents (delisted) fall back to appearing at depth 0.
  walk(null, 0);
  for (const r of results) if (!out.find((o) => o.id === r.id)) out.push({ ...r, depth: 0 });
  return out;
}
