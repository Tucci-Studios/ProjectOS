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
        className={`flex flex-col items-center rounded px-2 py-1 font-mono text-xs transition ${
          liked ? "text-cyan-400" : "text-neutral-500 hover:text-cyan-400"
        }`}
      >
        <span className="text-base leading-none">{liked ? "▲" : "△"}</span>
        <span>{count}</span>
      </button>
      {error && <span className="max-w-[80px] text-center font-mono text-[9px] text-rose-400">{error}</span>}
    </div>
  );
}
