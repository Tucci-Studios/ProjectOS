import Link from "next/link";
import { Search as SearchIcon, ArrowLeft, ArrowRight, Users } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getUserVotes, getFollowedIds, getBadgesFor } from "@/lib/queries";
import { searchProjects, searchPosts, searchPeople } from "@/lib/search";
import { ProjectCard } from "@/components/project-card";
import { PageHeader } from "@/components/page-header";
import { UserChip } from "@/components/user-chip";
import { timeAgo } from "@/lib/categories";

export const dynamic = "force-dynamic";

const PER_PAGE = 10;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const query = (q ?? "").trim().slice(0, 80);
  const page = Math.max(1, Number(pageParam) || 1);
  const user = await getSessionUser();

  if (!query) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader crumbs={[{ label: "Search" }]} title="Search" purpose="Find projects, posts, and people." Icon={SearchIcon} />
        <p className="rounded-xl border border-dashed border-neutral-700 p-10 text-center text-sm text-neutral-500">
          Type something in the search box up top.
        </p>
      </div>
    );
  }

  const [{ results: projects, total }, posts, people, votes, follows] = await Promise.all([
    searchProjects(query, { limit: PER_PAGE, offset: (page - 1) * PER_PAGE }),
    page === 1 ? searchPosts(query) : Promise.resolve([]),
    page === 1 ? searchPeople(query) : Promise.resolve([]),
    getUserVotes(user?.id),
    getFollowedIds(user?.id),
  ]);
  const badges = await getBadgesFor(projects.map((p) => p.owner_id ?? ""));

  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const nothing = total === 0 && posts.length === 0 && people.length === 0;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        crumbs={[{ label: "Search" }]}
        title={`“${query}”`}
        purpose={
          nothing
            ? "Nothing matched."
            : `${total} project${total === 1 ? "" : "s"}${posts.length ? `, ${posts.length} post${posts.length === 1 ? "" : "s"}` : ""}${people.length ? `, ${people.length} ${people.length === 1 ? "person" : "people"}` : ""}.`
        }
        Icon={SearchIcon}
      />

      {nothing && (
        <div className="rounded-xl border border-dashed border-neutral-700 p-10 text-center">
          <p className="font-mono text-base font-bold text-white">No matches</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-400">
            Try fewer words, or browse a section from the sidebar. If nobody&apos;s built it yet, that&apos;s a good
            reason to build it.
          </p>
        </div>
      )}

      {people.length > 0 && (
        <section className="mb-7">
          <h2 className="mb-2.5 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
            <Users size={13} aria-hidden /> People
          </h2>
          <div className="flex flex-wrap gap-2">
            {people.map((p) => (
              <span key={p.id} className="rounded-lg border border-neutral-700 bg-neutral-900/40 px-3 py-2">
                <UserChip login={p.github_login} avatarUrl={p.avatar_url} />
              </span>
            ))}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section className="mb-7">
          <h2 className="mb-2.5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">Projects</h2>
          <div className="space-y-3">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                p={p}
                vote={votes.get(p.id) ?? 0}
                following={follows.has(p.id)}
                canFollow={!!user}
                badges={badges.get(p.owner_id ?? "")}
              />
            ))}
          </div>

          {pages > 1 && (
            <nav className="mt-5 flex items-center justify-between" aria-label="Pagination">
              <PageLink q={query} page={page - 1} disabled={page === 1}>
                <ArrowLeft size={14} aria-hidden /> Previous
              </PageLink>
              <span className="font-mono text-xs text-neutral-500">
                Page {page} of {pages}
              </span>
              <PageLink q={query} page={page + 1} disabled={page >= pages}>
                Next <ArrowRight size={14} aria-hidden />
              </PageLink>
            </nav>
          )}
        </section>
      )}

      {posts.length > 0 && (
        <section>
          <h2 className="mb-2.5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">Posts</h2>
          <div className="space-y-2">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/wire/${post.id}`}
                className="block rounded-xl border border-neutral-700/70 bg-neutral-900/40 p-3.5 transition hover:border-neutral-500 hover:bg-neutral-800/40"
              >
                <span className="block font-mono text-sm text-neutral-200">{post.title ?? "(untitled)"}</span>
                <span className="font-mono text-[11px] text-neutral-500">
                  {post.kind} · @{post.github_login} · {timeAgo(post.created_at)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function PageLink({
  q,
  page,
  disabled,
  children,
}: {
  q: string;
  page: number;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled)
    return (
      <span className="inline-flex min-h-[36px] cursor-not-allowed items-center gap-1.5 rounded-lg border border-neutral-800 px-3 font-mono text-[13px] text-neutral-700">
        {children}
      </span>
    );
  return (
    <Link
      href={`/search?q=${encodeURIComponent(q)}&page=${page}`}
      className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-neutral-700 px-3 font-mono text-[13px] text-neutral-300 transition hover:border-emerald-400/50 hover:text-emerald-300"
    >
      {children}
    </Link>
  );
}
