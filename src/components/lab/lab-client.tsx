"use client";

import { FlaskConical } from "lucide-react";
import { SectionMarks } from "./section-marks";

export function LabClient() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-300">
        <FlaskConical size={13} aria-hidden /> Test area — nothing here is live
      </div>
      <h1 className="font-mono text-[28px] font-bold text-white">The last two marks</h1>
      <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
        Eight are settled. The first pass at these two reached for wrenches and puzzle pieces — generic pictures of
        &ldquo;capability&rdquo; and &ldquo;tool&rdquo;. This set comes at it from the syntax instead: what you
        actually type or see when you use one.
      </p>

      <div className="mt-6">
        <SectionMarks />
      </div>
    </div>
  );
}
