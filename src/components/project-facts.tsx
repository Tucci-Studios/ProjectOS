import { Clock, CircleDot, Archive } from "lucide-react";

export type Contributor = { login: string; commits: number; avatar: string | null };

const ago = (t: number | null) => {
  if (!t) return null;
  const d = Math.floor((Date.now() / 1000 - t) / 86400);
  if (d < 1) return "today";
  if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
  if (d < 365) return `${Math.floor(d / 30)} month${Math.floor(d / 30) === 1 ? "" : "s"} ago`;
  const y = Math.floor(d / 365);
  return `${y} year${y === 1 ? "" : "s"} ago`;
};

/**
 * Version, and whether anyone is still working on this.
 *
 * The two questions people ask before installing something, and the page
 * answered neither: it printed the date we indexed the project, so one
 * abandoned in 2023 read the same as one shipped yesterday. Every part of this
 * hides when it has nothing to say — roughly 40% of the catalogue has no
 * release, and a permanently blank row is worse than no row.
 */
export function ProjectFacts({
  releaseTag,
  releaseAt,
  pushedAt,
  archived,
}: {
  releaseTag: string | null;
  releaseAt: number | null;
  pushedAt: number | null;
  archived?: boolean;
}) {
  const touched = ago(pushedAt);
  const released = ago(releaseAt);
  // Six months without a commit is the point where "quiet" starts to mean
  // something a reader should weigh.
  const stale = pushedAt ? Date.now() / 1000 - pushedAt > 15552000 : false;

  if (!releaseTag && !touched && !archived) return null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[12px]">
      {releaseTag && (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-400/40 bg-emerald-400/[0.07] px-2 py-0.5 font-bold text-emerald-300">
          {releaseTag}
          {released && <span className="font-normal text-neutral-400">{released}</span>}
        </span>
      )}
      {touched && (
        <span className={`inline-flex items-center gap-1.5 ${stale ? "text-amber-200/80" : "text-neutral-400"}`}>
          <Clock size={11} className={stale ? "text-amber-400" : "text-neutral-400"} aria-hidden />
          Last commit {touched}
        </span>
      )}
      {archived && (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-700 px-2 py-0.5 text-neutral-300">
          <Archive size={10} aria-hidden /> Archived — no longer maintained
        </span>
      )}
    </div>
  );
}

/** The people who wrote it, not just the account that owns it. */
export function Contributors({ json }: { json: string | null }) {
  let people: Contributor[] = [];
  try {
    people = json ? (JSON.parse(json) as Contributor[]) : [];
  } catch {
    return null;
  }
  if (people.length < 2) return null;

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2.5">
      <span className="flex -space-x-1.5">
        {people.slice(0, 6).map((c) =>
          c.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={c.login}
              src={c.avatar}
              alt={c.login}
              title={`${c.login} — ${c.commits.toLocaleString()} commits`}
              className="h-6 w-6 rounded-full border border-neutral-800 object-cover"
            />
          ) : null,
        )}
      </span>
      <span className="font-mono text-[12px] text-neutral-400">
        built by {people.length === 6 ? "6+" : people.length} people
      </span>
    </div>
  );
}

/** Open issues, which is both a health signal and a way in for someone new. */
export function OpenIssues({ count, repo }: { count: number | null; repo: string }) {
  if (!count) return null;
  return (
    <a
      href={`https://github.com/${repo}/issues`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-baseline gap-1.5 rounded outline-none transition hover:text-sky-200 focus-visible:ring-2 focus-visible:ring-emerald-400"
    >
      <CircleDot size={13} className="self-center text-sky-400" aria-hidden />
      <span className="font-mono text-[15px] font-bold text-sky-300">{count.toLocaleString()}</span>
      <span className="font-mono text-[12px] text-neutral-400">open</span>
    </a>
  );
}
