import Link from "next/link";
import { Compass, ArrowRight, Users, Vote, Download } from "lucide-react";
import { ProjectCard, type ProjectFeedRow } from "@/components/project-card";
import { REPO_IS_PUBLIC } from "@/lib/site";

/**
 * What a stranger sees.
 *
 * Signed out, this page used to be one dashed box saying "sign in to build your
 * feed" — no projects, no explanation, and the actual pitch sitting unread on
 * an orphaned page nothing linked to. Somebody arriving from Hacker News got a
 * login wall guarding an empty room.
 *
 * So: say what this is, show real projects immediately, and leave signing in as
 * something you do once you've decided you care.
 */
export function WelcomeHome({ projects, total }: { projects: ProjectFeedRow[]; total: number }) {
  return (
    <div>
      <div className="rounded-2xl border border-neutral-800 bg-gradient-to-b from-[#1b231e] to-[#161d18] px-6 py-10 text-center sm:px-10 sm:py-14">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-emerald-400">
          Project Open Source
        </p>
        <h1 className="mx-auto mt-4 max-w-2xl font-mono text-3xl font-bold leading-tight tracking-tight text-white sm:text-[38px]">
          People building with AI,
          <br />
          <span className="text-emerald-400">helping each other</span> do it.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-[15.5px] leading-relaxed text-neutral-300">
          {total.toLocaleString()} open-source projects — skills, MCP servers, tools, games — and the people who make
          them. Take what you need, show someone how you did it.{" "}
          <span className="text-white">Everything here is free and stays that way.</span>
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/explore"
            className="inline-flex min-h-[46px] items-center gap-2 rounded-lg bg-emerald-400 px-6 font-mono text-sm font-bold text-black transition hover:bg-emerald-300"
          >
            <Compass size={16} aria-hidden /> Look around
          </Link>
          <Link
            href="/api/auth/login"
            className="inline-flex min-h-[46px] items-center gap-2 rounded-lg border border-neutral-700 px-5 font-mono text-sm text-neutral-300 transition hover:border-emerald-400/50 hover:text-emerald-300"
          >
            Sign in with GitHub <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { Icon: Users, t: "Show your work", d: "Post what you built and how. A tutorial that saves someone an afternoon beats a star count." },
          {
            Icon: Vote,
            t: "Run the place",
            // Don't claim the site is forkable while the source is private —
            // this audience checks. Says what's true now and what's coming.
            d: REPO_IS_PUBLIC
              ? "The site is open source on itself. Build a change, put it to a vote, and it ships."
              : "Project OS opens its own source when it launches, under the same rules it asks of everyone else. Until then, vote on what gets built.",
          },
          { Icon: Download, t: "Nothing is sold here", d: "Publish and you agree not to sell or paywall it, and to ask the same of anyone who builds on it." },
        ].map(({ Icon, t, d }) => (
          <div key={t} className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
            <Icon size={16} className="text-emerald-300" aria-hidden />
            <p className="mt-2.5 font-mono text-[13.5px] font-bold text-white">{t}</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-neutral-400">{d}</p>
          </div>
        ))}
      </div>

      {projects.length > 0 && (
        <section className="mt-10">
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <h2 className="font-mono text-[15px] font-bold text-white">Being worked on right now</h2>
            <Link href="/explore" className="font-mono text-[12px] text-neutral-400 transition hover:text-emerald-300">
              See all {total.toLocaleString()} →
            </Link>
          </div>
          <div className="stagger space-y-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} p={p} vote={0} following={false} saved={false} canFollow={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
