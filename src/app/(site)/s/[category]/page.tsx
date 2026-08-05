import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Boxes, BookOpen, HelpCircle, Plus, ArrowLeft, ArrowRight } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getProjectFeed, getUserVotes, getFollowedIds, getBadgesFor, type FeedSort , getSavedIds } from "@/lib/queries";
import { ProjectCard } from "@/components/project-card";
import { PageHeader } from "@/components/page-header";
import { SectionMark } from "@/components/section-mark";
import { SortTabs } from "@/components/sort-tabs";
import { ButtonLink } from "@/components/ui";
import { CATEGORY_META, categoryMeta, groupOf, timeAgo } from "@/lib/categories";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const meta = CATEGORY_META.find((c) => c.slug === category);
  if (!meta) return { title: "Project OS" };
  const title = `${meta.label} — open-source projects on Project OS`;
  return {
    title,
    description: meta.use,
    alternates: { canonical: `${siteUrl()}/s/${category}` },
    openGraph: { title, description: meta.use },
  };
}

const PER_PAGE = 15;

// One plain-English line per section, so a newcomer knows what belongs here.
const SECTION_PURPOSE: Record<string, string> = {
  "claude-code": "Full projects built with Claude Code — clone one and keep building where someone else left off.",
  "claude-skills": "Drop-in skills that teach Claude a new trick. Install one into your ~/.claude/skills folder in seconds.",
  "claude-md": "CLAUDE.md files — the instructions that shape how Claude works on your project. Steal a good one.",
  codex: "Projects, configs, and prompt setups built around Codex.",
  grok: "Projects built on Grok and the xAI API.",
  "local-llms": "Everything for models you run on your own machine — stacks, UIs, and tooling.",
  "mcp-servers": "MCP servers connect Claude to your tools and data. Add one with a single command.",
  apps: "Desktop and mobile apps you build from source. No binaries hosted here.",
  games: "Games to play, read, and fork into your own version.",
  "scripts-tools": "Small scripts and command-line tools that do one thing well.",
};

type PostRow = {
  id: string;
  title: string | null;
  body_md: string;
  kind: string;
  created_at: number;
  github_login: string;
  comment_count: number;
};

async function getSectionPosts(category: string, kind: "tutorial" | "request"): Promise<PostRow[]> {
  const { env } = getCloudflareContext();
  const { results } = await env.DB.prepare(
    `SELECT po.id, po.title, po.body_md, po.kind, po.created_at, u.github_login,
            (SELECT COUNT(*) FROM comments c WHERE c.post_id = po.id AND c.status = 'live') AS comment_count
     FROM posts po JOIN users u ON u.id = po.author_id
     WHERE po.status = 'live' AND po.category = ?1 AND po.kind = ?2
     ORDER BY po.created_at DESC`,
  )
    .bind(category, kind)
    .all<PostRow>();
  return results;
}

export default async function SectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ tab?: string; sort?: string; page?: string }>;
}) {
  const { category } = await params;
  const { tab: tabParam, sort: sortParam, page: pageParam } = await searchParams;
  if (!CATEGORY_META.some((c) => c.slug === category)) notFound();

  const meta = categoryMeta(category);
  const g = groupOf(category);
  const tab = tabParam === "tutorials" ? "tutorials" : tabParam === "help" ? "help" : "projects";
  const sort = (["top", "new", "forked", "followed"].includes(sortParam ?? "") ? sortParam : "top") as FeedSort;
  const page = Math.max(1, Number(pageParam) || 1);

  const user = await getSessionUser();

  // Counts sit on the tabs so it's obvious what's actually in each one.
  const { env } = getCloudflareContext();
  const counts = await env.DB.prepare(
    `SELECT
      (SELECT COUNT(*) FROM projects WHERE category = ?1 AND status='live') AS projects,
      (SELECT COUNT(*) FROM posts WHERE category = ?1 AND kind='tutorial' AND status='live') AS tutorials,
      (SELECT COUNT(*) FROM posts WHERE category = ?1 AND kind='request' AND status='live') AS help`,
  )
    .bind(category)
    .first<{ projects: number; tutorials: number; help: number }>();

  const TABS = [
    { key: "projects", label: "Projects", Icon: Boxes, count: counts?.projects ?? 0, blurb: SECTION_PURPOSE[category] },
    {
      key: "tutorials",
      label: "Tutorials",
      Icon: BookOpen,
      count: counts?.tutorials ?? 0,
      blurb: `How-to guides for ${meta.label}, written by people who figured it out.`,
    },
    {
      key: "help",
      label: "Help wanted",
      Icon: HelpCircle,
      count: counts?.help ?? 0,
      blurb: `People stuck on ${meta.label} things. Answer one by writing a tutorial.`,
    },
  ] as const;
  const activeTab = TABS.find((t) => t.key === tab)!;

  let content: React.ReactNode;
  let pager: React.ReactNode = null;

  if (tab === "projects") {
    const [{ results: feed, total }, votes, follows, savedIds] = await Promise.all([
      getProjectFeed(category, sort, { limit: PER_PAGE, offset: (page - 1) * PER_PAGE, viewerId: user?.id }),
      getUserVotes(user?.id),
      getFollowedIds(user?.id),
      getSavedIds(user?.id),
    ]);
    const badges = await getBadgesFor(feed.map((p) => p.owner_id ?? ""));
    const pages = Math.max(1, Math.ceil(total / PER_PAGE));

    content =
      feed.length === 0 ? (
        <Empty
          title={`No ${meta.label} yet`}
          body="Publish the first one — it'll be the whole section until someone forks it."
          cta={{ href: user ? "/submit" : "/login", label: "Publish here" }}
        />
      ) : (
        <div className="space-y-3">
          {feed.map((p) => (
            <ProjectCard
              key={p.id}
              p={p}
              vote={votes.get(p.id) ?? 0}
              following={follows.has(p.id)} saved={savedIds.has(p.id)}
              canFollow={!!user}
              badges={badges.get(p.owner_id ?? "")}
            />
          ))}
        </div>
      );

    if (pages > 1) {
      const link = (n: number) => `/s/${category}?tab=projects&sort=${sort}&page=${n}`;
      pager = (
        <nav className="mt-5 flex items-center justify-between" aria-label="Pagination">
          <Pager href={link(page - 1)} disabled={page === 1}>
            <ArrowLeft size={14} aria-hidden /> Previous
          </Pager>
          <span className="font-mono text-xs text-neutral-400">
            Page {page} of {pages} · {total} total
          </span>
          <Pager href={link(page + 1)} disabled={page >= pages}>
            Next <ArrowRight size={14} aria-hidden />
          </Pager>
        </nav>
      );
    }
  } else {
    const kind = tab === "tutorials" ? "tutorial" : "request";
    const posts = await getSectionPosts(category, kind);
    content =
      posts.length === 0 ? (
        <Empty
          title={tab === "tutorials" ? "No tutorials yet" : "Nobody's asked for help yet"}
          body={
            tab === "tutorials"
              ? "Know this stuff? Write the first guide — it's the fastest way to get known here."
              : "Stuck on something? Ask, and someone (or someone's AI) will write it up."
          }
          cta={{
            href: user ? `/wire/new?kind=${kind}&category=${category}` : "/login",
            label: tab === "tutorials" ? "Write a tutorial" : "Ask for help",
          }}
        />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-xl border border-neutral-700/70 bg-neutral-900/40 p-4 transition hover:border-neutral-500 hover:bg-neutral-800/40"
            >
              <Link
                href={`/wire/${post.id}`}
                className="font-mono text-base font-bold tracking-tight text-white transition hover:text-emerald-300"
              >
                {post.title ?? "(untitled)"}
              </Link>
              <p className="mt-1 font-mono text-[11px] text-neutral-400">
                @{post.github_login} · {timeAgo(post.created_at)} · {post.comment_count} comment
                {post.comment_count === 1 ? "" : "s"}
              </p>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-400">{post.body_md}</p>
            </article>
          ))}
        </div>
      );
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader
        crumbs={[{ label: "Explore", href: "/explore" }, { label: g.label }, { label: meta.label }]}
        title={meta.label}
        purpose={activeTab.blurb ?? `Everything published under ${meta.label}.`}
        accent={g.text}
        glyph={<SectionMark category={category} size={24} color={g.hex} />}
        action={
          tab !== "projects" ? (
            <ButtonLink
              href={user ? `/wire/new?kind=${tab === "tutorials" ? "tutorial" : "request"}&category=${category}` : "/login"}
              variant="outline"
            >
              <Plus size={15} aria-hidden /> {tab === "tutorials" ? "Write a tutorial" : "Ask for help"}
            </ButtonLink>
          ) : undefined
        }
      />

      {/* Tabs carry counts so you can tell what's actually in them */}
      <div className="mb-4 flex flex-wrap gap-1 border-b border-neutral-800">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <Link
              key={t.key}
              href={t.key === "projects" ? `/s/${category}` : `/s/${category}?tab=${t.key}`}
              aria-current={active ? "page" : undefined}
              className={`relative -mb-px flex min-h-[42px] items-center gap-2 px-3.5 font-mono text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                active ? "text-white" : "text-neutral-400 hover:text-neutral-300"
              }`}
            >
              <t.Icon size={14} aria-hidden />
              {t.label}
              <span
                className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] ${
                  active ? "bg-neutral-800 text-neutral-300" : "text-neutral-400"
                }`}
              >
                {t.count}
              </span>
              {active && <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-t bg-emerald-400" aria-hidden />}
            </Link>
          );
        })}
      </div>

      {tab === "projects" && (
        <div className="mb-4">
          <SortTabs basePath={`/s/${category}?tab=projects`} sort={sort} />
        </div>
      )}

      {content}
      {pager}
    </div>
  );
}

function Pager({ href, disabled, children }: { href: string; disabled: boolean; children: React.ReactNode }) {
  if (disabled)
    return (
      <span className="inline-flex min-h-[36px] cursor-not-allowed items-center gap-1.5 rounded-lg border border-neutral-800 px-3 font-mono text-[13px] text-neutral-700">
        {children}
      </span>
    );
  return (
    <Link
      href={href}
      className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-neutral-700 px-3 font-mono text-[13px] text-neutral-300 transition hover:border-emerald-400/50 hover:text-emerald-300"
    >
      {children}
    </Link>
  );
}

function Empty({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-700 p-10 text-center">
      <p className="font-mono text-base font-bold text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-400">{body}</p>
      <div className="mt-5 flex justify-center">
        <ButtonLink href={cta.href} variant="primary">
          {cta.label}
        </ButtonLink>
      </div>
    </div>
  );
}
