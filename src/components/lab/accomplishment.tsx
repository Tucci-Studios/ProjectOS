"use client";

import { ForkSwarm } from "../fork-swarm";

/**
 * Restraint, three ways.
 *
 * The gamified versions — medals, tiers, percentiles, "you made something
 * people copied" — read as a mobile game congratulating you. Developers see
 * straight through that, and it makes the site feel like it's trying.
 *
 * The swarm is already the interesting thing. These stop decorating it and
 * argue about how little can sit next to it.
 */

const COUNT = 7790;

export function Accomplishment() {
  return (
    <div className="space-y-4">
      <Idea
        n={1}
        title="Nothing but the number"
        why="Full bleed, no card, no border, no sentence. The swarm is the whole statement and the number is a caption on it. Anything else added here would be the site talking about itself."
      >
        <div className="relative">
          <ForkSwarm count={COUNT} known={50} height={280} caption={false} />
          <p className="pointer-events-none absolute bottom-4 left-5 font-mono text-[13px] text-neutral-500">
            <span className="text-[15px] font-bold text-white tabular-nums">{COUNT.toLocaleString()}</span> forks
          </p>
        </div>
      </Idea>

      <Idea
        n={2}
        title="A readout, not a trophy"
        why="Monospace, aligned, stated like a machine reporting a fact. No adjective anywhere. The most technical of the three and the hardest to find cringe, because it isn't claiming anything."
      >
        <div className="relative">
          <ForkSwarm count={COUNT} known={50} height={280} caption={false} />
          <div className="pointer-events-none absolute left-5 top-5 font-mono text-[12px] leading-relaxed">
            <p className="text-neutral-500">
              forks <span className="ml-2 text-white tabular-nums">{COUNT.toLocaleString()}</span>
            </p>
            <p className="text-neutral-500">
              named <span className="ml-2 text-neutral-300 tabular-nums">50</span>
            </p>
            <p className="text-neutral-500">
              depth <span className="ml-2 text-neutral-300 tabular-nums">3</span>
            </p>
          </div>
        </div>
      </Idea>

      <Idea
        n={3}
        title="No trophy at all"
        why="The count already sits in the section header and the stat bar. So the swarm gets no number, no frame and no label — it's just there, moving, and the number lives where numbers live. The quietest option and probably the most confident."
      >
        <div>
          <p className="mb-3 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
            Forks <span className="font-normal normal-case tracking-normal text-emerald-400">{COUNT.toLocaleString()}</span>
          </p>
          <ForkSwarm count={COUNT} known={50} height={200} caption={false} />
        </div>
      </Idea>
    </div>
  );
}

function Idea({ n, title, why, children }: { n: number; title: string; why: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900/30">
      <header className="border-b border-neutral-800 px-5 py-3">
        <h2 className="flex items-baseline gap-2.5 font-mono text-[15px] font-bold text-white">
          <span className="text-neutral-600">{String(n).padStart(2, "0")}</span>
          {title}
        </h2>
        <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-neutral-400">{why}</p>
      </header>
      {children}
    </section>
  );
}
