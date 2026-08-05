"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * The switch, floating, in a portal.
 *
 * It was sticky and it vanished the moment you scrolled: this site wraps every
 * page in a transform for the route transition, and a transformed ancestor
 * breaks position: sticky and position: fixed alike. So the control scrolled
 * away with the content and there was nothing left to press — which is exactly
 * what "I hit the button and nothing changes" looks like from the outside.
 *
 * A portal to document.body escapes that ancestor entirely, the same fix the
 * readme overlay needed.
 */
export function PolishToggle() {
  const [on, setOn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    document.documentElement.classList.toggle("pos-polish", on);
    return () => document.documentElement.classList.remove("pos-polish");
  }, [on]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed bottom-5 left-1/2 z-[60] w-[min(92vw,460px)] -translate-x-1/2 rounded-2xl border border-neutral-600 bg-[#0f1411]/95 p-3 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.9)] backdrop-blur">
      <button
        onClick={() => setOn((v) => !v)}
        aria-pressed={on}
        className={`flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-xl border px-4 text-center font-mono text-[14px] font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 ${
          on
            ? "border-emerald-400 bg-emerald-400 text-black"
            : "border-neutral-500 text-neutral-100 hover:border-neutral-300"
        }`}
      >
        {on ? "POLISH ON — tap to turn off" : "POLISH OFF — tap to turn on"}
      </button>
      <p className="mt-2 text-center text-[11.5px] leading-snug text-neutral-400">
        {on ? (
          <>
            Every card should now have a <span className="font-bold text-fuchsia-400">magenta outline</span>. If it
            does, the wiring is fine and the real changes are just too subtle to see.
          </>
        ) : (
          <>This floats above everything, so it can&apos;t scroll away. It only exists on the Lab.</>
        )}
      </p>
    </div>,
    document.body,
  );
}
