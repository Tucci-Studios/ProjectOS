"use client";

import { useState } from "react";

/**
 * The favicon, every way round, in the two places it actually gets drawn.
 *
 * Judging a 16px icon on a swatch is how we got here: the mark looked right in
 * isolation and wrong in the tab, because Safari paints a light rounded chip
 * behind favicons and Chrome doesn't. A dark mark vanishes on one, a white mark
 * vanishes on the other, and you can't tell from looking at the file.
 *
 * So each variant renders at true size against both backgrounds at once.
 */

const COLOURS = {
  green: "#4ade80",
  black: "#101010",
  white: "#fafafa",
} as const;

type Key = keyof typeof COLOURS;
const KEYS = Object.keys(COLOURS) as Key[];

/** The mark itself: ring, prompt, cursor — each independently coloured. */
function Mark({ ring, prompt, cursor, size }: { ring: Key; prompt: Key; cursor: Key; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <circle cx="32" cy="32" r="25" fill="none" stroke={COLOURS[ring]} strokeWidth="4" />
      <path
        d="M22 22 L33 32 L22 42"
        fill="none"
        stroke={COLOURS[prompt]}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="37" y="37" width="12" height="5" rx="1.6" fill={COLOURS[cursor]} />
    </svg>
  );
}

/** Safari: light rounded chip in the title bar, dark window frame around it. */
function SafariTab({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 rounded-md bg-[#3a3a3c] px-2 py-1">
      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-[4px] bg-[#f2f2f2]">
        {children}
      </span>
      <span className="font-sans text-[9px] text-neutral-200">Project Open Source</span>
    </span>
  );
}

/** Chrome: the icon straight onto the tab, no chip. */
function ChromeTab({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 rounded-t-md bg-[#242629] px-2 py-1">
      <span className="flex h-[18px] w-[18px] items-center justify-center">{children}</span>
      <span className="font-sans text-[9px] text-neutral-300">Project Open Source</span>
    </span>
  );
}

export function IconMatrix() {
  const [only, setOnly] = useState<"both" | "safari" | "chrome">("both");
  const [big, setBig] = useState(false);

  const combos = KEYS.flatMap((ring) =>
    KEYS.flatMap((prompt) => KEYS.map((cursor) => ({ ring, prompt, cursor }))),
  );

  const px = big ? 22 : 16;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        {(["both", "safari", "chrome"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setOnly(k)}
            aria-pressed={only === k}
            className={`min-h-[32px] cursor-pointer rounded-full border px-3 font-mono text-[11.5px] capitalize outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 ${
              only === k
                ? "border-emerald-400 bg-emerald-400/10 font-bold text-emerald-300"
                : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
            }`}
          >
            {k}
          </button>
        ))}
        <button
          onClick={() => setBig((b) => !b)}
          className="ml-auto min-h-[32px] cursor-pointer rounded-full border border-neutral-700 px-3 font-mono text-[11.5px] text-neutral-400 outline-none transition hover:border-neutral-500 hover:text-neutral-200 focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          {big ? "True size (16px)" : "Enlarge a little"}
        </button>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {combos.map(({ ring, prompt, cursor }) => {
          const id = `${ring}-${prompt}-${cursor}`;
          const allSame = ring === prompt && prompt === cursor;
          return (
            <div
              key={id}
              className={`rounded-xl border bg-neutral-900/40 p-3 ${
                allSame ? "border-neutral-700" : "border-neutral-800"
              }`}
            >
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                <span className="text-neutral-300">○</span> {ring} <span className="text-neutral-400">·</span>{" "}
                <span className="text-neutral-300">&gt;</span> {prompt} <span className="text-neutral-400">·</span>{" "}
                <span className="text-neutral-300">_</span> {cursor}
              </p>
              <div className="flex flex-wrap gap-2">
                {only !== "chrome" && (
                  <SafariTab>
                    <Mark ring={ring} prompt={prompt} cursor={cursor} size={px} />
                  </SafariTab>
                )}
                {only !== "safari" && (
                  <ChromeTab>
                    <Mark ring={ring} prompt={prompt} cursor={cursor} size={px} />
                  </ChromeTab>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-[12.5px] leading-relaxed text-neutral-400">
        27 combinations — ring, prompt and cursor each in green, black or white. Safari paints a light chip behind the
        icon, Chrome doesn&apos;t, so anything that only works on one of them is out. The ones that survive both are
        the real shortlist.
      </p>
    </div>
  );
}
