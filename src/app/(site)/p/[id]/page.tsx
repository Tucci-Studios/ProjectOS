import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GitBranch, ExternalLink } from "lucide-react";
import { ButtonLink } from "@/components/ui";
import { InstallBlock } from "@/components/install-block";
import { BranchTree } from "@/components/branch-tree";
import { getSessionUser } from "@/lib/auth";
import { getLineage } from "@/lib/queries";
import { categoryMeta, groupOf, accentHex, timeAgo } from "@/lib/categories";
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
  const g = groupOf(p.category);
  const likedRow = user
    ? await env.DB.prepare("SELECT 1 FROM likes WHERE user_id = ?1 AND project_id = ?2").bind(user.id, p.id).first()
    : null;
  const lineage = await getLineage(p.root_id);

  const crumbLabel = p.variant_name ? `${p.base_name} // ${p.variant_name}` : p.base_name;

  return (
    <div className="max-w-3xl">
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 font-mono text-xs text-neutral-500">
        <Link href="/" className="rounded px-1 py-0.5 hover:text-neutral-200">Home</Link>
        <span className="text-neutral-700">/</span>
        <Link href="/projects" className="rounded px-1 py-0.5 hover:text-neutral-200">Projects</Link>
        <span className="text-neutral-700">/</span>
        <Link href={`/s/${meta.slug}`} className={`rounded px-1 py-0.5 hover:opacity-80 ${g.text}`}>{meta.label}</Link>
        <span className="text-neutral-700">/</span>
        <span className="px-1 py-0.5 text-neutral-300">{crumbLabel}</span>
      </nav>
      <div className="flex items-start gap-3">
        <LikeButton projectId={p.id} initialCount={p.like_count} initialLiked={!!likedRow} />
        <div className="min-w-0 flex-1">
          <h1 className="font-mono text-3xl font-bold tracking-tight text-white">
            {p.base_name}
            {p.variant_name && (
              <>
                <span className="text-emerald-400"> // </span>
                {p.variant_name}
              </>
            )}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 font-mono text-xs text-neutral-500">
            <Link
              href={`/s/${meta.slug}`}
              className={`rounded border ${g.border} bg-neutral-800/60 px-1.5 py-0.5 ${g.text}`}
            >
              {meta.label}
            </Link>
            by @{p.github_login} · {timeAgo(p.created_at)} · {p.license}
            {p.stars != null && <> · ★ {p.stars}</>}
            {p.release_downloads != null && p.release_downloads > 0 && <> · ⇩ {p.release_downloads}</>}
          </p>
        </div>
      </div>

      <p className="mt-5 text-lg leading-relaxed text-neutral-200">{p.description}</p>
      {p.change_summary && (
        <p className="mt-3 rounded border-l-2 border-emerald-400/50 bg-neutral-800/50 p-3 text-sm text-neutral-400">
          <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">vs. parent</span>
          <br />
          {p.change_summary}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <ButtonLink href={`/p/${p.id}/branch`} variant="primary">
          <GitBranch size={16} aria-hidden /> branch it
        </ButtonLink>
        <ButtonLink href={`https://github.com/${p.github_repo}`} variant="ghost" external>
          view on GitHub <ExternalLink size={15} aria-hidden />
        </ButtonLink>
      </div>

      <InstallBlock category={p.category} repo={p.github_repo} />

      {/* The tree */}
      <section className="mt-8">
        <h2 className="mb-3 flex flex-wrap items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
          <GitBranch size={14} aria-hidden /> the tree
          <span className="font-normal normal-case tracking-normal text-neutral-500">
            {lineage.length} branch{lineage.length === 1 ? "" : "es"} growing from {p.base_name}
          </span>
        </h2>
        <BranchTree nodes={lineage} currentId={p.id} accent={accentHex(p.category)} />
      </section>
    </div>
  );
}
