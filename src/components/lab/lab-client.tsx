"use client";

import { useState } from "react";
import { FlaskConical } from "lucide-react";
import { ProjectExtras } from "./project-extras";

/**
 * On the bench: what a project page could show that it doesn't.
 *
 * Run against a real repo you pick, because the whole question is which of
 * these survive contact with the catalogue. Half of them look excellent against
 * a big well-kept project and vanish against a two-file skill — and that's the
 * thing to find out before any of it reaches 655 pages.
 */
export function LabClient({ samples }: { samples: { id: string; base_name: string; github_repo: string }[] }) {
  const [pick, setPick] = useState(samples[0]?.id ?? "");

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
        <h2 className="font-mono text-[15px] font-bold text-white">What a project page is missing</h2>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-neutral-400">
          The same project page twice — as it is now, and with the GitHub data we don&apos;t show yet. Real data, so
          switch projects and watch which rows go empty on an ordinary repo. Turn a row off to see whether the page
          is actually worse without it.
        </p>

        {samples.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {samples.map((s) => (
              <button
                key={s.id}
                onClick={() => setPick(s.id)}
                aria-pressed={pick === s.id}
                className={`min-h-[34px] cursor-pointer rounded-full border px-3 font-mono text-[12px] outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  pick === s.id
                    ? "border-emerald-400 bg-emerald-400/10 font-bold text-emerald-300"
                    : "border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200"
                }`}
              >
                {s.base_name}
              </button>
            ))}
          </div>
        )}

        <div className="mt-5">{pick && <ProjectExtras key={pick} projectId={pick} />}</div>
      </section>
    </div>
  );
}
