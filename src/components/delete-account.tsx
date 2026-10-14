"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";

const PHRASE = "delete my account";

/**
 * The destructive control.
 *
 * Folded shut by default, and it says what survives before it says how to
 * proceed — someone should not find out that their tutorials stayed up by
 * discovering it afterwards.
 */
export function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: typed }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setError(d.error ?? "That didn't work.");
        return;
      }
      // Hard reload rather than a router push, so nothing signed-in survives.
      window.location.href = "/";
    } catch {
      setError("That didn't work.");
    } finally {
      setBusy(false);
    }
  }

  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex min-h-[36px] cursor-pointer items-center gap-2 rounded-lg border border-neutral-700 px-3 font-mono text-[12.5px] text-neutral-300 outline-none transition hover:border-rose-400/60 hover:text-rose-200 focus-visible:ring-2 focus-visible:ring-rose-400"
      >
        <Trash2 size={13} aria-hidden /> Delete my account
      </button>
    );

  return (
    <div className="rounded-xl border border-rose-400/40 bg-rose-500/[0.06] p-4">
      <p className="flex items-center gap-2 font-mono text-[12px] font-bold uppercase tracking-widest text-rose-200">
        <AlertTriangle size={13} aria-hidden /> This can&apos;t be undone
      </p>

      <div className="mt-3 space-y-2 text-[13px] leading-relaxed text-neutral-300">
        <p>
          <span className="font-bold text-white">Erased for good:</span> your username, name and avatar, plus every
          save, follow, block, notification, vote and report you&apos;ve made.
        </p>
        <p>
          <span className="font-bold text-white">Stays up:</span> projects, tutorials and comments you published,
          reattributed to a deleted account with your name removed. Other people&apos;s forks hang off that history,
          so erasing it would break their work too. Delete anything you want gone{" "}
          <span className="text-neutral-400">before</span> you do this.
        </p>
      </div>

      <label className="mt-3.5 block">
        <span className="mb-1.5 block font-mono text-[12px] text-neutral-300">
          Type <span className="font-bold text-rose-200">{PHRASE}</span> to confirm
        </span>
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoComplete="off"
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900/60 px-3 py-2 font-mono text-[13px] text-white outline-none transition focus:border-rose-400/60"
        />
      </label>

      {error && <p className="mt-2 text-[12.5px] text-rose-300">{error}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={go}
          disabled={busy || typed !== PHRASE}
          className="inline-flex min-h-[36px] cursor-pointer items-center gap-2 rounded-lg border border-rose-400/60 bg-rose-500/15 px-3.5 font-mono text-[12.5px] font-bold text-rose-100 outline-none transition hover:bg-rose-500/25 focus-visible:ring-2 focus-visible:ring-rose-400 disabled:cursor-default disabled:opacity-40"
        >
          <Trash2 size={13} aria-hidden /> {busy ? "Deleting..." : "Delete it"}
        </button>
        <button
          onClick={() => {
            setOpen(false);
            setTyped("");
            setError(null);
          }}
          className="inline-flex min-h-[36px] cursor-pointer items-center rounded-lg border border-neutral-700 px-3.5 font-mono text-[12.5px] text-neutral-300 outline-none transition hover:border-neutral-500 focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          Keep my account
        </button>
      </div>
    </div>
  );
}
