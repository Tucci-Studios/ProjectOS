import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GitBranch, ExternalLink, Star, Download } from "lucide-react";
import { ButtonLink } from "@/components/ui";
import { InstallBlock } from "@/components/install-block";
import { BranchTree } from "@/components/branch-tree";
import { FollowButton } from "@/components/follow-button";
import { ReportButton } from "@/components/report-button";
import { BackLink } from "@/components/back-link";
import { ProjectTabs } from "./project-tabs";
import { accentHex, categoryMeta, groupOf, timeAgo } from "@/lib/categories";
import { getSessionUser } from "@/lib/auth";
import { getLineage } from "@/lib/queries";
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
  avatar_url: string | null;
  like_count: number;
  stars: number | null;
  release_downloads: number | null;
};

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab: tabParam } = await searchParams;
  const tab = tabParam === "branches" ? "branches" : tabParam === "install" ? "install" : "about";

  const user = await getSessionUser();
  const { env } = getCloudflareContext();

  const p = await env.DB.prepare(
    `SELECT p.id, p.base_name, p.variant_name, p.category, p.description, p.license,
            p.github_repo, p.change_summary, p.parent_id, p.root_id, p.created_at,
            u.github_login, u.avatar_url,
            (SELECT COALESCE(SUM(l.value),0) FROM likes l WHERE l.project_id = p.id) AS like_count,
            rs.stars, rs.release_downloads
     FROM projects p JOIN users u ON u.id = p.owner_id
     LEFT JOIN repo_stats rs ON rs.project_id = p.id
     WHERE p.id = ?1 AND p.status = 'live'`,
  )
    .bind(id)
    .first<Row>();
  if (!p) notFound();

  const meta = categoryMeta(p.category);
  const g = groupOf(p.category);

  const [myVote, lineage, followRows, parent] = await Promise.all([
    user
      ? env.DB.prepare("SELECT value FROM likes WHERE user_id = ?1 AND project_id = ?2")
          .bind(user.id, p.id)
          .first<{ value: number }>()
      : Promise.resolve(null),
    getLineage(p.root_id),
    user
      ? env.DB.prepare("SELECT project_id FROM follows WHERE user_id = ?1").bind(user.id).all<{ project_id: string }>()
      : Promise.resolve({ results: [] as { project_id: string }[] }),
    p.parent_id
      ? env.DB.prepare(
          `SELECT id, CASE WHEN variant_name IS NULL THEN base_name ELSE base_name || ' // ' || variant_name END AS display
           FROM projects WHERE id = ?1`,
        )
          .bind(p.parent_id)
          .first<{ id: string; display: string }>()
      : Promise.resolve(null),
  ]);

  const following = new Set(followRows.results.map((r) => r.project_id));
  const branchCount = lineage.length - 1;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <BackLink />
        <ReportButton targetType="project" targetId={p.id} signedIn={!!user} />
      </div>

      {/* Identity */}
      <div className="flex items-start gap-4">
        <LikeButton projectId={p.id} initialCount={p.like_count} initialVote={myVote?.value ?? 0} />
        <div className="min-w-0 flex-1">
          <h1 className="font-mono text-[26px] font-bold leading-tight tracking-tight text-white">
            {p.base_name}
            {p.variant_name && (
              <>
                <span className="text-neutral-600"> // </span>
                <span className="text-neutral-200">{p.variant_name}</span>
              </>
            )}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-xs text-neutral-500">
            <Link
              href={`/u/${p.github_login}`}
              className="inline-flex items-center gap-1.5 text-neutral-300 transition hover:text-white"
            >
              {p.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.avatar_url} alt="" className="h-4 w-4 rounded-full border border-neutral-700" />
              ) : null}
              @{p.github_login}
            </Link>
            <span>·</span>
            <span>{timeAgo(p.created_at)}</span>
            <span>·</span>
            <Link href={`/s/${meta.slug}`} className={`transition hover:underline ${g.text}`}>
              {meta.kind}
            </Link>
            {parent && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <GitBranch size={11} aria-hidden /> branch of{" "}
                  <Link href={`/p/${parent.id}`} className="text-neutral-300 hover:underline">
                    {parent.display}
                  </Link>
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      <p className="mt-5 text-[17px] leading-relaxed text-neutral-200">{p.description}</p>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <ButtonLink href={`/p/${p.id}/branch`} variant="primary">
          <GitBranch size={16} aria-hidden /> Branch it
        </ButtonLink>
        {user && <FollowButton projectId={p.id} initialFollowing={following.has(p.id)} />}
        <ButtonLink href={`https://github.com/${p.github_repo}`} variant="ghost" external>
          GitHub <ExternalLink size={14} aria-hidden />
        </ButtonLink>
      </div>

      <ProjectTabs projectId={p.id} tab={tab} branchCount={branchCount} />

      {tab === "about" && (
        <div className="animate-rise">
          {p.change_summary && (
            <div className="rounded-xl border-l-2 border-emerald-400/60 bg-neutral-900/50 p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">What this branch changed</p>
              <p className="mt-1.5 text-[15px] leading-relaxed text-neutral-300">{p.change_summary}</p>
            </div>
          )}
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Branches" value={branchCount} Icon={GitBranch} />
            <Stat label="Votes" value={p.like_count} />
            {p.stars != null && <Stat label="Stars" value={p.stars} Icon={Star} />}
            {p.release_downloads ? <Stat label="Downloads" value={p.release_downloads} Icon={Download} /> : null}
          </dl>
          <p className="mt-4 font-mono text-[11px] text-neutral-600">License: {p.license}</p>
        </div>
      )}

      {tab === "install" && (
        <div className="animate-rise">
          <InstallBlock category={p.category} repo={p.github_repo} />
        </div>
      )}

      {tab === "branches" && (
        <div className="animate-rise">
          <p className="mb-3 text-sm text-neutral-400">
            {branchCount === 0
              ? "Nobody has branched this yet — you could be first."
              : `${branchCount} ${branchCount === 1 ? "person has" : "people have"} taken this and made their own version. Follow any of them to get told when they grow.`}
          </p>
          <BranchTree
            nodes={lineage}
            currentId={p.id}
            accent={accentHex(p.category)}
            following={following}
            canFollow={!!user}
          />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, Icon }: { label: string; value: number; Icon?: typeof GitBranch }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 px-3 py-2.5">
      <dt className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
        {Icon && <Icon size={11} aria-hidden />} {label}
      </dt>
      <dd className="mt-0.5 font-mono text-lg font-bold text-white tabular-nums">{value}</dd>
    </div>
  );
}
