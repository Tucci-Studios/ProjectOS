// Single source of truth for sections, grouping, and color.
//
// COLOR RULE: color carries meaning, not decoration. There are exactly three
// group colors (AI-purple, Build-amber, Play-rose) plus the emerald accent for
// "you can click this". Individual sections inherit their group's color — no
// ten-way rainbow.

export type CategoryMeta = {
  slug: string;
  label: string;
  /** What this kind of thing IS, in one or two words — shown as a badge on cards. */
  kind: string;
  group: GroupKey;
};

export type GroupKey = "ai" | "build" | "play";

export const GROUPS: Record<GroupKey, { label: string; blurb: string; text: string; border: string; dot: string; hex: string }> = {
  ai: {
    label: "AI",
    blurb: "Things that make your AI better",
    text: "text-violet-300",
    border: "border-violet-400/30",
    dot: "bg-violet-400",
    hex: "#c4b5fd",
  },
  build: {
    label: "Build",
    blurb: "Tools and code you build with",
    text: "text-amber-300",
    border: "border-amber-400/30",
    dot: "bg-amber-400",
    hex: "#fcd34d",
  },
  play: {
    label: "Play",
    blurb: "Things you run and enjoy",
    text: "text-rose-300",
    border: "border-rose-400/30",
    dot: "bg-rose-400",
    hex: "#fda4af",
  },
};

export const GROUP_ORDER: GroupKey[] = ["ai", "build", "play"];

export const CATEGORY_META: CategoryMeta[] = [
  { slug: "claude-skills", label: "Claude Skills", kind: "Skill", group: "ai" },
  { slug: "claude-md", label: "CLAUDE.md Files", kind: "Instructions", group: "ai" },
  { slug: "mcp-servers", label: "MCP Servers", kind: "MCP Server", group: "ai" },
  { slug: "local-llms", label: "Local LLMs", kind: "Local AI", group: "ai" },
  { slug: "codex", label: "Codex", kind: "Codex Setup", group: "ai" },
  { slug: "grok", label: "Grok / xAI", kind: "Grok Project", group: "ai" },

  { slug: "claude-code", label: "Claude Code Projects", kind: "Codebase", group: "build" },
  { slug: "scripts-tools", label: "Scripts & Tools", kind: "Tool", group: "build" },

  { slug: "apps", label: "Apps", kind: "App", group: "play" },
  { slug: "games", label: "Games", kind: "Game", group: "play" },
];

export const CATEGORY_SLUGS = CATEGORY_META.map((c) => c.slug);

const FALLBACK: CategoryMeta = { slug: "", label: "Other", kind: "Project", group: "build" };

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
