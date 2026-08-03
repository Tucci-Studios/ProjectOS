"use client";

import { useMemo, useState } from "react";
import { FlaskConical, GitFork, Star } from "lucide-react";
import { labLineage, SHAPES, LAB_PROJECT, type LabShape } from "@/lib/lab-data";
import { Orbit } from "./orbit";
import { Growth } from "./growth";

/**
 * The lab is a shelf of views onto one fake project. Add one by appending to
 * VIEWS — each gets a tab and the same lineage to draw.
 */
type View = {
  key: string;
  label: string;
  blurb: string;
  Panel: (p: { nodes: ReturnType<typeof labLineage> }) => React.ReactNode;
};

const VIEWS: View[] = [
  {
    key: "orbit",
    label: "Orbit",
    blurb:
      "Every generation is a ring around the original, turning slowly and alternating direction. Hover to hold it still; click any fork to trace its path home.",
    Panel: ({ nodes }) => <Orbit nodes={nodes} />,
  },
  {
    key: "growth",
    label: "Growth",
    blurb:
      "Press play and watch the lineage actually happen, in the order it was made. Scrub back through it, or stop on the day a particular fork appeared.",
    Panel: ({ nodes }) => <Growth nodes={nodes} />,
  },
];

export function LabClient() {
  const [active, setActive] = useState(VIEWS[0].key);
  const [shape, setShape] = useState<LabShape>("monster");
  const nodes = useMemo(() => labLineage(shape), [shape]);
  const meta = SHAPES.find((s) => s.key === shape)!;
  const view = VIEWS.find((v) => v.key === active) ?? VIEWS[0];

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-300">
        <FlaskConical size={13} aria-hidden /> Test area — nothing here is live
      </div>

      {/* The fake project these views are drawn against. */}
      <h1 className="font-mono text-[28px] font-bold text-white">{LAB_PROJECT.name}</h1>
      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px] text-neutral-500">
        <span>@{LAB_PROJECT.repo.split("/")[0]}</span>
        <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
          <GitFork size={11} aria-hidden /> {nodes.length - 1}
        </span>
        <span className="inline-flex items-center gap-1 text-amber-400">
          <Star size={11} className="fill-amber-400" aria-hidden /> 4.2k
        </span>
      </p>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-neutral-300">{LAB_PROJECT.description}</p>

      <div className="mt-5 flex gap-1 overflow-x-auto border-b border-neutral-800">
        {VIEWS.map((v, i) => {
          const on = v.key === view.key;
          return (
            <button
              key={v.key}
              onClick={() => setActive(v.key)}
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

      <p className="mt-4 max-w-3xl text-[14px] leading-relaxed text-neutral-400">{view.blurb}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {SHAPES.map((s) => (
          <button
            key={s.key}
            onClick={() => setShape(s.key)}
            className={`min-h-[36px] cursor-pointer rounded-full border px-3.5 font-mono text-[12px] transition ${
              shape === s.key
                ? "border-emerald-400 bg-emerald-400/10 font-bold text-emerald-300"
                : "border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <p className="mt-2 font-mono text-[11px] text-neutral-500">{meta.blurb}</p>

      <div className="mt-4 overflow-hidden rounded-xl border border-neutral-700">
        <view.Panel nodes={nodes} />
      </div>
    </div>
  );
}
