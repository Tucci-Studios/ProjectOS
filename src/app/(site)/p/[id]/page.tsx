import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getLineage } from "@/lib/queries";
import { categoryMeta, timeAgo } from "@/lib/categories";
import { LikeButton } from "@/components/like-button";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  base_name: string;
  variant_name: string | null;
  category: string;
  description: string;
  license: string;
  github_repo: string;
  change_summary: string | null;
  parent_id: string | null;
  root_id: string;
  created_at: number;
  github_login: string;
  like_count: number;
  stars: number | null;
  release_downloads: number | null;
};

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  const { env } = getCloudflareContext();
  const p = await env.DB.prepare(
    `SELECT p.id, p.base_name, p.variant_name, p.category, p.description, p.license,
            p.github_repo, p.change_summary, p.parent_id, p.root_id, p.created_at, u.github_login,
            (SELECT COUNT(*) FROM likes l WHERE l.project_id = p.id) AS like_count,
            rs.stars, rs.release_downloads
     FROM projects p
     JOIN users u ON u.id = p.owner_id
     LEFT JOIN repo_stats rs ON rs.project_id = p.id
     WHERE p.id = ?1 AND p.status = 'live'`,
  )
    .bind(id)
    .first<Row>();
  if (!p) notFound();

  const meta = categoryMeta(p.category);
  const likedRow = user
    ? await env.DB.prepare("SELECT 1 FROM likes WHERE user_id = ?1 AND project_id = ?2").bind(user.id, p.id).first()
    : null;
  const lineage = await getLineage(p.root_id);

  return (
    <div className="max-w-3xl">
      <div className="flex items-start gap-3">
        <LikeButton projectId={p.id} initialCount={p.like_count} initialLiked={!!likedRow} />
        <div className="min-w-0 flex-1">
          <h1 className="font-mono text-2xl font-bold text-white">
            {p.base_name}
            {p.variant_name && (
              <>
                <span className="text-cyan-400"> // </span>
                {p.variant_name}
              </>
            )}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[11px] text-neutral-500">
            <Link
              href={`/s/${meta.slug}`}
              className={`rounded border ${meta.border} bg-neutral-900/60 px-1.5 py-0.5 ${meta.text}`}
            >
              {meta.label}
            </Link>
            by @{p.github_login} · {timeAgo(p.created_at)} · {p.license}
            {p.stars != null && <> · ★ {p.stars}</>}
            {p.release_downloads != null && p.release_downloads > 0 && <> · ⇩ {p.release_downloads}</>}
          </p>
        </div>
      </div>

      <p className="mt-4 text-neutral-300">{p.description}</p>
      {p.change_summary && (
        <p className="mt-3 rounded border-l-2 border-cyan-400/50 bg-neutral-900/50 p-3 text-sm text-neutral-400">
          <span className="font-mono text-[10px] uppercase tracking-widest text-cyan-400">vs. parent</span>
          <br />
          {p.change_summary}
        </p>
      )}

      <div className="mt-4 flex gap-3 font-mono text-xs">
        <a
          href={`https://github.com/${p.github_repo}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded border border-neutral-700 px-3 py-1.5 text-neutral-300 transition hover:border-neutral-500"
        >
          view on GitHub ↗
        </a>
        <span
          className="cursor-not-allowed rounded border border-cyan-400/40 px-3 py-1.5 text-cyan-400/50"
          title="Fork registration lands next"
        >
          ⑂ fork this
        </span>
      </div>

      {/* Lineage */}
      <section className="mt-8">
        <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600">
          Lineage — {lineage.length} project{lineage.length === 1 ? "" : "s"}
        </h2>
        <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-4">
          {lineage.map((node) => (
            <div key={node.id} style={{ paddingLeft: node.depth * 24 }} className="py-1">
              <span className="font-mono text-xs text-neutral-700">{node.depth > 0 ? "└─ " : "◉ "}</span>
              <Link
                href={`/p/${node.id}`}
                className={`font-mono text-sm ${
                  node.id === p.id ? "font-bold text-cyan-400" : "text-neutral-300 hover:text-white"
                }`}
              >
                {node.base_name}
                {node.variant_name && (
                  <>
                    <span className="text-cyan-400/60"> // </span>
                    {node.variant_name}
                  </>
                )}
              </Link>
              <span className="ml-2 font-mono text-[10px] text-neutral-600">
                @{node.github_login} · ♥ {node.like_count}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-2 font-mono text-[10px] text-neutral-700">
          (the glowing circuit-tree render of this is coming — this is the data working)
        </p>
      </section>
    </div>
  );
}
