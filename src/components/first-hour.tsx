"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Clock, Check } from "lucide-react";

export type PathStep = {
  id: string;
  n: number;
  title: string;
  why: string;
  minutes: number;
  steps: number;
};

/**
 * A route through the tutorials, in order, for someone starting from nothing.
 *
 * The tutorials page is a shelf — fine once you know what you're after, useless
 * when you don't know what any of the words mean. This is the other thing: three
 * in a fixed order, each one the prerequisite for the next, with why it matters
 * rather than what it covers.
 *
 * Clicking a card opens the reason before the tutorial. Someone who is nervous
 * wants to know what they're committing to before they commit to it, and a card
 * that expands costs nothing while a page you have to navigate back from does.
 */
export function FirstHour({ path }: { path: PathStep[] }) {
  const [open, setOpen] = useState<string | null>(path[0]?.id ?? null);
  const total = path.reduce((n, s) => n + s.minutes, 0);

  if (path.length === 0) return null;

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="font-mono text-[17px] font-bold text-white">Your first hour</h2>
        <p className="font-mono text-[12px] text-neutral-400">
          {path.length} guides · about {total} min
        </p>
      </div>
      <p className="mt-1.5 text-[14px] leading-relaxed text-neutral-400">
        In this order. Each one assumes you&apos;ve done the one above it, and nothing before the first.
      </p>

      <ol className="mt-3.5 space-y-2">
        {path.map((s) => {
          const isOpen = open === s.id;
          return (
            <li key={s.id}>
              <div
                className={`overflow-hidden rounded-xl border transition ${
                  isOpen ? "border-emerald-400/40 bg-emerald-400/[0.04]" : "border-neutral-800 bg-neutral-900/40"
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : s.id)}
                  aria-expanded={isOpen}
                  className="flex w-full cursor-pointer items-center gap-3 p-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-mono text-[13px] font-bold ${
                      isOpen
                        ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
                        : "border-neutral-700 text-neutral-400"
                    }`}
                    aria-hidden
                  >
                    {s.n}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[14px] font-bold leading-snug text-white">{s.title}</span>
                    <span className="mt-0.5 flex items-center gap-1.5 font-mono text-[11.5px] text-neutral-400">
                      <Clock size={11} aria-hidden /> {s.minutes} min · {s.steps} steps
                    </span>
                  </span>
                  <ChevronRight
                    size={16}
                    className={`shrink-0 text-neutral-400 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                    aria-hidden
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-emerald-400/20 px-3.5 pb-3.5 pt-3">
                    <p className="text-[13.5px] leading-relaxed text-neutral-300">{s.why}</p>
                    <Link
                      href={`/wire/${s.id}`}
                      className="mt-3 inline-flex min-h-[38px] items-center gap-2 rounded-lg bg-emerald-400 px-4 font-mono text-[13px] font-bold text-black outline-none transition hover:bg-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400"
                    >
                      <Check size={13} aria-hidden /> Start this one
                    </Link>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
