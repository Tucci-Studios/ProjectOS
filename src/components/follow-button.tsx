"use client";

import { useState } from "react";
import { Bell, BellRing } from "lucide-react";

export function FollowButton({
  projectId,
  initialFollowing,
  label = "Follow",
  size = "md",
  iconOnly = false,
}: {
  projectId: string;
  initialFollowing: boolean;
  label?: string;
  size?: "sm" | "md";
  iconOnly?: boolean;
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
      const data = (await res.json()) as { following?: boolean; error?: string };
      if (res.ok && data.following !== undefined) setFollowing(data.following);
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
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border font-mono outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50 ${dims} ${
        following
          ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
          : "border-neutral-600 text-neutral-300 hover:border-emerald-400/50 hover:text-emerald-300"
      }`}
    >
      {following ? <BellRing size={iconSize} aria-hidden /> : <Bell size={iconSize} aria-hidden />}
      {!iconOnly && (following ? "Following" : label)}
    </button>
  );
}
