"use client";

import { FlaskConical } from "lucide-react";
import { SectionMarks } from "./section-marks";

export function LabClient() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-300">
        <FlaskConical size={13} aria-hidden /> Test area — nothing here is live
      </div>
      <h1 className="font-mono text-[28px] font-bold text-white">The last three marks</h1>
      <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
        Seven are settled. These three resisted because none has an obvious written form — Claude Skills can&apos;t be
        &ldquo;CS&rdquo;, Claude Code can&apos;t be a logo, and Scripts &amp; Tools is two things at once. Type or icon,
        each in the real tile.
      </p>

      <div className="mt-6">
        <SectionMarks />
      </div>
    </div>
  );
}
