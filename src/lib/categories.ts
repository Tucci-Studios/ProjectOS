import {
  Sparkles,
  FileText,
  Plug,
  Cpu,
  HardDrive,
  SquareTerminal,
  Bot,
  Code2,
  Wrench,
  AppWindow,
  Gamepad2,
  Hammer,
  Play,
  type LucideIcon,
} from "lucide-react";

// Single source of truth for sections, grouping, color, and iconography.
//
// COLOR RULE: three group colors, nothing else. Emerald is reserved for "you
// can click this". Section identity comes from ICONS, not from more colors.
//
// NOTE ON LOGOS: these are original icons, not Anthropic/OpenAI/xAI marks.
// Shipping third-party trademarks in a product UI needs their permission and
// compliance with each brand's guidelines — see docs/legal/TERMS.md notes.

export type GroupKey = "ai" | "build" | "play";

export type CategoryMeta = {
  slug: string;
  label: string;
  /** What this kind of thing IS — shown as a badge and spoken in plain words. */
  kind: string;
  /** What you DO with it — the thing you actually want to know at a glance. */
  use: string;
  group: GroupKey;
  Icon: LucideIcon;
};

export const GROUPS: Record<
  GroupKey,
  { key: GroupKey; label: string; blurb: string; Icon: LucideIcon; text: string; border: string; bg: string; dot: string; hex: string }
> = {
  ai: {
    key: "ai",
    label: "AI",
    blurb: "Make your AI better",
    Icon: Cpu,
    text: "text-sky-300",
    border: "border-sky-400/30",
    bg: "bg-sky-400/10",
    dot: "bg-sky-400",
    hex: "#7cc4ff",
  },
  build: {
    key: "build",
    label: "Build",
    blurb: "Code and tools to build with",
    Icon: Hammer,
    text: "text-violet-300",
    border: "border-violet-400/30",
    bg: "bg-violet-400/10",
    dot: "bg-violet-400",
    hex: "#a78bfa",
  },
  play: {
    key: "play",
    label: "Play",
    blurb: "Things you run and enjoy",
    Icon: Play,
    text: "text-orange-400",
    border: "border-orange-400/30",
    bg: "bg-orange-400/10",
    dot: "bg-orange-400",
    hex: "#fb923c",
  },
};

export const GROUP_ORDER: GroupKey[] = ["ai", "build", "play"];

export const CATEGORY_META: CategoryMeta[] = [
  { slug: "claude-skills", label: "Claude Skills", kind: "Skill", use: "Teaches Claude a new trick", group: "ai", Icon: Sparkles },
  { slug: "claude-md", label: "CLAUDE.md Files", kind: "Instructions", use: "Drops into your repo", group: "ai", Icon: FileText },
  { slug: "mcp-servers", label: "MCP Servers", kind: "MCP Server", use: "Connects Claude to something", group: "ai", Icon: Plug },
  { slug: "local-llms", label: "Local LLMs", kind: "Local AI", use: "Runs AI on your machine", group: "ai", Icon: HardDrive },
  { slug: "codex", label: "Codex", kind: "Codex Setup", use: "Set up for Codex", group: "ai", Icon: SquareTerminal },
  { slug: "grok", label: "Grok / xAI", kind: "Grok Project", use: "Built on Grok", group: "ai", Icon: Bot },

  { slug: "claude-code", label: "Claude Code Projects", kind: "Codebase", use: "Clone it and keep building", group: "build", Icon: Code2 },
  { slug: "scripts-tools", label: "Scripts & Tools", kind: "Tool", use: "Run it in your terminal", group: "build", Icon: Wrench },

  { slug: "apps", label: "Apps", kind: "App", use: "Install and use it", group: "play", Icon: AppWindow },
  { slug: "games", label: "Games", kind: "Game", use: "Play it", group: "play", Icon: Gamepad2 },
];

export const CATEGORY_SLUGS = CATEGORY_META.map((c) => c.slug);

const FALLBACK: CategoryMeta = { slug: "", label: "Other", kind: "Project", use: "Open source project", group: "build", Icon: Code2 };

export function categoryMeta(slug: string): CategoryMeta {
  return CATEGORY_META.find((c) => c.slug === slug) ?? { ...FALLBACK, slug, label: slug };
}

export function groupOf(slug: string) {
  return GROUPS[categoryMeta(slug).group];
}

export function sectionsIn(group: GroupKey) {
  return CATEGORY_META.filter((c) => c.group === group);
}

/** Raw hex for SVG/inline styles that can't use Tailwind classes. */
export function accentHex(slug: string) {
  return groupOf(slug).hex;
}

export function timeAgo(epochSeconds: number): string {
  const s = Math.max(1, Math.floor(Date.now() / 1000) - epochSeconds);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}
