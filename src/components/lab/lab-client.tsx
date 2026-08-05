"use client";

import { useState } from "react";
import { FlaskConical } from "lucide-react";
import { VERIFIED_MARKS } from "./verified-marks";

/**
 * Judging a mark that lives at 11px.
 *
 * Shown three ways on purpose. Big enough to see the shape, at the size it
 * actually ships, and — the one that decides it — repeated down a list of
 * names, because that's where a badge either earns its place or turns into
 * visual noise.
 */
const NAMES = ["thedotmack", "alirezarezvani", "n8n-io", "travisvn", "ComposioHQ"];

export function LabClient() {
  const [picked, setPicked] = useState<string>("02");
  const current = VERIFIED_MARKS.find((m) => m.key === picked)!;

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
        <h2 className="font-mono text-[15px] font-bold text-white">The verified mark — ten takes</h2>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-neutral-400">
          It means one thing: this person has signed in, rather than having been indexed from GitHub without ever
          hearing of us. It has to feel like something you got — while sitting at 11px next to a name, holding still,
          possibly a dozen times down one page.
        </p>

        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
          {VERIFIED_MARKS.map(({ key, name, Mark, note }) => {
            const on = key === picked;
            return (
              <button
                key={key}
                onClick={() => setPicked(key)}
                aria-pressed={on}
                className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  on ? "border-emerald-400/60 bg-emerald-400/[0.05]" : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-600"
                }`}
              >
                <span className="flex shrink-0 flex-col items-center gap-2.5 pt-0.5">
                  <Mark size={40} />
                  <Mark size={12} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="font-mono text-[11px] text-neutral-400">{key}</span>
                    <span className="font-mono text-[14px] font-bold text-white">{name}</span>
                  </span>
                  <span className="mt-1.5 block text-[12.5px] leading-relaxed text-neutral-400">{note}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-7">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-neutral-400">
            {current.key} {current.name} — where it actually lives
          </p>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
            <div className="space-y-2.5">
              {NAMES.map((n, i) => (
                <p key={n} className="flex items-center gap-1.5 font-mono text-[13px] text-neutral-400">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 text-[8px] uppercase">
                    {n.slice(0, 2)}
                  </span>
                  @{n}
                  {/* the third and fifth are shadow authors — the mark has to be
                      the thing that separates them at a glance */}
                  {i !== 2 && i !== 4 && <current.Mark size={12} />}
                  <span className="ml-1 text-neutral-600">· 2 projects</span>
                </p>
              ))}
            </div>
          </div>
          <p className="mt-2 text-[12.5px] text-neutral-400">
            Two of these five are unmarked. If you can&apos;t tell which without looking twice, the mark is too quiet.
          </p>
        </div>
      </section>
    </div>
  );
}
