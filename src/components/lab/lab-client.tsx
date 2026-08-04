"use client";

import { FlaskConical } from "lucide-react";
import { GroupTiles } from "./group-tiles";

export function LabClient() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-300">
        <FlaskConical size={13} aria-hidden /> Test area — nothing here is live
      </div>
      <h1 className="font-mono text-[28px] font-bold text-white">What replaces the vote arrows</h1>
      <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
        Five rectangles for the slot the up and down arrows used to hold, each at both sizes, for all three groups —
        and then the same thing sitting on a card, which is the only test that counts.
      </p>

      <div className="mt-6">
        <GroupTiles />
      </div>
    </div>
  );
}
