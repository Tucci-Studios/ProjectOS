"use client";

import { useState } from "react";
import { ChevronUp } from "lucide-react";

// Minimal vote control: a chevron over a count. No box, no chrome — it only
// gains a background on hover so the card stays quiet.
export function LikeButton({
  projectId,
  initialCount,
  initialLiked,
}: {
  projectId: string;
  initialCount: number;
  initialLiked: boolean;
}) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = (await res.json()) as { liked?: boolean; count?: number; error?: string };
      if (res.ok && data.count !== undefined) {
        setLiked(!!data.liked);
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
        aria-pressed={liked}
        aria-label={liked ? "Remove vote" : "Vote"}
        title={error ?? (liked ? "Remove vote" : "Vote")}
        className={`group/vote flex min-h-[52px] w-11 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-wait ${
          liked ? "text-emerald-400" : "text-neutral-500 hover:bg-neutral-800/70 hover:text-emerald-300"
        }`}
      >
        <ChevronUp
          size={20}
          strokeWidth={liked ? 3 : 2.25}
          aria-hidden
          className="transition-transform duration-200 group-hover/vote:-translate-y-0.5"
        />
        <span className={`font-mono text-[13px] leading-none ${liked ? "font-bold" : "font-medium"}`}>{count}</span>
      </button>
      {error && <span className="mt-1 max-w-[84px] text-center font-mono text-[10px] text-rose-400">{error}</span>}
    </div>
  );
}
