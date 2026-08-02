import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getLikedIds } from "@/lib/queries";
import { ProjectCard, type ProjectFeedRow } from "@/components/project-card";
import { timeAgo } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q ?? "").trim().slice(0, 80);
  const user = await getSessionUser();

  if (!query) {
    return <p className="font-mono text-sm text-neutral-500">Type something in the search box up top.</p>;
  }

  const { env } = getCloudflareContext();
  const like = `%${query}%`;
  const [projects, liked, posts] = await Promise.all([
    env.DB.prepare(
      `SELECT p.id, p.base_name, p.variant_name, p.category, p.description, p.parent_id, p.created_at,
              u.github_login,
              (SELECT COUNT(*) FROM likes l WHERE l.project_id = p.id) AS like_count,
              (SELECT COUNT(*) FROM projects f WHERE f.parent_id = p.id AND f.status='live') AS fork_count,
              (SELECT CASE WHEN pp.variant_name IS NULL THEN pp.base_name
                           ELSE pp.base_name || ' // ' || pp.variant_name END
               FROM projects pp WHERE pp.id = p.parent_id) AS parent_display
       FROM projects p JOIN users u ON u.id = p.owner_id
       WHERE p.status='live' AND (p.base_name LIKE ?1 OR p.variant_name LIKE ?1 OR p.description LIKE ?1)
       ORDER BY like_count DESC LIMIT 25`,
    ).bind(like).all<ProjectFeedRow>().then((r) => r.results),
    getLikedIds(user?.id),
    env.DB.prepare(
      `SELECT po.id, po.title, po.kind, po.created_at, u.github_login
       FROM posts po JOIN users u ON u.id = po.author_id
       WHERE po.status='live' AND (po.title LIKE ?1 OR po.body_md LIKE ?1)
       ORDER BY po.created_at DESC LIMIT 15`,
    ).bind(like).all<{ id: string; title: string | null; kind: string; created_at: number; github_login: string }>().then((r) => r.results),
  ]);

  return (
    <div>
      <h1 className="mb-5 font-mono text-2xl font-bold tracking-tight text-white">
        Search: <span className="text-cyan-400">{query}</span>
      </h1>
      <h2 className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.25em] text-neutral-500">
        projects ({projects.length})
      </h2>
      {projects.length === 0 ? (
        <p className="mb-6 font-mono text-xs text-neutral-600">no projects matched</p>
      ) : (
        <div className="mb-8 space-y-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} p={p} liked={liked.has(p.id)} />
          ))}
        </div>
      )}
      <h2 className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.25em] text-neutral-500">
        feed posts ({posts.length})
      </h2>
      {posts.length === 0 ? (
        <p className="font-mono text-xs text-neutral-600">no posts matched</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={`/wire/${post.id}`} className="font-mono text-sm text-neutral-200 transition hover:text-cyan-400">
                {post.title ?? "(untitled)"}
              </Link>
              <span className="ml-2 font-mono text-[11px] text-neutral-600">
                {post.kind} · @{post.github_login} · {timeAgo(post.created_at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
