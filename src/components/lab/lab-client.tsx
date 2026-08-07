"use client";

import { FlaskConical } from "lucide-react";
import { TutorialView } from "@/components/tutorial-view";
import { CLAUDE_SKILLS } from "@/lib/tutorials/claude-skills";
import { TUTORIAL_SPEC } from "@/lib/tutorial-guide";

/**
 * One page, read top to bottom.
 *
 * The spec used to sit behind a second tab, which meant the tutorial ended and
 * then nothing happened. It's a section at the bottom now — someone who has
 * just finished a guide is exactly who's most likely to write one.
 */
export function LabClient({ specUrl }: { specUrl: string }) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-300">
        <FlaskConical size={13} aria-hidden /> Test area — nothing here is live
      </div>
      <h1 className="font-mono text-[28px] font-bold text-white">Lab</h1>
      <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
        Where things get tried before they earn a place on the site.
      </p>

      <section className="mt-8">
        <h2 className="font-mono text-[15px] font-bold text-white">The tutorial format</h2>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-neutral-400">
          One worked example, and at the bottom the spec that produces more of them. The shape is fixed on purpose — a
          reader should always know where the prerequisites are and where the thing that usually goes wrong is written
          down.
        </p>
        <div className="mt-5">
          <TutorialView
            t={{ ...CLAUDE_SKILLS, verified: { by: "Tucci-Studios", at: 0 } }}
            spec={TUTORIAL_SPEC}
            specUrl={specUrl}
          />
        </div>
      </section>
    </div>
  );
}
