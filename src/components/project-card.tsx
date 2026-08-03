import Link from "next/link";
import { GitBranch } from "lucide-react";
import { groupOf, timeAgo } from "@/lib/categories";
import { LikeButton } from "./like-button";
import { FollowButton } from "./follow-button";
import { CardComments } from "./card-comments";
import { UserChip } from "./user-chip";
import type { Badges } from "./user-badges";
import { BrandMark } from "./brand";

export type ProjectFeedRow = {
  id: string;
  base_name: string;
  variant_name: string | null;
  category: string;
  description: string;
  github_login: string;
  like_count: number;
  parent_id: string | null;
  parent_display: string | null;
  fork_count: number;
  created_at: number;
  avatar_url?: string | null;
  image_url?: string | null;
  comment_count?: number;
  owner_id?: string;
  image_urls?: string | null;
};

/** Monochrome "PROJECT /" byline, then the name. The headliner. */
export function ProjectHeadline({
  baseName,
  variantName,
  size = "md",
}: {
  baseName: string;
  variantName?: string | null;
  size?: "md" | "lg";
}) {
  return (
    <span className="flex flex-wrap items-baseline gap-x-2">
      <span className="inline-flex items-center gap-1.5">
        <BrandMark size={16} className="!border-neutral-600 !bg-transparent" />
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">Project</span>
      </span>
      <span className="text-neutral-700">/</span>
      <span
        className={`font-mono font-bold tracking-tight text-white ${size === "lg" ? "text-2xl" : "text-[17px]"}`}
      >
        {baseName}
        {variantName && (
          <>
            <span className="text-neutral-600"> // </span>
            <span className="text-neutral-200">{variantName}</span>
          </>
        )}
      </span>
    </span>
  );
}

/** Minimal group symbol — AI, Build, or Play — sitting quietly on the right. */
export function GroupGlyph({ category, size = 20 }: { category: string; size?: number }) {
  const g = groupOf(category);
  return (
    <span
      title={`${g.label} — ${g.blurb}`}
      aria-label={g.label}
      className="flex shrink-0 items-center justify-center opacity-60 transition-opacity duration-200 group-hover:opacity-100"
    >
      <g.Icon size={size} strokeWidth={1.6} style={{ color: g.hex }} aria-hidden />
    </span>
  );
}

export function ProjectCard({
  p,
  vote = 0,
  following,
  canFollow = false,
  badges,
}: {
  p: ProjectFeedRow;
  vote?: number;
  following?: boolean;
  canFollow?: boolean;
  badges?: Badges;
}) {
  const fullName = p.variant_name ? `${p.base_name} // ${p.variant_name}` : p.base_name;

  return (
    <article className="group relative rounded-xl border border-neutral-700/70 bg-neutral-900/40 transition duration-200 hover:border-neutral-500 hover:bg-neutral-800/40">
      <div className="flex items-start gap-3 px-4 py-4">
        <div className="relative z-[2] flex shrink-0 self-center">
          <LikeButton projectId={p.id} initialCount={p.like_count} initialVote={vote} />
        </div>

        <div className="min-w-0 flex-1">
          <ProjectHeadline baseName={p.base_name} variantName={p.variant_name} />

          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-neutral-400">{p.description}</p>

          {(() => {
            // Up to five previews here; the project page holds the rest.
            const shots = (p.image_urls?.split("|").filter(Boolean) ?? []).slice(0, 5);
            const gallery = shots.length > 0 ? shots : p.image_url ? [p.image_url] : [];
            if (gallery.length === 0) return null;
            return (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-neutral-800 pt-3">
                {gallery.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt=""
                    loading="lazy"
                    className="h-16 w-24 rounded-lg border border-neutral-800 object-cover"
                  />
                ))}
              </div>
            );
          })()}

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-neutral-500">
            <UserChip login={p.github_login} avatarUrl={p.avatar_url} badges={badges} />
            <span>{timeAgo(p.created_at)}</span>
            <CardComments projectId={p.id} count={p.comment_count ?? 0} />
            <span
              className={`inline-flex items-center gap-1 ${p.fork_count > 0 ? "font-bold text-emerald-400" : ""}`}
              title={`${p.fork_count} branch${p.fork_count === 1 ? "" : "es"}`}
            >
              <GitBranch size={11} aria-hidden /> {p.fork_count}
            </span>
            {p.parent_display && (
              <span className="inline-flex items-center gap-1 text-neutral-600">
                branched from <span className="text-neutral-400">{p.parent_display}</span>
              </span>
            )}
          </div>
        </div>

        <div className="relative z-[2] flex shrink-0 flex-col items-end justify-between self-stretch pt-1">
          <GroupGlyph category={p.category} size={20} />
          {canFollow && (
            <FollowButton projectId={p.id} initialFollowing={!!following} iconOnly />
          )}
        </div>
      </div>

      <Link
        href={`/p/${p.id}`}
        aria-label={`Open ${fullName}`}
        className="absolute inset-0 z-[1] rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      />
    </article>
  );
}
