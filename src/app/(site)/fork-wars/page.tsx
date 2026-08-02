// Fork Wars teaser page — becomes the live event page at launch.

export default function ForkWarsPage() {
  return (
    <div className="mx-auto max-w-xl pt-10 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.4em] text-rose-400">the launch event</p>
      <h1 className="mt-4 font-mono text-5xl font-bold tracking-tight text-white">
        FORK<span className="text-rose-400">_</span>WARS
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-neutral-300">
        One starter project. Seven days. Fork it, remix it, make it yours —{" "}
        <span className="text-white">the most-liked fork wears the crown</span>{" "}
        <span className="text-amber-400">♛</span> on the lineage tree. Forever.
      </p>
      <div className="mt-8 rounded-2xl border border-rose-400/30 bg-neutral-900/60 p-6 font-mono text-sm text-neutral-400">
        <p>STATUS: <span className="text-rose-400">arming</span></p>
        <p className="mt-1">The starter project drops when the doors open.</p>
      </div>
      <p className="mt-6 font-mono text-xs text-neutral-500">
        every fork = a new branch on a public family tree. bring your weirdest ideas.
      </p>
    </div>
  );
}
