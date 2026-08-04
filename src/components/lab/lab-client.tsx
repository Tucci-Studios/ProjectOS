"use client";

import { useState } from "react";
import { FlaskConical } from "lucide-react";
import { Swarm } from "./swarm";
import { LogRings, Tiles, Counter } from "./scale-views";

type View = {
  key: string;
  label: string;
  blurb: string;
  Panel: (p: { count: number; known: number }) => React.ReactNode;
};

const VIEWS: View[] = [
  {
    key: "swarm",
    label: "Swarm",
    blurb:
      "One point of light per fork — all of them, really drawn. Fifty dots can't express thirty thousand, and nothing abstract can either, so this stops abstracting. Canvas, so the count is the only limit that matters.",
    Panel: ({ count, known }) => <Swarm count={count} known={known} />,
  },
  {
    key: "tiles",
    label: "Tiles",
    blurb:
      "One tile per fork, packed into a block that fills in as it counts. The plainest of these and the easiest to compare against — you can see one block is four times another in a way you cannot see it in a circle.",
    Panel: ({ count }) => <Tiles count={count} />,
  },
  {
    key: "rings",
    label: "Powers of ten",
    blurb:
      "Scale as distance: every ring out is ten times the last. The only one that holds 12 and 60,000 at the same size, and the distance is the story — two rings is a nice project, four is a phenomenon.",
    Panel: ({ count }) => <LogRings count={count} />,
  },
  {
    key: "counter",
    label: "Counter",
    blurb:
      "No picture at all — just how long the number takes to arrive. Cheapest by far, works at any magnitude, and the only one here that still reads at 40 pixels tall.",
    Panel: ({ count }) => <Counter count={count} />,
  },
];

/** Real fork counts from the catalogue, so the sizes aren't invented. */
const SCALES = [
  { n: 12, label: "12", note: "a typical project" },
  { n: 399, label: "399", note: "doing well" },
  { n: 7790, label: "7,790", note: "claude-mem" },
  { n: 24842, label: "24,842", note: "TrendRadar" },
  { n: 59879, label: "59,879", note: "n8n — the biggest here" },
];

export function LabClient() {
  const [view, setView] = useState(VIEWS[0].key);
  const [scale, setScale] = useState(SCALES[2]);
  const current = VIEWS.find((v) => v.key === view) ?? VIEWS[0];

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-300">
        <FlaskConical size={13} aria-hidden /> Test area — nothing here is live
      </div>
      <h1 className="font-mono text-[28px] font-bold text-white">Making a big number feel big</h1>
      <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
        The trophy draws the fifty forks GitHub hands us by name, which looks identical whether a project has 400 or
        40,000. Four ways to fix that — switch the size and watch which ones actually change.
      </p>

      <div className="mt-5 flex gap-1 overflow-x-auto border-b border-neutral-800">
        {VIEWS.map((v, i) => {
          const on = v.key === view;
          return (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              aria-current={on ? "page" : undefined}
              className={`-mb-px flex min-h-[42px] shrink-0 cursor-pointer items-center gap-2 border-b-2 px-3.5 font-mono text-[13px] outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                on ? "border-emerald-400 font-bold text-white" : "border-transparent text-neutral-500 hover:text-neutral-200"
              }`}
            >
              <span className={on ? "text-emerald-400" : "text-neutral-700"}>{String(i + 1).padStart(2, "0")}</span>
              {v.label}
            </button>
          );
        })}
      </div>

      <p className="mt-4 max-w-3xl text-[14px] leading-relaxed text-neutral-400">{current.blurb}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {SCALES.map((s) => (
          <button
            key={s.n}
            onClick={() => setScale(s)}
            className={`min-h-[34px] cursor-pointer rounded-full border px-3.5 font-mono text-[12px] tabular-nums transition ${
              scale.n === s.n
                ? "border-emerald-400 bg-emerald-400/10 font-bold text-emerald-300"
                : "border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200"
            }`}
          >
            {s.label}
          </button>
        ))}
        <span className="font-mono text-[11px] text-neutral-600">{scale.note}</span>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900/40">
        {/* Remounting on change restarts the reveal, which is half the effect. */}
        <current.Panel key={`${current.key}-${scale.n}`} count={scale.n} known={50} />
      </div>
    </div>
  );
}
