// Single source of truth for category display. Slugs must match
// docs/manifest/project.schema.json's category enum.

export type CategoryMeta = {
  slug: string;
  label: string;
  /** Tailwind classes for the neon accent */
  text: string;
  border: string;
  dot: string;
};

export const CATEGORY_META: CategoryMeta[] = [
  { slug: "claude-code",   label: "Claude Code",     text: "text-cyan-400",    border: "border-cyan-400/30",    dot: "bg-cyan-400" },
  { slug: "claude-skills", label: "Claude Skills",   text: "text-fuchsia-400", border: "border-fuchsia-400/30", dot: "bg-fuchsia-400" },
  { slug: "claude-md",     label: "CLAUDE.md",       text: "text-amber-400",   border: "border-amber-400/30",   dot: "bg-amber-400" },
  { slug: "mcp-servers",   label: "MCP Servers",     text: "text-emerald-400", border: "border-emerald-400/30", dot: "bg-emerald-400" },
  { slug: "codex",         label: "Codex",           text: "text-sky-400",     border: "border-sky-400/30",     dot: "bg-sky-400" },
  { slug: "local-llms",    label: "Local LLMs",      text: "text-violet-400",  border: "border-violet-400/30",  dot: "bg-violet-400" },
  { slug: "scripts-tools", label: "Scripts & Tools", text: "text-lime-400",    border: "border-lime-400/30",    dot: "bg-lime-400" },
  { slug: "games",         label: "Games",           text: "text-rose-400",    border: "border-rose-400/30",    dot: "bg-rose-400" },
];

export function categoryMeta(slug: string): CategoryMeta {
  return (
    CATEGORY_META.find((c) => c.slug === slug) ?? {
      slug,
      label: slug,
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
