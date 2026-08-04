"use client";

import { useEffect, useRef, useState } from "react";
import { Trophy, TrendingUp, Users, GitFork, Award, Globe } from "lucide-react";
import { ForkSwarm } from "../fork-swarm";

/**
 * Six ways to make a fork count feel like something you did, rather than a
 * number you have.
 *
 * The swarm solved scale — 5 looks like five and 59,879 looks like a galaxy.
 * It doesn't touch accomplishment, because size alone isn't an achievement.
 * These try the things that actually are: rank, milestones, people, momentum,
 * consequence, and being spoken to directly.
 */

const P = {
  name: "Subwolf",
  forks: 7790,
  stars: 4200,
  rankPct: 2, // top 2% of the catalogue
  beats: 452,
  total: 462,
  thisMonth: 412,
  secondOrder: 23,
  countries: 47,
  people: ["riverbed", "tinfoil", "halcyon", "kilobyte", "mothlight"],
};

export function Accomplishment() {
  return (
    <div className="space-y-4">
      <Idea
        n={1}
        title="Rank against everything else"
        why="A number alone can't tell you if you did well — 7,790 is meaningless until you know what normal is. A percentile answers that in four words, and it works identically for a project with 12 forks in a quiet section."
      >
        <div className="flex flex-wrap items-center gap-6">
          <div className="relative h-[104px] w-[104px] shrink-0">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="44" fill="none" stroke="#243029" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="#34d399"
                strokeWidth="8"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray={100}
                strokeDashoffset={P.rankPct}
                style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-[22px] font-bold leading-none text-white">Top</span>
              <span className="font-mono text-[22px] font-bold leading-none text-emerald-400">{P.rankPct}%</span>
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[17px] font-bold text-white">
              More forked than {P.beats} of the {P.total} projects here.
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-400">
              Works at any size. A 40-fork project can be top 10% in a quiet section, and that&apos;s worth saying.
            </p>
          </div>
        </div>
      </Idea>

      <Idea
        n={2}
        title="Milestones you cross"
        why="Achievements are things you EARN, not things you have. A tier that upgrades at 10, 100, 1,000, 10,000 gives you a moment — and showing the next one turns a static number into something with a direction."
      >
        <div className="flex flex-wrap items-center gap-5">
          <Medal />
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[15px] font-bold text-white">Gold · 1,000 forks</p>
            <div className="mt-3 h-2 w-full max-w-sm overflow-hidden rounded-full bg-neutral-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400/70 to-amber-300"
                style={{ width: `${(Math.log10(P.forks) - 3) * 100}%` }}
              />
            </div>
            <p className="mt-2 font-mono text-[12px] text-neutral-400">
              {(10000 - P.forks).toLocaleString()} from <span className="text-neutral-200">Platinum</span>
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">
              And the crossing itself is an event — a notification, a feed post, something to screenshot.
            </p>
          </div>
        </div>
      </Idea>

      <Idea
        n={3}
        title="Say who, not how many"
        why="7,790 is a statistic. '@riverbed built on this' is a person. Naming even five of them turns an abstract total into evidence that real humans used your work — and the faces do more emotional work than any number."
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {P.people.map((p) => (
              <span
                key={p}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-600 bg-neutral-800 font-mono text-[10px] text-neutral-300"
              >
                {p.slice(0, 2)}
              </span>
            ))}
            <span className="flex h-9 items-center rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 font-mono text-[12px] text-emerald-300">
              +{(P.forks - P.people.length).toLocaleString()}
            </span>
          </div>
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-200">
            <span className="text-white">@{P.people[0]}</span>, <span className="text-white">@{P.people[1]}</span> and{" "}
            <span className="font-bold text-emerald-300">{(P.forks - 2).toLocaleString()} others</span> built on{" "}
            {P.name}.
          </p>
        </div>
      </Idea>

      <Idea
        n={4}
        title="Movement, not the total"
        why="A total is a fact about the past and it never changes much. '+412 this month' is happening NOW, and it's the only version that gives someone a reason to come back next week and look again."
      >
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <p className="font-mono text-[40px] font-bold leading-none text-emerald-400 tabular-nums">
              +{P.thisMonth}
            </p>
            <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">forks this month</p>
          </div>
          <Spark />
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-neutral-400">
          Needs the daily star history that&apos;s already recording — a fork column alongside it and this is free.
        </p>
      </Idea>

      <Idea
        n={5}
        title="Forks of your forks"
        why="The strongest thing you can say about a piece of work isn't that people copied it — it's that the copies were worth copying. It's rare, it's hard to fake, and nowhere else shows it."
      >
        <p className="text-[17px] leading-relaxed text-neutral-200">
          <span className="font-bold text-emerald-300">{P.secondOrder}</span> of these forks were themselves forked.
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-neutral-400">
          {P.name} is {P.secondOrder > 0 ? "three" : "two"} generations deep — people are building on the things people
          built on it.
        </p>
      </Idea>

      <Idea
        n={6}
        title="Talk to the person"
        why="Every number on the site is written about a project. This one is written to its author. Second person costs nothing, and it's the difference between a dashboard and a compliment."
      >
        <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/[0.04] p-5">
          <p className="font-mono text-[19px] leading-snug text-white">
            You made something <span className="font-bold text-emerald-300">{P.forks.toLocaleString()} people</span>{" "}
            copied to build their own.
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-neutral-400">
            Shown only to the owner, on their own project. Everyone else sees the plain count.
          </p>
        </div>
      </Idea>

      <Idea
        n={7}
        title="All of it, together"
        why="None of these are exclusive. The swarm gives scale, the rank gives meaning, the people give warmth, the momentum gives a reason to return. This is what they look like as one object."
        wide
      >
        <div className="overflow-hidden rounded-xl border border-emerald-400/25 bg-emerald-400/[0.03]">
          <div className="relative">
            <ForkSwarm count={P.forks} known={50} height={230} />
            <div className="pointer-events-none absolute left-0 top-0 p-5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-300">
                <Trophy size={11} aria-hidden /> Top {P.rankPct}% most forked
              </span>
            </div>
          </div>
          <div className="border-t border-emerald-400/15 px-5 py-4">
            <p className="font-mono text-[17px] leading-snug text-white">
              <span className="font-bold">@{P.people[0]}</span>, <span className="font-bold">@{P.people[1]}</span> and{" "}
              <span className="font-bold text-emerald-300">{(P.forks - 2).toLocaleString()} others</span> built on{" "}
              {P.name}.
            </p>
            <p className="mt-1.5 font-mono text-[12px] text-neutral-400">
              <span className="text-emerald-400">+{P.thisMonth}</span> this month
              <span className="text-neutral-700"> · </span>
              {P.secondOrder} of them were forked again
            </p>
          </div>
        </div>
      </Idea>
    </div>
  );
}

function Idea({
  n,
  title,
  why,
  children,
  wide,
}: {
  n: number;
  title: string;
  why: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900/30">
      <header className="border-b border-neutral-800 px-5 py-3">
        <h2 className="flex items-baseline gap-2.5 font-mono text-[15px] font-bold text-white">
          <span className="text-neutral-600">{String(n).padStart(2, "0")}</span>
          {title}
        </h2>
        <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-neutral-400">{why}</p>
      </header>
      <div className={wide ? "" : "p-5"}>{children}</div>
    </section>
  );
}

/** A medal that actually looks like one, rather than a coloured circle. */
function Medal() {
  return (
    <div className="relative h-[104px] w-[104px] shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <defs>
          <linearGradient id="medal-face" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="55%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>
        <path d="M34 8 L44 44 L30 50 Z" fill="#34d399" opacity="0.5" />
        <path d="M66 8 L56 44 L70 50 Z" fill="#34d399" opacity="0.35" />
        <circle cx="50" cy="62" r="30" fill="url(#medal-face)" />
        <circle cx="50" cy="62" r="24" fill="none" stroke="#78350f" strokeWidth="1.5" opacity="0.55" />
        <text
          x="50"
          y="68"
          textAnchor="middle"
          fill="#4a2c05"
          fontSize="17"
          fontWeight="bold"
          fontFamily="ui-monospace, monospace"
        >
          1k
        </text>
      </svg>
    </div>
  );
}

/** Twelve weeks of fork growth, drawing itself in. */
function Spark() {
  const ref = useRef<SVGPathElement | null>(null);
  const [d] = useState(() => {
    const pts = [4, 6, 5, 9, 12, 10, 16, 21, 19, 27, 33, 41];
    const max = Math.max(...pts);
    return pts
      .map((v, i) => `${i === 0 ? "M" : "L"}${(i / (pts.length - 1)) * 160} ${44 - (v / max) * 40}`)
      .join(" ");
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const len = el.getTotalLength();
    el.style.strokeDasharray = String(len);
    el.style.strokeDashoffset = String(len);
    requestAnimationFrame(() => {
      el.style.transition = "stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)";
      el.style.strokeDashoffset = "0";
    });
  }, []);

  return (
    <svg viewBox="0 0 160 48" className="h-12 w-40">
      <path ref={ref} d={d} fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
