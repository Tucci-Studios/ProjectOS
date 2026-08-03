"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Check } from "lucide-react";

export function ModActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(action: "remove" | "dismiss") {
    setBusy(true);
    try {
      await fetch("/api/mod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, action }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        onClick={() => act("remove")}
        disabled={busy}
        className="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-lg border border-rose-400/40 px-3 font-mono text-[13px] text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-50"
      >
        <Trash2 size={14} aria-hidden /> Remove it
      </button>
      <button
        onClick={() => act("dismiss")}
        disabled={busy}
        className="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-700 px-3 font-mono text-[13px] text-neutral-300 transition hover:border-neutral-500 disabled:opacity-50"
      >
        <Check size={14} aria-hidden /> Looks fine
      </button>
    </div>
  );
}
