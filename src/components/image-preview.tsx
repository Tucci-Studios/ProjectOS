"use client";

import { useEffect, useState } from "react";
import { Expand, X } from "lucide-react";

// Small preview by default; click to see it full size.
export function ImagePreview({ src, alt }: { src: string; alt: string }) {
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
        aria-label="Expand screenshot"
        className="group/img relative mt-5 block w-full max-w-sm cursor-pointer overflow-hidden rounded-xl border border-neutral-700 outline-none transition hover:border-neutral-500 focus-visible:ring-2 focus-visible:ring-emerald-400"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="h-40 w-full object-cover" loading="lazy" />
        <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-600 bg-black/60 text-neutral-200 opacity-0 backdrop-blur transition group-hover/img:opacity-100">
          <Expand size={13} aria-hidden />
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          className="animate-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
        >
          <button
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900/80 text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
          >
            <X size={18} aria-hidden />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="animate-dialog max-h-full max-w-5xl rounded-xl object-contain" />
        </div>
      )}
    </>
  );
}
