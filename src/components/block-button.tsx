"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeOff, Eye } from "lucide-react";

export function BlockButton({ login, initialBlocked }: { login: string; initialBlocked: boolean }) {
  const router = useRouter();
  const [blocked, setBlocked] = useState(initialBlocked);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      const res = await fetch("/api/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockedLogin: login }),
      });
      const data = (await res.json()) as { blocked?: boolean };
      if (typeof data.blocked === "boolean") setBlocked(data.blocked);
      setConfirming(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (blocked) {
    return (
      <button
        onClick={toggle}
        disabled={busy}
        className="inline-flex min-h-[32px] cursor-pointer items-center gap-1.5 rounded-md border border-neutral-600 px-2.5 font-mono text-[11px] text-neutral-300 transition hover:border-emerald-400/50 hover:text-emerald-300 disabled:opacity-50"
      >
        <Eye size={12} aria-hidden /> Unhide @{login}
      </button>
    );
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2">
        <button
          onClick={toggle}
          disabled={busy}
          className="inline-flex min-h-[32px] cursor-pointer items-center gap-1.5 rounded-md border border-rose-400/50 bg-rose-500/10 px-2.5 font-mono text-[11px] text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-50"
        >
          <EyeOff size={12} aria-hidden /> Yes, hide them
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="min-h-[32px] cursor-pointer px-1.5 font-mono text-[11px] text-neutral-500 transition hover:text-neutral-300"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title="Hide this person's projects and posts from your feeds"
      className="inline-flex min-h-[32px] cursor-pointer items-center gap-1.5 rounded-md px-2 font-mono text-[11px] text-neutral-600 transition hover:bg-neutral-800 hover:text-neutral-300"
    >
      <EyeOff size={12} aria-hidden /> Hide
    </button>
  );
}
