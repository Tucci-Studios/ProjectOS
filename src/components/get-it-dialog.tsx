"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { InstallBlock } from "./install-block";

// The install steps only matter once you've decided you want it, so they live
// behind a button instead of eating the page.
export function GetItDialog({ category, repo }: { category: string; repo: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-emerald-400/50 bg-emerald-400/10 px-4 font-mono text-sm font-semibold text-emerald-300 outline-none transition hover:bg-emerald-400/20 focus-visible:ring-2 focus-visible:ring-emerald-400"
      >
        <Download size={16} aria-hidden /> Get it
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="How to install"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          className="animate-overlay fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
        >
          <div className="animate-dialog w-full max-w-xl rounded-2xl border border-neutral-700 bg-[#161d18] p-1.5 shadow-2xl shadow-black/70">
            <div className="flex items-center justify-between px-3 pt-2">
              <p className="font-mono text-sm font-bold text-white">Install</p>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
              >
                <X size={16} aria-hidden />
              </button>
            </div>
            <div className="px-1.5 pb-1.5">
              <InstallBlock category={category} repo={repo} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
