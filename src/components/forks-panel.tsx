"use client";

import { useEffect, useState } from "react";
import { GitFork, ExternalLink, RefreshCw } from "lucide-react";
import { timeAgo } from "@/lib/categories";
import type { ForkPicture } from "@/lib/forks";

/**
 * The honest gap: GitHub forks that nobody published here.
 *
 * These are deliberately NOT project cards — no votes, no page, no tree node.
 * Someone copying your code on GitHub isn't the same as joining the site, and
 * the page should never blur the two. What it IS good for: showing an author
 * their real reach, and nudging forkers into publishing.
 */
export function ForksPanel({
  projectId,
  initial,
  stale,
  repo,
}: {
  projectId: string;
  initial: ForkPicture;
  stale: boolean;
  repo: string;
}) {
  const [picture, setPicture] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(6);

  async function refresh() {
    setBusy(true);
    try {
      const res = await fetch("/api/sync-forks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = (await res.json()) as ForkPicture & { ok?: boolean };
      if (data.ok) setPicture({ unpublished: data.unpublished, total: data.total, published: data.published, syncedAt: data.syncedAt });
    } catch {
      /* GitHub being down is not this page's problem */
    } finally {
      setBusy(false);
    }
  }

  // Refresh after paint, never before — the page must not wait on GitHub.
  useEffect(() => {
    if (stale) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stale]);

  const { unpublished, total, published, syncedAt } = picture;
  const untracked = Math.max(0, total - published);

  return (
    <div className="mt-5 border-t border-neutral-800 pt-4">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <h3 className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
          <GitFork size={13} aria-hidden /> Forked on GitHub
        </h3>
        <span className="font-mono text-[11px] text-neutral-500">
          {syncedAt === null && !busy ? "not checked yet" : `${total} total`}
        </span>
        <button
          onClick={refresh}
          disabled={busy}
          aria-label="Check GitHub again"
          className="ml-auto flex cursor-pointer items-center gap-1.5 rounded p-1 font-mono text-[11px] text-neutral-600 outline-none transition hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50"
        >
          <RefreshCw size={12} className={busy ? "animate-spin" : ""} aria-hidden />
          {busy ? "checking" : syncedAt ? timeAgo(syncedAt) : "check"}
        </button>
      </div>

      <p className="mb-3 text-[13px] leading-relaxed text-neutral-500">
        {syncedAt === null ? (
          <>Haven&apos;t asked GitHub about this one yet.</>
        ) : total === 0 ? (
          <>Nobody has forked this on GitHub yet.</>
        ) : (
          <>
            <span className="font-bold text-emerald-400">{published}</span> of these were published here and are on the
            tree above.{" "}
            {untracked > 0 && (
              <>
                The other <span className="text-neutral-300">{untracked}</span> exist on GitHub but nobody published
                them, so they have no page, no votes, and no place on the tree.
              </>
            )}
          </>
        )}
      </p>

      {unpublished.length > 0 && (
        <>
          <ul className="space-y-1">
            {unpublished.slice(0, show).map((f) => (
              <li key={f.full_name}>
                <a
                  href={`https://github.com/${f.full_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/30 px-3 py-2 font-mono text-[12px] outline-none transition hover:border-neutral-600 focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <span className="min-w-0 flex-1 truncate text-neutral-300">{f.full_name}</span>
                  {f.pushed_at && (
                    <span className="shrink-0 text-[10px] text-neutral-600">touched {timeAgo(f.pushed_at)}</span>
                  )}
                  <ExternalLink size={11} className="shrink-0 text-neutral-600" aria-hidden />
                </a>
              </li>
            ))}
          </ul>

          {show < unpublished.length && (
            <button
              onClick={() => setShow(show + 20)}
              className="mt-2 w-full cursor-pointer rounded-lg border border-neutral-800 py-2 font-mono text-[11px] text-neutral-500 transition hover:border-neutral-600 hover:text-neutral-300"
            >
              show {Math.min(20, unpublished.length - show)} more
            </button>
          )}

          <p className="mt-3 rounded-lg border border-emerald-400/25 bg-emerald-400/[0.04] px-3 py-2 text-[12px] leading-relaxed text-neutral-400">
            One of these yours?{" "}
            <a href="/submit" className="font-bold text-emerald-300 hover:underline">
              Publish it
            </a>{" "}
            and it joins the tree — we already know it came from{" "}
            <span className="font-mono text-neutral-300">{repo}</span>, so there&apos;s nothing to fill in.
          </p>
        </>
      )}
    </div>
  );
}
