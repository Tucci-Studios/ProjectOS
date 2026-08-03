"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// Uses browser history so you land back at the exact scroll position you left,
// with a sane fallback for people arriving from a shared link.
export function BackLink({ fallback = "/popular", label = "Back" }: { fallback?: string; label?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) router.back();
        else router.push(fallback);
      }}
      className="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-lg px-2 font-mono text-[13px] text-neutral-400 outline-none hover:bg-neutral-800 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400"
    >
      <ArrowLeft size={15} aria-hidden /> {label}
    </button>
  );
}
