import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { GitBranch, ArrowRight, Sparkles } from "lucide-react";
import { getLineage, getLikedIds } from "@/lib/queries";
import { getSessionUser } from "@/lib/auth";
import { CATEGORY_META, CATEGORY_GROUPS, categoryMeta, ACCENT_HEX } from "@/lib/categories";
import { MiniTree } from "@/components/mini-tree";
import { ButtonLink } from "@/components/ui";
import { ProjectCard, type ProjectFeedRow } from "@/components/project-card";

export const dynamic = "force-dynamic";

export default async function FrontPage() {
  const { env } = getCloudflareContext();
  const now = Math.floor(Date.now() / 1000);
  const user = await getSessionUser();

  const hero = await env.DB.prepare(
    `SELECT p.id, p.base_name, p.variant_name, p.category, p.description, p.root_id, u.github_login,
            (SELECT COUNT(*) FROM likes l WHERE l.project_id = p.id AND l.created_at > ?1) AS week_likes,
            (SELECT COUNT(*) FROM likes l WHERE l.project_id = p.id) AS like_count,
            (SELECT COUNT(*) FROM projects f WHERE f.parent_id = p.id AND f.status='live') AS fork_count
     FROM projects p JOIN users u ON u.id = p.owner_id
     WHERE p.status = 'live'
     ORDER BY week_likes DESC, like_count DESC LIMIT 1`,
  )
    .bind(now - 7 * 86400)
    .first<{
      id: string; base_name: string; variant_name: string | null; category: string;
      description: string; root_id: string; github_login: string;
      week_likes: number; like_count: number; fork_count: number;
    }>();

  const FEED_SQL = (order: string, extraWhere = "") =>
    `SELECT p.id, p.base_name, p.variant_name, p.category, p.description, p.parent_id, p.created_at,
            u.github_login,
            (SELECT COUNT(*) FROM likes l WHERE l.project_id = p.id) AS like_count,
            (SELECT COUNT(*) FROM projects f WHERE f.parent_id = p.id AND f.status='live') AS fork_count,
            (SELECT CASE WHEN pp.variant_name IS NULL THEN pp.base_name
                         ELSE pp.base_name || ' // ' || pp.variant_name END
             FROM projects pp WHERE pp.id = p.parent_id) AS parent_display
     FROM projects p JOIN users u ON u.id = p.owner_id
     WHERE p.status='live' ${extraWhere}
     ORDER BY ${order} LIMIT 6`;

  const [topProjects, newProjects, catCounts, heroLineage, liked] = await Promise.all([
    env.DB.prepare(FEED_SQL("like_count DESC, p.created_at DESC")).all<ProjectFeedRow>().then((r) => r.results),
    env.DB.prepare(FEED_SQL("p.created_at DESC")).all<ProjectFeedRow>().then((r) => r.results),
    env.DB.prepare(`SELECT category, COUNT(*) AS n FROM projects WHERE status='live' GROUP BY category`)
      .all<{ category: string; n: number }>()
      .then((r) => r.results),
    hero ? getLineage(hero.root_id) : Promise.resolve([]),
    getLikedIds(user?.id),
  ]);

  const countBy = new Map(catCounts.map((c) => [c.category, c.n]));
  const heroMeta = hero ? categoryMeta(hero.category) : null;
  const heroAccent = hero ? (ACCENT_HEX[hero.category] ?? "#34d399") : "#34d399";

  return (
    <div>
      {/* Hero: featured project */}
      {hero && heroMeta && (
        <section
          className="rounded-2xl border border-neutral-700 bg-neutral-900/60 p-6 sm:p-8"
          style={{ boxShadow: `0 0 60px ${heroAccent}12` }}
        >
          <p className="mb-3 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: heroAccent }}>
            <Sparkles size={13} aria-hidden /> featured project
          </p>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1">
              <h1 className="font-mono text-4xl font-bold tracking-tight text-white">
                <Link href={`/p/${hero.id}`} className="outline-none transition hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400">
                  {hero.base_name}
                  {hero.variant_name && (
                    <>
                      <span style={{ color: heroAccent }}> // </span>
                      {hero.variant_name}
                    </>
                  )}
                </Link>
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-2 font-mono text-xs text-neutral-500">
                <Link
                  href={`/s/${heroMeta.slug}`}
                  className={`rounded-md border ${heroMeta.border} bg-neutral-800/80 px-2 py-0.5 ${heroMeta.text} transition hover:bg-neutral-800`}
                >
                  {heroMeta.label}
                </Link>
                <span>by @{hero.github_login}</span>
                <span>· {hero.like_count} likes</span>
                <span>· {hero.fork_count} branch{hero.fork_count === 1 ? "" : "es"}</span>
              </p>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-neutral-300">{hero.description}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href={`/p/${hero.id}`} variant="primary">
                  open project <ArrowRight size={15} aria-hidden />
                </ButtonLink>
                <ButtonLink href={`/p/${hero.id}/branch`} variant="ghost">
                  <GitBranch size={15} aria-hidden /> branch it
                </ButtonLink>
              </div>
            </div>
            {heroLineage.length > 0 && (
              <div className="w-full shrink-0 lg:w-96">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">lineage</p>
                <MiniTree nodes={heroLineage} highlightId={hero.id} accent={heroAccent} />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Browse by section */}
      <section className="mt-10">
        <h2 className="mb-4 font-mono text-sm font-bold uppercase tracking-[0.2em] text-neutral-400">browse</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {CATEGORY_GROUPS.map((group) => (
            <div key={group}>
              <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">{group}</p>
              <div className="space-y-1.5">
                {CATEGORY_META.filter((c) => c.group === group).map((c) => (
                  <Link
                    key={c.slug}
                    href={`/s/${c.slug}`}
                    className={`flex min-h-[46px] cursor-pointer items-center justify-between gap-2 rounded-lg border ${c.border} bg-neutral-900/60 px-3.5 font-mono text-sm ${c.text} outline-none transition duration-200 hover:bg-neutral-800 hover:shadow-[0_0_16px_currentColor] focus-visible:ring-2 focus-visible:ring-emerald-400`}
                  >
                    {c.label}
                    <span className="text-xs text-neutral-500">{countBy.get(c.slug) ?? 0}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Most liked + newest */}
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-neutral-400">most liked</h2>
            <ButtonLink href="/projects" variant="subtle" className="!min-h-[36px] px-3 text-xs">
              see all <ArrowRight size={14} aria-hidden />
            </ButtonLink>
          </div>
          <div className="space-y-3">
            {topProjects.map((p) => (
              <ProjectCard key={p.id} p={p} liked={liked.has(p.id)} />
            ))}
          </div>
        </section>
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-neutral-400">just published</h2>
            <ButtonLink href="/projects?sort=new" variant="subtle" className="!min-h-[36px] px-3 text-xs">
              see all <ArrowRight size={14} aria-hidden />
            </ButtonLink>
          </div>
          <div className="space-y-3">
            {newProjects.map((p) => (
              <ProjectCard key={p.id} p={p} liked={liked.has(p.id)} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
