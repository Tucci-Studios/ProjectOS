"use client";

import { FlaskConical } from "lucide-react";

/** Empty until something needs deciding. Keeping finished experiments around
 *  turns a lab into a museum. */
export function LabClient() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-300">
        <FlaskConical size={13} aria-hidden /> Test area — nothing here is live
      </div>
      <h1 className="font-mono text-[28px] font-bold text-white">Lab</h1>
      <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
        Where things get tried before they earn a place on the site.
      </p>
      <p className="mt-8 rounded-xl border border-dashed border-neutral-700 p-10 text-center text-sm text-neutral-400">
        Nothing on the bench right now.
      </p>
    </div>
  );
}
