import { WaitlistForm } from "./waitlist-form";

const CATEGORIES = [
  { name: "Claude Code", color: "text-emerald-400 border-emerald-400/30" },
  { name: "Claude Skills", color: "text-fuchsia-400 border-fuchsia-400/30" },
  { name: "CLAUDE.md", color: "text-amber-400 border-amber-400/30" },
  { name: "MCP Servers", color: "text-emerald-400 border-emerald-400/30" },
  { name: "Codex", color: "text-sky-400 border-sky-400/30" },
  { name: "Local LLMs", color: "text-violet-400 border-violet-400/30" },
  { name: "Scripts & Tools", color: "text-lime-400 border-lime-400/30" },
  { name: "Games", color: "text-rose-400 border-rose-400/30" },
];

export default function Home() {
  return (
    <main className="flex-1 bg-[#161d18] text-neutral-200">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-400">
          project_os // coming soon
        </p>

        <h1 className="mt-6 font-mono text-4xl font-bold leading-tight text-white sm:text-5xl">
          The operating system
          <br />
          for <span className="text-emerald-400">open source</span>.
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-400">
          Publish your projects. Fork each other&apos;s work. Every fork joins a
          public family tree — <span className="text-neutral-200">Subwolf</span>
          <span className="text-emerald-400"> // </span>
          <span className="text-neutral-200">Cyber</span> — and the best
          lineages rise. Built for vibe coders, new and professional.
        </p>

        <ul className="mt-10 space-y-3 text-sm text-neutral-400">
          <li>
            <span className="font-mono text-emerald-400">▸</span> Everything open
            source. Nothing for sale. Code lives on GitHub.
          </li>
          <li>
            <span className="font-mono text-emerald-400">▸</span> Every project
            ships AI continuation instructions — any coding AI can pick it up
            cold and keep evolving it.
          </li>
          <li>
            <span className="font-mono text-emerald-400">▸</span> Lineage trees,
            likes, and Fork Wars: the most-forked projects wear the crown.
          </li>
        </ul>

        <div className="mt-12">
          <WaitlistForm />
          <p className="mt-3 font-mono text-xs text-neutral-500">
            No spam. One email when the doors open.
          </p>
        </div>

        <div className="mt-16 border-t border-neutral-700 pt-8">
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            Launch sections
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <span
                key={c.name}
                className={`rounded border bg-neutral-800/60 px-3 py-1 font-mono text-xs ${c.color}`}
              >
                {c.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
