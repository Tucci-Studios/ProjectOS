// Single source of truth for category display + grouping. Slugs must match
// docs/manifest/project.schema.json's category enum.

export type CategoryMeta = {
  slug: string;
  label: string;
  group: string;
  /** Tailwind classes for the accent */
  text: string;
  border: string;
  dot: string;
};

export const CATEGORY_GROUPS = ["Claude", "AI", "Software"] as const;

export const CATEGORY_META: CategoryMeta[] = [
  // Claude — everything in the Claude ecosystem, branched properly
  { slug: "claude-code",   label: "Code Projects", group: "Claude",   text: "text-cyan-400",    border: "border-cyan-400/30",    dot: "bg-cyan-400" },
  { slug: "claude-skills", label: "Skills",        group: "Claude",   text: "text-fuchsia-400", border: "border-fuchsia-400/30", dot: "bg-fuchsia-400" },
  { slug: "claude-md",     label: "CLAUDE.md",     group: "Claude",   text: "text-amber-400",   border: "border-amber-400/30",   dot: "bg-amber-400" },
  // Other AI ecosystems
  { slug: "codex",         label: "Codex",         group: "AI",       text: "text-sky-400",     border: "border-sky-400/30",     dot: "bg-sky-400" },
  { slug: "grok",          label: "Grok / xAI",    group: "AI",       text: "text-zinc-300",    border: "border-zinc-300/30",    dot: "bg-zinc-300" },
  { slug: "local-llms",    label: "Local LLMs",    group: "AI",       text: "text-violet-400",  border: "border-violet-400/30",  dot: "bg-violet-400" },
  { slug: "mcp-servers",   label: "MCP Servers",   group: "AI",       text: "text-emerald-400", border: "border-emerald-400/30", dot: "bg-emerald-400" },
  // Software — things you run
  { slug: "apps",          label: "Apps",          group: "Software", text: "text-orange-400",  border: "border-orange-400/30",  dot: "bg-orange-400" },
  { slug: "games",         label: "Games",         group: "Software", text: "text-rose-400",    border: "border-rose-400/30",    dot: "bg-rose-400" },
  { slug: "scripts-tools", label: "Scripts & Tools", group: "Software", text: "text-lime-400",  border: "border-lime-400/30",    dot: "bg-lime-400" },
];

export const CATEGORY_SLUGS = CATEGORY_META.map((c) => c.slug);

/** Raw hex per category, for SVG/inline styles that can't use Tailwind classes. */
export const ACCENT_HEX: Record<string, string> = {
  "claude-code": "#22d3ee",
  "claude-skills": "#e879f9",
  "claude-md": "#fbbf24",
  codex: "#38bdf8",
  grok: "#d4d4d8",
  "local-llms": "#a78bfa",
  "mcp-servers": "#34d399",
  apps: "#fb923c",
  games: "#fb7185",
  "scripts-tools": "#a3e635",
};

export function categoryMeta(slug: string): CategoryMeta {
  return (
    CATEGORY_META.find((c) => c.slug === slug) ?? {
      slug,
      label: slug,
      group: "Software",
      text: "text-neutral-400",
      border: "border-neutral-400/30",
      dot: "bg-neutral-400",
    }
  );
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
