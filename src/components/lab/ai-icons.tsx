"use client";

import {
  Brain,
  BrainCircuit,
  Sparkles,
  Bot,
  Cpu,
  CircuitBoard,
  Atom,
  Zap,
  Waves,
  Network,
  Hexagon,
  Binary,
  Orbit,
  Aperture,
  Gem,
  type LucideIcon,
} from "lucide-react";
import { GROUPS, categoryMeta } from "@/lib/categories";

const AI = GROUPS.ai.hex;

/**
 * Candidates for the AI group mark.
 *
 * It has to hold up at 16px inside a card tile, sit beside a hammer and a play
 * triangle without looking like a different family, and not be the tired
 * glowing-brain cliché every AI product already uses.
 */
const CANDIDATES: { Icon: LucideIcon; name: string; note: string }[] = [
  { Icon: Brain, name: "Brain", note: "What's shipped. The obvious choice, and the one every AI product already uses." },
  { Icon: BrainCircuit, name: "BrainCircuit", note: "Brain with traces. More specific, but busy — the detail turns to mud at 16px." },
  { Icon: Sparkles, name: "Sparkles", note: "The current industry shorthand for AI. Instantly understood, completely generic." },
  { Icon: Bot, name: "Bot", note: "Reads as chatbot rather than model. Friendly, slightly toy-like." },
  { Icon: Cpu, name: "Cpu", note: "Machine rather than mind. Sits well beside a hammer — both are tools." },
  { Icon: CircuitBoard, name: "CircuitBoard", note: "Same idea with more texture. Strong at 21px, crowded at 16." },
  { Icon: Atom, name: "Atom", note: "Abstract, scientific, unclaimed by AI branding. Distinct at any size." },
  { Icon: Zap, name: "Zap", note: "Energy, speed. Very legible small — but it means 'fast' everywhere else." },
  { Icon: Waves, name: "Waves", note: "Signal, inference, something flowing. Quiet and unusual." },
  { Icon: Network, name: "Network", note: "Nodes and edges — literally what a model is. Reads as networking too." },
  { Icon: Hexagon, name: "Hexagon", note: "Pure geometry, no metaphor at all. Would need the colour to carry meaning." },
  { Icon: Binary, name: "Binary", note: "Ones and zeroes. Honest and technical, maybe too retro." },
  { Icon: Orbit, name: "Orbit", note: "A centre with things moving around it. Distinctive and calm." },
  { Icon: Aperture, name: "Aperture", note: "Lens, focus, perception. Elegant, holds its shape when tiny." },
  { Icon: Gem, name: "Gem", note: "Something refined out of raw material. Unusual for AI, reads as quality." },
];

export function AiIcons() {
  return (
    <div className="space-y-3">
      {CANDIDATES.map(({ Icon, name, note }, i) => (
        <div
          key={name}
          className="flex flex-wrap items-center gap-5 rounded-xl border border-neutral-800 bg-neutral-900/30 p-4"
        >
          {/* in the tile, at both sizes — the only place it has to work */}
          <div className="flex shrink-0 items-center gap-3">
            <Tile Icon={Icon} big />
            <Tile Icon={Icon} />
          </div>

          {/* beside the other two groups, to check it belongs to the family */}
          <div className="flex shrink-0 items-center gap-2 border-l border-neutral-800 pl-5">
            <Tile Icon={Icon} />
            <Tile Icon={categoryMeta("scripts-tools").Icon} tone={GROUPS.build.hex} />
            <Tile Icon={categoryMeta("games").Icon} tone={GROUPS.play.hex} />
          </div>

          <div className="min-w-[220px] flex-1">
            <p className="font-mono text-[14px] font-bold text-white">
              <span className="mr-2 text-neutral-600">{String(i + 1).padStart(2, "0")}</span>
              {name}
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-neutral-400">{note}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Tile({ Icon, big, tone = AI }: { Icon: LucideIcon; big?: boolean; tone?: string }) {
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900 ${
        big ? "h-16 w-14" : "h-11 w-10"
      }`}
    >
      <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: tone }} aria-hidden />
      <Icon size={big ? 21 : 16} strokeWidth={1.6} style={{ color: tone }} aria-hidden />
    </span>
  );
}
