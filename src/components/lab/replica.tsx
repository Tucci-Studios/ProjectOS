"use client";

import { GitFork, Star, Users, ChevronUp, Download, ExternalLink, Bookmark, Bell } from "lucide-react";
import { ForkSwarm } from "../fork-swarm";

export type Spot = "hero" | "band" | "split" | "backdrop" | "card";

export const SPOTS: { key: Spot; label: string; blurb: string }[] = [
  {
    key: "hero",
    label: "Hero",
    blurb:
      "Full width across the very top, above the name, with the count sitting in it. The first thing you see before you know what the project even is — biggest possible statement, and it costs the description its place at the top of the page.",
  },
  {
    key: "band",
    label: "Band",
    blurb:
      "Full width and 320 tall, opening the forks section with the count underneath rather than over it. Nothing covers the field, so the swarm reads at full strength and the number still gets its own line.",
  },
  {
    key: "split",
    label: "Split",
    blurb:
      "Half the width, 300 tall, count on the left with room to breathe. Keeps the swarm large without giving up a whole band of page, and nothing overlaps anything.",
  },
  {
    key: "backdrop",
    label: "Backdrop",
    blurb:
      "Behind the entire forks section, full bleed, with the list sitting on top of it. The most atmospheric and the most likely to make the list hard to read — worth seeing before ruling out.",
  },
  {
    key: "card",
    label: "Card (shipped)",
    blurb:
      "What's on the real page now: 210 tall with the number over a scrim. Compact and tidy, but the scrim covers the left half of the field and the height caps how much the swarm can say.",
  },
];

/** A stand-in project page, so the swarm can be judged where it has to live. */
export function Replica({ count, spot }: { count: number; spot: Spot }) {
  const known = Math.min(50, count);

  return (
    <div className="bg-[#0f1411]">
      {spot === "hero" && (
        <div className="relative border-b border-neutral-800">
          <ForkSwarm count={count} known={known} height={300} />
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-mono text-[52px] font-bold leading-none tabular-nums text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              {count.toLocaleString()}
            </p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.35em] text-emerald-400">forks</p>
          </div>
        </div>
      )}

      <div className="p-5 md:p-7">
        <div className="flex items-start gap-4">
          <Votes />
          <div className="min-w-0 flex-1">
            <h2 className="font-mono text-[26px] font-bold leading-tight tracking-tight text-white">Subwolf</h2>
            <p className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-xs text-neutral-500">
              <span className="text-neutral-300">@nyx</span>
              <span>·</span>
              <span>3d ago</span>
              <span>·</span>
              <span className="text-orange-400">Game</span>
            </p>
          </div>
        </div>

        <p className="mt-4 text-[17px] leading-relaxed text-neutral-200">
          A neon stealth game about a wolf that hacks security systems.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <Btn primary>
            <GitFork size={16} aria-hidden /> Fork on GitHub <ExternalLink size={13} aria-hidden />
          </Btn>
          <Btn>
            <Download size={15} aria-hidden /> Get it
          </Btn>
          <Btn>GitHub</Btn>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-2.5">
          <Stat Icon={GitFork} value={count.toLocaleString()} label="forks" tone="text-emerald-400" />
          <Stat Icon={ChevronUp} value="0" label="votes" />
          <Stat Icon={Users} value="12" label="followers" />
          <Stat Icon={Star} value="4.2k" label="stars" tone="text-amber-300/70" filled />
          <span className="ml-auto flex items-center gap-2">
            <Ghost>
              <Bell size={13} aria-hidden /> Follow
            </Ghost>
            <Ghost>
              <Bookmark size={13} aria-hidden />
            </Ghost>
          </span>
        </div>

        {/* ── the forks section ─────────────────────────────── */}
        <section className="relative mt-7 border-t border-neutral-800 pt-5">
          {spot === "backdrop" && (
            <div className="pointer-events-none absolute inset-x-0 top-0 bottom-0">
              <ForkSwarm count={count} known={known} height={520} />
            </div>
          )}

          <div className="relative">
            <h3 className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
              <GitFork size={13} aria-hidden /> Forks
              <span className="font-normal normal-case tracking-normal text-emerald-400">
                {count.toLocaleString()}
              </span>
            </h3>

            {spot === "band" && (
              <div className="mt-4 overflow-hidden rounded-xl border border-emerald-400/25 bg-emerald-400/[0.03]">
                <ForkSwarm count={count} known={known} height={320} />
                <div className="flex items-baseline gap-3 border-t border-emerald-400/15 px-5 py-3">
                  <p className="font-mono text-[34px] font-bold leading-none tabular-nums text-white">
                    {count.toLocaleString()}
                  </p>
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400">forks</p>
                  <p className="ml-auto text-[13px] text-neutral-400">Every one of them came from Subwolf.</p>
                </div>
              </div>
            )}

            {spot === "split" && (
              <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.03] p-4">
                <div className="min-w-[180px] flex-1">
                  <p className="font-mono text-[44px] font-bold leading-none tabular-nums text-white">
                    {count.toLocaleString()}
                  </p>
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400">forks</p>
                  <p className="mt-3 text-[13px] leading-relaxed text-neutral-400">
                    Every one of them came from Subwolf.
                  </p>
                </div>
                <div className="min-w-[280px] flex-[1.4]">
                  <ForkSwarm count={count} known={known} height={300} />
                </div>
              </div>
            )}

            {spot === "card" && (
              <div className="relative mt-4 overflow-hidden rounded-xl border border-emerald-400/25 bg-emerald-400/[0.03]">
                <ForkSwarm count={count} known={known} height={210} />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex w-[62%] flex-col justify-center bg-gradient-to-r from-[#0f1411] via-[#0f1411]/85 to-transparent p-5">
                  <p className="font-mono text-[40px] font-bold leading-none tabular-nums text-white">
                    {count.toLocaleString()}
                  </p>
                  <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400">forks</p>
                  <p className="mt-2 max-w-[280px] text-[13px] leading-relaxed text-neutral-400">
                    Every one of them came from Subwolf.
                  </p>
                </div>
              </div>
            )}

            <ul className="mt-4 space-y-1.5">
              {["riverbed/subwolf", "tinfoil/subwolf", "halcyon/subwolf", "kilobyte/subwolf"].map((n, i) => (
                <li
                  key={n}
                  className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/40 px-3 py-2 font-mono text-[12px]"
                >
                  <span className="h-1.5 w-1.5 rounded-full border border-neutral-700" aria-hidden />
                  <span className="flex-1 truncate text-neutral-400">{n}</span>
                  <span className="text-[10px] text-neutral-600">{["1h", "10h", "2d", "5d"][i]} ago</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

function Votes() {
  return (
    <div className="flex w-8 shrink-0 flex-col items-center pt-1 text-neutral-600">
      <ChevronUp size={18} aria-hidden />
      <span className="py-0.5 font-mono text-sm font-bold text-neutral-300">0</span>
      <ChevronUp size={18} className="rotate-180" aria-hidden />
    </div>
  );
}

function Btn({ children, primary }: { children: React.ReactNode; primary?: boolean }) {
  return (
    <span
      className={`inline-flex min-h-[40px] items-center gap-2 rounded-lg px-4 font-mono text-sm font-bold ${
        primary ? "bg-emerald-400 text-black" : "border border-neutral-700 text-neutral-200"
      }`}
    >
      {children}
    </span>
  );
}

function Ghost({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-neutral-600 px-2.5 font-mono text-[11px] text-neutral-300">
      {children}
    </span>
  );
}

function Stat({
  Icon,
  value,
  label,
  tone,
  filled,
}: {
  Icon: typeof GitFork;
  value: string;
  label: string;
  tone?: string;
  filled?: boolean;
}) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <Icon
        size={13}
        className={`self-center ${tone ?? "text-neutral-500"} ${filled ? "fill-current" : ""}`}
        aria-hidden
      />
      <span className={`font-mono text-[15px] font-bold ${tone ?? "text-neutral-200"}`}>{value}</span>
      <span className="font-mono text-[12px] text-neutral-500">{label}</span>
    </span>
  );
}
