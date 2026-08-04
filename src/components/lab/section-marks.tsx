"use client";

import { Sparkles, Code2, Wrench, Terminal, Zap, Puzzle, Blocks, GraduationCap, Wand2, FolderCode, GitBranch, Play, Cog, Hammer, type LucideIcon } from "lucide-react";
import { GROUPS } from "@/lib/categories";

/**
 * The three sections still without a mark.
 *
 * Seven are settled — .md, MCP, LLM, >_, Xai, ▢ and a controller. These three
 * resisted because none has an obvious written form: "Claude Skills" can't be
 * `CS`, "Claude Code" can't be a logo, and "Scripts & Tools" is two things.
 *
 * Each option is either short type or a drawn icon, shown in the real tile.
 */

type Option = { kind: "text"; text: string; note: string } | { kind: "icon"; Icon: LucideIcon; name: string; note: string };

const SETS: { slug: string; label: string; hex: string; current: string; options: Option[] }[] = [
  {
    slug: "claude-skills",
    label: "Claude Skills",
    hex: GROUPS.ai.hex,
    current: "SK",
    options: [
      { kind: "text", text: "SK", note: "What's in the lab now. Compact, but nobody reads SK as 'skill' without being told." },
      { kind: "text", text: "/", note: "Skills are invoked like commands. One character, unmistakable, and it hints at how you use one." },
      { kind: "text", text: "+1", note: "A skill is a trick added to what the model already does. Reads as an upgrade." },
      { kind: "icon", Icon: Puzzle, name: "Puzzle", note: "A piece that slots into something bigger — which is exactly what a skill is." },
      { kind: "icon", Icon: GraduationCap, name: "GraduationCap", note: "Teaching. Clear meaning, but it reads as courses and tutorials." },
      { kind: "icon", Icon: Wand2, name: "Wand", note: "A new ability. Playful, and close to the sparkle cliché without being it." },
      { kind: "icon", Icon: Zap, name: "Zap", note: "Something extra, instantly. Very legible tiny; means 'fast' elsewhere." },
      { kind: "icon", Icon: Blocks, name: "Blocks", note: "Add-on parts. Sits oddly close to Puzzle without being clearer." },
    ],
  },
  {
    slug: "claude-code",
    label: "Claude Code Projects",
    hex: GROUPS.build.hex,
    current: "{}",
    options: [
      { kind: "text", text: "{}", note: "What's in the lab now. Universally code, though it leans JavaScript to some eyes." },
      { kind: "text", text: "</>", note: "The other universal code mark. Slightly wider, reads unambiguously as source." },
      { kind: "text", text: "~/", note: "A project you clone into your own machine. Technical and specific." },
      { kind: "icon", Icon: FolderCode, name: "FolderCode", note: "A codebase rather than a snippet — the distinction this section actually rests on." },
      { kind: "icon", Icon: GitBranch, name: "GitBranch", note: "Something to fork and keep building. Collides with the fork icon used elsewhere." },
      { kind: "icon", Icon: Code2, name: "Code2", note: "What's shipped today. Fine, and completely generic." },
      { kind: "icon", Icon: Blocks, name: "Blocks", note: "A whole thing made of parts. Reads more like an app than a repo." },
    ],
  },
  {
    slug: "scripts-tools",
    label: "Scripts & Tools",
    hex: GROUPS.build.hex,
    current: "$",
    options: [
      { kind: "text", text: "$", note: "What's in the lab now. The shell prompt — instantly right for anyone who's used a terminal, invisible to anyone who hasn't." },
      { kind: "text", text: "$_", note: "Prompt with a cursor. Reads more like a live terminal than a currency symbol." },
      { kind: "text", text: "⌘", note: "A command. Elegant, but it means the Mac key to most people." },
      { kind: "icon", Icon: Terminal, name: "Terminal", note: "Where you run it. Clashes with Codex's terminal if that one keeps >_." },
      { kind: "icon", Icon: Wrench, name: "Wrench", note: "What's shipped today. Says 'tool' plainly, says nothing about scripts." },
      { kind: "icon", Icon: Cog, name: "Cog", note: "A working part. Very generic — it's the settings icon everywhere else." },
      { kind: "icon", Icon: Play, name: "Play", note: "Something you run. Collides with the Play group mark." },
      { kind: "icon", Icon: Hammer, name: "Hammer", note: "Collides with the Build group mark directly above it in the tile." },
    ],
  },
];

export function SectionMarks() {
  return (
    <div className="space-y-4">
      {SETS.map((set) => (
        <section key={set.slug} className="overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900/30">
          <header className="border-b border-neutral-800 px-5 py-3">
            <h2 className="font-mono text-[15px] font-bold text-white">{set.label}</h2>
            <p className="mt-1 font-mono text-[12px] text-neutral-500">
              currently <span className="text-neutral-300">{set.current}</span>
            </p>
          </header>

          <div className="flex flex-wrap gap-x-4 gap-y-4 p-5">
            {set.options.map((o, i) => (
              <div key={i} className="flex w-[150px] flex-col gap-2">
                <div className="flex items-end gap-2">
                  <Tile o={o} hex={set.hex} big />
                  <Tile o={o} hex={set.hex} />
                </div>
                <p className="font-mono text-[11px] font-bold text-neutral-200">
                  {o.kind === "text" ? o.text : o.name}
                </p>
                <p className="text-[11px] leading-snug text-neutral-500">{o.note}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Tile({ o, hex, big }: { o: Option; hex: string; big?: boolean }) {
  const size = big ? 24 : 18;
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900 pl-[3px] ${
        big ? "h-20 w-16" : "h-[52px] w-11"
      }`}
    >
      <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: hex }} aria-hidden />
      {o.kind === "text" ? (
        <span
          className="font-mono font-bold leading-none tracking-tight"
          style={{ color: hex, fontSize: size * (o.text.length > 2 ? 0.55 : 0.72) }}
          aria-hidden
        >
          {o.text}
        </span>
      ) : (
        <o.Icon size={size} strokeWidth={1.6} style={{ color: hex }} aria-hidden />
      )}
    </span>
  );
}
