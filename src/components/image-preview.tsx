"use client";

import { useCallback, useEffect, useState } from "react";
import { Expand, X, ChevronLeft, ChevronRight } from "lucide-react";

// One preview tile plus small thumbnails; click anything to open the gallery.
export function ImagePreview({ images, alt }: { images: string[]; alt: string }) {
  const [openAt, setOpenAt] = useState<number | null>(null);
  const isOpen = openAt !== null;

  const step = useCallback(
    (dir: 1 | -1) => setOpenAt((i) => (i === null ? i : (i + dir + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenAt(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, step]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="mt-5 flex flex-wrap items-start gap-2.5">
        <button
          onClick={() => setOpenAt(0)}
          aria-label="Expand screenshot"
          className="group/img relative block h-28 w-40 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-neutral-700 outline-none transition hover:border-emerald-400/60 focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[0]} alt={alt} className="h-full w-full object-cover" loading="lazy" />
          <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-600 bg-black/60 text-neutral-200 opacity-0 backdrop-blur transition group-hover/img:opacity-100">
            <Expand size={13} aria-hidden />
          </span>
        </button>

        {images.length > 1 && (
          <div className="flex flex-wrap gap-2.5">
            {images.slice(1, 4).map((src, i) => (
              <button
                key={src}
                onClick={() => setOpenAt(i + 1)}
                aria-label={`Open image ${i + 2}`}
                className="relative h-28 w-40 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-neutral-700 outline-none transition hover:border-emerald-400/60 focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                {i === 2 && images.length > 4 && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/70 font-mono text-xs text-white">
                    +{images.length - 4}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={(e) => e.target === e.currentTarget && setOpenAt(null)}
          className="animate-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
        >
          <button
            onClick={() => setOpenAt(null)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900/80 text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
          >
            <X size={18} aria-hidden />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={() => step(-1)}
                aria-label="Previous image"
                className="absolute left-4 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/80 text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
              >
                <ChevronLeft size={20} aria-hidden />
              </button>
              <button
                onClick={() => step(1)}
                aria-label="Next image"
                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/80 text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
              >
                <ChevronRight size={20} aria-hidden />
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[openAt]} alt={alt} className="animate-dialog max-h-full max-w-5xl rounded-xl object-contain" />

          {images.length > 1 && (
            <span className="absolute bottom-5 rounded-full border border-neutral-700 bg-neutral-900/80 px-3 py-1 font-mono text-xs text-neutral-300">
              {openAt + 1} / {images.length}
            </span>
          )}
        </div>
      )}
    </>
  );
}
