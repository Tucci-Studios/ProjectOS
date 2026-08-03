"use client";

import { useMemo, useState } from "react";
import { FlaskConical } from "lucide-react";
import { labLineage, SHAPES, type LabShape } from "@/lib/lab-data";
import {
  VizThreadline,
  VizRanked,
  VizExplorer,
  VizColumns,
  VizDendrogram,
  VizSunburst,
  VizIcicle,
  VizSpine,
  VizConstellation,
  VizLeaderboard,
} from "./visuals";

const VISUALS = [
  {
    n: 1,
    title: "Threadline",
    sub: "What the site uses today",
    holds: "Fine at 12. Falls apart past ~30 siblings — you scroll forever and lose the parent.",
    C: VizThreadline,
  },
  {
    n: 2,
    title: "Ranked + capped",
    sub: "Top 4 siblings, then “show 94 more”",
    holds: "Same shape as today but bounded. The 100-branch case becomes 4 rows and a button.",
    C: VizRanked,
  },
  {
    n: 3,
    title: "File explorer",
    sub: "One dense row per branch, everything folded",
    holds: "Very scannable. Expand-all still hurts on the monster tree, but nothing is ever forced open.",
    C: VizExplorer,
  },
  {
    n: 4,
    title: "Drill-down columns",
    sub: "Finder-style — pick a branch, its children fill the next column",
    holds: "Scales to any size, because you only ever see one generation at a time.",
    C: VizColumns,
  },
  {
    n: 5,
    title: "Dendrogram",
    sub: "The classic left-to-right family tree",
    holds: "Beautiful and honest at small sizes. Gets very tall very fast — needs scrolling in both directions.",
    C: VizDendrogram,
  },
  {
    n: 6,
    title: "Sunburst",
    sub: "Rings outward from the original, slice size = descendants",
    holds: "Handles hundreds in one screen. Great for “where did the growth happen”, bad for reading names.",
    C: VizSunburst,
  },
  {
    n: 7,
    title: "Icicle",
    sub: "Nested bars, width = share of the lineage",
    holds: "Same information as the sunburst but rectangular, so names actually fit. Click to zoom.",
    C: VizIcicle,
  },
  {
    n: 8,
    title: "Spine + tributaries",
    sub: "The strongest path drawn straight, side branches folded",
    holds: "Turns any tree into one readable story. Hides breadth by design — that's the trade.",
    C: VizSpine,
  },
  {
    n: 9,
    title: "Constellation",
    sub: "Every branch a star, distance = depth, size = votes",
    holds: "Gorgeous, works at 400 nodes, tells you shape at a glance. Not something you navigate with.",
    C: VizConstellation,
  },
  {
    n: 10,
    title: "Leaderboard",
    sub: "No tree — ranked list with a path breadcrumb",
    holds: "Infinite scale, zero drawing. Loses the shape of the family entirely.",
    C: VizLeaderboard,
  },
];

export function LabClient() {
  const [shape, setShape] = useState<LabShape>("wide");
  const nodes = useMemo(() => labLineage(shape), [shape]);
  const meta = SHAPES.find((s) => s.key === shape)!;

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-300">
        <FlaskConical size={13} aria-hidden /> Test area — nothing here is live
      </div>
      <h1 className="font-mono text-[28px] font-bold text-white">Ways to draw a branch tree</h1>
      <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
        Ten options for the same problem: a lineage stops being readable long before it stops growing. Switch the test
        tree below to a nasty shape and see which ones survive.
      </p>

      <div className="sticky top-[60px] z-10 -mx-1 mt-5 border-b border-neutral-800 bg-[#0f1411]/95 px-1 py-3 backdrop-blur">
        <div className="flex flex-wrap gap-2">
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
        <p className="mt-2 font-mono text-[11px] text-neutral-500">
          {meta.blurb} <span className="text-neutral-600">— {nodes.length} branches in this tree.</span>
        </p>
      </div>

      <div className="mt-5 space-y-5">
        {VISUALS.map(({ n, title, sub, holds, C }) => (
          <section key={n} className="overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900/30">
            <header className="border-b border-neutral-800 px-4 py-3">
              <h2 className="flex items-baseline gap-2.5 font-mono text-[15px] font-bold text-white">
                <span className="text-neutral-600">{String(n).padStart(2, "0")}</span>
                {title}
                <span className="font-normal text-[12px] text-neutral-500">{sub}</span>
              </h2>
              <p className="mt-1 text-[13px] leading-relaxed text-neutral-400">{holds}</p>
            </header>
            <C nodes={nodes} />
          </section>
        ))}
      </div>
    </div>
  );
}
