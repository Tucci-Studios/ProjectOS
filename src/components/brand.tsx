// The Project OS mark: a branching trunk in a rounded square. Used as the
// wordmark in the header and as the "this is a project" chip on every card.

export function BrandMark({ size = 28, className = "", mono = false }: { size?: number; className?: string; mono?: boolean }) {
  const c = mono ? "#a3a3a3" : "#34d399";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg border border-emerald-400/40 bg-emerald-400/10 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 16 16" fill="none">
        {/* trunk */}
        <path d="M8 15V9" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
        {/* two branches */}
        <path d="M8 9.5 L4 6.5 M8 9.5 L12 6.5" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
        {/* nodes */}
        <circle cx="8" cy="9.5" r="1.5" fill={c} />
        <circle cx="4" cy="5.5" r="1.6" fill="none" stroke={c} strokeWidth="1.3" />
        <circle cx="12" cy="5.5" r="1.6" fill="none" stroke={c} strokeWidth="1.3" />
      </svg>
    </span>
  );
}

export function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <BrandMark size={32} />
      <span className="flex flex-col leading-none">
        <span className="font-mono text-[17px] font-bold tracking-[0.16em] text-white">
          PROJECT<span className="text-emerald-400">_</span>OS
        </span>
        <span className="mt-[3px] font-mono text-[8.5px] font-medium uppercase tracking-[0.42em] text-neutral-500">
          open source
        </span>
      </span>
    </span>
  );
}
