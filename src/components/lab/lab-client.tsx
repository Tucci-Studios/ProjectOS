"use client";

import { useMemo, useState } from "react";
import { FlaskConical } from "lucide-react";
import { labLineage, SHAPES, type LabShape } from "@/lib/lab-data";
import { VizGalaxy } from "./visuals";

export function LabClient() {
  const [shape, setShape] = useState<LabShape>("wide");
  const nodes = useMemo(() => labLineage(shape), [shape]);
  const meta = SHAPES.find((s) => s.key === shape)!;

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-300">
        <FlaskConical size={13} aria-hidden /> Test area — nothing here is live
      </div>
      <h1 className="font-mono text-[28px] font-bold text-white">Galaxy</h1>
      <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
        The picture tells you the shape of a lineage, the list tells you where to go. They share a selection — hover
        either side and the other lights up, click a row or a star to trace it back to the original. Switch the test
        tree to a nasty shape and see if it holds.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
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

      <div className="mt-4 overflow-hidden rounded-xl border border-neutral-700">
        <VizGalaxy nodes={nodes} />
      </div>
    </div>
  );
}
