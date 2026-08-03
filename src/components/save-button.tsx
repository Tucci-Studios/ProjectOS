"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";

/**
 * Saving is a shelf, following is a subscription. Kept apart on purpose: you
 * should be able to keep something for later without signing up for alerts.
 */
export function SaveButton({
  projectId,
  initialSaved,
  iconOnly = false,
}: {
  projectId: string;
  initialSaved: boolean;
  iconOnly?: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/saves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = (await res.json()) as { saved?: boolean };
      if (typeof data.saved === "boolean") setSaved(data.saved);
    } finally {
      setBusy(false);
    }
  }

  const Icon = saved ? BookmarkCheck : Bookmark;

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      title={saved ? "Saved — click to remove from your saves" : "Save this to read later"}
      className={`group/save relative inline-flex cursor-pointer items-center gap-1.5 rounded-lg border font-mono outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50 ${
        iconOnly ? "h-8 w-8 justify-center" : "min-h-[40px] px-4 text-sm"
      } ${
        saved
          ? "border-neutral-400 bg-neutral-100/10 text-white"
          : "border-neutral-600 text-neutral-300 hover:border-neutral-400 hover:text-white"
      }`}
    >
      {iconOnly && (
        // Floated clear of the layout so hovering can't resize the button.
        <span
          aria-hidden
          className="pointer-events-none absolute right-[calc(100%+5px)] top-1/2 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-md border border-neutral-700 bg-[#1a221d] px-2 py-1 font-mono text-[11px] text-neutral-200 opacity-0 shadow-lg transition-all duration-200 ease-out group-hover/save:translate-x-0 group-hover/save:opacity-100 group-focus-visible/save:translate-x-0 group-focus-visible/save:opacity-100"
        >
          {saved ? "Saved" : "Save"}
        </span>
      )}
      <Icon size={iconOnly ? 15 : 15} aria-hidden />
      {!iconOnly && (saved ? "Saved" : "Save")}
    </button>
  );
}
