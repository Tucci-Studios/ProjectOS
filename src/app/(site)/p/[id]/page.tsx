import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GitBranch, ExternalLink, MessageCircle } from "lucide-react";
import { ButtonLink } from "@/components/ui";
import { GetItDialog } from "@/components/get-it-dialog";
import type { ProjectComment } from "@/components/project-comments";
import { UserBadges } from "@/components/user-badges";
import { ProjectStats } from "@/components/follow-stat";
import { ImagePreview } from "@/components/image-preview";
import { BranchTree } from "@/components/branch-tree";
import { ReportButton } from "@/components/report-button";
import { BackLink } from "@/components/back-link";
import { accentHex, categoryMeta, groupOf, timeAgo } from "@/lib/categories";
import { getSessionUser } from "@/lib/auth";
import { getLineage, getBadges } from "@/lib/queries";
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
  release_downloads: number | null;
  image_url: string | null;
  owner_id: string;
};

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  const { env } = getCloudflareContext();

  const p = await env.DB.prepare(
    `SELECT p.id, p.base_name, p.variant_name, p.category, p.description, p.license,
            p.github_repo, p.change_summary, p.parent_id, p.root_id, p.created_at,
            u.github_login, u.avatar_url,
            (SELECT COALESCE(SUM(l.value),0) FROM likes l WHERE l.project_id = p.id) AS like_count,
            rs.release_downloads, p.image_url, p.owner_id
     FROM projects p JOIN users u ON u.id = p.owner_id
     LEFT JOIN repo_stats rs ON rs.project_id = p.id
     WHERE p.id = ?1 AND p.status = 'live'`,
  )
    .bind(id)
    .first<Row>();
  if (!p) notFound();

  const meta = categoryMeta(p.category);
  const g = groupOf(p.category);

  const [myVote, lineage, followRows, parent, followerRow, commentRows, imageRows, badges] = await Promise.all([
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
    env.DB.prepare("SELECT COUNT(*) AS n FROM follows WHERE project_id = ?1").bind(id).first<{ n: number }>(),
    env.DB.prepare(
      `SELECT c.id, c.body_md, c.created_at, u.github_login, u.avatar_url
       FROM project_comments c JOIN users u ON u.id = c.author_id
       WHERE c.project_id = ?1 AND c.status='live' ORDER BY c.created_at DESC LIMIT 50`,
    ).bind(id).all<ProjectComment>(),
    env.DB.prepare("SELECT url FROM project_images WHERE project_id = ?1 ORDER BY position").bind(id).all<{ url: string }>(),
    (async () => {
      const owner = await env.DB.prepare("SELECT owner_id FROM projects WHERE id = ?1").bind(id).first<{ owner_id: string }>();
      return owner ? getBadges(owner.owner_id) : null;
    })(),
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
            {badges && <UserBadges badges={badges} />}
            <span>·</span>
            <span>{timeAgo(p.created_at)}</span>
            <span>·</span>
            <Link href={`/s/${meta.slug}`} className={`transition hover:underline ${g.text}`}>
              {meta.kind}
            </Link>
            <span>·</span>
            <ProjectStats
              projectId={p.id}
              initialFollowing={following.has(p.id)}
              initialFollowers={followerRow?.n ?? 0}
              branchCount={branchCount}
              voteCount={p.like_count}
              downloads={p.release_downloads}
              signedIn={!!user}
            />
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

        <GetItDialog category={p.category} repo={p.github_repo} />
        <ButtonLink href={`https://github.com/${p.github_repo}`} variant="ghost" external>
          GitHub <ExternalLink size={14} aria-hidden />
        </ButtonLink>
      </div>

      <ImagePreview
        images={imageRows.results.length > 0 ? imageRows.results.map((r) => r.url) : p.image_url ? [p.image_url] : []}
        alt={`Screenshot of ${p.base_name}`}
      />

      {/* What changed vs. parent — only on branches */}
      {p.change_summary && (
        <div className="mt-6 rounded-xl border-l-2 border-emerald-400/60 bg-neutral-900/50 p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">What this branch changed</p>
          <p className="mt-1.5 text-[15px] leading-relaxed text-neutral-300">{p.change_summary}</p>
        </div>
      )}

      {/* Stats strip */}
      <section className="mt-9">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
            <GitBranch size={13} aria-hidden /> The tree
            <span className="font-normal normal-case tracking-normal text-neutral-500">
              {branchCount === 0 ? "no branches yet" : `${branchCount} grew from this`}
            </span>
          </h2>
          <Link
            href={`/p/${p.id}/comments`}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-neutral-700 px-3 font-mono text-[13px] text-neutral-300 outline-none transition hover:border-emerald-400/50 hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <MessageCircle size={14} aria-hidden /> Comments {commentRows.results.length}
          </Link>
        </div>
        <BranchTree
          nodes={lineage}
          currentId={p.id}
          accent={accentHex(p.category)}
          following={following}
          canFollow={!!user}
        />
      </section>

      <p className="mt-8 font-mono text-[11px] text-neutral-600">License: {p.license}</p>
    </div>
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-9">
      <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">{title}</h2>
      {note && <p className="mt-1.5 mb-3 text-sm leading-relaxed text-neutral-500">{note}</p>}
      <div className={note ? "" : "mt-3"}>{children}</div>
    </section>
  );
}

