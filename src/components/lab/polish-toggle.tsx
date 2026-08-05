"use client";

import { useEffect, useState } from "react";

/**
 * Puts the pass on the real page rather than on a swatch.
 *
 * Everything before this was a mock-up sitting inside a page that never
 * changed, which meant the comparison was something you had to go looking for.
 * This restyles the header, the rail and the cards you are already looking at,
 * so the difference happens to the thing rather than beside it.
 *
 * Scoped to a class on <html> and cleaned up on leaving, so no other page is
 * touched and nothing here is shipped by accident.
 */
export function PolishToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("pos-polish", on);
    return () => document.documentElement.classList.remove("pos-polish");
  }, [on]);

  return (
    <div className="sticky top-[72px] z-30 -mx-2 mb-6 rounded-xl border border-neutral-700 bg-[#141a16]/95 px-4 py-3 backdrop-blur">
      <button
        onClick={() => setOn((v) => !v)}
        aria-pressed={on}
        className={`flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-3 rounded-lg border px-4 font-mono text-[14px] font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 ${
          on
            ? "border-emerald-400 bg-emerald-400 text-black"
            : "border-neutral-600 text-neutral-200 hover:border-neutral-400"
        }`}
      >
        {on ? "Polish is ON — click to turn it off" : "Polish is OFF — click to turn it on"}
      </button>
      <p className="mt-2 text-center text-[12.5px] leading-relaxed text-neutral-400">
        This changes the page you are looking at right now — the header above, the rail on the left, and every card
        below. Not a preview: the real thing, live.
      </p>
    </div>
  );
}
