"use client";

import { useEffect, useState } from "react";
import { Star, GitFork, Clock, Tag, CircleDot, Archive, Loader2, Download, ExternalLink } from "lucide-react";

type Data = {
  project: {
    base_name: string;
    github_repo: string;
    stars: number;
    github_forks: number;
    language: string | null;
    pushed_at: number | null;
    license: string;
    archived: number;
  };
  topics: string[];
  openIssues: number | null;
  createdAt: string | null;
  release: { tag: string; name: string | null; at: string | null } | null;
  contributors: { login: string; commits: number; avatar: string | null }[];
  languages: Record<string, number>;
};

const ago = (t: number | null) => {
  if (!t) return "unknown";
  const d = Math.floor((Date.now() / 1000 - t) / 86400);
  if (d < 1) return "today";
  if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
  if (d < 365) return `${Math.floor(d / 30)} month${Math.floor(d / 30) === 1 ? "" : "s"} ago`;
  const y = Math.floor(d / 365);
  return `${y} year${y === 1 ? "" : "s"} ago`;
};

const OPTIONS = [
  { key: "version", label: "Version" },
  { key: "updated", label: "Last commit" },
  { key: "topics", label: "Topics" },
  { key: "people", label: "Contributors" },
  { key: "issues", label: "Open issues" },
] as const;

type Key = (typeof OPTIONS)[number]["key"];

/**
 * The proposals shown where they'd actually live.
 *
 * The first version of this was seven labelled boxes explaining my reasoning,
 * which is a design document rather than something anyone can judge. This is
 * the project page itself — today's on the left, the proposal on the right,
 * additions outlined — with a switch per row so you can turn each one off and
 * see whether the page is worse without it.
 */
export function ProjectExtras({ projectId }: { projectId: string }) {
  const [d, setD] = useState<Data | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const [on, setOn] = useState<Set<Key>>(new Set(OPTIONS.map((o) => o.key)));

  useEffect(() => {
    fetch(`/api/lab-preview?projectId=${encodeURIComponent(projectId)}`)
      .then((r) => (r.ok ? (r.json() as Promise<Data>) : Promise.reject()))
      .then((data) => {
        setD(data);
        setState("ready");
      })
      .catch(() => setState("failed"));
  }, [projectId]);

  const toggle = (k: Key) =>
    setOn((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  if (state === "loading")
    return (
      <p className="flex items-center gap-2 py-10 font-mono text-[13px] text-neutral-400">
        <Loader2 size={14} className="animate-spin" aria-hidden /> Asking GitHub...
      </p>
    );
  if (state === "failed" || !d)
    return (
      <p className="rounded-xl border border-dashed border-neutral-700 p-8 text-center text-sm text-neutral-400">
        GitHub didn&apos;t answer — probably the hourly rate limit. Try again in a bit.
      </p>
    );

  const p = d.project;
  const owner = p.github_repo.split("/")[0];

  /** A row only present in the proposal, outlined so it's obvious what's new. */
  const New = ({ children }: { children: React.ReactNode }) => (
    <span className="rounded-md border border-dashed border-emerald-400/40 bg-emerald-400/[0.04] px-1.5 py-0.5">
      {children}
    </span>
  );

  const Page = ({ next }: { next: boolean }) => (
    <div className="rounded-xl border border-neutral-800 bg-[#161d18] p-5">
      <p className="font-mono text-[19px] font-bold text-white">{p.base_name}</p>

      <p className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 font-mono text-[12px] text-neutral-400">
        <span>@{owner}</span>
        {next && on.has("version") && d.release && (
          <New>
            <span className="font-bold text-emerald-300">{d.release.tag}</span>
          </New>
        )}
        {next && on.has("updated") ? (
          <New>
            <span className="inline-flex items-center gap-1 text-neutral-200">
              <Clock size={10} aria-hidden /> updated {ago(p.pushed_at)}
            </span>
          </New>
        ) : (
          <span>
            added {ago(d.createdAt ? Math.floor(new Date(d.createdAt).getTime() / 1000) : null)}
          </span>
        )}
        {next && !!p.archived && (
          <New>
            <span className="inline-flex items-center gap-1">
              <Archive size={10} aria-hidden /> archived
            </span>
          </New>
        )}
      </p>

      <div className="mt-3.5 flex flex-wrap gap-2">
        <span className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg bg-emerald-400 px-3 font-mono text-[12px] font-bold text-black">
          <GitFork size={12} aria-hidden /> Fork on GitHub
        </span>
        <span className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-emerald-400/50 px-3 font-mono text-[12px] text-emerald-300">
          <Download size={12} aria-hidden /> Get it
        </span>
        <span className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-neutral-700 px-3 font-mono text-[12px] text-neutral-300">
          GitHub <ExternalLink size={11} aria-hidden />
        </span>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-neutral-800 px-3.5 py-2.5 font-mono text-[12px]">
        <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400">
          <GitFork size={12} aria-hidden /> {p.github_forks.toLocaleString()}
          <span className="font-normal text-neutral-400">forks</span>
        </span>
        <span className="inline-flex items-center gap-1.5 font-bold text-amber-300">
          <Star size={12} className="fill-current" aria-hidden /> {p.stars.toLocaleString()}
          <span className="font-normal text-neutral-400">stars</span>
        </span>
        {next && on.has("issues") && d.openIssues !== null && (
          <New>
            <span className="inline-flex items-center gap-1.5 text-sky-300">
              <CircleDot size={11} aria-hidden /> {d.openIssues}
              <span className="text-neutral-400">open</span>
            </span>
          </New>
        )}
      </div>

      {next && on.has("topics") && d.topics.length > 0 && (
        <div className="mt-3">
          <New>
            <span className="inline-flex flex-wrap gap-1.5 py-0.5">
              {d.topics.slice(0, 6).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full border border-neutral-700 px-2 py-0.5 font-mono text-[10.5px] text-neutral-300"
                >
                  <Tag size={8} aria-hidden />
                  {t}
                </span>
              ))}
            </span>
          </New>
        </div>
      )}

      {next && on.has("people") && d.contributors.length > 0 && (
        <div className="mt-3">
          <New>
            <span className="inline-flex items-center gap-2 py-0.5">
              <span className="flex -space-x-1.5">
                {d.contributors.slice(0, 5).map((c) =>
                  c.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={c.login}
                      src={c.avatar}
                      alt=""
                      title={`${c.login} — ${c.commits} commits`}
                      className="h-5 w-5 rounded-full border border-neutral-800"
                    />
                  ) : null,
                )}
              </span>
              <span className="font-mono text-[11.5px] text-neutral-400">
                {d.contributors.length} contributor{d.contributors.length === 1 ? "" : "s"}
              </span>
            </span>
          </New>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 font-mono text-[11px] uppercase tracking-widest text-neutral-400">Show</span>
        {OPTIONS.map(({ key, label }) => {
          const active = on.has(key);
          const empty =
            (key === "version" && !d.release) ||
            (key === "topics" && !d.topics.length) ||
            (key === "people" && !d.contributors.length);
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              aria-pressed={active}
              className={`min-h-[32px] cursor-pointer rounded-full border px-3 font-mono text-[11.5px] outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                active
                  ? "border-emerald-400 bg-emerald-400/10 font-bold text-emerald-300"
                  : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
              }`}
            >
              {label}
              {empty && <span className="ml-1.5 text-amber-400">empty here</span>}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-neutral-400">Today</p>
          <Page next={false} />
        </div>
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-emerald-300">
            Proposed — dashed outlines are new
          </p>
          <Page next />
        </div>
      </div>
    </div>
  );
}
