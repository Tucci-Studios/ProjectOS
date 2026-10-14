/**
 * Loading placeholders.
 *
 * Every page here is force-dynamic, so navigation used to sit on a blank
 * screen until the database answered. These give the router something to show
 * immediately and, more usefully, show it in the *shape* of what's coming —
 * matching the real card geometry so nothing jumps when the content lands.
 *
 * Three rules, all of them accessibility rather than taste:
 *   - `motion-safe:` on the pulse, so a reader who asked for reduced motion
 *     gets a still placeholder instead of a flashing one.
 *   - The region announces itself once as busy rather than the screen reader
 *     reading out a wall of empty boxes.
 *   - The bars are `bg-neutral-800`, which is a surface, not text — nothing
 *     here is content, so nothing here needs to meet text contrast.
 */

function Bar({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-neutral-800 motion-safe:animate-pulse ${className}`} />;
}

/** Wraps a page's placeholders so assistive tech says "loading" once. */
export function LoadingRegion({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" aria-label={label}>
      {children}
      <span className="sr-only">{label}</span>
    </div>
  );
}

/** Title + one line of purpose, matching PageHeader's metrics. */
export function HeaderSkeleton() {
  return (
    <div className="mb-4">
      <Bar className="h-7 w-56" />
      <Bar className="mt-3 h-4 w-full max-w-md" />
    </div>
  );
}

/** The square-mark tile used by Explore strips and the tutorial shelf. */
export function TileSkeleton() {
  return (
    <div className="flex gap-3 rounded-xl border border-neutral-800 bg-neutral-900/40 p-3">
      <div className="h-[52px] w-14 shrink-0 rounded-lg bg-neutral-800 motion-safe:animate-pulse" />
      <div className="min-w-0 flex-1">
        <Bar className="h-3.5 w-2/5" />
        <Bar className="mt-2 h-3 w-full" />
        <Bar className="mt-1.5 h-3 w-3/4" />
        <Bar className="mt-2.5 h-2.5 w-1/3" />
      </div>
    </div>
  );
}

/** A two-column shelf of tiles. */
export function TileGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {Array.from({ length: count }, (_, i) => (
        <TileSkeleton key={i} />
      ))}
    </div>
  );
}

/** The full-width project row used by the Explore list. */
export function RowSkeleton() {
  return (
    <div className="flex gap-4 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="h-[74px] w-[68px] shrink-0 rounded-lg bg-neutral-800 motion-safe:animate-pulse" />
      <div className="min-w-0 flex-1">
        <Bar className="h-4 w-1/3" />
        <Bar className="mt-2.5 h-3 w-full" />
        <Bar className="mt-1.5 h-3 w-4/5" />
        <Bar className="mt-3 h-2.5 w-2/5" />
      </div>
    </div>
  );
}

export function RowListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <RowSkeleton key={i} />
      ))}
    </div>
  );
}

/** A titled shelf: heading, one line of blurb, then tiles. */
export function StripSkeleton({ count = 4 }: { count?: number }) {
  return (
    <section className="mt-7">
      <Bar className="h-4 w-40" />
      <Bar className="mt-2 h-3 w-72" />
      <div className="mt-3">
        <TileGridSkeleton count={count} />
      </div>
    </section>
  );
}
