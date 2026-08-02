"use client";

import { useState } from "react";
import { ArrowBigUp } from "lucide-react";

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
        title={error ?? (liked ? "unlike" : "like")}
        aria-label={liked ? "Unlike" : "Like"}
        aria-pressed={liked}
        className={`flex min-h-[44px] min-w-[44px] cursor-pointer flex-col items-center justify-center rounded-lg border font-mono text-sm outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-wait ${
          liked
            ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]"
            : "border-neutral-700 text-neutral-400 hover:border-emerald-400/50 hover:bg-neutral-800 hover:text-emerald-400"
        }`}
      >
        <ArrowBigUp size={18} fill={liked ? "currentColor" : "none"} aria-hidden />
        <span className="text-xs font-semibold leading-none">{count}</span>
      </button>
      {error && <span className="mt-1 max-w-[90px] text-center font-mono text-[11px] text-rose-400">{error}</span>}
    </div>
  );
}
