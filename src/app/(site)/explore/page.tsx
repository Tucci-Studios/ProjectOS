import Link from "next/link";
import { Compass } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import {
  getProjectFeed,
  getUserVotes,
  getFollowedIds,
  getSavedIds,
  getBadgesFor,
  type FeedSort,
} from "@/lib/queries";
import { ProjectCard } from "@/components/project-card";
import { GROUPS, GROUP_ORDER, CATEGORY_META, categoryMeta, type GroupKey } from "@/lib/categories";

export const dynamic = "force-dynamic";

const PER_PAGE = 24;

const SORTS: { key: FeedSort; label: string; blurb: string }[] = [
  { key: "top", label: "Popular", blurb: "Voted up here, then big and still being worked on" },
  { key: "new", label: "New", blurb: "Most recently published" },
  { key: "forked", label: "Most forked", blurb: "Most forked on GitHub" },
  { key: "starred", label: "Most starred", blurb: "Most starred on GitHub" },
];

/**
 * One place to browse everything.
 *
 * Popular and Explore were the same list of projects with one difference —
 * the order — so they're one page with a sort control. The filters stack: a
 * group or section narrows what's counted, the sort decides the order, and both
 * live in the URL so any view can be linked.
 */
const WHENS: { key: string; label: string; days?: number; blurb: string }[] = [
  { key: "all", label: "Any time", blurb: "Everything, however long ago it was last touched" },
  { key: "today", label: "Today", days: 1, blurb: "Worked on in the last day" },
  { key: "week", label: "This week", days: 7, blurb: "Worked on in the last seven days" },
  { key: "month", label: "This month", days: 30, blurb: "Worked on in the last thirty days" },
];

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; in?: string; when?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const sort: FeedSort = SORTS.some((s) => s.key === sp.sort) ? (sp.sort as FeedSort) : "top";
  const requested = sp.in ?? "";
  const when = WHENS.find((w) => w.key === sp.when) ?? WHENS[0];
  const page = Math.max(1, Number(sp.page) || 1);
  const meta = SORTS.find((s) => s.key === sort)!;

  const isGroup = GROUP_ORDER.includes(requested as GroupKey);
  const isSection = CATEGORY_META.some((c) => c.slug === requested);
  const active = isGroup || isSection ? requested : "";
  const openGroup = isGroup ? (active as GroupKey) : isSection ? categoryMeta(active).group : null;

  const user = await getSessionUser();
  const [{ results, total }, votes, follows, saved] = await Promise.all([
    getProjectFeed(active || undefined, sort, {
      limit: PER_PAGE,
      offset: (page - 1) * PER_PAGE,
      viewerId: user?.id,
      sinceDays: when.days,
    }),
    getUserVotes(user?.id),
    getFollowedIds(user?.id),
    getSavedIds(user?.id),
  ]);
  const badges = await getBadgesFor(results.map((p) => p.owner_id ?? ""));

  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const href = (next: { sort?: FeedSort; in?: string; when?: string; page?: number }) => {
    const q = new URLSearchParams();
    const s = next.sort ?? sort;
    const f = next.in !== undefined ? next.in : active;
    const w = next.when ?? when.key;
    if (s !== "top") q.set("sort", s);
    if (f) q.set("in", f);
    if (w !== "all") q.set("when", w);
    if (next.page && next.page > 1) q.set("page", String(next.page));
    const qs = q.toString();
    return qs ? `/explore?${qs}` : "/explore";
  };

  const where = isGroup
    ? GROUPS[active as GroupKey].label
    : isSection
      ? categoryMeta(active).label
      : null;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <header className="mb-4">
        <h1 className="flex items-center gap-2.5 font-mono text-2xl font-bold tracking-tight text-white">
          <Compass size={22} className="text-emerald-400" aria-hidden /> Explore
        </h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-neutral-400">
          <span className="text-neutral-200">{total.toLocaleString()}</span> project{total === 1 ? "" : "s"}
          {where && <> in {where}</>}
          {when.days && <> touched in the last {when.days === 1 ? "day" : `${when.days} days`}</>}. {meta.blurb}.
        </p>
      </header>

      {/* order */}
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
                  : "border-transparent text-neutral-500 hover:text-neutral-200"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* what's included — sections appear once you pick their group */}
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

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {WHENS.map((w) => (
          <Pill key={w.key} href={href({ when: w.key, page: 1 })} on={when.key === w.key} small title={w.blurb}>
            {w.label}
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

      <div className="mt-5">
        {results.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-700 p-10 text-center text-sm text-neutral-500">
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
          <span className="text-neutral-600">
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

function Pill({
  href,
  on,
  small,
  title,
  children,
}: {
  href: string;
  on: boolean;
  small?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      title={title}
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
