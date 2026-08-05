"use client";

import { useEffect, useState } from "react";
import {
  Tag,
  Clock,
  Users,
  CircleDot,
  Terminal,
  ShieldQuestion,
  Loader2,
  Archive,
  Scale,
} from "lucide-react";

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
  watchers: number | null;
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

/** Each proposal gets its own frame so it can be judged, or rejected, alone. */
function Try({
  n,
  title,
  why,
  children,
}: {
  n: string;
  title: string;
  why: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
      <p className="flex items-baseline gap-2">
        <span className="font-mono text-[11px] text-neutral-400">{n}</span>
        <span className="font-mono text-[14px] font-bold text-white">{title}</span>
      </p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-neutral-400">{why}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/**
 * Everything GitHub knows that a project page here doesn't show yet, against a
 * real repo rather than a mock-up.
 *
 * Shown separately rather than assembled into a finished page on purpose: some
 * of these will be empty for most of the catalogue, and a proposal that looks
 * great against the one repo that has all the data is how you end up shipping a
 * blank row on 600 pages. What matters is which of these survive being empty.
 */
export function ProjectExtras({ projectId }: { projectId: string }) {
  const [d, setD] = useState<Data | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    fetch(`/api/lab-preview?projectId=${encodeURIComponent(projectId)}`)
      .then((r) => (r.ok ? (r.json() as Promise<Data>) : Promise.reject()))
      .then((data) => {
        setD(data);
        setState("ready");
      })
      .catch(() => setState("failed"));
  }, [projectId]);

  if (state === "loading")
    return (
      <p className="flex items-center gap-2 py-10 font-mono text-[13px] text-neutral-400">
        <Loader2 size={14} className="animate-spin" aria-hidden /> Asking GitHub...
      </p>
    );
  if (state === "failed" || !d)
    return (
      <p className="rounded-xl border border-dashed border-neutral-700 p-8 text-center text-sm text-neutral-400">
        GitHub didn&apos;t answer — probably the hourly rate limit.
      </p>
    );

  const langTotal = Object.values(d.languages).reduce((a, b) => a + b, 0) || 1;
  const langs = Object.entries(d.languages).slice(0, 4);
  const stale = d.project.pushed_at ? Date.now() / 1000 - d.project.pushed_at > 15552000 : false;

  return (
    <div className="space-y-3">
      <p className="font-mono text-[12px] text-neutral-400">
        Live data for <span className="text-emerald-300">{d.project.github_repo}</span>
      </p>

      <Try
        n="01"
        title="Version"
        why="The first thing anyone asks before installing something. You show nothing today, so 'Get it' means 'get an unknown quantity'."
      >
        {d.release ? (
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-lg border border-emerald-400/50 bg-emerald-400/10 px-2.5 py-1 font-mono text-[13px] font-bold text-emerald-200">
              {d.release.tag}
            </span>
            <span className="font-mono text-[12px] text-neutral-400">
              released {ago(d.release.at ? Math.floor(new Date(d.release.at).getTime() / 1000) : null)}
            </span>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-amber-400/30 px-3 py-2 text-[12.5px] text-amber-100/80">
            No releases. This is the catch — most repos here won&apos;t have any, so this row would be blank on
            perhaps two thirds of the catalogue.
          </p>
        )}
      </Try>

      <Try
        n="02"
        title="Last worked on"
        why="You already store this and show the wrong date instead — a project abandoned in 2023 currently reads the same as one shipped yesterday."
      >
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-2 font-mono text-[13px] text-neutral-200">
            <Clock size={13} className={stale ? "text-amber-400" : "text-emerald-400"} aria-hidden />
            Last commit {ago(d.project.pushed_at)}
          </span>
          <span className="font-mono text-[12px] text-neutral-400">
            first published {ago(d.createdAt ? Math.floor(new Date(d.createdAt).getTime() / 1000) : null)}
          </span>
          {!!d.project.archived && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-700 px-2 py-0.5 font-mono text-[11px] text-neutral-300">
              <Archive size={10} aria-hidden /> Archived
            </span>
          )}
        </div>
        <p className="mt-2 text-[12px] text-neutral-400">
          {stale ? "Amber because nothing has landed in six months." : "Green because it's been touched recently."}
        </p>
      </Try>

      <Try
        n="03"
        title="Topics"
        why="GitHub's own tags. Your project_tags table has been sitting empty this whole time — these would fill it, sharpen the categories, and make 'more like this' possible with nobody doing any work."
      >
        {d.topics.length ? (
          <div className="flex flex-wrap gap-1.5">
            {d.topics.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-full border border-neutral-700 px-2.5 py-1 font-mono text-[11.5px] text-neutral-300"
              >
                <Tag size={9} aria-hidden />
                {t}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[12.5px] text-neutral-400">This repo has no topics set.</p>
        )}
      </Try>

      <Try
        n="04"
        title="Contributors"
        why="You show one owner. Most projects are several people, and on a site about credit that's the wrong number."
      >
        {d.contributors.length ? (
          <div className="flex flex-wrap items-center gap-2">
            {d.contributors.map((c) => (
              <span
                key={c.login}
                title={`${c.commits} commits`}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 py-1 pl-1 pr-2.5"
              >
                {c.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.avatar} alt="" className="h-4 w-4 rounded-full" />
                ) : (
                  <span className="h-4 w-4 rounded-full bg-neutral-700" />
                )}
                <span className="font-mono text-[11.5px] text-neutral-300">{c.login}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[12.5px] text-neutral-400">GitHub returned no contributor list.</p>
        )}
      </Try>

      <Try
        n="05"
        title="Open issues"
        why="A health signal, and an on-ramp — it's how someone finds a way to help rather than just consume."
      >
        <span className="inline-flex items-center gap-2 font-mono text-[13px] text-neutral-200">
          <CircleDot size={13} className="text-sky-400" aria-hidden />
          {d.openIssues ?? 0} open
          {d.watchers !== null && <span className="text-neutral-400">· {d.watchers} watching</span>}
        </span>
      </Try>

      <Try
        n="06"
        title="What it needs to run"
        why="The real question before installing anything, and the readme buries it. Inferred from the language mix — no extra call."
      >
        {langs.length ? (
          <>
            <div className="flex h-2 overflow-hidden rounded-full">
              {langs.map(([name, bytes], i) => (
                <span
                  key={name}
                  title={`${name} ${Math.round((bytes / langTotal) * 100)}%`}
                  style={{
                    width: `${(bytes / langTotal) * 100}%`,
                    background: ["#4ade80", "#7cc4ff", "#a78bfa", "#fb923c"][i],
                  }}
                />
              ))}
            </div>
            <p className="mt-2.5 inline-flex items-center gap-2 font-mono text-[12.5px] text-neutral-300">
              <Terminal size={12} className="text-emerald-400" aria-hidden />
              {langs.map(([n], i) => (
                <span key={n}>
                  {i > 0 && <span className="text-neutral-600"> · </span>}
                  {n} {Math.round((langs[i][1] / langTotal) * 100)}%
                </span>
              ))}
            </p>
          </>
        ) : (
          <p className="text-[12.5px] text-neutral-400">No language data.</p>
        )}
      </Try>

      <Try
        n="07"
        title="Judge it yourself"
        why="You can't tell anyone code is safe. You can put the facts that let them decide in one place instead of making them hunt."
      >
        <div className="flex flex-wrap gap-2">
          {[
            [`${d.contributors.length || 1} contributor${d.contributors.length === 1 ? "" : "s"}`, true],
            [`${d.project.stars.toLocaleString()} stars`, d.project.stars > 50],
            [`last commit ${ago(d.project.pushed_at)}`, !stale],
            [
              d.project.license === "NOASSERTION" ? "no licence" : d.project.license,
              d.project.license !== "NOASSERTION",
            ],
          ].map(([label, good]) => (
            <span
              key={String(label)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[11.5px] ${
                good ? "border-neutral-700 text-neutral-300" : "border-amber-400/40 text-amber-100/85"
              }`}
            >
              {good ? (
                <Scale size={10} aria-hidden />
              ) : (
                <ShieldQuestion size={10} className="text-amber-400" aria-hidden />
              )}
              {label}
            </span>
          ))}
        </div>
        <p className="mt-2.5 text-[12px] text-neutral-400">
          No score, no badge, no promise — four facts, with the ones worth pausing over in amber.
        </p>
      </Try>
    </div>
  );
}
