import { GitFork } from "lucide-react";
import { ForkSwarm } from "./fork-swarm";

/**
 * The forks of a project, as something to be a bit proud of.
 *
 * The number and the picture are the same fact told twice: the count says
 * 7,790 and the swarm draws 7,790 points of light. Neither works alone — a
 * number that big doesn't land, and a picture without the number is just
 * decoration.
 */
export function ForkTrophy({
  total,
  published,
  known,
  projectName,
}: {
  total: number;
  published: number;
  /** How many we hold names for — those are drawn brighter. */
  known: number;
  projectName: string;
}) {
  // Two forks and a picture of two forks is not a trophy, it's a diagram.
  if (total < 3) return null;

  return (
    <div className="relative mb-4 overflow-hidden rounded-xl border border-emerald-400/25 bg-emerald-400/[0.03]">
      <ForkSwarm count={total} known={known} height={210} />

      {/* The number sits over the swarm, with a scrim so it stays readable
          however dense the field behind it gets. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex w-[62%] flex-col justify-center bg-gradient-to-r from-[#0f1411] via-[#0f1411]/85 to-transparent p-5">
        <p className="font-mono text-[40px] font-bold leading-none text-white tabular-nums">
          {total.toLocaleString()}
        </p>
        <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400">
          <GitFork size={11} aria-hidden />
          fork{total === 1 ? "" : "s"}
        </p>
        <p className="mt-2 max-w-[280px] text-[13px] leading-relaxed text-neutral-400">
          {published > 0 ? (
            <>
              <span className="text-neutral-200">{published}</span> published here.{" "}
            </>
          ) : null}
          Every one of them came from {projectName}.
        </p>
      </div>
    </div>
  );
}
