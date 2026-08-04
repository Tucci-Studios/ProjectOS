"use client";

import { useState } from "react";
import { FlaskConical } from "lucide-react";
import { LOGO_MARKS } from "./logo-marks";

/**
 * The shelf. Currently holding: ten candidate header marks.
 *
 * Shown three ways on purpose, because a logo that looks good on a swatch can
 * fall apart in the place it actually lives. Big to judge the idea, at 34px to
 * judge whether it survives, and dropped into a mock header to judge whether
 * you'd want to look at it all day.
 */
export function LabClient() {
  const [picked, setPicked] = useState<string>("grow");
  const current = LOGO_MARKS.find((m) => m.key === picked)!;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-300">
        <FlaskConical size={13} aria-hidden /> Test area — nothing here is live
      </div>
      <h1 className="font-mono text-[28px] font-bold text-white">Lab</h1>
      <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
        Where things get tried before they earn a place on the site.
      </p>

      <section className="mt-9">
        <h2 className="font-mono text-[15px] font-bold text-white">Header mark — ten takes</h2>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-neutral-500">
          All original geometry, nobody else&apos;s marks. Pure CSS, so none of them run a timer in the header.
          Every one holds still for reduced-motion. Click one to see it in a mock header at real size.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {LOGO_MARKS.map(({ key, n, name, Mark, note }) => {
            const on = key === picked;
            return (
              <button
                key={key}
                onClick={() => setPicked(key)}
                aria-pressed={on}
                className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  on
                    ? "border-emerald-400/60 bg-emerald-400/[0.05]"
                    : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-600"
                }`}
              >
                <span className="flex shrink-0 flex-col items-center gap-2.5 pt-0.5">
                  <Mark size={56} />
                  <Mark size={34} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="font-mono text-[11px] text-neutral-600">{n}</span>
                    <span className="font-mono text-[14px] font-bold text-white">{name}</span>
                  </span>
                  <span className="mt-1.5 block text-[12.5px] leading-relaxed text-neutral-400">{note}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
            {current.n} {current.name} — in a header, at 34px
          </p>
          <div className="overflow-hidden rounded-xl border border-neutral-800">
            <div className="flex items-center gap-3 border-b border-neutral-800 bg-[#141a16] px-4 py-3">
              <current.Mark size={34} />
              <span className="flex flex-col leading-none">
                <span className="font-mono text-[17px] font-bold tracking-[0.16em] text-white">
                  PROJECT<span className="text-emerald-400">_</span>OS
                </span>
                <span className="mt-[3px] font-mono text-[8.5px] font-medium uppercase tracking-[0.42em] text-neutral-500">
                  open source
                </span>
              </span>
              <span className="ml-auto h-9 w-28 rounded-full border border-neutral-700" />
            </div>
            <div className="space-y-2 bg-[#161d18] p-4">
              <span className="block h-2.5 w-2/3 rounded bg-neutral-800" />
              <span className="block h-2.5 w-1/2 rounded bg-neutral-800/70" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
