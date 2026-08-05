"use client";

import { useState } from "react";
import { Search, Plus, Compass, ScrollText, Radio, Star, GitFork, Clock } from "lucide-react";

/**
 * The site, mimicked, with the polish pass switched on and off.
 *
 * Built as a copy rather than applied to the real thing first, because "premium"
 * is a claim you can only test by looking at the same thing twice. Everything
 * here is a real fragment of the site — the header, the rail, a project card —
 * at real sizes, so the comparison isn't flattered by a mock-up.
 *
 * What the ON state changes, and why (from the two skills):
 *   · surfaces get a top-lit gradient and a real shadow, so they read as
 *     material rather than as a 1px rectangle
 *   · the header stops using a hard divider and fades content out underneath it
 *   · hover is gated behind (hover: hover) so touch devices stop sticking
 *   · every transition names its properties and its curve; the weak default
 *     cubic-bezier(0.4,0,0.2,1) is replaced by the stronger --ease-out
 *   · exits run faster than entrances
 *   · type gets a hierarchy: one size up for names, one down for metadata
 */

const CARDS = [
  { name: "claude-mem", desc: "Persistent memory across sessions for every agent.", stars: "89.6k", forks: "7.8k", tag: "SKL", when: "today" },
  { name: "n8n", desc: "Workflow automation with native AI capabilities.", stars: "199.3k", forks: "59.9k", tag: "MCP", when: "today" },
  { name: "NextChat", desc: "Light and fast AI assistant for web, iOS and desktop.", stars: "88.6k", forks: "59.3k", tag: "LLM", when: "2 days ago" },
];

export function PremiumLab() {
  const [on, setOn] = useState(true);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">Polish</span>
        {[
          ["off", "As it is now"],
          ["on", "With the pass"],
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setOn(k === "on")}
            aria-pressed={on === (k === "on")}
            className={`min-h-[34px] cursor-pointer rounded-full border px-3.5 font-mono text-[12px] outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 ${
              on === (k === "on")
                ? "border-emerald-400 bg-emerald-400/10 font-bold text-emerald-300"
                : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={`lab-frame ${on ? "lab-on" : ""} overflow-hidden rounded-xl border border-neutral-800`}>
        {/* header */}
        <div className="lab-header relative flex h-[52px] items-center gap-3 px-4">
          <span className="lab-mark flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-neutral-500 bg-neutral-900/60">
            <svg width="17" height="17" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M4.4 5.7 L7 8 L4.4 10.3" stroke="#fafafa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="8.6" y="9.3" width="3.6" height="1.5" rx="0.45" fill="#4ade80" />
            </svg>
          </span>
          <span className="font-mono text-[14px] font-bold tracking-[0.16em] text-white">
            PROJECT<span className="text-emerald-400">_</span>OS
          </span>
          <span className="lab-search ml-4 hidden h-8 flex-1 items-center gap-2 rounded-full border border-neutral-700 bg-neutral-800/60 px-3 sm:flex">
            <Search size={13} className="text-neutral-400" aria-hidden />
            <span className="font-mono text-[11.5px] text-neutral-400">Search projects, posts, people</span>
          </span>
          <span className="lab-cta ml-auto inline-flex h-8 items-center gap-1.5 rounded-full bg-emerald-400 px-3 font-mono text-[11.5px] font-bold text-black">
            <Plus size={13} aria-hidden /> Publish
          </span>
        </div>

        <div className="flex">
          {/* rail */}
          <div className="lab-rail hidden w-40 shrink-0 flex-col gap-0.5 p-3 sm:flex">
            {[
              [ScrollText, "Feed", false],
              [Compass, "Explore", true],
              [Radio, "Wire", false],
            ].map(([Icon, label, active], i) => {
              const I = Icon as typeof Compass;
              return (
                <span
                  key={i}
                  className={`lab-row flex min-h-[34px] items-center gap-2.5 rounded-lg px-2.5 font-mono text-[12.5px] ${
                    active ? "lab-row-active font-bold text-emerald-300" : "text-neutral-300"
                  }`}
                >
                  <I size={14} aria-hidden /> {label as string}
                </span>
              );
            })}
          </div>

          {/* cards */}
          <div className="lab-body min-w-0 flex-1 space-y-2.5 p-4">
            {CARDS.map((c) => (
              <article key={c.name} className="lab-card flex items-start gap-3 rounded-xl p-3">
                <span className="lab-tile flex h-[46px] w-12 shrink-0 items-center justify-center rounded-lg font-mono text-[11px] font-bold text-emerald-300">
                  {c.tag}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="lab-name block truncate font-mono font-bold text-white">{c.name}</span>
                  <span className="lab-desc mt-0.5 block truncate text-neutral-400">{c.desc}</span>
                  <span className="lab-meta mt-1.5 flex flex-wrap items-center gap-x-3 font-mono text-neutral-400">
                    <span className="inline-flex items-center gap-1 text-amber-300/70">
                      <Star size={9} className="fill-current" aria-hidden /> {c.stars}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                      <GitFork size={9} aria-hidden /> {c.forks}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock size={9} aria-hidden /> {c.when}
                    </span>
                  </span>
                </span>
              </article>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-3 text-[12.5px] leading-relaxed text-neutral-400">
        Hover a card and press it in both states. The difference is mostly in things you don&apos;t look at directly:
        the surface catches light from above, the shadow gives it somewhere to sit, and the press has a curve instead
        of a straight line.
      </p>
    </div>
  );
}
