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
    ? "h-8 justify-end px-[7px] hover:pl-2.5 focus-visible:pl-2.5"
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
          {/* The word unfurls to the left of the icon; the button grows into it. */}
          <span
            aria-hidden
            className="grid grid-cols-[0fr] overflow-hidden transition-[grid-template-columns] duration-200 ease-out group-hover/follow:grid-cols-[1fr] group-focus-visible/follow:grid-cols-[1fr]"
          >
            <span className="min-w-0">
              <span className="block whitespace-nowrap pr-1.5 font-mono text-[11px]">
                {following ? "Following" : label}
              </span>
            </span>
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
