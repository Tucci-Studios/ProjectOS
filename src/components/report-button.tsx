"use client";

import { useState } from "react";
import { Flag, Check } from "lucide-react";

export function ReportButton({
  targetType,
  targetId,
  signedIn,
  label = "Report",
}: {
  targetType: "project" | "post" | "comment" | "user";
  targetId: string;
  signedIn: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, reason }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (data.ok) {
        setDone(true);
        setOpen(false);
        return;
      }
      setError(data.error ?? "Failed.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
        <Check size={12} aria-hidden /> Reported — thanks
      </span>
    );
  }

  if (!signedIn) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex min-h-[32px] cursor-pointer items-center gap-1.5 rounded-md px-2 font-mono text-[11px] text-neutral-400 outline-none transition hover:bg-neutral-800 hover:text-rose-300 focus-visible:ring-2 focus-visible:ring-rose-400"
      >
        <Flag size={12} aria-hidden /> {label}
      </button>

      {open && (
        <form
          onSubmit={submit}
          className="absolute right-0 z-30 mt-1 w-72 rounded-xl border border-neutral-700 bg-[#1a221d] p-3 shadow-2xl shadow-black/60"
        >
          <p className="mb-2 font-mono text-xs text-neutral-300">What&apos;s wrong with this?</p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            rows={3}
            maxLength={500}
            placeholder="Malware, stolen code, harassment, spam..."
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 font-mono text-xs text-white placeholder-neutral-600 outline-none focus:border-rose-400"
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              type="submit"
              disabled={busy}
              className="min-h-[34px] cursor-pointer rounded-md border border-rose-400/40 px-3 font-mono text-xs text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-50"
            >
              {busy ? "Sending..." : "Send report"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="min-h-[34px] cursor-pointer px-2 font-mono text-xs text-neutral-400 transition hover:text-neutral-300"
            >
              Cancel
            </button>
          </div>
          {error && <p className="mt-2 font-mono text-[11px] text-rose-400">{error}</p>}
        </form>
      )}
    </div>
  );
}
