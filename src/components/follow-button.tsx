"use client";

import { useState } from "react";
import { Bell, BellRing } from "lucide-react";

export function FollowButton({
  projectId,
  initialFollowing,
  label = "Follow",
  size = "md",
  iconOnly = false,
  onCount,
}: {
  projectId: string;
  initialFollowing: boolean;
  label?: string;
  size?: "sm" | "md";
  iconOnly?: boolean;
  onCount?: (n: number) => void;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = (await res.json()) as { following?: boolean; count?: number; error?: string };
      if (res.ok && data.following !== undefined) {
        setFollowing(data.following);
        if (typeof data.count === "number") onCount?.(data.count);
      }
      else {
        setError(data.error ?? "Failed.");
        setTimeout(() => setError(null), 3000);
      }
    } finally {
      setBusy(false);
    }
  }

  const dims = iconOnly
    ? "h-8 w-8 justify-center"
    : size === "sm"
      ? "min-h-[32px] px-2.5 text-[11px]"
      : "min-h-[40px] px-4 text-sm";
  const iconSize = iconOnly ? 15 : size === "sm" ? 12 : 15;

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-pressed={following}
      title={error ?? (following ? "Stop following — no more branch alerts" : "Follow — get told when this grows a branch")}
      className={`group/follow relative inline-flex cursor-pointer items-center gap-1.5 rounded-lg border font-mono outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50 ${dims} ${
        following
          ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
          : "border-neutral-600 text-neutral-300 hover:border-emerald-400/50 hover:text-emerald-300"
      }`}
    >
      {iconOnly ? (
        <>
          {/* Label floats out to the left; it never touches layout, so nothing shifts. */}
          <span
            aria-hidden
            className="pointer-events-none absolute right-full mr-1.5 translate-x-1 whitespace-nowrap rounded-md border border-neutral-700 bg-[#1a221d] px-2 py-1 font-mono text-[11px] text-neutral-200 opacity-0 shadow-lg transition-all duration-200 ease-out group-hover/follow:translate-x-0 group-hover/follow:opacity-100 group-focus-visible/follow:translate-x-0 group-focus-visible/follow:opacity-100"
          >
            {following ? "Following" : label}
          </span>
          {following ? <BellRing size={iconSize} aria-hidden /> : <Bell size={iconSize} aria-hidden />}
        </>
      ) : (
        <>
          {following ? <BellRing size={iconSize} aria-hidden /> : <Bell size={iconSize} aria-hidden />}
          {following ? "Following" : label}
        </>
      )}
    </button>
  );
}
