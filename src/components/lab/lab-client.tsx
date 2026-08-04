"use client";

import { useState } from "react";
import { FlaskConical } from "lucide-react";
import {
  RailTree,
  TerminalTree,
  FieldTree,
  TimelineTree,
  WeightTree,
  type ForkNode,
  type TreeRoot,
} from "./fork-trees";

/**
 * The shelf. One question on it: how do you draw a lineage.
 *
 * The top-down family tree was the obvious answer and it wasn't right, so these
 * five stop trying to be a tree. Each says a different thing, and the point of
 * having them side by side is to find out which thing is worth saying.
 */
const OPTIONS = [
  {
    key: "rail",
    label: "A · Rail",
    says: "History. A git graph — the trunk runs down the left and each fork peels off it. Nothing wraps, so it holds at any number of forks.",
    Render: RailTree,
  },
  {
    key: "terminal",
    label: "B · Terminal",
    says: "Structure. The listing a developer already reads all day. Costs nothing to understand and it's the same voice as the mark.",
    Render: TerminalTree,
  },
  {
    key: "field",
    label: "C · Field",
    says: "Scale. Every fork is one cell. Useless for reading names, unbeatable for feeling how many there are.",
    Render: FieldTree,
  },
  {
    key: "timeline",
    label: "D · Timeline",
    says: "When. Lineage happened over time and none of the others say so — position is the year each fork was last touched.",
    Render: TimelineTree,
  },
  {
    key: "weight",
    label: "E · Weight",
    says: "Which one matters. Not a diagram at all — one bar per fork, sized by stars. The least clever option here.",
    Render: WeightTree,
  },
] as const;

export function LabClient({ treeRoot, forks }: { treeRoot: TreeRoot | null; forks: ForkNode[] }) {
  const [pick, setPick] = useState<(typeof OPTIONS)[number]["key"]>("rail");
  const current = OPTIONS.find((o) => o.key === pick)!;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-300">
        <FlaskConical size={13} aria-hidden /> Test area — nothing here is live
      </div>
      <h1 className="font-mono text-[28px] font-bold text-white">Lab</h1>
      <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
        Where things get tried before they earn a place on the site.
      </p>

      <section className="mt-9">
        <h2 className="font-mono text-[15px] font-bold text-white">The lineage tree — five more takes</h2>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-neutral-400">
          Real rows, not a mock-up: one project and its actual GitHub forks. Green means the fork is listed on
          Project OS, grey means it isn&apos;t — and grey is the ask, not a gap in the data.
        </p>

        {!treeRoot ? (
          <p className="mt-5 rounded-xl border border-dashed border-neutral-700 p-8 text-center text-sm text-neutral-400">
            No synced forks in the database yet — run scripts/sync-forks.mjs.
          </p>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setPick(key)}
                  aria-pressed={pick === key}
                  className={`min-h-[36px] cursor-pointer rounded-full border px-3.5 font-mono text-[12px] outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                    pick === key
                      ? "border-emerald-400 bg-emerald-400/10 font-bold text-emerald-300"
                      : "border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-neutral-400">{current.says}</p>

            <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/40 p-6">
              <current.Render root={treeRoot} forks={forks} />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
