"use client";

import { FlaskConical } from "lucide-react";
import { Accomplishment } from "./accomplishment";

export function LabClient() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-300">
        <FlaskConical size={13} aria-hidden /> Test area — nothing here is live
      </div>
      <h1 className="font-mono text-[28px] font-bold text-white">Making forks feel earned</h1>
      <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
        The swarm fixed scale — five looks like five, sixty thousand looks like a galaxy. It doesn&apos;t make anything
        feel like an achievement, because size on its own isn&apos;t one. Seven things that are, all on the same
        project so they can be compared.
      </p>

      <div className="mt-6">
        <Accomplishment />
      </div>
    </div>
  );
}
