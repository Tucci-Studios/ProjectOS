import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { GitFork, ArrowRight, MessageSquarePlus } from "lucide-react";
import { getLineage } from "@/lib/queries";
import { CATEGORY_META, categoryMeta } from "@/lib/categories";
import { MiniTree } from "@/components/mini-tree";
import { ButtonLink } from "@/components/ui";

export const dynamic = "force-dynamic";

const SITE_EPOCH = 1785974400; // 2026-08-02 — week 1 starts here (honest dateline)

const ACCENT_HEX: Record<string, string> = {
  "claude-code": "#22d3ee",
  "claude-skills": "#e879f9",
  "claude-md": "#fbbf24",
  "mcp-servers": "#34d399",
  codex: "#38bdf8",
  "local-llms": "#a78bfa",
  "scripts-tools": "#a3e635",
  games: "#fb7185",
};

type TopRow = {
  id: string;
  base_name: string;
  variant_name: string | null;
  category: string;
  like_count: number;
  fork_count: number;
  prev_rank: number | null;
};

export default async function FrontPage() {
  const { env } = getCloudflareContext();
  const now = Math.floor(Date.now() / 1000);
  const week = Math.max(1, Math.floor((now - SITE_EPOCH) / (7 * 86400)) + 1);
  const dateline = new Date(now * 1000).toISOString().slice(0, 10).replaceAll("-", ".");

  // Project of the week: most likes in the last 7 days, tie-break total likes.
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

  const [top, tutorials, requests, freshForks, feedPosts, catCounts, heroLineage] = await Promise.all([
    env.DB.prepare(
      `SELECT p.id, p.base_name, p.variant_name, p.category,
              (SELECT COUNT(*) FROM likes l WHERE l.project_id = p.id) AS like_count,
              (SELECT COUNT(*) FROM projects f WHERE f.parent_id = p.id AND f.status='live') AS fork_count,
              (SELECT rs.rank FROM rank_snapshots rs WHERE rs.project_id = p.id AND rs.week = ?1) AS prev_rank
       FROM projects p WHERE p.status = 'live'
       ORDER BY like_count DESC, p.created_at ASC LIMIT 10`,
    ).bind(week - 1).all<TopRow>().then((r) => r.results),
    env.DB.prepare(
      `SELECT po.id, po.title, po.category FROM posts po
       WHERE po.status='live' AND po.kind='tutorial' ORDER BY po.created_at DESC LIMIT 5`,
    ).all<{ id: string; title: string; category: string | null }>().then((r) => r.results),
    env.DB.prepare(
      `SELECT po.id, po.title, po.category FROM posts po
       WHERE po.status='live' AND po.kind='request' ORDER BY po.created_at DESC LIMIT 4`,
    ).all<{ id: string; title: string; category: string | null }>().then((r) => r.results),
    env.DB.prepare(
      `SELECT p.id, p.base_name, p.variant_name, u.github_login
       FROM projects p JOIN users u ON u.id = p.owner_id
       WHERE p.status='live' AND p.parent_id IS NOT NULL
       ORDER BY p.created_at DESC LIMIT 5`,
    ).all<{ id: string; base_name: string; variant_name: string | null; github_login: string }>().then((r) => r.results),
    env.DB.prepare(
      `SELECT po.id, po.title FROM posts po
       WHERE po.status='live' AND po.kind='post' ORDER BY po.created_at DESC LIMIT 3`,
    ).all<{ id: string; title: string }>().then((r) => r.results),
    env.DB.prepare(
      `SELECT category, COUNT(*) AS n FROM projects WHERE status='live' GROUP BY category`,
    ).all<{ category: string; n: number }>().then((r) => r.results),
    hero ? getLineage(hero.root_id) : Promise.resolve([]),
  ]);

  const countBy = new Map(catCounts.map((c) => [c.category, c.n]));
  const heroMeta = hero ? categoryMeta(hero.category) : null;

  return (
    <div>
      {/* Dateline */}
      <p className="mb-6 border-b border-neutral-700 pb-3 font-mono text-xs tracking-[0.25em] text-neutral-500">
        PROJECT_OS <span className="text-emerald-400">//</span> WEEK {String(week).padStart(2, "0")}{" "}
        <span className="text-emerald-400">//</span> {dateline}
        <span className="float-right hidden text-neutral-500 sm:inline">THE OPERATING SYSTEM FOR OPEN SOURCE</span>
      </p>

      {/* Hero: Project of the Week */}
      {hero && heroMeta && (
        <section
          className="mb-8 rounded-2xl border border-neutral-700 bg-neutral-900/60 p-6 sm:p-8"
          style={{ boxShadow: `0 0 60px ${ACCENT_HEX[hero.category] ?? "#34d399"}12` }}
        >
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: ACCENT_HEX[hero.category] }}>
            ★ project of the week
          </p>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1">
              <h1 className="font-mono text-4xl font-bold tracking-tight text-white">
                <Link href={`/p/${hero.id}`} className="transition hover:text-emerald-400">
                  {hero.base_name}
                  {hero.variant_name && (
                    <>
                      <span style={{ color: ACCENT_HEX[hero.category] }}> // </span>
                      {hero.variant_name}
                    </>
                  )}
                </Link>
              </h1>
              <p className="mt-2 font-mono text-xs text-neutral-500">
                <Link href={`/s/${heroMeta.slug}`} className={heroMeta.text}>
                  {heroMeta.label}
                </Link>{" "}
                · by @{hero.github_login} · ♥ {hero.like_count} · ⑂ {hero.fork_count} remix{hero.fork_count === 1 ? "" : "es"}
              </p>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-neutral-300">{hero.description}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/p/${hero.id}/remix`}
                  className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg px-5 font-mono text-sm font-bold text-black outline-none transition duration-200 hover:brightness-110 hover:shadow-[0_0_24px_rgba(52,211,153,0.3)] focus-visible:ring-2 focus-visible:ring-white"
                  style={{ backgroundColor: ACCENT_HEX[hero.category] }}
                >
                  <GitFork size={16} aria-hidden /> REMIX THIS
                </Link>
                <ButtonLink href={`/p/${hero.id}`} variant="ghost">
                  view project <ArrowRight size={15} aria-hidden />
                </ButtonLink>
              </div>
            </div>
            {heroLineage.length > 0 && (
              <div className="w-full shrink-0 lg:w-96">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">lineage</p>
                <MiniTree nodes={heroLineage} highlightId={hero.id} accent={ACCENT_HEX[hero.category]} />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Editorial band: three columns */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr_1fr]">
        {/* Column 1: Top 10 */}
        <section className="rounded-2xl border border-neutral-700 bg-neutral-900/60 p-5">
          <h2 className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">
            top 10 // all categories
          </h2>
          <ol className="divide-y divide-neutral-800">
            {top.map((p, i) => {
              const meta = categoryMeta(p.category);
              const move = p.prev_rank == null ? null : p.prev_rank - (i + 1);
              return (
                <li key={p.id} className="flex items-center gap-3 py-2.5">
                  <span className={`w-7 shrink-0 text-right font-mono text-base font-bold ${i === 0 ? "text-emerald-400" : i < 3 ? "text-neutral-200" : "text-neutral-500"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="w-10 shrink-0 text-center font-mono text-[11px]">
                    {move == null ? (
                      <span className="text-neutral-500">♥{p.like_count}</span>
                    ) : move > 0 ? (
                      <span className="text-emerald-400">▲{move}</span>
                    ) : move < 0 ? (
                      <span className="text-rose-400">▼{-move}</span>
                    ) : (
                      <span className="text-neutral-500">—</span>
                    )}
                  </span>
                  <Link href={`/p/${p.id}`} className="min-w-0 flex-1 truncate font-mono text-sm text-neutral-200 transition hover:text-emerald-400">
                    {p.base_name}
                    {p.variant_name && <span className="text-neutral-500"> // {p.variant_name}</span>}
                  </Link>
                  <span className={`shrink-0 font-mono text-[10px] ${meta.text}`}>{meta.label}</span>
                </li>
              );
            })}
          </ol>
          <div className="mt-3">
            <ButtonLink href="/projects" variant="subtle" className="w-full">
              full rankings <ArrowRight size={15} aria-hidden />
            </ButtonLink>
          </div>
        </section>

        {/* Column 2: Tutorials + Requests */}
        <section className="rounded-2xl border border-neutral-700 bg-neutral-900/60 p-5">
          <h2 className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.25em] text-amber-400">tutorials</h2>
          {tutorials.length === 0 ? (
            <p className="font-mono text-xs text-neutral-500">none yet — write the first one</p>
          ) : (
            <ul className="space-y-3">
              {tutorials.map((t) => (
                <li key={t.id}>
                  <Link href={`/wire/${t.id}`} className="block text-sm leading-snug text-neutral-200 transition hover:text-amber-400">
                    {t.title}
                  </Link>
                  {t.category && <span className={`font-mono text-[10px] ${categoryMeta(t.category).text}`}>{categoryMeta(t.category).label}</span>}
                </li>
              ))}
            </ul>
          )}
          <h2 className="mt-6 mb-3 font-mono text-xs font-bold uppercase tracking-[0.25em] text-violet-400">open requests</h2>
          {requests.length === 0 ? (
            <p className="font-mono text-xs text-neutral-500">nothing requested yet</p>
          ) : (
            <ul className="space-y-3">
              {requests.map((r) => (
                <li key={r.id}>
                  <Link href={`/wire/${r.id}`} className="block text-sm leading-snug text-neutral-300 transition hover:text-violet-400">
                    {r.title}
                  </Link>
                  {r.category && <span className={`font-mono text-[10px] ${categoryMeta(r.category).text}`}>{categoryMeta(r.category).label}</span>}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4">
            <ButtonLink
              href="/wire/new?kind=request"
              variant="subtle"
              className="w-full border-violet-400/40 text-violet-400 hover:bg-violet-400/10 hover:text-violet-300"
            >
              <MessageSquarePlus size={15} aria-hidden /> request a tutorial
            </ButtonLink>
          </div>
        </section>

        {/* Column 3: Fresh remixes + from the feed */}
        <section className="rounded-2xl border border-neutral-700 bg-neutral-900/60 p-5">
          <h2 className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">fresh remixes</h2>
          {freshForks.length === 0 ? (
            <p className="font-mono text-xs text-neutral-500">no remixes yet — start a lineage</p>
          ) : (
            <ul className="space-y-3">
              {freshForks.map((f) => (
                <li key={f.id}>
                  <Link href={`/p/${f.id}`} className="block font-mono text-sm text-neutral-200 transition hover:text-emerald-400">
                    {f.base_name}
                    <span className="text-emerald-400"> // </span>
                    {f.variant_name}
                  </Link>
                  <span className="font-mono text-[10px] text-neutral-500">by @{f.github_login}</span>
                </li>
              ))}
            </ul>
          )}
          <h2 className="mt-6 mb-3 font-mono text-xs font-bold uppercase tracking-[0.25em] text-neutral-400">from the feed</h2>
          <ul className="space-y-3">
            {feedPosts.map((post) => (
              <li key={post.id}>
                <Link href={`/wire/${post.id}`} className="block text-sm leading-snug text-neutral-300 transition hover:text-white">
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <ButtonLink href="/wire" variant="subtle" className="w-full">
              open the feed <ArrowRight size={15} aria-hidden />
            </ButtonLink>
          </div>
        </section>
      </div>

      {/* Category strip */}
      <div className="mt-8 flex flex-wrap gap-2">
        {CATEGORY_META.map((c) => (
          <Link
            key={c.slug}
            href={`/s/${c.slug}`}
            className={`inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-lg border ${c.border} bg-neutral-900/60 px-3 font-mono text-xs ${c.text} outline-none transition duration-200 hover:bg-neutral-800 hover:shadow-[0_0_12px_currentColor] focus-visible:ring-2 focus-visible:ring-emerald-400`}
          >
            {c.label} <span className="text-neutral-500">{countBy.get(c.slug) ?? 0}</span>
          </Link>
        ))}
      </div>

      {/* Remix Wars footer */}
      <Link
        href="/remix-wars"
        className="mt-8 block rounded-2xl border border-rose-400/30 bg-neutral-900/60 p-5 text-center transition hover:border-rose-400/60 hover:shadow-[0_0_30px_rgba(251,113,133,0.1)]"
      >
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-rose-400">remix wars — coming at launch</p>
        <p className="mt-1 font-mono text-sm text-neutral-400">
          7 days. one starter project. most-liked remix wears the crown <span className="text-amber-400">♛</span> forever.
        </p>
      </Link>
    </div>
  );
}
