import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { ProjectFeedRow } from "@/components/project-card";

// One endless stream: projects and posts interleaved, newest first, keyed by a
// timestamp cursor so it never "ends" until the data does.
export type StreamPost = {
  kind: "post";
  id: string;
  created_at: number;
  title: string | null;
  body_md: string;
  post_kind: string;
  github_login: string;
  avatar_url: string | null;
  comment_count: number;
  project_display: string | null;
  project_id: string | null;
};
export type StreamProject = { kind: "project"; created_at: number; project: ProjectFeedRow };
export type StreamItem = StreamPost | StreamProject;

export const PAGE_SIZE = 12;

export async function getStream(before?: number): Promise<{ items: StreamItem[]; nextCursor: number | null }> {
  const { env } = getCloudflareContext();
  const cursor = before && Number.isFinite(before) ? before : 9_999_999_999;

  const [{ results: projects }, { results: posts }] = await Promise.all([
    env.DB.prepare(
      `SELECT p.id, p.base_name, p.variant_name, p.category, p.description, p.parent_id, p.created_at, p.image_url,
              u.github_login, u.avatar_url,
              (SELECT COALESCE(SUM(l.value),0) FROM likes l WHERE l.project_id = p.id) AS like_count,
              (SELECT COUNT(*) FROM projects f WHERE f.parent_id = p.id AND f.status='live') AS fork_count,
              (SELECT CASE WHEN pp.variant_name IS NULL THEN pp.base_name
                           ELSE pp.base_name || ' // ' || pp.variant_name END
               FROM projects pp WHERE pp.id = p.parent_id) AS parent_display
       FROM projects p JOIN users u ON u.id = p.owner_id
       WHERE p.status='live' AND p.created_at < ?1
       ORDER BY p.created_at DESC LIMIT ?2`,
    )
      .bind(cursor, PAGE_SIZE)
      .all<ProjectFeedRow>(),
    env.DB.prepare(
      `SELECT po.id, po.title, po.body_md, po.kind AS post_kind, po.created_at, po.project_id,
              u.github_login, u.avatar_url,
              (SELECT COUNT(*) FROM comments c WHERE c.post_id = po.id AND c.status='live') AS comment_count,
              (SELECT CASE WHEN pp.variant_name IS NULL THEN pp.base_name
                           ELSE pp.base_name || ' // ' || pp.variant_name END
               FROM projects pp WHERE pp.id = po.project_id) AS project_display
       FROM posts po JOIN users u ON u.id = po.author_id
       WHERE po.status='live' AND po.created_at < ?1
       ORDER BY po.created_at DESC LIMIT ?2`,
    )
      .bind(cursor, PAGE_SIZE)
      .all<Omit<StreamPost, "kind">>(),
  ]);

  const merged: StreamItem[] = [
    ...projects.map((p) => ({ kind: "project" as const, created_at: p.created_at, project: p })),
    ...posts.map((p) => ({ ...p, kind: "post" as const })),
  ]
    .sort((a, b) => b.created_at - a.created_at)
    .slice(0, PAGE_SIZE);

  const nextCursor = merged.length === PAGE_SIZE ? merged[merged.length - 1].created_at : null;
  return { items: merged, nextCursor };
}
