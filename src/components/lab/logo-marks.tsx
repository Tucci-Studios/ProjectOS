"use client";

/**
 * Ten takes on the mark, all animated.
 *
 * The current one is a forking trunk in a circle and it's fine, but it's inert —
 * a logo you stop seeing after a week. Everything here keeps that idea (a
 * lineage: one thing becoming two) and asks what motion adds.
 *
 * Rules for all ten:
 *   - Original geometry only. No borrowed glyphs or anyone else's marks.
 *   - Legible at 34px, which is the size it actually ships at. Several ideas
 *     that looked good at 96 died at 34 and aren't here.
 *   - CSS animation, no JS loop. This sits in the header on every page; it
 *     can't cost a frame budget or keep a timer alive forever.
 *   - Motion is slow and looping, or it happens on hover. A fast loop in the
 *     corner of every page is a distraction, not a brand.
 */

const S = "#fafafa";
const ACCENT = "#4ade80";

/** The shared shell: same circle, same size behaviour, so the ten compare fairly. */
function Shell({ size, children, spin }: { size: number; children: React.ReactNode; spin?: boolean }) {
  return (
    <span
      className={`group/mark relative inline-flex shrink-0 items-center justify-center rounded-full border border-neutral-500 bg-neutral-900/60 ${
        spin ? "mark-shell-spin" : ""
      }`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 16 16" fill="none" overflow="visible">
        {children}
      </svg>
    </span>
  );
}

/** 01 — Growth. The trunk draws itself, then the branches, then the nodes land. */
export function MarkGrow({ size = 34 }: { size?: number }) {
  return (
    <Shell size={size}>
      <path d="M8 15V9.5" stroke={S} strokeWidth="1.5" strokeLinecap="round" className="m-draw m-d1" />
      <path d="M8 10 L4.2 6.6" stroke={S} strokeWidth="1.35" strokeLinecap="round" className="m-draw m-d2" />
      <path d="M8 10 L11.8 6.6" stroke={S} strokeWidth="1.35" strokeLinecap="round" className="m-draw m-d3" />
      <circle cx="8" cy="10" r="1.35" fill={S} />
      <circle cx="4" cy="5.4" r="1.5" fill="none" stroke={S} strokeWidth="1.25" className="m-pop m-d4" />
      <circle cx="12" cy="5.4" r="1.5" fill="none" stroke={S} strokeWidth="1.25" className="m-pop m-d5" />
    </Shell>
  );
}

/** 02 — Pulse. A signal travels up the trunk and out to both tips, forever. */
export function MarkPulse({ size = 34 }: { size?: number }) {
  return (
    <Shell size={size}>
      <path d="M8 15V9.5" stroke="#525252" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 10 L4.2 6.6 M8 10 L11.8 6.6" stroke="#525252" strokeWidth="1.35" strokeLinecap="round" />
      <path d="M8 15V9.5" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" className="m-flow" />
      <path d="M8 10 L4.2 6.6" stroke={ACCENT} strokeWidth="1.35" strokeLinecap="round" className="m-flow m-d2" />
      <path d="M8 10 L11.8 6.6" stroke={ACCENT} strokeWidth="1.35" strokeLinecap="round" className="m-flow m-d2" />
      <circle cx="8" cy="10" r="1.35" fill={S} />
      <circle cx="4" cy="5.4" r="1.5" fill="none" stroke={S} strokeWidth="1.25" className="m-blink m-d4" />
      <circle cx="12" cy="5.4" r="1.5" fill="none" stroke={S} strokeWidth="1.25" className="m-blink m-d5" />
    </Shell>
  );
}

/** 03 — Orbit. The tips are satellites; the whole fork turns slowly. */
export function MarkOrbit({ size = 34 }: { size?: number }) {
  return (
    <Shell size={size}>
      <g className="m-spin" style={{ transformOrigin: "8px 8px" }}>
        <path d="M8 8 L4.2 4.6 M8 8 L11.8 4.6 M8 8 V13" stroke={S} strokeWidth="1.35" strokeLinecap="round" />
        <circle cx="4.2" cy="4.6" r="1.4" fill="none" stroke={S} strokeWidth="1.2" />
        <circle cx="11.8" cy="4.6" r="1.4" fill="none" stroke={S} strokeWidth="1.2" />
        <circle cx="8" cy="13" r="1.4" fill="none" stroke={S} strokeWidth="1.2" />
      </g>
      <circle cx="8" cy="8" r="1.5" fill={ACCENT} className="m-breathe" />
    </Shell>
  );
}

/** 04 — Split. One node divides into two and resets. The fork, as a verb. */
export function MarkSplit({ size = 34 }: { size?: number }) {
  return (
    <Shell size={size}>
      <path d="M8 15V9.5" stroke={S} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 10 L4.2 6.6 M8 10 L11.8 6.6" stroke="#525252" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="8" cy="10" r="1.35" fill={S} />
      <circle cx="8" cy="10" r="1.5" fill="none" stroke={ACCENT} strokeWidth="1.3" className="m-split-l" />
      <circle cx="8" cy="10" r="1.5" fill="none" stroke={ACCENT} strokeWidth="1.3" className="m-split-r" />
    </Shell>
  );
}

/** 05 — Scan. A line sweeps the circle and lights what it crosses. */
export function MarkScan({ size = 34 }: { size?: number }) {
  return (
    <Shell size={size}>
      <defs>
        <clipPath id="mk-scan">
          <circle cx="8" cy="8" r="7.6" />
        </clipPath>
      </defs>
      <g clipPath="url(#mk-scan)">
        <path d="M8 15V9.5" stroke={S} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 10 L4.2 6.6 M8 10 L11.8 6.6" stroke={S} strokeWidth="1.35" strokeLinecap="round" />
        <circle cx="8" cy="10" r="1.35" fill={S} />
        <circle cx="4" cy="5.4" r="1.5" fill="none" stroke={S} strokeWidth="1.25" />
        <circle cx="12" cy="5.4" r="1.5" fill="none" stroke={S} strokeWidth="1.25" />
        <rect x="-8" y="-1" width="16" height="2.2" fill={ACCENT} opacity="0.5" className="m-scan" />
      </g>
    </Shell>
  );
}

/** 06 — Terminal. A cursor blinks where the trunk would be. Most "OS" of the ten. */
export function MarkCaret({ size = 34 }: { size?: number }) {
  return (
    <Shell size={size}>
      <path d="M3.6 5.4 L6.6 8 L3.6 10.6" stroke={S} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="8.4" y="9.4" width="4.4" height="1.5" rx="0.5" fill={ACCENT} className="m-caret" />
    </Shell>
  );
}

/** 07 — Ring. The circle itself is the animation: a lineage closing the loop. */
export function MarkRing({ size = 34 }: { size?: number }) {
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center rounded-full bg-neutral-900/60"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="absolute inset-0">
        <circle cx="20" cy="20" r="19" stroke="#525252" strokeWidth="1.4" />
        <circle
          cx="20"
          cy="20"
          r="19"
          stroke={ACCENT}
          strokeWidth="1.6"
          strokeLinecap="round"
          className="m-trace"
          style={{ transformOrigin: "20px 20px" }}
        />
      </svg>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 16 16" fill="none">
        <path d="M8 15V9.5" stroke={S} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 10 L4.2 6.6 M8 10 L11.8 6.6" stroke={S} strokeWidth="1.35" strokeLinecap="round" />
        <circle cx="8" cy="10" r="1.35" fill={S} />
      </svg>
    </span>
  );
}

/** 08 — Stack. Three layers settle into place, like a build finishing. */
export function MarkStack({ size = 34 }: { size?: number }) {
  return (
    <Shell size={size}>
      <path d="M8 3.4 L13 6 L8 8.6 L3 6 Z" fill="none" stroke={S} strokeWidth="1.25" strokeLinejoin="round" className="m-lift m-d1" />
      <path d="M3 9 L8 11.6 L13 9" fill="none" stroke={S} strokeWidth="1.25" strokeLinejoin="round" className="m-lift m-d3" />
      <path d="M3 12 L8 14.6 L13 12" fill="none" stroke={ACCENT} strokeWidth="1.25" strokeLinejoin="round" className="m-lift m-d5" />
    </Shell>
  );
}

/** 09 — Constellation. Nodes fade in and out of a network, never all at once. */
export function MarkNodes({ size = 34 }: { size?: number }) {
  const pts: [number, number, string][] = [
    [8, 11.5, ""], [4.4, 7.6, "m-d2"], [11.6, 7.6, "m-d3"], [8, 4.2, "m-d4"],
  ];
  return (
    <Shell size={size}>
      <path d="M8 11.5 L4.4 7.6 M8 11.5 L11.6 7.6 M4.4 7.6 L8 4.2 M11.6 7.6 L8 4.2"
        stroke="#525252" strokeWidth="1" strokeLinecap="round" />
      {pts.map(([cx, cy, d], i) => (
        <circle key={i} cx={cx} cy={cy} r="1.5" fill={i === 0 ? ACCENT : S} className={`m-twinkle ${d}`} />
      ))}
    </Shell>
  );
}

/** 10 — Still, until you touch it. The rest animate on hover only. */
export function MarkHover({ size = 34 }: { size?: number }) {
  return (
    <Shell size={size}>
      <path d="M8 15V9.5" stroke={S} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 10 L4.2 6.6" stroke={S} strokeWidth="1.35" strokeLinecap="round" className="m-hv-l" />
      <path d="M8 10 L11.8 6.6" stroke={S} strokeWidth="1.35" strokeLinecap="round" className="m-hv-r" />
      <circle cx="8" cy="10" r="1.35" fill={S} />
      <circle cx="4" cy="5.4" r="1.5" fill="none" stroke={S} strokeWidth="1.25" className="m-hv-l" />
      <circle cx="12" cy="5.4" r="1.5" fill="none" stroke={S} strokeWidth="1.25" className="m-hv-r" />
    </Shell>
  );
}

export const LOGO_MARKS = [
  { key: "grow", n: "01", name: "Growth", Mark: MarkGrow,
    note: "Draws itself on load — trunk, branches, then the two tips land. Says 'lineage' without you having to explain it." },
  { key: "pulse", n: "02", name: "Pulse", Mark: MarkPulse,
    note: "A signal runs up the trunk and out to both tips, on a loop. Reads as alive; the risk is that it never stops moving." },
  { key: "orbit", n: "03", name: "Orbit", Mark: MarkOrbit,
    note: "The whole fork turns, slowly enough to notice only if you look. Centre breathes green." },
  { key: "split", n: "04", name: "Split", Mark: MarkSplit,
    note: "One node divides into two and resets. The literal act of forking, as a loop." },
  { key: "scan", n: "05", name: "Scan", Mark: MarkScan,
    note: "A line sweeps the circle and lights what it passes. Closest to the cyberpunk brief." },
  { key: "caret", n: "06", name: "Terminal", Mark: MarkCaret,
    note: "A prompt and a blinking cursor. The most 'OS' of the ten, and the only one that drops the fork entirely." },
  { key: "ring", n: "07", name: "Ring", Mark: MarkRing,
    note: "The mark holds still; the circle traces around it. Motion at the edge is easier to live with in a header." },
  { key: "stack", n: "08", name: "Stack", Mark: MarkStack,
    note: "Three layers settle, like a build finishing. Loses the fork, gains a sense of something being assembled." },
  { key: "nodes", n: "09", name: "Constellation", Mark: MarkNodes,
    note: "A small network where nodes come and go. Suggests many projects rather than one." },
  { key: "hover", n: "10", name: "On touch", Mark: MarkHover,
    note: "Identical to what ships today until you point at it, then it opens. Nothing moves unless a person asks." },
] as const;
