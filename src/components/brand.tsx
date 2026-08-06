import Link from "next/link";

/**
 * The Project OS mark: a prompt and a blinking cursor, in a circle.
 *
 * Picked from the ten in the lab. It's the only one of them that drops the
 * forking trunk, which trades the literal "lineage" read for something that
 * looks like the thing the site is about — a terminal you build in.
 *
 * The cursor only blinks in the header — everywhere else it sits still, because
 * a second animated mark on the same page is movement with nothing to say. It
 * also holds still for anyone whose system asks for reduced motion.
 */
export function BrandMark({
  size = 34,
  className = "",
  animated = false,
}: {
  size?: number;
  className?: string;
  /** Only the header passes this. One blinking cursor per page is plenty. */
  animated?: boolean;
}) {
  return (
    <span
      // Green ring to match the favicon, which is the same mark and is the
      // version that reads at a glance.
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-emerald-400/70 bg-neutral-900/60 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 16 16" fill="none" overflow="visible">
        <path
          d="M3.6 5.4 L6.6 8 L3.6 10.6"
          stroke="#4ade80"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="8.4" y="9.4" width="4.4" height="1.5" rx="0.5" fill="#4ade80" className={animated ? "m-caret" : undefined} />
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
          className="mt-[3px] w-fit rounded font-mono text-[8.5px] font-medium uppercase tracking-[0.42em] text-neutral-400 outline-none transition-colors duration-200 hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          open source
        </Link>
      </span>
    </span>
  );
}
