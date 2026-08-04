"use client";

import { FlaskConical } from "lucide-react";
import { Accomplishment } from "./accomplishment";

export function LabClient() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-300">
        <FlaskConical size={13} aria-hidden /> Test area — nothing here is live
      </div>
      <h1 className="font-mono text-[28px] font-bold text-white">Say less</h1>
      <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
        The badges and tiers were the site congratulating itself. The swarm is already the interesting part — these
        three argue about how little is allowed to sit next to it.
      </p>

      <div className="mt-6">
        <Accomplishment />
      </div>
    </div>
  );
}
