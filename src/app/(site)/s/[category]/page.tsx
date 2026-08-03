import Link from "next/link";
import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getSessionUser } from "@/lib/auth";
import { getProjectFeed, getUserVotes } from "@/lib/queries";
import { ProjectCard } from "@/components/project-card";
import { Boxes } from "lucide-react";
import { CATEGORY_META, categoryMeta, groupOf, timeAgo } from "@/lib/categories";
import { PageHeader } from "@/components/page-header";

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
  games: "Games to play, read, and branch into your own version.",
  "scripts-tools": "Small scripts and command-line tools that do one thing well.",
};

export const dynamic = "force-dynamic";

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
  searchParams: Promise<{ tab?: string }>;
}) {
  const { category } = await params;
  const { tab: tabParam } = await searchParams;
  if (!CATEGORY_META.some((c) => c.slug === category)) notFound();
  const meta = categoryMeta(category);
  const g = groupOf(category);
  const tab = tabParam === "tutorials" ? "tutorials" : tabParam === "requests" ? "requests" : "projects";

  const user = await getSessionUser();

  const tabLink = (key: string, label: string) => (
    <Link
      href={key === "projects" ? `/s/${category}` : `/s/${category}?tab=${key}`}
      className={`rounded-lg px-4 py-1.5 font-mono text-sm transition ${
        tab === key
          ? `bg-neutral-800 ${g.text} shadow-[0_0_12px_rgba(255,255,255,0.05)]`
          : "text-neutral-500 hover:text-neutral-300"
      }`}
    >
      {label}
    </Link>
  );

  let content: React.ReactNode;
  if (tab === "projects") {
    const [feed, votes] = await Promise.all([getProjectFeed(category, "top"), getUserVotes(user?.id)]);
    content =
      feed.length === 0 ? (
        <Empty text="Nothing here yet. Be the first — hit + publish." />
      ) : (
        <div className="space-y-3">
          {feed.map((p) => (
            <ProjectCard key={p.id} p={p} vote={votes.get(p.id) ?? 0} />
          ))}
        </div>
      );
  } else {
    const kind = tab === "tutorials" ? "tutorial" : "request";
    const posts = await getSectionPosts(category, kind);
    const cta =
      tab === "tutorials" ? (
        <Link
          href={`/wire/new?kind=tutorial&category=${category}`}
          className="rounded-lg border border-amber-400/40 px-4 py-2 font-mono text-sm text-amber-400 transition hover:bg-amber-400/10"
        >
          + write a tutorial
        </Link>
      ) : (
        <Link
          href={`/wire/new?kind=request&category=${category}`}
          className="rounded-lg border border-violet-400/40 px-4 py-2 font-mono text-sm text-violet-400 transition hover:bg-violet-400/10"
        >
          + request a tutorial
        </Link>
      );
    content = (
      <div>
        <div className="mb-4 flex justify-end">{cta}</div>
        {posts.length === 0 ? (
          <Empty
            text={
              tab === "tutorials"
                ? "No tutorials yet. Know this stuff? Write the first one — or check requests."
                : "No requests yet. Stuck on something? Ask and someone (or someone's AI) will build it."
            }
          />
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="rounded-xl border border-neutral-700 bg-neutral-900/60 p-4 transition hover:border-emerald-400/40 hover:bg-neutral-800/40"
              >
                <Link href={`/wire/${post.id}`} className="font-mono text-lg font-bold tracking-tight text-white transition hover:text-emerald-400">
                  {post.title ?? "(untitled)"}
                </Link>
                <p className="mt-1 font-mono text-xs text-neutral-500">
                  by <span className="text-neutral-400">@{post.github_login}</span> · {timeAgo(post.created_at)} ·{" "}
                  {post.comment_count} comment{post.comment_count === 1 ? "" : "s"}
                </p>
                <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-neutral-300">{post.body_md}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    );
  }

  const TAB_PURPOSE: Record<string, string> = {
    projects: SECTION_PURPOSE[category] ?? `Everything published under ${meta.label}.`,
    tutorials: `Step-by-step guides for ${meta.label}, written by the community.`,
    requests: `People stuck on ${meta.label} things. Answer one by writing a tutorial.`,
  };

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Projects", href: "/popular" },
          { label: g.label },
          { label: meta.label },
        ]}
        title={meta.label}
        purpose={TAB_PURPOSE[tab]}
        accent={g.text}
        Icon={Boxes}
      />
      <div className="mb-5 inline-flex gap-1 rounded-lg border border-neutral-700 bg-neutral-900/60 p-1">
        {tabLink("projects", "Projects")}
        {tabLink("tutorials", "Tutorials")}
        {tabLink("requests", "Help wanted")}
      </div>
      {content}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-neutral-700 p-10 text-center font-mono text-sm text-neutral-500">
      {text}
    </p>
  );
}
