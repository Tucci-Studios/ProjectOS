"use client";

import { FlaskConical } from "lucide-react";
import { ForkTree, type ForkNode, type TreeRoot } from "./fork-trees";

/**
 * The shelf, currently holding one thing.
 *
 * It had five experiments on it and four of them are settled — the header mark
 * is picked and live, empty counters are gone from project pages, and the
 * description and density tests answered their questions. Keeping finished
 * experiments around just makes the lab look like a graveyard.
 */
export function LabClient({
  treeRoot,
  forks,
}: {
  treeRoot: TreeRoot | null;
  forks: ForkNode[];
}) {
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
        <h2 className="font-mono text-[15px] font-bold text-white">The lineage tree</h2>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-neutral-400">
          The tree on the site draws for one project out of 655, because it only counts forks published back to
          Project OS and almost nobody has. This one uses the GitHub forks already synced — 13,761 rows sitting
          unused. Green means it&apos;s listed here. Grey means it isn&apos;t, which is the ask, not a gap.
        </p>

        {!treeRoot ? (
          <p className="mt-5 rounded-xl border border-dashed border-neutral-700 p-8 text-center text-sm text-neutral-400">
            No synced forks in the database yet — run scripts/sync-forks.mjs.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/40 p-6">
            <ForkTree root={treeRoot} forks={forks} />
          </div>
        )}
      </section>
    </div>
  );
}
