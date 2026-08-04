"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export function VoteButton({
  ideaId,
  initialCount,
  initialVote = 0,
}: {
  ideaId: string;
  initialCount: number;
  initialVote?: number;
}) {
  const [count, setCount] = useState(initialCount);
  const [vote, setVote] = useState(initialVote);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function cast(direction: "up" | "down") {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ideas/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId, direction }),
      });
      const data = (await res.json()) as { vote?: number; count?: number; error?: string };
      if (res.ok && data.count !== undefined) {
        setVote(data.vote ?? 0);
        setCount(data.count);
      } else {
        setError(data.error ?? "Failed.");
        setTimeout(() => setError(null), 3000);
      }
    } finally {
      setBusy(false);
    }
  }

  const btn =
    "flex h-11 w-12 cursor-pointer items-center justify-center rounded-lg outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-wait";

  return (
    <div className="group/vote relative flex flex-col items-center">
      <button
        onClick={() => cast("up")}
        disabled={busy}
        aria-pressed={vote === 1}
        aria-label={vote === 1 ? "Remove upvote" : "Upvote"}
        title={vote === 1 ? "Remove upvote" : "Upvote"}
        className={`${btn} ${vote === 1 ? "text-emerald-400" : "text-neutral-400 hover:bg-neutral-800 hover:text-emerald-300"}`}
      >
        <ChevronUp size={26} strokeWidth={vote === 1 ? 3 : 2.25} aria-hidden />
      </button>

      <span
        title={error ?? `${count} net vote${Math.abs(count) === 1 ? "" : "s"}`}
        className={`-my-1 select-none font-mono text-[17px] font-bold leading-none tabular-nums ${
          vote === 1 ? "text-emerald-400" : vote === -1 ? "text-rose-400" : "text-neutral-200"
        }`}
      >
        {count}
      </span>

      <button
        onClick={() => cast("down")}
        disabled={busy}
        aria-pressed={vote === -1}
        aria-label={vote === -1 ? "Remove downvote" : "Downvote"}
        title={vote === -1 ? "Remove downvote" : "Downvote"}
        className={`${btn} ${
          vote === -1
            ? "text-rose-400 opacity-100"
            : "text-neutral-400 opacity-40 hover:bg-neutral-800 hover:text-rose-300 hover:opacity-100 group-hover/vote:opacity-100"
        }`}
      >
        <ChevronDown size={26} strokeWidth={vote === -1 ? 3 : 2.25} aria-hidden />
      </button>

      {error && (
        <span className="absolute -bottom-7 w-24 text-center font-mono text-[10px] leading-tight text-rose-400">
          {error}
        </span>
      )}
    </div>
  );
}
