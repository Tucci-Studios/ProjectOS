import {
  Sparkles,
  FileText,
  Plug,
  Cpu,
  SquareTerminal,
  Bot,
  Code2,
  Wrench,
  AppWindow,
  Gamepad2,
  Brain,
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
    Icon: Brain,
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
    text: "text-orange-300",
    border: "border-orange-400/30",
    bg: "bg-orange-400/10",
    dot: "bg-orange-400",
    hex: "#ffb86b",
  },
  play: {
    key: "play",
    label: "Play",
    blurb: "Things you run and enjoy",
    Icon: Play,
    text: "text-pink-300",
    border: "border-pink-400/30",
    bg: "bg-pink-400/10",
    dot: "bg-pink-400",
    hex: "#ff8fb1",
  },
};

export const GROUP_ORDER: GroupKey[] = ["ai", "build", "play"];

export const CATEGORY_META: CategoryMeta[] = [
  { slug: "claude-skills", label: "Claude Skills", kind: "Skill", group: "ai", Icon: Sparkles },
  { slug: "claude-md", label: "CLAUDE.md Files", kind: "Instructions", group: "ai", Icon: FileText },
  { slug: "mcp-servers", label: "MCP Servers", kind: "MCP Server", group: "ai", Icon: Plug },
  { slug: "local-llms", label: "Local LLMs", kind: "Local AI", group: "ai", Icon: Cpu },
  { slug: "codex", label: "Codex", kind: "Codex Setup", group: "ai", Icon: SquareTerminal },
  { slug: "grok", label: "Grok / xAI", kind: "Grok Project", group: "ai", Icon: Bot },

  { slug: "claude-code", label: "Claude Code Projects", kind: "Codebase", group: "build", Icon: Code2 },
  { slug: "scripts-tools", label: "Scripts & Tools", kind: "Tool", group: "build", Icon: Wrench },

  { slug: "apps", label: "Apps", kind: "App", group: "play", Icon: AppWindow },
  { slug: "games", label: "Games", kind: "Game", group: "play", Icon: Gamepad2 },
];

export const CATEGORY_SLUGS = CATEGORY_META.map((c) => c.slug);

const FALLBACK: CategoryMeta = { slug: "", label: "Other", kind: "Project", group: "build", Icon: Code2 };

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
