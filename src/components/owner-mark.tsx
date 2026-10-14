"use client";

import { useState } from "react";
import { BadgeCheck, AlertTriangle, X, Check, History, MessageSquare } from "lucide-react";

export type OwnerMark = {
  kind: "approved" | "disputed";
  note: string | null;
  by: string;
  /** True when the guide changed after the owner gave this verdict. */
  stale?: boolean;
} | null;

/**
 * What the project's owner says about a tutorial for their project.
 *
 * Three states, and they read very differently on purpose. A guide the owner
 * wrote themselves is simply theirs. A guide they've approved carries their
 * name as a recommendation. A guide they've disputed carries a correction in
 * red at the very top, above the steps, because someone about to follow
 * instructions the maintainer says are wrong needs to know before step one and
 * not after.
 *
 * A dispute never hides the tutorial. The owner gets to say so loudly; they
 * don't get to delete a competitor.
 */
export function OwnerBanner({
  mark,
  ownProject,
  discussHref,
}: {
  mark: OwnerMark;
  ownProject?: boolean;
  /** Where the two of them can talk about it. */
  discussHref?: string;
}) {
  if (ownProject)
    return (
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-400/[0.07] px-3.5 py-2.5">
        <BadgeCheck size={15} className="shrink-0 text-emerald-400" aria-hidden />
        <p className="text-[13px] text-emerald-100">
          <span className="font-bold">Written by the project&apos;s owner.</span> Straight from the source.
        </p>
      </div>
    );

  if (!mark) return null;

  if (mark.kind === "approved")
    return mark.stale ? (
      // Deliberately not green. An approval given before an edit is vouching
      // for text nobody re-read, and showing it as current would be a lie the
      // owner didn't tell.
      <div className="mt-4 flex items-start gap-2 rounded-lg border border-neutral-700 bg-neutral-900/60 px-3.5 py-2.5">
        <History size={15} className="mt-[2px] shrink-0 text-neutral-400" aria-hidden />
        <p className="text-[13px] leading-relaxed text-neutral-300">
          <span className="font-bold">@{mark.by} approved an earlier version.</span>{" "}
          <span className="text-neutral-400">
            The guide has been edited since, so this isn&apos;t a verdict on what you&apos;re reading now.
          </span>
        </p>
      </div>
    ) : (
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-400/35 bg-emerald-400/[0.06] px-3.5 py-2.5">
        <BadgeCheck size={15} className="shrink-0 text-emerald-400" aria-hidden />
        <p className="text-[13px] text-emerald-100">
          <span className="font-bold">Approved by the project&apos;s owner</span>
          <span className="text-emerald-200/70"> — @{mark.by} read this and says it&apos;s right.</span>
        </p>
      </div>
    );

  return (
    <div className="mt-4 rounded-lg border border-rose-400/50 bg-rose-500/[0.09] px-4 py-3">
      <p className="flex items-center gap-2 font-mono text-[12px] font-bold uppercase tracking-widest text-rose-200">
        <AlertTriangle size={14} aria-hidden /> The project&apos;s owner disputes this
      </p>
      {mark.note && <p className="mt-2 text-[13.5px] leading-relaxed text-rose-100/90">{mark.note}</p>}
      <p className="mt-2 font-mono text-[11px] text-rose-200/60">
        — @{mark.by}, who maintains the project this is about. The guide is left up so you can judge for yourself.
      </p>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-rose-400/20 pt-2">
        {mark.stale && (
          // Deliberately green inside a red box. The dispute is the warning;
          // this line is the opposite — the author has been back since, so the
          // complaint above may no longer apply. Colouring it like the rest of
          // the warning buried the one hopeful fact in there.
          <p className="flex items-start gap-1.5 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-2 py-1 font-mono text-[11px] font-bold leading-relaxed text-emerald-300">
            <History size={11} className="mt-[2px] shrink-0" aria-hidden />
            Edited since this was written — it may already be fixed.
          </p>
        )}
        {discussHref && (
          <a
            href={discussHref}
            className="ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] text-rose-200 underline-offset-4 hover:underline"
          >
            <MessageSquare size={11} aria-hidden /> Talk about it
          </a>
        )}
      </div>
    </div>
  );
}

/** The owner's controls, shown only to them. */
export function OwnerControls({
  postId,
  mark,
  demo = false,
}: {
  postId: string;
  mark: OwnerMark;
  /** Lab only: keep the interaction, skip the write. */
  demo?: boolean;
}) {
  const [current, setCurrent] = useState<OwnerMark>(mark);
  const [writing, setWriting] = useState(false);
  const [note, setNote] = useState(mark?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function send(kind: "approved" | "disputed" | "clear") {
    setBusy(true);
    setError(null);
    if (demo) {
      setCurrent(kind === "clear" ? null : { kind, note, by: "you" });
      setWriting(false);
      setBusy(false);
      return;
    }
    try {
      const res = await fetch("/api/owner-mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, kind, note }),
      });
      const d = (await res.json()) as { kind?: string | null; error?: string };
      if (!res.ok) {
        setError(d.error ?? "That didn't save.");
        return;
      }
      setCurrent(d.kind ? { kind: d.kind as "approved" | "disputed", note, by: "you" } : null);
      setWriting(false);
    } finally {
      setBusy(false);
    }
  }

  const btn =
    "inline-flex min-h-[32px] cursor-pointer items-center gap-1.5 rounded-lg border px-3 font-mono text-[11.5px] outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50";

  return (
    <div className="mt-4 rounded-xl border border-neutral-700 bg-neutral-900/50 p-4">
      <p className="font-mono text-[12px] font-bold text-neutral-100">This tutorial is about your project</p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-neutral-400">
        You can vouch for it, or say publicly that it&apos;s wrong. Either way it stays up — readers see your verdict
        and decide.
      </p>

      {error && <p className="mt-2.5 text-[12.5px] text-rose-300">{error}</p>}

      {writing ? (
        <div className="mt-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="What's wrong with it? Be specific — the author can fix what you name."
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900/60 px-3 py-2 text-[13px] text-white placeholder-neutral-600 outline-none focus:border-rose-400/60"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={() => send("disputed")}
              disabled={busy || note.trim().length < 10}
              className={`${btn} border-rose-400/50 bg-rose-500/10 text-rose-200 hover:border-rose-400`}
            >
              <AlertTriangle size={12} aria-hidden /> Post the correction
            </button>
            <button onClick={() => setWriting(false)} className={`${btn} border-neutral-700 text-neutral-400`}>
              <X size={12} aria-hidden /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => send("approved")}
            disabled={busy}
            aria-pressed={current?.kind === "approved"}
            className={`${btn} ${
              current?.kind === "approved"
                ? "border-emerald-400 bg-emerald-400/10 font-bold text-emerald-200"
                : "border-neutral-700 text-neutral-300 hover:border-emerald-400/50"
            }`}
          >
            {current?.kind === "approved" ? <Check size={12} aria-hidden /> : <BadgeCheck size={12} aria-hidden />}
            {current?.kind === "approved" ? "Approved" : "Approve it"}
          </button>

          <button
            onClick={() => setWriting(true)}
            disabled={busy}
            className={`${btn} ${
              current?.kind === "disputed"
                ? "border-rose-400 bg-rose-500/10 font-bold text-rose-200"
                : "border-neutral-700 text-neutral-300 hover:border-rose-400/50"
            }`}
          >
            <AlertTriangle size={12} aria-hidden />
            {current?.kind === "disputed" ? "Edit your correction" : "Something's wrong with it"}
          </button>

          {current && (
            <button onClick={() => send("clear")} disabled={busy} className={`${btn} border-neutral-700 text-neutral-400`}>
              <X size={12} aria-hidden /> Take it back
            </button>
          )}
        </div>
      )}
    </div>
  );
}
