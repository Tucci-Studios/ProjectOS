"use client";

import { useMemo, useState } from "react";
import { FlaskConical } from "lucide-react";
import { labLineage, SHAPES, type LabShape } from "@/lib/lab-data";
import { Replica, PLACEMENTS, type Placement } from "./replica";

/**
 * A fake project page, so a fork visual can be judged where it will actually
 * live. Five placements for the same living orbit — same component, same
 * motion, different spot on the page.
 */
export function LabClient() {
  const [placement, setPlacement] = useState<Placement>("trophy");
  const [shape, setShape] = useState<LabShape>("monster");
  const nodes = useMemo(() => labLineage(shape), [shape]);
  const meta = SHAPES.find((s) => s.key === shape)!;
  const current = PLACEMENTS.find((p) => p.key === placement)!;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-300">
        <FlaskConical size={13} aria-hidden /> Test area — nothing here is live
      </div>
      <h1 className="font-mono text-[28px] font-bold text-white">Where does the trophy go?</h1>
      <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
        The same living orbit, in five different spots on a project page. It moves on its own in all of them — the
        question is which one earns the space without getting in the way.
      </p>

      <div className="mt-5 flex gap-1 overflow-x-auto border-b border-neutral-800">
        {PLACEMENTS.map((p, i) => {
          const on = p.key === placement;
          return (
            <button
              key={p.key}
              onClick={() => setPlacement(p.key)}
              aria-current={on ? "page" : undefined}
              className={`-mb-px flex min-h-[42px] shrink-0 cursor-pointer items-center gap-2 border-b-2 px-3.5 font-mono text-[13px] outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                on ? "border-emerald-400 font-bold text-white" : "border-transparent text-neutral-500 hover:text-neutral-200"
              }`}
            >
              <span className={on ? "text-emerald-400" : "text-neutral-700"}>{String(i + 1).padStart(2, "0")}</span>
              {p.label}
            </button>
          );
        })}
      </div>

      <p className="mt-4 max-w-3xl text-[14px] leading-relaxed text-neutral-400">{current.blurb}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {SHAPES.map((s) => (
          <button
            key={s.key}
            onClick={() => setShape(s.key)}
            className={`min-h-[34px] cursor-pointer rounded-full border px-3.5 font-mono text-[12px] transition ${
              shape === s.key
                ? "border-emerald-400 bg-emerald-400/10 font-bold text-emerald-300"
                : "border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200"
            }`}
          >
            {s.label}
          </button>
        ))}
        <span className="font-mono text-[11px] text-neutral-600">{meta.blurb}</span>
      </div>

      {/* the mock page itself */}
      <div className="mt-4 overflow-hidden rounded-xl border border-neutral-700">
        <Replica nodes={nodes} placement={placement} />
      </div>
    </div>
  );
}
