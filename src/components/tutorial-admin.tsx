"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Trash2, Check } from "lucide-react";

/**
 * The two actions that don't belong to the author.
 *
 * Checked is a moderator saying they followed the steps themselves — the only
 * thing that makes the badge mean anything, and the reason the intake strips it
 * when an author tries to claim it.
 *
 * Delete asks first, and delists rather than erasing: comments, saves and an
 * owner's verdict all point at a tutorial, and a hard delete takes an
 * argument's context with it.
 */
export function TutorialAdmin({
  postId,
  checked,
  canCheck,
  canDelete,
}: {
  postId: string;
  checked: boolean;
  canCheck: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [isChecked, setIsChecked] = useState(checked);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!canCheck && !canDelete) return null;

  const btn =
    "inline-flex min-h-[30px] cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 font-mono text-[11.5px] outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50";

  async function toggleChecked() {
    setBusy(true);
    try {
      const res = await fetch("/api/tutorials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: postId, checked: !isChecked }),
      });
      if (res.ok) {
        setIsChecked(!isChecked);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      const res = await fetch(`/api/tutorials?id=${encodeURIComponent(postId)}`, { method: "DELETE" });
      if (res.ok) router.push("/tutorials");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-neutral-800 pt-4">
      {canCheck && (
        <button
          onClick={toggleChecked}
          disabled={busy}
          aria-pressed={isChecked}
          title="Only mark this once you've followed the steps yourself"
          className={`${btn} ${
            isChecked
              ? "border-sky-400/60 bg-sky-400/10 font-bold text-sky-200"
              : "border-neutral-700 text-neutral-300 hover:border-sky-400/50"
          }`}
        >
          {isChecked ? <Check size={12} aria-hidden /> : <BadgeCheck size={12} aria-hidden />}
          {isChecked ? "Checked — undo" : "I followed this; mark it Checked"}
        </button>
      )}

      {canDelete &&
        (confirming ? (
          <>
            <span className="font-mono text-[11.5px] text-neutral-400">Take it down?</span>
            <button
              onClick={remove}
              disabled={busy}
              className={`${btn} border-rose-400/50 bg-rose-500/10 text-rose-200 hover:border-rose-400`}
            >
              <Trash2 size={12} aria-hidden /> Yes, take it down
            </button>
            <button onClick={() => setConfirming(false)} className={`${btn} border-neutral-700 text-neutral-400`}>
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className={`${btn} ml-auto border-neutral-800 text-neutral-500 hover:border-rose-400/40 hover:text-rose-300`}
          >
            <Trash2 size={12} aria-hidden /> Delete
          </button>
        ))}
    </div>
  );
}
