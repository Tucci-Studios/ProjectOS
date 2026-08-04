"use client";

import { Layers, Hexagon, ToyBrick, Component, SlidersHorizontal, Pipette, Binary, Workflow } from "lucide-react";
import { GROUPS } from "@/lib/categories";

/**
 * The last two marks, thought about again from scratch.
 *
 * The first pass leaned on the same handful of ideas — a puzzle piece, a wand,
 * a wrench — which are all "generic icon that vaguely means capability". These
 * come at it from the syntax instead: what you actually type or see when you
 * use one of these things.
 */

type Option =
  | { kind: "text"; text: string; note: string }
  | { kind: "icon"; Icon: typeof Layers; name: string; note: string }
  | { kind: "svg"; name: string; note: string; draw: (c: string) => React.ReactNode };

const SETS: { label: string; hex: string; why: string; options: Option[] }[] = [
  {
    label: "Claude Skills",
    hex: GROUPS.ai.hex,
    why: "A skill is a folder the model loads on demand to do one job well. The last set tried to draw 'capability' and got vague — these use the shape of the thing instead.",
    options: [
      { kind: "text", text: ".sk", note: "Sits directly alongside .md, which is already shipped. Reads as a file type — which is exactly what a skill is on disk." },
      { kind: "text", text: "::", note: "Namespacing. Quiet, symmetrical, and unlike anything else in the set." },
      { kind: "text", text: "[+]", note: "Something added to what the model already does, in brackets so it reads as syntax rather than a button." },
      { kind: "text", text: "SKL", note: "Three letters, same rhythm as MCP and LLM. Consistent with its neighbours at a glance." },
      {
        kind: "svg",
        name: "Patch",
        note: "A merit badge — a skill you've earned and can attach. Drawn from scratch, and unlike anything in the icon set.",
        draw: (c) => (
          <>
            <path d="M12 3l7 4v6c0 4-3 6.5-7 8-4-1.5-7-4-7-8V7z" fill="none" stroke={c} strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M9 12l2 2 4-4" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </>
        ),
      },
      {
        kind: "svg",
        name: "Module",
        note: "A block that clicks into a socket. Says 'loaded on demand' without borrowing the puzzle cliché.",
        draw: (c) => (
          <>
            <rect x="4" y="7" width="16" height="11" rx="2" fill="none" stroke={c} strokeWidth="1.6" />
            <path d="M9 7V4.5M15 7V4.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
            <path d="M8.5 12.5h7" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
          </>
        ),
      },
      { kind: "icon", Icon: Layers, name: "Layers", note: "Something stacked on top of the base model. Very legible small." },
      { kind: "icon", Icon: Component, name: "Component", note: "A part of a larger system. Distinct shape, holds at 18px." },
      { kind: "icon", Icon: ToyBrick, name: "ToyBrick", note: "Clicks into place. Warmer than Puzzle and less overused." },
      { kind: "icon", Icon: Hexagon, name: "Hexagon", note: "Pure module geometry. Needs the stripe colour to carry all the meaning." },
    ],
  },
  {
    label: "Scripts & Tools",
    hex: GROUPS.build.hex,
    why: "Something you run in a terminal. The last set reached for wrenches and cogs, which describe 'tool' in the abstract — these are what a script literally looks like.",
    options: [
      { kind: "text", text: "#!", note: "The shebang: the first two characters of every script ever written. Nothing else in the world uses this mark." },
      { kind: "text", text: "./", note: "Literally how you run one. Two characters, unmistakable to anyone who has." },
      { kind: "text", text: "|", note: "A pipe — one tool feeding the next, which is the whole philosophy of this section." },
      { kind: "text", text: "sh", note: "The shell itself. Plain, lowercase, technical." },
      { kind: "text", text: "~", note: "Home, where your scripts live. Very quiet — possibly too quiet." },
      {
        kind: "svg",
        name: "Pipe",
        note: "The pipe drawn rather than typed: output flowing from one box to another.",
        draw: (c) => (
          <>
            <rect x="3" y="8" width="7" height="8" rx="1.5" fill="none" stroke={c} strokeWidth="1.6" />
            <rect x="14" y="8" width="7" height="8" rx="1.5" fill="none" stroke={c} strokeWidth="1.6" />
            <path d="M10 12h4" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
          </>
        ),
      },
      {
        kind: "svg",
        name: "Run",
        note: "A prompt with something after it — a command being entered, not a terminal window.",
        draw: (c) => (
          <>
            <path d="M5 8l4 4-4 4" fill="none" stroke={c} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 16h7" stroke={c} strokeWidth="1.9" strokeLinecap="round" />
          </>
        ),
      },
      { kind: "icon", Icon: Workflow, name: "Workflow", note: "Steps chained together. Reads as automation, which most of these are." },
      { kind: "icon", Icon: SlidersHorizontal, name: "Sliders", note: "Something you configure and run. Reads as settings elsewhere." },
      { kind: "icon", Icon: Binary, name: "Binary", note: "Ones and zeroes — an executable. Honest, slightly retro." },
      { kind: "icon", Icon: Pipette, name: "Pipette", note: "A small precise instrument. Unusual, arguably too clever." },
    ],
  },
];

export function SectionMarks() {
  return (
    <div className="space-y-4">
      {SETS.map((set) => (
        <section key={set.label} className="overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900/30">
          <header className="border-b border-neutral-800 px-5 py-3">
            <h2 className="font-mono text-[15px] font-bold text-white">{set.label}</h2>
            <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-neutral-400">{set.why}</p>
          </header>

          <div className="flex flex-wrap gap-x-4 gap-y-5 p-5">
            {set.options.map((o, i) => (
              <div key={i} className="flex w-[152px] flex-col gap-2">
                <div className="flex items-end gap-2">
                  <Tile o={o} hex={set.hex} big />
                  <Tile o={o} hex={set.hex} />
                </div>
                <p className="font-mono text-[11px] font-bold text-neutral-200">
                  {o.kind === "text" ? o.text : o.name}
                </p>
                <p className="text-[11px] leading-snug text-neutral-500">{o.note}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Tile({ o, hex, big }: { o: Option; hex: string; big?: boolean }) {
  const size = big ? 24 : 18;
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900 pl-[3px] ${
        big ? "h-20 w-16" : "h-[52px] w-11"
      }`}
    >
      <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: hex }} aria-hidden />
      {o.kind === "text" ? (
        <span
          className="font-mono font-bold leading-none tracking-tight"
          style={{ color: hex, fontSize: size * (o.text.length > 2 ? 0.55 : 0.72) }}
          aria-hidden
        >
          {o.text}
        </span>
      ) : o.kind === "svg" ? (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
          {o.draw(hex)}
        </svg>
      ) : (
        <o.Icon size={size} strokeWidth={1.6} style={{ color: hex }} aria-hidden />
      )}
    </span>
  );
}
