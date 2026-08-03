import Link from "next/link";

// The Project OS mark: a forking trunk inside a circle — monochrome, matching
// the glyph treatment used on project cards.
export function BrandMark({ size = 34, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-neutral-500 bg-neutral-900/60 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 16 16" fill="none">
        <path d="M8 15V9.5" stroke="#fafafa" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 10 L4.2 6.6 M8 10 L11.8 6.6" stroke="#fafafa" strokeWidth="1.35" strokeLinecap="round" />
        <circle cx="8" cy="10" r="1.35" fill="#fafafa" />
        <circle cx="4" cy="5.4" r="1.5" fill="none" stroke="#fafafa" strokeWidth="1.25" />
        <circle cx="12" cy="5.4" r="1.5" fill="none" stroke="#fafafa" strokeWidth="1.25" />
      </svg>
    </span>
  );
}

/** Header lockup. "open source" is a link to the weekly updates page. */
export function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <BrandMark size={34} />
      <span className="flex flex-col leading-none">
        <span className="font-mono text-[17px] font-bold tracking-[0.16em] text-white">
          PROJECT<span className="text-emerald-400">_</span>OS
        </span>
        <Link
          href="/updates"
          title="What's new — weekly updates"
          className="mt-[3px] w-fit rounded font-mono text-[8.5px] font-medium uppercase tracking-[0.42em] text-neutral-500 outline-none transition-colors duration-200 hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          open source
        </Link>
      </span>
    </span>
  );
}
