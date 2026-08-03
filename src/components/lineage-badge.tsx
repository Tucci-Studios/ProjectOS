import { GitFork, BadgeCheck, HelpCircle } from "lucide-react";

/**
 * Says how much we actually KNOW about a fork's parent, rather than implying
 * one level of certainty for both cases.
 *
 *   verified  — GitHub's fork graph proves it. We looked it up ourselves.
 *   declared  — the publisher said so; nobody has confirmed it yet.
 *   confirmed — the publisher said so and the parent's owner agreed.
 */
export function LineageBadge({
  source,
  confirmedAt,
  parentDisplay,
}: {
  source: string | null;
  confirmedAt: number | null;
  parentDisplay?: string | null;
}) {
  if (!source) return null;
  const from = parentDisplay ? ` of ${parentDisplay}` : "";

  if (source === "verified")
    return (
      <span
        title={`GitHub's fork record confirms this is a fork${from}. We checked it ourselves — nobody typed it in.`}
        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-300"
      >
        <BadgeCheck size={11} aria-hidden /> Verified fork
      </span>
    );

  if (confirmedAt)
    return (
      <span
        title={`The owner of ${parentDisplay ?? "the parent"} confirmed this came from their project.`}
        className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/40 bg-sky-400/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-sky-300"
      >
        <GitFork size={11} aria-hidden /> Confirmed by owner
      </span>
    );

  return (
    <span
      title={`This publisher says it came from ${parentDisplay ?? "another project"}, but GitHub has no fork record — so we can't verify it. The parent's owner can confirm.`}
      className="inline-flex items-center gap-1.5 rounded-full border border-neutral-600 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-400"
    >
      <HelpCircle size={11} aria-hidden /> Claimed fork
    </span>
  );
}
