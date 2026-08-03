"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Plus, Wrench, Bug, Rocket } from "lucide-react";
import { BrandMark } from "./brand";

export type SplashUpdate = {
  id: string;
  version: string | null;
  title: string;
  intro: string | null;
  body_md: string;
  published_at: number;
  github_login: string;
};

const LINE_KINDS = {
  "+": { Icon: Plus, cls: "text-emerald-300", label: "Added" },
  "~": { Icon: Wrench, cls: "text-amber-300", label: "Changed" },
  "-": { Icon: Bug, cls: "text-sky-300", label: "Fixed" },
  ">": { Icon: Rocket, cls: "text-fuchsia-300", label: "From an idea" },
} as const;

/**
 * Shows the newest update once per person, as an overlay on top of whatever
 * page they're on. Closing it leaves them exactly where they were.
 * `trigger` lets the header re-open it on demand.
 */
export function UpdateSplash({
  update,
  unseen,
  trigger,
  onClosed,
}: {
  update: SplashUpdate;
  unseen: boolean;
  trigger?: number;
  onClosed?: () => void;
}) {
  const [open, setOpen] = useState(unseen);

  useEffect(() => {
    if (trigger) setOpen(true);
  }, [trigger]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    setOpen(false);
    onClosed?.();
    // Mark seen; failure is harmless — they'd just see it once more.
    void fetch("/api/updates/seen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updateId: update.id }),
    }).catch(() => {});
  }

  if (!open) return null;

  const date = new Date(update.published_at * 1000).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="What's new"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-emerald-400/30 bg-[#161d18] shadow-2xl shadow-black/70">
        {/* Banner */}
        <div className="relative flex items-center gap-3 border-b border-neutral-800 bg-neutral-900/70 px-5 py-4">
          <BrandMark size={36} />
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-300">What&apos;s new</p>
            <h2 className="truncate font-mono text-lg font-bold leading-tight text-white">{update.title}</h2>
            <p className="font-mono text-[11px] text-neutral-500">
              {update.version && <span className="text-neutral-400">{update.version} · </span>}
              {date}
            </p>
          </div>
          <button
            onClick={close}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-neutral-500 outline-none transition hover:bg-neutral-800 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-5 py-5">
          {update.intro && <p className="mb-4 text-[15px] leading-relaxed text-neutral-300">{update.intro}</p>}
          <ul className="space-y-2.5">
            {update.body_md
              .split("\n")
              .map((l) => l.trim())
              .filter(Boolean)
              .map((line, i) => {
                const kind = LINE_KINDS[line[0] as keyof typeof LINE_KINDS];
                if (!kind)
                  return (
                    <li key={i} className="text-sm leading-relaxed text-neutral-400">
                      {line}
                    </li>
                  );
                return (
                  <li key={i} className="flex items-start gap-2.5">
                    <kind.Icon size={14} className={`mt-[3px] shrink-0 ${kind.cls}`} aria-hidden />
                    <span className="text-sm leading-relaxed text-neutral-300">
                      <span className={`mr-1.5 font-mono text-[10px] font-bold uppercase tracking-wider ${kind.cls}`}>
                        {kind.label}
                      </span>
                      {line.slice(1).trim()}
                    </span>
                  </li>
                );
              })}
          </ul>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 px-5 py-3.5">
          <Link
            href="/updates"
            onClick={close}
            className="font-mono text-[12px] text-neutral-500 transition hover:text-neutral-300"
          >
            All past updates
          </Link>
          <button
            onClick={close}
            className="min-h-[40px] cursor-pointer rounded-lg bg-emerald-400 px-5 font-mono text-sm font-bold text-black transition hover:bg-emerald-300"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
