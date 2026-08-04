"use client";

import { GROUPS, GROUP_ORDER, categoryMeta, type GroupKey } from "@/lib/categories";

/**
 * Five ways to draw the group rectangle that replaces the vote control on a
 * card, each at both sizes.
 *
 * It has to work at a glance in a list of two dozen, survive being 44px wide on
 * a phone, and tell AI from Build from Play without reading anything. Colour
 * alone won't do it — the icon has to carry it too.
 */

export type TileProps = { group: GroupKey; category: string; big?: boolean };

/** 01 — solid block, icon only. The most obvious thing that could work. */
export function Solid({ group, big }: TileProps) {
  const g = GROUPS[group];
  return (
    <span
      className={`flex shrink-0 flex-col items-center justify-center rounded-lg ${big ? "h-16 w-14" : "h-11 w-10"}`}
      style={{ background: `${g.hex}1f`, border: `1px solid ${g.hex}55` }}
    >
      <g.Icon size={big ? 22 : 16} strokeWidth={1.7} style={{ color: g.hex }} aria-hidden />
    </span>
  );
}

/** 02 — icon over the group's name, so it teaches itself. */
export function Labelled({ group, big }: TileProps) {
  const g = GROUPS[group];
  return (
    <span
      className={`flex shrink-0 flex-col items-center justify-center gap-1 rounded-lg ${big ? "h-16 w-14" : "h-11 w-11"}`}
      style={{ background: `${g.hex}14`, border: `1px solid ${g.hex}44` }}
    >
      <g.Icon size={big ? 20 : 14} strokeWidth={1.7} style={{ color: g.hex }} aria-hidden />
      <span
        className={`font-mono font-bold uppercase leading-none tracking-wider ${big ? "text-[9px]" : "text-[7px]"}`}
        style={{ color: g.hex }}
      >
        {g.label}
      </span>
    </span>
  );
}

/** 03 — a coloured spine down one edge, the rest quiet. */
export function Spine({ group, big }: TileProps) {
  const g = GROUPS[group];
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900 ${
        big ? "h-16 w-14" : "h-11 w-10"
      }`}
    >
      <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: g.hex }} />
      <g.Icon size={big ? 21 : 15} strokeWidth={1.6} style={{ color: g.hex }} aria-hidden />
    </span>
  );
}

/** 04 — the section's own icon, with the group colour behind it. */
export function Section({ group, category, big }: TileProps) {
  const g = GROUPS[group];
  const meta = categoryMeta(category);
  return (
    <span
      className={`flex shrink-0 flex-col items-center justify-center rounded-lg ${big ? "h-16 w-14" : "h-11 w-10"}`}
      style={{ background: `${g.hex}18`, border: `1px solid ${g.hex}40` }}
      title={meta.label}
    >
      <meta.Icon size={big ? 21 : 15} strokeWidth={1.6} style={{ color: g.hex }} aria-hidden />
    </span>
  );
}

/** 05 — no fill at all, just a rule under the icon. The quietest. */
export function Underline({ group, big }: TileProps) {
  const g = GROUPS[group];
  return (
    <span
      className={`flex shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/60 ${
        big ? "h-16 w-14" : "h-11 w-10"
      }`}
    >
      <g.Icon size={big ? 21 : 15} strokeWidth={1.6} className="text-neutral-300" aria-hidden />
      <span className="h-[2px] w-5 rounded-full" style={{ background: g.hex }} />
    </span>
  );
}

export const DESIGNS: { key: string; label: string; note: string; Tile: (p: TileProps) => React.ReactNode }[] = [
  {
    key: "solid",
    label: "Solid",
    note: "Tinted block, icon only. Reads fastest in a long list, and the colour does most of the work — which is also the risk, since colour alone fails for anyone who can't separate these three hues.",
    Tile: Solid,
  },
  {
    key: "labelled",
    label: "Labelled",
    note: "Same block with the word under it. The only one that needs no learning at all, and the only one that still works in greyscale. Costs a little height and gets tight at the small size.",
    Tile: Labelled,
  },
  {
    key: "spine",
    label: "Spine",
    note: "Colour reduced to a stripe down the edge, so a page of cards stays calm. Quietest of the coloured options — but at small sizes the stripe is easy to miss entirely.",
    Tile: Spine,
  },
  {
    key: "section",
    label: "Section icon",
    note: "The section's own icon rather than the group's, so Games and Apps look different from each other instead of both being Play. Most informative, and the one most likely to be unreadable at 11px.",
    Tile: Section,
  },
  {
    key: "underline",
    label: "Underline",
    note: "No fill, neutral icon, one coloured rule beneath. Sits back the furthest — good if the card should be about the project, bad if the group is meant to be scannable.",
    Tile: Underline,
  },
];

/** One category per group, to stand in for the section-icon variant. */
const SAMPLE: Record<GroupKey, string> = {
  ai: "claude-skills",
  build: "scripts-tools",
  play: "games",
};

export function GroupTiles() {
  return (
    <div className="space-y-4">
      {DESIGNS.map((d, i) => (
        <section key={d.key} className="overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900/30">
          <header className="border-b border-neutral-800 px-5 py-3">
            <h2 className="flex items-baseline gap-2.5 font-mono text-[15px] font-bold text-white">
              <span className="text-neutral-600">{String(i + 1).padStart(2, "0")}</span>
              {d.label}
            </h2>
            <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-neutral-400">{d.note}</p>
          </header>

          <div className="flex flex-wrap items-end gap-x-8 gap-y-5 p-5">
            {GROUP_ORDER.map((g) => (
              <div key={g} className="flex items-end gap-3">
                <div className="flex flex-col items-center gap-1.5">
                  <d.Tile group={g} category={SAMPLE[g]} big />
                  <span className="font-mono text-[10px] text-neutral-600">big</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <d.Tile group={g} category={SAMPLE[g]} />
                  <span className="font-mono text-[10px] text-neutral-600">small</span>
                </div>
                <span className="pb-5 font-mono text-[11px] text-neutral-500">{GROUPS[g].label}</span>
              </div>
            ))}
          </div>

          {/* in place, on a card, which is the only test that counts */}
          <div className="border-t border-neutral-800 bg-neutral-900/40 p-5">
            <p className="mb-2.5 font-mono text-[10px] uppercase tracking-widest text-neutral-600">On a card</p>
            <div className="space-y-2">
              {GROUP_ORDER.map((g) => (
                <div
                  key={g}
                  className="flex items-start gap-3 rounded-xl border border-neutral-700/70 bg-neutral-900/40 px-4 py-3"
                >
                  <div className="flex shrink-0 self-center">
                    <d.Tile group={g} category={SAMPLE[g]} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[15px] font-bold text-white">
                      {g === "ai" ? "claude-mem" : g === "build" ? "yeet-sh" : "subwolf"}
                    </p>
                    <p className="mt-1 line-clamp-1 text-sm text-neutral-400">
                      {g === "ai"
                        ? "Persistent context across sessions for every agent."
                        : g === "build"
                          ? "Finds every node_modules on your machine and yeets them."
                          : "A neon stealth game about a wolf that hacks security systems."}
                    </p>
                    <p className="mt-1.5 font-mono text-[11px] text-neutral-500">
                      @someone · <span className="text-amber-300/70">★ 4.2k</span> ·{" "}
                      <span className="font-bold text-emerald-400">1.1k forks</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
