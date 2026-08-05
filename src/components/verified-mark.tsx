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
        style={{ filter: "drop-shadow(0 0 2.5px rgba(52,211,153,0.55))" }}
      >
        {/* a lit rim rather than a moving part — it has to sit quietly beside a
            name, sometimes several times in one list */}
        <circle cx="8" cy="8" r="7.1" stroke="#34d399" strokeWidth="1.3" opacity="0.9" />
        <circle cx="8" cy="8" r="7.1" stroke="#34d399" strokeWidth="2.6" opacity="0.18" />
        <path
          d="M4.1 5.7 L6.7 8 L4.1 10.3"
          stroke="#34d399"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="8.2" y="9.3" width="4" height="1.4" rx="0.45" fill="#34d399" />
      </svg>
    </span>
  );
}
