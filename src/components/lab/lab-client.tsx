"use client";

import { FlaskConical } from "lucide-react";
import { CatalogueMap, type MapDot } from "./catalogue-map";

/** On the bench: the whole catalogue in one picture. */
export function LabClient({ dots }: { dots: MapDot[] }) {
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
        <h2 className="font-mono text-[15px] font-bold text-white">The whole catalogue, at once</h2>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-neutral-400">
          Every listed project as one dot. Explore shows you twenty-four at a time in one order; this shows you the
          shape of the thing — which sections are fat, which are nearly empty, and how much of it has stopped moving.
        </p>
        <div className="mt-5">
          <CatalogueMap dots={dots} />
        </div>
      </section>
    </div>
  );
}
