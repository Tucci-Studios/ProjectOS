"use client";

import { useState } from "react";
import { FlaskConical } from "lucide-react";
import { LOGO_MARKS } from "./logo-marks";
import { TreeVertical, TreeRadial, TreeList, type ForkNode, type TreeRoot } from "./fork-trees";
import { DescriptionLab, ZeroStateLab, DensityLab } from "./experiments";

type Sample = {
  id: string;
  base_name: string;
  description: string;
  category: string;
  stars: number;
  github_forks: number;
  language: string | null;
};

const TABS = [
  { key: "tree", label: "Fork tree" },
  { key: "text", label: "Descriptions" },
  { key: "zeros", label: "Empty counters" },
  { key: "density", label: "Card density" },
  { key: "mark", label: "Header mark" },
] as const;

const TREES = [
  { key: "vertical", label: "A · Family tree", note: "The shape people already know. Reads as descent, and it's what the site claims to be about." },
  { key: "radial", label: "B · Ring", note: "One project surrounded by its offspring. Prettier, and says 'many' better than it says 'from'." },
  { key: "list", label: "C · Ranked", note: "Least pretty, most readable. Survives a phone, and the bar makes the size difference obvious." },
] as const;

/**
 * The shelf. Currently holding: ten candidate header marks.
 *
 * Shown three ways on purpose, because a logo that looks good on a swatch can
 * fall apart in the place it actually lives. Big to judge the idea, at 34px to
 * judge whether it survives, and dropped into a mock header to judge whether
 * you'd want to look at it all day.
 */
export function LabClient({
  treeRoot,
  forks,
  messy,
  sample,
}: {
  treeRoot: TreeRoot | null;
  forks: ForkNode[];
  messy: { name: string; description: string }[];
  sample: Sample[];
}) {
  const [picked, setPicked] = useState<string>("grow");
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("tree");
  const [tree, setTree] = useState<(typeof TREES)[number]["key"]>("vertical");
  const current = LOGO_MARKS.find((m) => m.key === picked)!;
  const treeNote = TREES.find((t) => t.key === tree)!;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-300">
        <FlaskConical size={13} aria-hidden /> Test area — nothing here is live
      </div>
      <h1 className="font-mono text-[28px] font-bold text-white">Lab</h1>
      <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
        Where things get tried before they earn a place on the site.
      </p>

      <div className="mt-7 flex gap-1 overflow-x-auto border-b border-neutral-800">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            aria-current={tab === key ? "page" : undefined}
            className={`-mb-px flex min-h-[42px] shrink-0 cursor-pointer items-center border-b-2 px-3.5 font-mono text-[13px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 ${
              tab === key
                ? "border-emerald-400 font-bold text-white"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "tree" && (
        <section className="mt-7">
          <h2 className="font-mono text-[15px] font-bold text-white">The lineage tree, from forks that already exist</h2>
          <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-neutral-400">
            The tree currently draws on one project page out of 655, because it only counts forks published back to
            Project OS and almost nobody has. These draw on the GitHub forks already synced — 13,761 rows sitting unused. Green means it&apos;s listed here; grey means it isn&apos;t, which is an
            invitation rather than a gap.
          </p>

          {!treeRoot ? (
            <p className="mt-5 rounded-xl border border-dashed border-neutral-700 p-8 text-center text-sm text-neutral-400">
              No synced forks in the database yet — run scripts/sync-forks.mjs.
            </p>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {TREES.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setTree(key)}
                    aria-pressed={tree === key}
                    className={`min-h-[34px] cursor-pointer rounded-full border px-3 font-mono text-[12px] outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                      tree === key
                        ? "border-emerald-400 bg-emerald-400/10 font-bold text-emerald-300"
                        : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[12.5px] text-neutral-400">{treeNote.note}</p>

              <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
                {tree === "vertical" && <TreeVertical root={treeRoot} forks={forks} />}
                {tree === "radial" && <TreeRadial root={treeRoot} forks={forks} />}
                {tree === "list" && <TreeList root={treeRoot} forks={forks} />}
              </div>
            </>
          )}
        </section>
      )}

      {tab === "text" && (
        <section className="mt-7">
          <h2 className="font-mono text-[15px] font-bold text-white">Descriptions, cleaned</h2>
          <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-neutral-400">
            283 of 655 descriptions carry badge markup, emoji bullets, pipe-separated platform lists or a trailing URL,
            straight from GitHub. Struck-through is what&apos;s live now; green is what the cleaner makes of it. These
            are the ten worst offenders, so if it holds here it holds everywhere.
          </p>
          <div className="mt-5">
            <DescriptionLab rows={messy} />
          </div>
        </section>
      )}

      {tab === "zeros" && (
        <section className="mt-7">
          <h2 className="font-mono text-[15px] font-bold text-white">Counters with nothing in them</h2>
          <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-neutral-400">
            Every project page says &ldquo;0 votes · 0 followers&rdquo;. It&apos;s honest, and on 655 pages it&apos;s
            also a site-wide announcement that the place is empty.
          </p>
          <div className="mt-5">
            <ZeroStateLab stars={sample[0]?.stars ?? 0} forks={sample[0]?.github_forks ?? 0} />
          </div>
        </section>
      )}

      {tab === "density" && (
        <section className="mt-7">
          <h2 className="font-mono text-[15px] font-bold text-white">How much fits on a screen</h2>
          <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-neutral-400">
            Explore shows 24 projects a page and you scroll a long way. Same six projects, both ways.
          </p>
          <div className="mt-5">
            <DensityLab rows={sample} />
          </div>
        </section>
      )}

      <section className={tab === "mark" ? "mt-7" : "hidden"}>
        <h2 className="font-mono text-[15px] font-bold text-white">Header mark — ten takes</h2>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-neutral-400">
          06 Terminal is live in the header now. The rest are kept for comparison. All original geometry, nobody else&apos;s marks. Pure CSS, so none of them run a timer in the header.
          Click one to see it in a mock header at real size. If your system is set to reduce motion, these still play here so you can judge them — everywhere the mark actually ships, it holds still.
        </p>

        <div className="motion-demo mt-5 grid gap-3 sm:grid-cols-2">
          {LOGO_MARKS.map(({ key, n, name, Mark, note }) => {
            const on = key === picked;
            return (
              <button
                key={key}
                onClick={() => setPicked(key)}
                aria-pressed={on}
                className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  on
                    ? "border-emerald-400/60 bg-emerald-400/[0.05]"
                    : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-600"
                }`}
              >
                <span className="flex shrink-0 flex-col items-center gap-2.5 pt-0.5">
                  <Mark size={56} />
                  <Mark size={34} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="font-mono text-[11px] text-neutral-400">{n}</span>
                    <span className="font-mono text-[14px] font-bold text-white">{name}</span>
                  </span>
                  <span className="mt-1.5 block text-[12.5px] leading-relaxed text-neutral-400">{note}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-neutral-400">
            {current.n} {current.name} — in a header, at 34px
          </p>
          <div className="motion-demo overflow-hidden rounded-xl border border-neutral-800">
            <div className="flex items-center gap-3 border-b border-neutral-800 bg-[#141a16] px-4 py-3">
              <current.Mark size={34} />
              <span className="flex flex-col leading-none">
                <span className="font-mono text-[17px] font-bold tracking-[0.16em] text-white">
                  PROJECT<span className="text-emerald-400">_</span>OS
                </span>
                <span className="mt-[3px] font-mono text-[8.5px] font-medium uppercase tracking-[0.42em] text-neutral-400">
                  open source
                </span>
              </span>
              <span className="ml-auto h-9 w-28 rounded-full border border-neutral-700" />
            </div>
            <div className="space-y-2 bg-[#161d18] p-4">
              <span className="block h-2.5 w-2/3 rounded bg-neutral-800" />
              <span className="block h-2.5 w-1/2 rounded bg-neutral-800/70" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
