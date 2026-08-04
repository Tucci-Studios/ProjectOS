"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

export function ApplicationActions({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(action: "accepted" | "declined") {
    setBusy(true);
    try {
      await fetch("/api/help", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        onClick={() => act("accepted")}
        disabled={busy}
        className="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-400/40 px-3 font-mono text-[13px] text-emerald-300 transition hover:bg-emerald-400/10 disabled:opacity-50"
      >
        <Check size={14} aria-hidden /> Bring them in
      </button>
      <button
        onClick={() => act("declined")}
        disabled={busy}
        className="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-700 px-3 font-mono text-[13px] text-neutral-300 transition hover:border-neutral-500 disabled:opacity-50"
      >
        <X size={14} aria-hidden /> Not now
      </button>
    </div>
  );
}
