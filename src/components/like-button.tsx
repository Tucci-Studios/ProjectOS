"use client";

import { useState } from "react";

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
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setError(null);
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
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={toggle}
        title={error ?? (liked ? "unlike" : "like")}
        className={`flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 font-mono text-sm transition ${
          liked
            ? "text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]"
            : "text-neutral-500 hover:bg-neutral-900 hover:text-cyan-400"
        }`}
      >
        <span className="text-lg leading-none">{liked ? "▲" : "△"}</span>
        <span className="font-semibold">{count}</span>
      </button>
      {error && <span className="max-w-[80px] text-center font-mono text-[9px] text-rose-400">{error}</span>}
    </div>
  );
}
