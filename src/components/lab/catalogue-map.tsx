"use client";

import { useMemo, useState } from "react";
import { GROUPS, GROUP_ORDER, categoryMeta, type GroupKey } from "@/lib/categories";

export type MapDot = {
  id: string;
  name: string;
  owner: string;
  category: string;
  stars: number;
  forks: number;
  pushedAt: number | null;
};

/**
 * All 655 projects, at once.
 *
 * Every other view here is a list — twenty-four at a time, sorted one way. None
 * of them let you see the shape of the thing: which sections are fat, which are
 * nearly empty, how much of the catalogue is enormous versus how much is one
 * person's weekend, and how much of it has been touched this month.
 *
 * Position is category (grouped left to right by AI / Build / Play), height is
 * stars on a log scale, because linear puts one 237k-star project at the top
 * and flattens the other 654 into a line. Brightness is how recently someone
 * pushed to it — the dim ones are the parts of the catalogue that have stopped
 * moving.
 */
export function CatalogueMap({ dots }: { dots: MapDot[] }) {
  const [hover, setHover] = useState<MapDot | null>(null);
  const [group, setGroup] = useState<GroupKey | "all">("all");

  const W = 900;
  const H = 420;
  const PAD = 34;

  const cats = useMemo(() => {
    const seen: string[] = [];
    for (const g of GROUP_ORDER)
      for (const d of dots) {
        const m = categoryMeta(d.category);
        if (m.group === g && !seen.includes(d.category)) seen.push(d.category);
      }
    return seen;
  }, [dots]);

  const maxStars = Math.max(...dots.map((d) => d.stars), 10);
  const logMax = Math.log10(maxStars + 1);
  // Floored to the day so the server and the client agree. An unrounded
  // Date.now() differs by milliseconds between the two renders, and near a
  // bucket boundary that flips a dot's brightness mid-hydration.
  const today = Math.floor(Date.now() / 86400000);

  const placed = useMemo(
    () =>
      dots.map((d, i) => {
        const col = Math.max(0, cats.indexOf(d.category));
        const band = (W - PAD * 2) / Math.max(1, cats.length);
        // Deterministic jitter — a seeded offset rather than random, so the map
        // doesn't rearrange itself on every render.
        const jitter = (((i * 2654435761) % 1000) / 1000 - 0.5) * band * 0.82;
        const x = PAD + band * col + band / 2 + jitter;
        const y = H - PAD - (Math.log10(d.stars + 1) / logMax) * (H - PAD * 2);
        const age = d.pushedAt ? today - Math.floor(d.pushedAt / 86400) : 9999;
        // Rounded, because the raw floats round-trip differently on the server
        // and in the browser and React calls that a hydration mismatch.
        return {
          d,
          x: Math.round(x * 100) / 100,
          y: Math.round(y * 100) / 100,
          r: Math.round((2 + (Math.log10(d.stars + 1) / logMax) * 6) * 100) / 100,
          alpha: age < 30 ? 0.92 : age < 180 ? 0.55 : 0.22,
          hex: GROUPS[categoryMeta(d.category).group].hex,
        };
      }),
    [dots, cats, logMax, today],
  );

  const shown = placed.filter((p) => group === "all" || categoryMeta(p.d.category).group === group);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {(["all", ...GROUP_ORDER] as const).map((g) => (
          <button
            key={g}
            onClick={() => setGroup(g as GroupKey | "all")}
            aria-pressed={group === g}
            className={`min-h-[32px] cursor-pointer rounded-full border px-3 font-mono text-[11.5px] outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 ${
              group === g
                ? "border-emerald-400 bg-emerald-400/10 font-bold text-emerald-300"
                : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
            }`}
          >
            {g === "all" ? `Everything (${dots.length})` : GROUPS[g as GroupKey].label}
          </button>
        ))}
      </div>

      <div className="relative overflow-x-auto rounded-xl border border-neutral-800 bg-[#10150f]/60 p-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[680px]" role="img" aria-label="Every project by section and stars">
          {[10, 100, 1000, 10000, 100000].map((tick) => {
            const y = Math.round((H - PAD - (Math.log10(tick + 1) / logMax) * (H - PAD * 2)) * 100) / 100;
            if (y < PAD || y > H - PAD) return null;
            return (
              <g key={tick}>
                <line x1={PAD} x2={W - PAD} y1={y} y2={y} stroke="#262626" strokeDasharray="2 4" />
                <text x={4} y={y + 3} fill="#6b7280" fontSize="9" fontFamily="monospace">
                  {tick >= 1000 ? `${tick / 1000}k` : tick}
                </text>
              </g>
            );
          })}

          {cats.map((c, i) => {
            const band = (W - PAD * 2) / Math.max(1, cats.length);
            const m = categoryMeta(c);
            const dim = group !== "all" && m.group !== group;
            return (
              <text
                key={c}
                x={Math.round((PAD + band * i + band / 2) * 100) / 100}
                y={H - 10}
                textAnchor="middle"
                fill={dim ? "#3f3f46" : "#8b9490"}
                fontSize="9"
                fontFamily="monospace"
              >
                {m.label.length > 12 ? `${m.label.slice(0, 11)}…` : m.label}
              </text>
            );
          })}

          {shown.map(({ d, x, y, r, alpha, hex }) => (
            <circle
              key={d.id}
              cx={x}
              cy={y}
              r={hover?.id === d.id ? Math.round((r + 2.5) * 100) / 100 : r}
              fill={hex}
              opacity={hover && hover.id !== d.id ? alpha * 0.35 : alpha}
              stroke={hover?.id === d.id ? "#fff" : "none"}
              strokeWidth="1.2"
              onMouseEnter={() => setHover(d)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer", transition: "opacity 140ms ease, r 140ms ease" }}
            />
          ))}
        </svg>

        <div className="pointer-events-none absolute left-3 top-3 font-mono text-[11px] leading-relaxed">
          {hover ? (
            <span className="text-white">
              {hover.name}
              <span className="text-neutral-400"> @{hover.owner}</span>
              <br />
              <span className="text-amber-300/80">{hover.stars.toLocaleString()}★</span>
              <span className="text-neutral-400"> · {categoryMeta(hover.category).label}</span>
            </span>
          ) : (
            <span className="text-neutral-400">Hover a dot</span>
          )}
        </div>
      </div>

      <p className="mt-2.5 text-[12.5px] leading-relaxed text-neutral-400">
        Height is stars on a log scale — linear would put one 237k project at the top and squash the other 654 into a
        line. Brightness is recency: solid means pushed this month, faint means nothing in six. The gaps along the
        bottom are the sections worth filling.
      </p>
    </div>
  );
}
