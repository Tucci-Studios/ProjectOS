import Link from "next/link";
import { Activity, Tag, TrendingUp } from "lucide-react";
import type { WeekPulse } from "@/lib/queries";
import { Strip } from "@/components/discover";

/**
 * What changed in the last seven days.
 *
 * Sits at the top of Explore so the site has a pulse without anyone having to
 * be on it. Every number is counted from real GitHub timestamps already in the
 * index — if the week was quiet, it says a smaller number rather than reaching
 * for a livelier one. The star-gain strip is absent until there are two daily
 * snapshots to subtract, because one data point can't show a change.
 */
export function WeekPulse({ week }: { week: WeekPulse }) {
  const share = week.total ? Math.round((week.workedOn / week.total) * 100) : 0;

  return (
    <section className="mt-6">
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
        <h2 className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-emerald-300">
          <Activity size={13} aria-hidden /> This week
        </h2>

        <div className="mt-3 flex flex-wrap gap-x-8 gap-y-3">
          <Stat n={week.workedOn} label={`of ${week.total.toLocaleString()} projects were worked on`} tint="text-emerald-300" />
          <Stat n={week.shippedCount} label="shipped a new release" tint="text-sky-300" Icon={Tag} />
          {week.movers.length > 0 && (
            <Stat
              n={week.movers[0].gained}
              label={`stars gained by the fastest mover in ${week.moversDays} day${week.moversDays === 1 ? "" : "s"}`}
              tint="text-amber-300"
              Icon={TrendingUp}
            />
          )}
        </div>

        {/* A bar, so the share reads before the number does. */}
        <div className="mt-3.5 h-1 w-full overflow-hidden rounded-full bg-neutral-800" aria-hidden>
          <div className="h-full rounded-full bg-emerald-400/70" style={{ width: `${share}%` }} />
        </div>
        <p className="mt-2 text-[12.5px] leading-relaxed text-neutral-400">
          {share}% of what&apos;s indexed here moved in the last seven days. Counted from GitHub, not from activity on
          this site — <Link href="/explore?sort=new" className="text-neutral-300 underline-offset-4 hover:underline">
            newest first
          </Link>
          .
        </p>
      </div>

      {week.movers.length > 0 && (
        <Strip
          title="Gaining fastest"
          blurb={`Most stars added in the last ${week.moversDays} day${week.moversDays === 1 ? "" : "s"}, measured here daily.`}
          href="/explore?sort=starred"
          items={week.movers}
        />
      )}
      <Strip
        title="Shipped this week"
        blurb="Cut a release in the last seven days — actively maintained, not just popular."
        href="/explore?sort=new"
        items={week.shipped}
      />
    </section>
  );
}

function Stat({
  n,
  label,
  tint,
  Icon,
}: {
  n: number;
  label: string;
  tint: string;
  Icon?: typeof Tag;
}) {
  return (
    <div className="min-w-0">
      <p className={`flex items-baseline gap-1.5 font-mono text-2xl font-bold leading-none ${tint}`}>
        {Icon && <Icon size={14} className="shrink-0 self-center" aria-hidden />}
        {n.toLocaleString()}
      </p>
      <p className="mt-1 max-w-[15rem] text-[12px] leading-snug text-neutral-400">{label}</p>
    </div>
  );
}
