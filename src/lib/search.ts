import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { ProjectFeedRow } from "@/components/project-card";

/**
 * FTS5 needs a sanitised query — raw user input can contain operators that
 * throw. We strip everything but words and quote each term, then prefix-match
 * the last one so results appear as you finish typing.
 */
export function toMatchQuery(raw: string): string | null {
  const terms = raw
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s._-]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1)
    .slice(0, 8);
  if (terms.length === 0) return null;
  return terms.map((t, i) => (i === terms.length - 1 ? `"${t}"*` : `"${t}"`)).join(" AND ");
}

const FEED_COLS = `p.id, p.base_name, p.variant_name, p.category, p.description, p.parent_id, p.created_at,
  p.image_url, p.owner_id, u.github_login, u.avatar_url,
  (SELECT COALESCE(SUM(l.value),0) FROM likes l WHERE l.project_id = p.id) AS like_count,
  (SELECT COUNT(*) FROM projects f WHERE f.parent_id = p.id AND f.status='live') AS fork_count,
  (SELECT COUNT(*) FROM project_comments pc WHERE pc.project_id = p.id AND pc.status='live') AS comment_count,
  (SELECT GROUP_CONCAT(url, '|') FROM (SELECT url FROM project_images pi WHERE pi.project_id = p.id ORDER BY pi.position LIMIT 5)) AS image_urls,
  (SELECT CASE WHEN pp.variant_name IS NULL THEN pp.base_name
               ELSE pp.base_name || ' // ' || pp.variant_name END
   FROM projects pp WHERE pp.id = p.parent_id) AS parent_display`;

export async function searchProjects(
  query: string,
  { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {},
): Promise<{ results: ProjectFeedRow[]; total: number }> {
  const match = toMatchQuery(query);
  if (!match) return { results: [], total: 0 };
  const { env } = getCloudflareContext();

  try {
    const [rows, count] = await Promise.all([
      env.DB.prepare(
        `SELECT ${FEED_COLS}
         FROM project_search s
         JOIN projects p ON p.id = s.project_id
         JOIN users u ON u.id = p.owner_id
         WHERE project_search MATCH ?1 AND p.status = 'live'
         -- bm25 alone put a 36-star starter above awesome-claude-skills for
         -- "claude", and a 224k-star project fifth for "agent". It was breaking
         -- ties on likes, and every project here has zero. bm25 is negative and
         -- lower is better, so multiplying by a bounded star factor pulls the
         -- well-known ones up without letting popularity beat relevance — a
         -- weak match with 50k stars still loses to a strong one.
         ORDER BY bm25(project_search, 3.0, 1.0, 2.0) * CASE
             WHEN p.stars >= 10000 THEN 2.0
             WHEN p.stars >= 1000  THEN 1.6
             WHEN p.stars >= 100   THEN 1.3
             WHEN p.stars >= 10    THEN 1.1
             ELSE 1.0
           END,
                  p.stars DESC
         LIMIT ?2 OFFSET ?3`,
      )
        .bind(match, limit, offset)
        .all<ProjectFeedRow>(),
      env.DB.prepare(
        `SELECT COUNT(*) AS n FROM project_search s JOIN projects p ON p.id = s.project_id
         WHERE project_search MATCH ?1 AND p.status='live'`,
      )
        .bind(match)
        .first<{ n: number }>(),
    ]);
    return { results: rows.results, total: count?.n ?? 0 };
  } catch {
    // A malformed match expression shouldn't 500 the page.
    return { results: [], total: 0 };
  }
}

export type PostHit = {
  id: string;
  title: string | null;
  kind: string;
  created_at: number;
  github_login: string;
  avatar_url: string | null;
};

export async function searchPosts(query: string, limit = 15): Promise<PostHit[]> {
  const match = toMatchQuery(query);
  if (!match) return [];
  const { env } = getCloudflareContext();
  try {
    const { results } = await env.DB.prepare(
      `SELECT po.id, po.title, po.kind, po.created_at, u.github_login, u.avatar_url
       FROM post_search s
       JOIN posts po ON po.id = s.post_id
       JOIN users u ON u.id = po.author_id
       WHERE post_search MATCH ?1 AND po.status='live'
       ORDER BY bm25(post_search, 3.0, 1.0)
       LIMIT ?2`,
    )
      .bind(match, limit)
      .all<PostHit>();
    return results;
  } catch {
    return [];
  }
}

export type PersonHit = { id: string; github_login: string; avatar_url: string | null };

export async function searchPeople(query: string, limit = 8): Promise<PersonHit[]> {
  const term = query.trim().replace(/[%_]/g, "");
  if (term.length < 2) return [];
  const { env } = getCloudflareContext();
  const { results } = await env.DB.prepare(
    `SELECT id, github_login, avatar_url FROM users
     WHERE banned_at IS NULL AND github_login LIKE ?1 ORDER BY github_login LIMIT ?2`,
  )
    .bind(`%${term}%`, limit)
    .all<PersonHit>();
  return results;
}
