import { categoryMeta, groupOf } from "@/lib/categories";

// A project's tile shows WHAT IT IS: a gamepad for a game, a plug for an MCP
// server, a wrench for a tool. You identify the box before you read a word.

export function ProjectMark({ category, size = 52 }: { category: string; size?: number }) {
  const { Icon } = categoryMeta(category);
  const g = groupOf(category);

  return (
    <span
      className="relative flex shrink-0 items-center justify-center rounded-xl border"
      style={{
        width: size,
        height: size,
        borderColor: `${g.hex}45`,
        background: `linear-gradient(160deg, ${g.hex}1f, transparent 65%), #12181400`,
      }}
      aria-hidden
    >
      <Icon size={size * 0.46} strokeWidth={1.75} style={{ color: g.hex }} />
    </span>
  );
}
