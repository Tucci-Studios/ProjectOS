"use client";

import { FlaskConical } from "lucide-react";
import { SectionMarks } from "./section-marks";

export function LabClient() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-300">
        <FlaskConical size={13} aria-hidden /> Test area — nothing here is live
      </div>
      <h1 className="font-mono text-[28px] font-bold text-white">Marks we&apos;re allowed to use</h1>
      <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
        Half the sections are &ldquo;things for product X&rdquo;, and the only honest picture of product X is its logo
        — which we can&apos;t use and shouldn&apos;t. A borrowed sparkle or plug tells you nothing either. Three systems
        drawn from scratch, all ten sections in each, shown in the real tile.
      </p>

      <div className="mt-6">
        <SectionMarks />
      </div>
    </div>
  );
}
