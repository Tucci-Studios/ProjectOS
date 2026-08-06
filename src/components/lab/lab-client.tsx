"use client";

import { FlaskConical } from "lucide-react";
import { IconMatrix } from "./icon-matrix";

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

      <section className="mt-9">
        <h2 className="font-mono text-[15px] font-bold text-white">The tab icon, 27 ways</h2>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-neutral-400">
          Every combination of ring, prompt and cursor in green, black and white — drawn at the size it actually
          ships, inside mock Safari and Chrome tabs. Safari puts a light chip behind favicons and Chrome puts them
          straight on the tab, which is the whole reason this was hard to judge from a file.
        </p>
        <div className="mt-5">
          <IconMatrix />
        </div>
      </section>
    </div>
  );
}
