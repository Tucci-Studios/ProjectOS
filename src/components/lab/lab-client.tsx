"use client";

import { FlaskConical } from "lucide-react";
import { PolishToggle } from "./polish-toggle";
import type { ProjectFeedRow } from "@/components/project-card";
import { ProjectCard } from "@/components/project-card";

/**
 * The bench: one switch, and real cards to watch it happen to.
 *
 * These are actual ProjectCards from the database, not a copy of one — so
 * whatever the switch does here is exactly what it does on Explore.
 */
export function LabClient({ cards }: { cards: ProjectFeedRow[] }) {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-300">
        <FlaskConical size={13} aria-hidden /> Test area — nothing here is live
      </div>
      <h1 className="font-mono text-[28px] font-bold text-white">Lab</h1>
      <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
        Where things get tried before they earn a place on the site.
      </p>

      <section className="mt-8">
        <h2 className="font-mono text-[15px] font-bold text-white">Making it feel expensive</h2>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-neutral-400">
          Press the switch and watch this page change around you. It only applies here — leaving the Lab turns it
          off.
        </p>

        <PolishToggle />

        <div className="mt-5 space-y-3">
          {cards.map((p) => (
            <ProjectCard key={p.id} p={p} vote={0} following={false} saved={false} canFollow={false} />
          ))}
        </div>
      </section>
    </div>
  );
}
