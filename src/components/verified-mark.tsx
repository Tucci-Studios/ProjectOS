/**
 * The Project OS mark, green and tiny, sitting after a username like a ©.
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
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="7.1" stroke="#34d399" strokeWidth="1.15" opacity="0.75" />
        {/* the forking trunk, scaled to sit inside the ring */}
        <g transform="translate(8 8.6) scale(0.62) translate(-8 -10)">
          <path d="M8 15V9.5" stroke="#34d399" strokeWidth="1.9" strokeLinecap="round" />
          <path d="M8 10 L4.2 6.6 M8 10 L11.8 6.6" stroke="#34d399" strokeWidth="1.7" strokeLinecap="round" />
          <circle cx="8" cy="10" r="1.6" fill="#34d399" />
          <circle cx="4" cy="5.4" r="1.7" fill="none" stroke="#34d399" strokeWidth="1.6" />
          <circle cx="12" cy="5.4" r="1.7" fill="none" stroke="#34d399" strokeWidth="1.6" />
        </g>
      </svg>
    </span>
  );
}
