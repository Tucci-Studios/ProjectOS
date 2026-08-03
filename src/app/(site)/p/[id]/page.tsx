import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GitBranch, ExternalLink, MessageCircle } from "lucide-react";
import { ButtonLink } from "@/components/ui";
import { GetItDialog } from "@/components/get-it-dialog";
import { ProjectComments, type ProjectComment } from "@/components/project-comments";
import { PanelToggle } from "@/components/panel-toggle";
import { ProjectUpdates, type ProjectUpdate } from "@/components/project-updates";
import { OwnerControls } from "@/components/owner-controls";
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

  const [myVote, lineage, followRows, parent, followerRow, commentRows, imageRows, badges, updateRows] = await Promise.all([
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
    env.DB.prepare(
      `SELECT pu.id, pu.version, pu.body_md, pu.created_at, u.github_login, u.avatar_url
       FROM project_updates pu JOIN users u ON u.id = pu.author_id
       WHERE pu.project_id = ?1 AND pu.status='live' ORDER BY pu.created_at DESC LIMIT 50`,
    ).bind(id).all<ProjectUpdate>(),
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
                <img src={p.avatar_url} alt="" className="h-5 w-5 rounded-full border border-neutral-700" />
              ) : (
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 font-mono text-[8px] text-neutral-400">
                  {p.github_login.slice(0, 2).toUpperCase()}
                </span>
              )}
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

      {user?.id === p.owner_id && (
        <OwnerControls
          projectId={p.id}
          initialDescription={p.description}
          initialChangeSummary={p.change_summary}
          initialImages={imageRows.results.map((r) => r.url)}
          isBranch={!!p.parent_id}
        />
      )}

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

      <div className="mt-7 border-t border-neutral-800 pt-6">
        <ProjectUpdates
          projectId={p.id}
          updates={updateRows.results}
          isOwner={user?.id === p.owner_id}
        />
      </div>

      {/* Stats strip */}
      <PanelToggle
        branchCount={branchCount}
        commentCount={commentRows.results.length}
        tree={
          <BranchTree
            nodes={lineage}
            currentId={p.id}
            accent={accentHex(p.category)}
            following={following}
            canFollow={!!user}
          />
        }
        comments={
          <ProjectComments
            projectId={p.id}
            comments={commentRows.results}
            signedIn={!!user}
            viewerLogin={user?.github_login}
          />
        }
      />

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

