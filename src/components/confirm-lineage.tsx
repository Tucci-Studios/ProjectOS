"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

/** Only the parent's owner sees this — they're the one who can settle the claim. */
export function ConfirmLineage({ projectId, childDisplay }: { projectId: string; childDisplay: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function settle(confirm: boolean) {
    setBusy(true);
    await fetch("/api/lineage-confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, confirm }),
    });
    setBusy(false);
    router.refresh();
  }

  const btn =
    "flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-lg border px-3 font-mono text-[12px] outline-none transition disabled:opacity-50 focus-visible:ring-2";

  return (
    <div className="mt-4 rounded-xl border border-sky-400/35 bg-sky-400/[0.05] p-4">
      <p className="font-mono text-[13px] font-bold text-sky-200">Is this really a fork of your project?</p>
      <p className="mt-1 text-[13px] leading-relaxed text-neutral-400">
        {childDisplay} says it came from your work, but GitHub has no fork record — so we can&apos;t check it. You can.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => settle(true)}
          disabled={busy}
          className={`${btn} border-emerald-400/50 text-emerald-300 hover:bg-emerald-400/10 focus-visible:ring-emerald-400`}
        >
          <Check size={13} aria-hidden /> Yes, it came from mine
        </button>
        <button
          onClick={() => settle(false)}
          disabled={busy}
          className={`${btn} border-neutral-600 text-neutral-400 hover:border-rose-400/50 hover:text-rose-300 focus-visible:ring-rose-400`}
        >
          <X size={13} aria-hidden /> No — cut it loose
        </button>
      </div>
    </div>
  );
}
