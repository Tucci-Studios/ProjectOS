"use client";

import { useState } from "react";
import { ChevronUp } from "lucide-react";

export function VoteButton({
  ideaId,
  initialCount,
  initialVoted,
}: {
  ideaId: string;
  initialCount: number;
  initialVoted: boolean;
}) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ideas/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId }),
      });
      const data = (await res.json()) as { voted?: boolean; count?: number; error?: string };
      if (res.ok && data.count !== undefined) {
        setVoted(!!data.voted);
        setCount(data.count);
      } else {
        setError(data.error ?? "Failed.");
        setTimeout(() => setError(null), 3000);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={toggle}
        disabled={busy}
        aria-pressed={voted}
        title={error ?? (voted ? "Remove your vote" : "Vote for this")}
        className={`flex min-h-[56px] w-14 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border font-mono outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-wait ${
          voted
            ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-300"
            : "border-neutral-700 text-neutral-400 hover:border-emerald-400/50 hover:bg-neutral-800 hover:text-emerald-300"
        }`}
      >
        <ChevronUp size={18} strokeWidth={2.5} aria-hidden />
        <span className="text-sm font-bold leading-none">{count}</span>
      </button>
      {error && <span className="mt-1 max-w-[90px] text-center font-mono text-[10px] text-rose-400">{error}</span>}
    </div>
  );
}
