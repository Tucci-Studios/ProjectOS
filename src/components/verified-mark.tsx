/**
 * The Project OS mark, green and tiny, sitting after a username like a ©.
 *
 * The same prompt-and-cursor as the header, so a person and the site are marked
 * by the same shape. It never blinks: this appears next to names, sometimes a
 * dozen down one page, and a dozen blinking cursors would be unreadable. The
 * rim carries a faint glow instead.
 *
 * It means one specific thing: this person has signed in here. Most authors on
 * the site were indexed from GitHub and have never heard of Project OS — this
 * is how you tell at a glance which ones are actually present.
 */
export function VerifiedMark({ size = 12, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      title="On Project OS — this person has signed in and claimed their work"
      className={`inline-flex shrink-0 translate-y-[0.5px] items-center justify-center align-middle ${className}`}
      style={{ width: size, height: size }}
    >
      <span className="sr-only">Verified on Project OS</span>
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden
        style={{ filter: "drop-shadow(0 0 3px rgba(52,211,153,0.6))" }}
      >
        {/* Solid, with the prompt knocked out of it. An outlined ring at 11px is
            the most invisible shape there is — stroke thins away and a circle is
            the silhouette every avatar beside it already has. Fill is what
            survives, and the glow does the work motion used to. */}
        <circle cx="8" cy="8" r="7.4" fill="#34d399" />
        <path
          d="M4.4 5.7 L7 8 L4.4 10.3"
          stroke="#0f1411"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="8.6" y="9.3" width="3.6" height="1.5" rx="0.45" fill="#0f1411" />
      </svg>
    </span>
  );
}
