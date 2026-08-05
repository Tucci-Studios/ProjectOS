"use client";

import { useState } from "react";
import { Search, Plus, Compass, ScrollText, Radio, Star, GitFork, Clock } from "lucide-react";

/**
 * The site, mimicked, beside the same thing with a polish pass on it.
 *
 * Side by side rather than a switch, because the first version of this was a
 * toggle and the differences were too small to hold in your head between
 * clicks. If two things have to be compared, they have to be visible at once.
 *
 * Every fragment here is real — the header, the rail, a project card, at the
 * sizes they actually ship at — so the comparison isn't flattered by a mock-up.
 */

const CARDS = [
  { name: "claude-mem", desc: "Persistent memory across sessions for every agent.", stars: "89.6k", forks: "7.8k", tag: "SKL", when: "today" },
  { name: "n8n", desc: "Workflow automation with native AI capabilities.", stars: "199.3k", forks: "59.9k", tag: "MCP", when: "today" },
  { name: "NextChat", desc: "Light and fast AI assistant for web, iOS and desktop.", stars: "88.6k", forks: "59.3k", tag: "LLM", when: "2 days ago" },
];

function Frame({ on }: { on: boolean }) {
  return (
    <div className={`lab-frame ${on ? "lab-on" : ""} overflow-hidden rounded-xl border border-neutral-800`}>
      <div className="lab-header relative flex h-[52px] items-center gap-3 px-4">
        <span className="lab-mark flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-neutral-500 bg-neutral-900/60">
          <svg width="17" height="17" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M4.4 5.7 L7 8 L4.4 10.3" stroke="#fafafa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="8.6" y="9.3" width="3.6" height="1.5" rx="0.45" fill="#4ade80" />
          </svg>
        </span>
        <span className="font-mono text-[13px] font-bold tracking-[0.14em] text-white">
          PROJECT<span className="text-emerald-400">_</span>OS
        </span>
        <span className="lab-search ml-3 hidden h-8 flex-1 items-center gap-2 rounded-full border border-neutral-700 bg-neutral-800/60 px-3 md:flex">
          <Search size={12} className="text-neutral-400" aria-hidden />
          <span className="truncate font-mono text-[11px] text-neutral-400">Search projects</span>
        </span>
        <span className="lab-cta ml-auto inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-emerald-400 px-3 font-mono text-[11.5px] font-bold text-black">
          <Plus size={13} aria-hidden /> Publish
        </span>
      </div>

      <div className="flex">
        <div className="lab-rail hidden w-36 shrink-0 flex-col gap-0.5 p-3 sm:flex">
          {([
            [ScrollText, "Feed", false],
            [Compass, "Explore", true],
            [Radio, "Wire", false],
          ] as const).map(([Icon, label, active], i) => (
            <span
              key={i}
              className={`lab-row flex min-h-[34px] items-center gap-2.5 rounded-lg px-2.5 font-mono text-[12.5px] ${
                active ? "lab-row-active font-bold text-emerald-300" : "text-neutral-300"
              }`}
            >
              <Icon size={14} aria-hidden /> {label}
            </span>
          ))}
        </div>

        <div className="lab-body min-w-0 flex-1 space-y-2.5 p-4">
          {CARDS.map((c) => (
            <article key={c.name} className="lab-card flex items-start gap-3">
              <span className="lab-tile flex h-[46px] w-12 shrink-0 items-center justify-center font-mono text-[11px] font-bold text-emerald-300">
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
  );
}

export function PremiumLab() {
  const [stacked, setStacked] = useState(false);

  return (
    <div>
      <button
        onClick={() => setStacked((s) => !s)}
        className="mb-3 min-h-[32px] cursor-pointer rounded-full border border-neutral-700 px-3 font-mono text-[11.5px] text-neutral-400 outline-none transition hover:border-neutral-500 hover:text-neutral-200 focus-visible:ring-2 focus-visible:ring-emerald-400"
      >
        {stacked ? "Put them side by side" : "Stack them (bigger)"}
      </button>

      <div className={stacked ? "space-y-6" : "grid gap-4 lg:grid-cols-2"}>
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-neutral-400">As it is now</p>
          <Frame on={false} />
        </div>
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-emerald-300">With the pass</p>
          <Frame on />
        </div>
      </div>

      <p className="mt-4 text-[12.5px] leading-relaxed text-neutral-400">
        The card is a lighter surface with a lit top edge and a shadow deep enough to imply height. The header is a
        layer the page passes under, not a bar with a line beneath it. The name, the description and the numbers are
        three clearly different sizes instead of three within 3px of each other. Hover and press a card on the right —
        that&apos;s where the rest of it lives.
      </p>
    </div>
  );
}
