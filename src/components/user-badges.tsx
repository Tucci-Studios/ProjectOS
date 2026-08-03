import { Crown, Lightbulb, GitBranch } from "lucide-react";

// Badges are counts you earned, never titles handed out.
export type Badges = { numberOne: number; ideasShipped: number; biggestTree: number };

export function UserBadges({ badges, size = "sm" }: { badges: Badges; size?: "sm" | "md" }) {
  const items = [
    badges.numberOne > 0 && {
      key: "no1",
      Icon: Crown,
      count: badges.numberOne,
      cls: "border-amber-400/40 bg-amber-400/10 text-amber-300",
      title: `Held the #1 spot with ${badges.numberOne} project${badges.numberOne === 1 ? "" : "s"}`,
    },
    badges.ideasShipped > 0 && {
      key: "idea",
      Icon: Lightbulb,
      count: badges.ideasShipped,
      cls: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300",
      title: `${badges.ideasShipped} idea${badges.ideasShipped === 1 ? "" : "s"} shipped into Project OS`,
    },
    badges.biggestTree > 1 && {
      key: "tree",
      Icon: GitBranch,
      count: badges.biggestTree,
      cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
      title: `Started a tree that grew to ${badges.biggestTree} branches`,
    },
  ].filter(Boolean) as { key: string; Icon: typeof Crown; count: number; cls: string; title: string }[];

  if (items.length === 0) return null;
  const dims = size === "md" ? "px-2 py-0.5 text-[11px]" : "px-1.5 py-px text-[10px]";
  const icon = size === "md" ? 11 : 10;

  return (
    <span className="inline-flex items-center gap-1">
      {items.map((b) => (
        <span
          key={b.key}
          title={b.title}
          className={`inline-flex items-center gap-0.5 rounded-full border font-mono font-bold ${dims} ${b.cls}`}
        >
          <b.Icon size={icon} aria-hidden />
          {b.count}
        </span>
      ))}
    </span>
  );
}
