import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cached } from "./cache";
import { GROUP_ORDER, sectionsIn, type GroupKey } from "./categories";
import type { ProjectFeedRow } from "@/components/project-card";

export type FeedSort = "top" | "new" | "forked" | "starred" | "builtOn" | "followed";

const ORDER_BY: Record<FeedSort, string> = {
  top: `(p.stars / (1.0 + (strftime('%s','now') - COALESCE(p.pushed_at, p.created_at)) / 2592000.0)) DESC,
        p.stars DESC, p.created_at DESC`,
  new: "p.created_at DESC",
  forked: "p.github_forks DESC, fork_count DESC, p.stars DESC",
  starred: "p.stars DESC, p.github_forks DESC",
  // Forks per star: who people BUILD on rather than merely admire. The floor
  // keeps a repo with three stars and two forks off the top of the list.
  builtOn: `CASE WHEN p.stars >= 200 THEN CAST(p.github_forks AS REAL) / p.stars ELSE 0 END DESC,
            p.github_forks DESC`,
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
  // Bound, not interpolated. viewerId comes from a verified session today, but
  // the next person to touch this shouldn't have to know that for it to be safe.
  // Numbered placeholders, so the viewer slot moves depending on whether the
  // category above claimed ?1.
  const bindCategory = !!category && !inGroup;
  const hideBlocked = viewerId
    ? ` AND p.owner_id NOT IN (SELECT blocked_id FROM blocks WHERE user_id = ?${bindCategory ? 2 : 1})`
    : "";
  const params = [...(bindCategory ? [category] : []), ...(viewerId ? [viewerId] : [])];

  const where = "p.status = 'live'" + filter + recent + hideBlocked;
  const order = ORDER_BY[sort] ?? ORDER_BY.new;
  // Two passes on purpose.
  //
  // The single-pass version evaluated six correlated subqueries against every
  // live project just to return four cards -- about 4,800 rows read per page,
  // which is what pushed the account over D1's daily read limit. The inner
  // query now does the ordering alone, and the expensive per-row columns are
  // computed only for the handful of ids that survive the LIMIT.
  const stmt = env.DB.prepare(
    `WITH picked AS (
       SELECT p.id FROM projects p
       WHERE ${where}
       ORDER BY ${order}
       ${limit ? `LIMIT ${Number(limit)} OFFSET ${Number(offset)}` : ""}
     )
     SELECT p.id, p.base_name, p.variant_name, p.category, p.description, p.parent_id, p.created_at, p.image_url,
            u.github_login, u.avatar_url, u.is_shadow, p.owner_id, p.source, p.stars, p.github_forks, p.language, p.setup_tier,
            (SELECT COALESCE(SUM(l.value),0) FROM likes l WHERE l.project_id = p.id) AS like_count,
            (SELECT COUNT(*) FROM projects f WHERE f.parent_id = p.id AND f.status = 'live') AS fork_count,
            (SELECT COUNT(*) FROM project_comments pc WHERE pc.project_id = p.id AND pc.status='live') AS comment_count,
            (SELECT GROUP_CONCAT(url, '|') FROM (SELECT url FROM project_images pi WHERE pi.project_id = p.id ORDER BY pi.position LIMIT 5)) AS image_urls,
            (SELECT COUNT(*) FROM follows fo WHERE fo.project_id = p.id) AS follower_count,
            (SELECT CASE WHEN pp.variant_name IS NULL THEN pp.base_name
                         ELSE pp.base_name || ' // ' || pp.variant_name END
             FROM projects pp WHERE pp.id = p.parent_id) AS parent_display
     FROM projects p
     JOIN picked k ON k.id = p.id
     JOIN users u ON u.id = p.owner_id
     ORDER BY ${order}`,
  );

  const countStmt = env.DB.prepare(`SELECT COUNT(*) AS n FROM projects p WHERE ${where}`);
  // The total is a full scan of the table. Signed-out visitors all get the same
  // answer, so it is computed once per filter rather than once per request.
  // Signed-in visitors skip the cache because their blocked list changes it.
  // The key is built only from values already validated against fixed lists.
  const run = async () => {
    const [rows, count] = await Promise.all([
      (params.length ? stmt.bind(...params) : stmt).all<ProjectFeedRow>(),
      (params.length ? countStmt.bind(...params) : countStmt).first<{ n: number }>(),
    ]);
    return { results: rows.results, total: count?.n ?? 0 };
  };

  // Signed-out visitors -- which includes every crawler, and crawlers are what
  // actually generate this traffic -- all get byte-identical results, so the
  // whole page is shared. Signed-in visitors bypass it because their blocked
  // list changes what they should see.
  //
  // Only the first ten pages are cached: every key comes from an already
  // validated value except the offset, and leaving that unbounded would let
  // anyone mint unlimited cache rows by walking ?page= upwards.
  if (viewerId || offset > 240) return run();

  const key = `feed:${category ?? "all"}:${sort}:${sinceDays ?? 0}:${limit ?? 0}:${offset}`;
  return cached(key, 3600, run);
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

  // The "number one" badge needs a ranking of every project by likes. That
  // ranking was being recomputed per author, per page -- ~128,000 rows read to
  // award a badge that cannot exist until someone has liked something. So the
  // existence of any like is checked once (and remembered), and the ranking is
  // only computed when it could change the answer.
  const anyLikes = await cached("likes:any", 3600, async () => {
    const r = await env.DB.prepare("SELECT 1 AS x FROM likes LIMIT 1").first<{ x: number }>();
    return !!r;
  });
  const numberOne = anyLikes
    ? `(SELECT COUNT(*) FROM projects p WHERE p.owner_id = u.id AND p.status='live'
         AND (SELECT COALESCE(SUM(l.value),0) FROM likes l WHERE l.project_id = p.id) =
             (SELECT MAX(s) FROM (SELECT COALESCE(SUM(l2.value),0) AS s FROM projects p2
               LEFT JOIN likes l2 ON l2.project_id = p2.id WHERE p2.status='live' GROUP BY p2.id))
         AND (SELECT COALESCE(SUM(l.value),0) FROM likes l WHERE l.project_id = p.id) > 0
       )`
    : "0";
  const { results } = await env.DB.prepare(
    `SELECT u.id,
       ${numberOne} AS number_one,
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


/* ---------------------------------------------------------------------------
 * This week
 *
 * Everything here is a fact already in the index, with a real timestamp on it.
 * Nothing is invented and nothing is smoothed — if a week is quiet, the numbers
 * say so and the strips come back short. The whole point is that the movement
 * is the actual open-source world's, not a simulation of activity on our site.
 * ------------------------------------------------------------------------- */

const WEEK_S = 7 * 24 * 3600;

/** The same projection the feed uses, so these rows render in the same cards. */
const FEED_COLUMNS = `p.id, p.base_name, p.variant_name, p.category, p.description, p.parent_id, p.created_at, p.image_url,
  u.github_login, u.avatar_url, u.is_shadow, p.owner_id, p.source, p.stars, p.github_forks, p.language, p.setup_tier,
  (SELECT COALESCE(SUM(l.value),0) FROM likes l WHERE l.project_id = p.id) AS like_count,
  (SELECT COUNT(*) FROM projects f WHERE f.parent_id = p.id AND f.status = 'live') AS fork_count,
  (SELECT COUNT(*) FROM project_comments pc WHERE pc.project_id = p.id AND pc.status='live') AS comment_count,
  (SELECT GROUP_CONCAT(url, '|') FROM (SELECT url FROM project_images pi WHERE pi.project_id = p.id ORDER BY pi.position LIMIT 5)) AS image_urls,
  (SELECT COUNT(*) FROM follows fo WHERE fo.project_id = p.id) AS follower_count,
  (SELECT CASE WHEN pp.variant_name IS NULL THEN pp.base_name
               ELSE pp.base_name || ' // ' || pp.variant_name END
   FROM projects pp WHERE pp.id = p.parent_id) AS parent_display`;

export type WeekPulse = {
  /** How many live projects saw a push in the last seven days, and the total. */
  workedOn: number;
  total: number;
  /** Projects that cut a release in the last seven days. */
  shippedCount: number;
  shipped: ProjectFeedRow[];
  /** Projects pushed to most recently. */
  moving: ProjectFeedRow[];
  /**
   * Biggest star gains — only once there are two days of star_history to
   * subtract. Empty until the daily snapshot has run more than once, because a
   * single data point cannot show a change and guessing one would be a lie.
   */
  movers: (ProjectFeedRow & { gained: number })[];
  /** How many days of history the gain above is measured over. */
  moversDays: number;
};

export async function getWeekPulse(): Promise<WeekPulse> {
  const { env } = getCloudflareContext();
  const since = Math.floor(Date.now() / 1000) - WEEK_S;

  // Is there more than one snapshot yet? Decides whether movers can be honest.
  const span = await env.DB.prepare(
    "SELECT MIN(day) AS lo, MAX(day) AS hi FROM star_history",
  ).first<{ lo: number | null; hi: number | null }>();
  const haveHistory = !!span?.lo && !!span?.hi && span.hi > span.lo;

  const [counts, shipped, moving, movers] = await Promise.all([
    env.DB.prepare(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN COALESCE(p.pushed_at,0) >= ?1 THEN 1 ELSE 0 END) AS worked_on,
              SUM(CASE WHEN COALESCE(p.release_at,0) >= ?1 THEN 1 ELSE 0 END) AS shipped
       FROM projects p WHERE p.status = 'live'`,
    )
      .bind(since)
      .first<{ total: number; worked_on: number; shipped: number }>(),

    env.DB.prepare(
      `SELECT ${FEED_COLUMNS}, p.release_tag, p.release_at
       FROM projects p JOIN users u ON u.id = p.owner_id
       WHERE p.status = 'live' AND p.release_at >= ?1
       ORDER BY p.release_at DESC LIMIT 4`,
    )
      .bind(since)
      .all<ProjectFeedRow>(),

    env.DB.prepare(
      `SELECT ${FEED_COLUMNS}
       FROM projects p JOIN users u ON u.id = p.owner_id
       WHERE p.status = 'live' AND p.pushed_at >= ?1 AND p.archived = 0
       ORDER BY p.stars DESC LIMIT 4`,
    )
      .bind(since)
      .all<ProjectFeedRow>(),

    haveHistory
      ? env.DB.prepare(
          `SELECT ${FEED_COLUMNS}, (p.stars - h.stars) AS gained
           FROM projects p
           JOIN users u ON u.id = p.owner_id
           JOIN star_history h ON h.project_id = p.id AND h.day = ?1
           WHERE p.status = 'live' AND p.stars > h.stars
           ORDER BY gained DESC LIMIT 4`,
        )
          .bind(span!.lo)
          .all<ProjectFeedRow & { gained: number }>()
      : Promise.resolve({ results: [] as (ProjectFeedRow & { gained: number })[] }),
  ]);

  return {
    workedOn: counts?.worked_on ?? 0,
    total: counts?.total ?? 0,
    shippedCount: counts?.shipped ?? 0,
    shipped: shipped.results,
    moving: moving.results,
    movers: movers.results,
    moversDays: haveHistory ? span!.hi! - span!.lo! : 0,
  };
}
