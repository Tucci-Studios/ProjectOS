import Link from "next/link";
import { Compass } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { cached } from "@/lib/cache";
import {
  getProjectFeed,
  getUserVotes,
  getFollowedIds,
  getSavedIds,
  getBadgesFor,
  getWeekPulse,
  type FeedSort,
} from "@/lib/queries";
import { ProjectCard } from "@/components/project-card";
import { Strip } from "@/components/discover";
import { WeekPulse } from "@/components/week-pulse";
import { GROUPS, GROUP_ORDER, CATEGORY_META, categoryMeta, type GroupKey } from "@/lib/categories";

export const dynamic = "force-dynamic";

const PER_PAGE = 24;

const SORTS: { key: FeedSort; label: string; blurb: string }[] = [
  { key: "top", label: "Popular", blurb: "Big on GitHub and still being worked on" },
  { key: "builtOn", label: "Most built on", blurb: "Most forks per star — started from, not just starred" },
  { key: "new", label: "New", blurb: "Most recently indexed" },
  { key: "forked", label: "Most forked", blurb: "Most forked on GitHub" },
  { key: "starred", label: "Most starred", blurb: "Most starred on GitHub" },
];

type Href = (next: { sort?: FeedSort; in?: string; page?: number }) => string;

/**
 * Explore, in two modes.
 *
 * Land on it with nothing chosen and it's a set of edited rows — 462 projects
 * sorted by one column is a query result, not discovery. Pick a sort or a group
 * and it becomes the full filtered list, which is what you want once you know
 * what you're after.
 */
export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; in?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const sort: FeedSort = SORTS.some((s) => s.key === sp.sort) ? (sp.sort as FeedSort) : "top";
  const requested = sp.in ?? "";
  const page = Math.max(1, Number(sp.page) || 1);
  const meta = SORTS.find((s) => s.key === sort)!;

  const isGroup = GROUP_ORDER.includes(requested as GroupKey);
  const isSection = CATEGORY_META.some((c) => c.slug === requested);
  const active = isGroup || isSection ? requested : "";
  const openGroup = isGroup ? (active as GroupKey) : isSection ? categoryMeta(active).group : null;

  const href: Href = (next) => {
    const q = new URLSearchParams();
    const s = next.sort ?? sort;
    const f = next.in !== undefined ? next.in : active;
    if (s !== "top") q.set("sort", s);
    if (f) q.set("in", f);
    if (next.page && next.page > 1) q.set("page", String(next.page));
    const qs = q.toString();
    return qs ? `/explore?${qs}` : "/explore";
  };

  const user = await getSessionUser();

  // Nothing chosen yet — show something edited rather than everything at once.
  if (!active && sort === "top" && page === 1) {
    // Every one of these scans the projects table to return four cards, and the
    // result is identical for every visitor — so it is computed once and shared
    // rather than recomputed per request.
    const [builtOn, fresh, ai, build, play, alive, week] = await cached(
      "explore:landing",
      3600,
      async () =>
        Promise.all([
          getProjectFeed(undefined, "builtOn", { limit: 4 }),
          getProjectFeed(undefined, "new", { limit: 4 }),
          getProjectFeed("ai", "top", { limit: 4 }),
          getProjectFeed("build", "top", { limit: 4 }),
          getProjectFeed("play", "top", { limit: 4 }),
          getProjectFeed(undefined, "top", { limit: 4 }),
          getWeekPulse(),
        ]),
    );

    return (
      <div className="mx-auto w-full max-w-4xl">
        <Header total={alive.total} />
        <Sorts sort={sort} href={href} />
        <Groups active={active} openGroup={openGroup} href={href} />

        <WeekPulse week={week} />

        <Strip
          title="Most built on"
          blurb="The highest ratio of forks to stars. People don't just star these — they start from them."
          href={href({ sort: "builtOn" })}
          items={builtOn.results}
        />
        <Strip
          title="Big and still moving"
          blurb="Large on GitHub and pushed to recently, rather than large and abandoned."
          href={href({ sort: "starred" })}
          items={alive.results}
        />
        <Strip
          title="AI"
          blurb="Skills, CLAUDE.md files, MCP servers — anything that makes a model better at its job."
          href={href({ in: "ai" })}
          items={ai.results}
        />
        <Strip
          title="Build"
          blurb="Code and tools to build with."
          href={href({ in: "build" })}
          items={build.results}
        />
        <Strip title="Play" blurb="Things you run and enjoy." href={href({ in: "play" })} items={play.results} />
        <Strip
          title="Just arrived"
          blurb="Most recently pulled in from GitHub."
          href={href({ sort: "new" })}
          items={fresh.results}
        />
      </div>
    );
  }

  const [{ results, total }, votes, follows, saved] = await Promise.all([
    getProjectFeed(active || undefined, sort, {
      limit: PER_PAGE,
      offset: (page - 1) * PER_PAGE,
      viewerId: user?.id,
    }),
    getUserVotes(user?.id),
    getFollowedIds(user?.id),
    getSavedIds(user?.id),
  ]);
  const badges = await getBadgesFor(results.map((p) => p.owner_id ?? ""));

  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const where = isGroup ? GROUPS[active as GroupKey].label : isSection ? categoryMeta(active).label : null;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Header total={total} where={where} />
      <Sorts sort={sort} href={href} />
      <Groups active={active} openGroup={openGroup} href={href} />

      <div className="mt-5">
        {results.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-700 p-10 text-center text-sm text-neutral-400">
            Nothing here yet.
          </p>
        ) : (
          <div className="stagger space-y-3">
            {results.map((p) => (
              <ProjectCard
                key={p.id}
                p={p}
                vote={votes.get(p.id) ?? 0}
                following={follows.has(p.id)}
                saved={saved.has(p.id)}
                canFollow={!!user}
                badges={badges.get(p.owner_id ?? "")}
              />
            ))}
          </div>
        )}
      </div>

      {pages > 1 && (
        <nav className="mt-6 flex items-center justify-between gap-3 border-t border-neutral-800 pt-4 font-mono text-[13px]">
          {page > 1 ? (
            <Link href={href({ page: page - 1 })} className="text-neutral-300 transition hover:text-emerald-300">
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-neutral-400">
            {page} of {pages}
          </span>
          {page < pages ? (
            <Link href={href({ page: page + 1 })} className="text-neutral-300 transition hover:text-emerald-300">
              Next →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}

function Header({ total, where }: { total: number; where?: string | null }) {
  return (
    <header className="mb-4">
      <h1 className="flex items-center gap-2.5 font-mono text-2xl font-bold tracking-tight text-white">
        <Compass size={22} className="text-emerald-400" aria-hidden /> Explore
      </h1>
      <p className="mt-1.5 text-[15px] leading-relaxed text-neutral-400">
        <span className="text-neutral-200">{total.toLocaleString()}</span> project{total === 1 ? "" : "s"}
        {where && <> in {where}</>}.
      </p>
    </header>
  );
}

function Sorts({ sort, href }: { sort: FeedSort; href: Href }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-neutral-800">
      {SORTS.map(({ key, label, blurb }) => {
        const on = key === sort;
        return (
          <Link
            key={key}
            href={href({ sort: key, page: 1 })}
            aria-current={on ? "page" : undefined}
            title={blurb}
            className={`-mb-px flex min-h-[42px] shrink-0 items-center border-b-2 px-3.5 font-mono text-[13px] outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 ${
              on
                ? "border-emerald-400 font-bold text-white"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}

function Groups({ active, openGroup, href }: { active: string; openGroup: GroupKey | null; href: Href }) {
  return (
    <>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Pill href={href({ in: "", page: 1 })} on={!active}>
          Everything
        </Pill>
        {GROUP_ORDER.map((key) => (
          <Pill key={key} href={href({ in: key, page: 1 })} on={active === key}>
            {GROUPS[key].label}
          </Pill>
        ))}
      </div>

      {openGroup && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 border-l-2 border-neutral-800 pl-3">
          {CATEGORY_META.filter((c) => c.group === openGroup).map((c) => (
            <Pill key={c.slug} href={href({ in: c.slug, page: 1 })} on={active === c.slug} small>
              {c.label}
            </Pill>
          ))}
        </div>
      )}
    </>
  );
}

function Pill({
  href,
  on,
  small,
  children,
}: {
  href: string;
  on: boolean;
  small?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={on ? "page" : undefined}
      className={`flex shrink-0 items-center rounded-full border px-3 font-mono outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 ${
        small ? "min-h-[30px] text-[11px]" : "min-h-[34px] text-[12px]"
      } ${
        on
          ? "border-emerald-400 bg-emerald-400/10 font-bold text-emerald-300"
          : "border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200"
      }`}
    >
      {children}
    </Link>
  );
}
