import { getCloudflareContext } from "@opennextjs/cloudflare";
import { GROUP_ORDER, sectionsIn, type GroupKey } from "./categories";
import type { ProjectFeedRow } from "@/components/project-card";

export type FeedSort = "top" | "new" | "forked" | "starred" | "followed";

const ORDER_BY: Record<FeedSort, string> = {
  top: `like_count DESC,
        (p.stars / (1.0 + (strftime('%s','now') - COALESCE(p.pushed_at, p.created_at)) / 2592000.0)) DESC,
        p.created_at DESC`,
  new: "p.created_at DESC",
  forked: "p.github_forks DESC, fork_count DESC, like_count DESC",
  starred: "p.stars DESC, p.github_forks DESC",
  followed: "follower_count DESC, like_count DESC",
};

/** Feed rows, optionally filtered by category, sorted and paginated. */
export async function getProjectFeed(
  category?: string,
  sort: FeedSort = "new",
  {
    limit,
    offset = 0,
    viewerId,
    sinceDays,
  }: { limit?: number; offset?: number; viewerId?: string; sinceDays?: number } = {},
): Promise<{ results: ProjectFeedRow[]; total: number }> {
  const { env } = getCloudflareContext();
  const hideBlocked = viewerId
    ? ` AND p.owner_id NOT IN (SELECT blocked_id FROM blocks WHERE user_id = '${viewerId.replace(/'/g, "")}')`
    : "";
  // A group like "ai" covers several categories, so it filters by an IN list
  // built from the category table rather than a single equality.
  const inGroup = category && GROUP_ORDER.includes(category as GroupKey);
  const slugs = inGroup ? sectionsIn(category as GroupKey).map((c) => c.slug) : [];
  const filter = inGroup
    ? ` AND p.category IN (${slugs.map((sl) => `'${sl}'`).join(",")})`
    : category
      ? " AND p.category = ?1"
      : "";
  // "This week" means worked on this week — true for every sort, and the only
  // reading that doesn't need history we haven't collected yet.
  const recent = sinceDays
    ? ` AND COALESCE(p.pushed_at, p.created_at) >= strftime('%s','now') - ${Math.floor(sinceDays) * 86400}`
    : "";
  const where = "p.status = 'live'" + filter + recent + hideBlocked;
  const order = ORDER_BY[sort] ?? ORDER_BY.new;
  const stmt = env.DB.prepare(
    `SELECT p.id, p.base_name, p.variant_name, p.category, p.description, p.parent_id, p.created_at, p.image_url,
            u.github_login, u.avatar_url, u.is_shadow, p.owner_id, p.source, p.stars, p.github_forks, p.language,
            (SELECT COALESCE(SUM(l.value),0) FROM likes l WHERE l.project_id = p.id) AS like_count,
            (SELECT COUNT(*) FROM projects f WHERE f.parent_id = p.id AND f.status = 'live') AS fork_count,
            (SELECT COUNT(*) FROM project_comments pc WHERE pc.project_id = p.id AND pc.status='live') AS comment_count,
            (SELECT GROUP_CONCAT(url, '|') FROM (SELECT url FROM project_images pi WHERE pi.project_id = p.id ORDER BY pi.position LIMIT 5)) AS image_urls,
            (SELECT COUNT(*) FROM follows fo WHERE fo.project_id = p.id) AS follower_count,
            (SELECT CASE WHEN pp.variant_name IS NULL THEN pp.base_name
                         ELSE pp.base_name || ' // ' || pp.variant_name END
             FROM projects pp WHERE pp.id = p.parent_id) AS parent_display
     FROM projects p JOIN users u ON u.id = p.owner_id
     WHERE ${where}
     ORDER BY ${order}
     ${limit ? `LIMIT ${Number(limit)} OFFSET ${Number(offset)}` : ""}`,
  );

  const countStmt = env.DB.prepare(`SELECT COUNT(*) AS n FROM projects p WHERE ${where}`);
  const bindCategory = !!category && !inGroup;
  const [rows, count] = await Promise.all([
    (bindCategory ? stmt.bind(category) : stmt).all<ProjectFeedRow>(),
    (bindCategory ? countStmt.bind(category) : countStmt).first<{ n: number }>(),
  ]);
  return { results: rows.results, total: count?.n ?? 0 };
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

/** People this viewer has hidden — their work is filtered out of feeds. */
export async function getBlockedIds(userId: string | undefined): Promise<Set<string>> {
  if (!userId) return new Set();
  const { env } = getCloudflareContext();
  const { results } = await env.DB.prepare("SELECT blocked_id FROM blocks WHERE user_id = ?1")
    .bind(userId)
    .all<{ blocked_id: string }>();
  return new Set(results.map((r) => r.blocked_id));
}

/** Project ids this user follows. */
export async function getSavedIds(userId: string | undefined): Promise<Set<string>> {
  if (!userId) return new Set();
  const { env } = getCloudflareContext();
  const { results } = await env.DB.prepare("SELECT project_id FROM saves WHERE user_id = ?1")
    .bind(userId)
    .all<{ project_id: string }>();
  return new Set(results.map((r) => r.project_id));
}

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

/** Earned counters shown next to a username. */
export async function getBadges(userId: string): Promise<import("@/components/user-badges").Badges> {
  const { env } = getCloudflareContext();
  const row = await env.DB.prepare(
    `SELECT
      (SELECT COUNT(*) FROM projects p WHERE p.owner_id = ?1 AND p.status='live'
        AND (SELECT COALESCE(SUM(l.value),0) FROM likes l WHERE l.project_id = p.id) =
            (SELECT MAX(s) FROM (SELECT COALESCE(SUM(l2.value),0) AS s FROM projects p2
              LEFT JOIN likes l2 ON l2.project_id = p2.id WHERE p2.status='live' GROUP BY p2.id))
        AND (SELECT COALESCE(SUM(l.value),0) FROM likes l WHERE l.project_id = p.id) > 0
      ) AS number_one,
      (SELECT COUNT(*) FROM ideas WHERE author_id = ?1 AND status='shipped') AS ideas_shipped,
      (SELECT COALESCE(MAX(cnt),0) FROM (
         SELECT COUNT(*) AS cnt FROM projects c
         JOIN projects r ON r.id = c.root_id
         WHERE r.owner_id = ?1 AND c.status='live' GROUP BY c.root_id
      )) AS biggest_tree`,
  )
    .bind(userId)
    .first<{ number_one: number; ideas_shipped: number; biggest_tree: number }>();

  return {
    numberOne: row?.number_one ?? 0,
    ideasShipped: row?.ideas_shipped ?? 0,
    biggestTree: row?.biggest_tree ?? 0,
  };
}

/** Badges for a set of users in one query — for lists where many names appear. */
export async function getBadgesFor(
  userIds: string[],
): Promise<Map<string, import("@/components/user-badges").Badges>> {
  const out = new Map<string, import("@/components/user-badges").Badges>();
  const ids = [...new Set(userIds)].filter(Boolean);
  if (ids.length === 0) return out;

  const { env } = getCloudflareContext();
  const placeholders = ids.map((_, i) => `?${i + 1}`).join(",");
  const { results } = await env.DB.prepare(
    `SELECT u.id,
       (SELECT COUNT(*) FROM projects p WHERE p.owner_id = u.id AND p.status='live'
         AND (SELECT COALESCE(SUM(l.value),0) FROM likes l WHERE l.project_id = p.id) =
             (SELECT MAX(s) FROM (SELECT COALESCE(SUM(l2.value),0) AS s FROM projects p2
               LEFT JOIN likes l2 ON l2.project_id = p2.id WHERE p2.status='live' GROUP BY p2.id))
         AND (SELECT COALESCE(SUM(l.value),0) FROM likes l WHERE l.project_id = p.id) > 0
       ) AS number_one,
       (SELECT COUNT(*) FROM ideas i WHERE i.author_id = u.id AND i.status='shipped') AS ideas_shipped,
       (SELECT COALESCE(MAX(cnt),0) FROM (
          SELECT COUNT(*) AS cnt FROM projects c JOIN projects r ON r.id = c.root_id
          WHERE r.owner_id = u.id AND c.status='live' GROUP BY c.root_id
       )) AS biggest_tree
     FROM users u WHERE u.id IN (${placeholders})`,
  )
    .bind(...ids)
    .all<{ id: string; number_one: number; ideas_shipped: number; biggest_tree: number }>();

  for (const r of results) {
    out.set(r.id, { numberOne: r.number_one, ideasShipped: r.ideas_shipped, biggestTree: r.biggest_tree });
  }
  return out;
}
