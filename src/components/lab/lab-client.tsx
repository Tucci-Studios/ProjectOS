"use client";

import { useMemo, useState } from "react";
import { FlaskConical } from "lucide-react";
import { labLineage, SHAPES, type LabShape } from "@/lib/lab-data";
import { VizGalaxy } from "./visuals";

/**
 * The lab is a shelf of experiments. Add one by appending to EXPERIMENTS —
 * `Panel` gets the whole tab body, and `shapes` says whether it wants the
 * test-tree switcher above it.
 */
type Experiment = {
  key: string;
  label: string;
  blurb: string;
  shapes: boolean;
  Panel: (p: { nodes: ReturnType<typeof labLineage> }) => React.ReactNode;
};

const EXPERIMENTS: Experiment[] = [
  {
    key: "galaxy",
    label: "Galaxy",
    blurb:
      "The picture tells you the shape of a lineage, the list tells you where to go. They share a selection — hover either side and the other lights up, click a row or a planet to trace it back to the original.",
    shapes: true,
    Panel: ({ nodes }) => (
      <div className="overflow-hidden rounded-xl border border-neutral-700">
        <VizGalaxy nodes={nodes} />
      </div>
    ),
  },
];

export function LabClient() {
  const [active, setActive] = useState(EXPERIMENTS[0].key);
  const [shape, setShape] = useState<LabShape>("wide");
  const nodes = useMemo(() => labLineage(shape), [shape]);
  const meta = SHAPES.find((s) => s.key === shape)!;
  const experiment = EXPERIMENTS.find((e) => e.key === active) ?? EXPERIMENTS[0];

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-300">
        <FlaskConical size={13} aria-hidden /> Test area — nothing here is live
      </div>
      <h1 className="font-mono text-[28px] font-bold text-white">Lab</h1>
      <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
        Things being tried out before they earn a place on the site.
      </p>

      {/* tabs — one per experiment */}
      <div className="mt-5 flex gap-1 overflow-x-auto border-b border-neutral-800">
        {EXPERIMENTS.map((e, i) => {
          const on = e.key === experiment.key;
          return (
            <button
              key={e.key}
              onClick={() => setActive(e.key)}
              aria-current={on ? "page" : undefined}
              className={`-mb-px flex min-h-[42px] shrink-0 cursor-pointer items-center gap-2 border-b-2 px-3.5 font-mono text-[13px] outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                on ? "border-emerald-400 font-bold text-white" : "border-transparent text-neutral-500 hover:text-neutral-200"
              }`}
            >
              <span className={on ? "text-emerald-400" : "text-neutral-700"}>{String(i + 1).padStart(2, "0")}</span>
              {e.label}
            </button>
          );
        })}
      </div>

      <p className="mt-4 max-w-3xl text-[14px] leading-relaxed text-neutral-400">{experiment.blurb}</p>

      {experiment.shapes && (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            {SHAPES.map((s) => (
              <button
                key={s.key}
                onClick={() => setShape(s.key)}
                className={`min-h-[38px] cursor-pointer rounded-full border px-4 font-mono text-[12px] transition ${
                  shape === s.key
                    ? "border-emerald-400 bg-emerald-400/10 font-bold text-emerald-300"
                    : "border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="mt-2 font-mono text-[11px] text-neutral-500">
            {meta.blurb} <span className="text-neutral-600">— {nodes.length} branches in this tree.</span>
          </p>
        </>
      )}

      <div className="mt-4">
        <experiment.Panel nodes={nodes} />
      </div>
    </div>
  );
}
