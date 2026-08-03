"use client";

import { Crown, Lightbulb, GitBranch } from "lucide-react";

// Badges are counts you earned, never titles handed out.
export type Badges = { numberOne: number; ideasShipped: number; biggestTree: number };

export function UserBadges({
  badges,
  size = "sm",
  showTree = false,
}: {
  badges: Badges;
  size?: "sm" | "md";
  /** Tree size is a profile-page stat, not something to crowd a byline with. */
  showTree?: boolean;
}) {
  const items = [
    badges.numberOne > 0 && {
      key: "no1",
      Icon: Crown,
      count: badges.numberOne,
      cls: "border-amber-400/40 bg-amber-400/10 text-amber-300",
      title: "Top of the charts",
      detail: `Has ${badges.numberOne} project${badges.numberOne === 1 ? "" : "s"} sitting at #1 on Project OS.`,
    },
    badges.ideasShipped > 0 && {
      key: "idea",
      Icon: Lightbulb,
      count: badges.ideasShipped,
      cls: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300",
      title: "Shipped an idea",
      detail: `Proposed ${badges.ideasShipped} change${badges.ideasShipped === 1 ? "" : "s"} the community voted for — now built into this site.`,
    },
    showTree && badges.biggestTree > 1 && {
      key: "tree",
      Icon: GitBranch,
      count: badges.biggestTree,
      cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
      title: "Grew a tree",
      detail: `Published something ${badges.biggestTree} people branched into their own versions.`,
    },
  ].filter(Boolean) as { key: string; Icon: typeof Crown; count: number; cls: string; title: string; detail: string }[];

  if (items.length === 0) return null;
  const dims = size === "md" ? "px-2 py-0.5 text-[11px]" : "px-1.5 py-px text-[10px]";
  const icon = size === "md" ? 11 : 10;

  return (
    <span className="inline-flex items-center gap-1">
      {items.map((b) => (
        <span key={b.key} className="group/badge relative inline-flex">
          <span
            className={`inline-flex cursor-help items-center gap-0.5 rounded-full border font-mono font-bold ${dims} ${b.cls}`}
          >
            <b.Icon size={icon} aria-hidden />
            {b.count}
          </span>

          {/* Explain it on hover — a new person has no idea what a crown means. */}
          <span
            role="tooltip"
            className="pointer-events-none absolute left-1/2 top-[calc(100%+6px)] z-40 w-52 -translate-x-1/2 translate-y-1 rounded-lg border border-neutral-700 bg-[#1a221d] px-3 py-2 text-left opacity-0 shadow-xl transition-all duration-150 group-hover/badge:translate-y-0 group-hover/badge:opacity-100"
          >
            <span className={`block font-mono text-[11px] font-bold ${b.cls.split(" ").find((c) => c.startsWith("text-"))}`}>
              {b.title}
            </span>
            <span className="mt-0.5 block text-[11px] leading-snug text-neutral-400">{b.detail}</span>
          </span>
        </span>
      ))}
    </span>
  );
}
