"use client";

import { useMemo, useState } from "react";
import { GitFork, Star, Users, ChevronUp, Download, ExternalLink, Bookmark, Bell, Megaphone } from "lucide-react";
import { LAB_PROJECT, type LabNode } from "@/lib/lab-data";
import { Orbit } from "./orbit";
import { build, flatten, byVotes, name } from "./tree";

export type Placement = "crest" | "trophy" | "ribbon" | "medallion" | "backdrop";

export const PLACEMENTS: { key: Placement; label: string; blurb: string }[] = [
  {
    key: "crest",
    label: "Crest",
    blurb:
      "Small, up in the header beside the name — the way a badge sits on a shirt. Always moving, never asks for anything, and you see it the instant the page loads.",
  },
  {
    key: "trophy",
    label: "Trophy case",
    blurb:
      "A framed card at the top of the forks section with the count beside it. Reads most like an award: the thing is on a shelf, in a box, with its number engraved next to it.",
  },
  {
    key: "ribbon",
    label: "Ribbon",
    blurb:
      "A wide, shallow band across the top of the forks section. Uses space the page already wastes, and the width lets the outer generations actually breathe.",
  },
  {
    key: "medallion",
    label: "Medallion",
    blurb:
      "A circle floated to the right of the fork list, so the list reads normally and the visual sits beside it. Biggest of the inline options without pushing anything down.",
  },
  {
    key: "backdrop",
    label: "Backdrop",
    blurb:
      "Behind the fork list at low opacity, drifting under the text. Most atmospheric, least legible — worth seeing, probably too subtle to be the trophy.",
  },
];

/**
 * A stand-in for the real project page, so a fork visual can be judged where it
 * will actually live rather than on a blank canvas. Everything here is fake.
 */
export function Replica({ nodes, placement }: { nodes: LabNode[]; placement: Placement }) {
  const root = useMemo(() => build(nodes), [nodes]);
  const top = useMemo(() => {
    if (!root) return [];
    return flatten(root)
      .filter((n) => n.depth > 0)
      .sort(byVotes)
      .slice(0, 5);
  }, [root]);

  const forks = nodes.length - 1;

  return (
    <div className="bg-[#0f1411] p-5 md:p-7">
      {/* ── header ─────────────────────────────────────────────── */}
      <div className="flex items-start gap-4">
        <Votes />
        <div className="min-w-0 flex-1">
          <h2 className="font-mono text-[26px] font-bold leading-tight tracking-tight text-white">
            {LAB_PROJECT.name}
          </h2>
          <p className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-xs text-neutral-500">
            <span className="text-neutral-300">@nyx</span>
            <span>·</span>
            <span>3d ago</span>
            <span>·</span>
            <span className="text-orange-400">Game</span>
          </p>
        </div>

        {placement === "crest" && (
          <div className="hidden shrink-0 sm:block" title={`${forks} forks`}>
            <div className="h-[104px] w-[104px]">
              <Orbit nodes={nodes} height={104} chrome={false} labels={false} />
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 text-[17px] leading-relaxed text-neutral-200">{LAB_PROJECT.description}</p>

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
        <Stat Icon={GitFork} value={forks.toLocaleString()} label="forks" tone="text-emerald-400" />
        <Stat Icon={ChevronUp} value="0" label="votes" />
        <Stat Icon={Users} value="12" label="followers" />
        <Stat Icon={Star} value="4.2k" label="stars" tone="text-amber-400" filled />
        <span className="ml-auto flex items-center gap-2">
          <Ghost>
            <Bell size={13} aria-hidden /> Follow
          </Ghost>
          <Ghost>
            <Bookmark size={13} aria-hidden />
          </Ghost>
        </span>
      </div>

      <div className="mt-7 border-t border-neutral-800 pt-5">
        <h3 className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
          <Megaphone size={13} aria-hidden /> Updates
        </h3>
        <p className="mt-2 text-sm text-neutral-500">Rewrote the save system — no more corrupt files.</p>
      </div>

      {/* ── forks ──────────────────────────────────────────────── */}
      <section className="relative mt-7 border-t border-neutral-800 pt-5">
        {placement === "backdrop" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
            <div className="w-[520px]">
              <Orbit nodes={nodes} height={420} chrome={false} labels={false} dim={0.22} />
            </div>
          </div>
        )}

        <div className="relative">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
              <GitFork size={13} aria-hidden /> Forks
              <span className="font-normal normal-case tracking-normal text-emerald-400">
                {forks.toLocaleString()}
              </span>
            </h3>
            <span className="font-mono text-[11px] text-neutral-600">4 published here</span>
          </div>

          {placement === "trophy" && (
            <div className="mt-4 flex items-center gap-5 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.03] p-4">
              <div className="h-[150px] w-[150px] shrink-0">
                <Orbit nodes={nodes} height={150} chrome={false} labels={false} />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[34px] font-bold leading-none text-white tabular-nums">
                  {forks.toLocaleString()}
                </p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400">
                  forks · {root?.maxDepth ?? 0} generations
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-neutral-400">
                  Every ring is a generation of people building on this.
                </p>
              </div>
            </div>
          )}

          {placement === "ribbon" && (
            <div className="mt-4 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/40">
              <Orbit nodes={nodes} height={170} chrome={false} labels={false} />
            </div>
          )}

          <div className={placement === "medallion" ? "mt-4 flex items-start gap-5" : "mt-4"}>
            <ol className="min-w-0 flex-1 space-y-1.5">
              {top.map((f, i) => (
                <li key={f.id}>
                  <div className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900/40 px-3 py-2 transition hover:border-neutral-600">
                    <span className="w-4 shrink-0 text-right font-mono text-[11px] text-neutral-600">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-[13px] text-neutral-100">{name(f)}</span>
                      <span className="block truncate font-mono text-[10px] text-neutral-500">
                        @{f.github_login} · {f.change_summary}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-[12px] text-emerald-400">+{f.like_count}</span>
                  </div>
                </li>
              ))}
            </ol>

            {placement === "medallion" && (
              <div className="hidden h-[230px] w-[230px] shrink-0 rounded-full border border-neutral-800 bg-neutral-900/30 md:block">
                <Orbit nodes={nodes} height={230} chrome={false} labels={false} />
              </div>
            )}
          </div>

          <p className="mt-3 font-mono text-[11px] text-neutral-600">
            The rest exist on GitHub but nobody published them here.
          </p>
        </div>
      </section>
    </div>
  );
}

/* ── small stand-ins for the real components ──────────────────── */

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
      <Icon size={13} className={`self-center ${tone ?? "text-neutral-500"} ${filled ? "fill-current" : ""}`} aria-hidden />
      <span className={`font-mono text-[15px] font-bold ${tone ?? "text-neutral-200"}`}>{value}</span>
      <span className="font-mono text-[12px] text-neutral-500">{label}</span>
    </span>
  );
}
