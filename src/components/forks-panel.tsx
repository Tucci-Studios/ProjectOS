"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, RefreshCw, Star } from "lucide-react";
import { timeAgo } from "@/lib/categories";
import type { ForkPicture } from "@/lib/forks";

/**
 * Every fork of this project, as GitHub knows them.
 *
 * There is no separate "Project OS fork" — a fork is a fork, and this is the
 * one list. The only difference between entries is whether the person who made
 * it has published here: published forks sit on the tree above with votes and a
 * page; the rest are names and links until their owner turns up.
 */
export function ForksPanel({
  projectId,
  initial,
  stale,
  repo,
  hasTree,
}: {
  projectId: string;
  initial: ForkPicture;
  stale: boolean;
  repo: string;
  hasTree: boolean;
}) {
  const router = useRouter();
  const [picture, setPicture] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(8);

  async function refresh() {
    setBusy(true);
    try {
      const res = await fetch("/api/sync-forks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = (await res.json()) as ForkPicture & { ok?: boolean };
      if (data.ok) {
        setPicture({
          unpublished: data.unpublished,
          total: data.total,
          published: data.published,
          syncedAt: data.syncedAt,
        });
        // The trophy above is server-rendered, so it can't see what we just
        // fetched. Without this you'd have to reload the page to get one.
        if (initial.syncedAt === null && data.total > 0) router.refresh();
      }
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

  return (
    <div className={hasTree ? "mt-4 border-t border-neutral-800 pt-4" : ""}>
      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 px-2 font-mono text-[11px]">
        <span className="text-neutral-400">
          {syncedAt === null && !busy ? (
            "Haven't checked GitHub yet."
          ) : total === 0 ? (
            "Nobody has forked this on GitHub."
          ) : (
            <>
              <span className="font-bold text-neutral-200">{total.toLocaleString()}</span> forks on GitHub
              {unpublished.length > 0 && total > unpublished.length && (
                <span className="text-neutral-400"> · top {unpublished.length} by stars</span>
              )}
              {published > 0 && (
                <>
                  <span className="text-neutral-700"> · </span>
                  <span className="font-bold text-emerald-400">{published}</span> published here
                </>
              )}
            </>
          )}
        </span>
        <button
          onClick={refresh}
          disabled={busy}
          aria-label="Check GitHub again"
          className="-mr-2 ml-auto flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded px-2 text-neutral-400 outline-none transition hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50"
        >
          <RefreshCw size={11} className={busy ? "animate-spin" : ""} aria-hidden />
          {busy ? "checking" : syncedAt ? timeAgo(syncedAt) : "check"}
        </button>
      </div>

      {unpublished.length > 0 && (
        <>
          <ol className="divide-y divide-neutral-800/70 overflow-hidden rounded-lg border border-neutral-800">
            {unpublished.slice(0, show).map((f, i) => {
              // Every fork is "someone/the-same-name", so repeating the project
              // name fifty times is noise. The owner is the part that differs.
              const suffix = f.full_name.slice(f.owner_login.length + 1);
              const renamed = suffix.toLowerCase() !== repo.split("/")[1].toLowerCase();
              return (
                <li key={f.full_name}>
                  <a
                    href={`https://github.com/${f.full_name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`${f.full_name} — not published on Project OS, this opens GitHub`}
                    className="flex items-center gap-3 px-3 py-2.5 outline-none transition hover:bg-neutral-800/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400"
                  >
                    <span className="w-5 shrink-0 text-right font-mono text-[11px] tabular-nums text-neutral-700">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-neutral-200">
                      {f.owner_login}
                      {renamed && <span className="text-neutral-400">/{suffix}</span>}
                    </span>
                    {f.stars > 0 && (
                      <span className="flex shrink-0 items-center gap-1 font-mono text-[12px] tabular-nums text-amber-300/70">
                        <Star size={10} className="fill-amber-300/70" aria-hidden />
                        {f.stars.toLocaleString()}
                      </span>
                    )}
                    <ExternalLink size={11} className="shrink-0 text-neutral-700" aria-hidden />
                  </a>
                </li>
              );
            })}
          </ol>

          {show < unpublished.length && (
            <button
              onClick={() => setShow(show + 25)}
              className="mt-2 w-full cursor-pointer rounded-lg border border-neutral-800 py-2 font-mono text-[11px] text-neutral-400 transition hover:border-neutral-600 hover:text-neutral-300"
            >
              show {Math.min(25, unpublished.length - show)} more
            </button>
          )}

          <p className="mt-3 px-1 font-mono text-[11px] leading-relaxed text-neutral-400">
            None of these have a page here — nobody claimed them.{" "}
            <a href="/submit" className="text-emerald-400 hover:underline">
              Publish yours
            </a>{" "}
            and it joins the tree.
          </p>
        </>
      )}
    </div>
  );
}
