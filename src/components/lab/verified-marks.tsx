const G = "#34d399";

/**
 * Ten ways to say "this person is actually here".
 *
 * The mark has a hard job: it renders at 11px next to a username, sometimes a
 * dozen times down one page, so it can't move and can't shout. But it also has
 * to feel like something you got rather than a checkbox — and a thin ring with
 * a cursor in it reads as neither.
 *
 * The levers are silhouette, weight and light. A circle is the most invisible
 * shape there is; fill, an edge that isn't round, or a rim that catches light
 * all make the same 11px feel earned.
 */

type MarkProps = { size?: number };

/** Shared shell so every option is judged on its shape, not its plumbing. */
function S({ size = 12, glow = 0, children }: { size?: number; glow?: number; children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="inline-block shrink-0 translate-y-[0.5px] align-middle"
      style={glow ? { filter: `drop-shadow(0 0 ${glow}px rgba(52,211,153,0.6))` } : undefined}
    >
      {children}
    </svg>
  );
}

/** The prompt, drawn small enough to survive inside a badge. */
function Prompt({ x = 4.1, s = 1.5, c = G }: { x?: number; s?: number; c?: string }) {
  return (
    <path
      d={`M${x} 5.7 L${x + 2.6} 8 L${x} 10.3`}
      stroke={c}
      strokeWidth={s}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

/** 01 — what ships today. */
export function M01({ size }: MarkProps) {
  return (
    <S size={size} glow={2.5}>
      <circle cx="8" cy="8" r="7.1" stroke={G} strokeWidth="1.3" opacity="0.9" />
      <Prompt />
      <rect x="8.2" y="9.3" width="4" height="1.4" rx="0.45" fill={G} />
    </S>
  );
}

/** 02 — filled. The single biggest change you can make at 11px. */
export function M02({ size }: MarkProps) {
  return (
    <S size={size} glow={3}>
      <circle cx="8" cy="8" r="7.4" fill={G} />
      <Prompt x={4.4} s={1.7} c="#0f1411" />
      <rect x="8.6" y="9.3" width="3.6" height="1.5" rx="0.45" fill="#0f1411" />
    </S>
  );
}

/** 03 — a seal. Scalloped edges read as "issued" rather than "ticked". */
export function M03({ size }: MarkProps) {
  const pts = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    const r = i % 2 === 0 ? 7.4 : 6.2;
    return `${(8 + Math.cos(a) * r).toFixed(2)},${(8 + Math.sin(a) * r).toFixed(2)}`;
  }).join(" ");
  return (
    <S size={size} glow={2.5}>
      <polygon points={pts} fill={G} opacity="0.16" />
      <polygon points={pts} stroke={G} strokeWidth="1.1" strokeLinejoin="round" fill="none" />
      <Prompt x={4.4} s={1.4} />
    </S>
  );
}

/** 04 — hexagon. Not round, so it stands out in a row of round avatars. */
export function M04({ size }: MarkProps) {
  const hex = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    return `${(8 + Math.cos(a) * 7.3).toFixed(2)},${(8 + Math.sin(a) * 7.3).toFixed(2)}`;
  }).join(" ");
  return (
    <S size={size} glow={3}>
      <polygon points={hex} fill={G} />
      <Prompt x={4.6} s={1.7} c="#0f1411" />
      <rect x="8.8" y="9.3" width="3.2" height="1.5" rx="0.45" fill="#0f1411" />
    </S>
  );
}

/** 05 — the cursor alone, lit. Nothing to read, everything to notice. */
export function M05({ size }: MarkProps) {
  return (
    <S size={size} glow={4}>
      <rect x="3.4" y="5.2" width="9.2" height="5.6" rx="1.4" fill={G} opacity="0.18" />
      <rect x="5" y="6.4" width="6" height="3.2" rx="0.8" fill={G} />
    </S>
  );
}

/** 06 — a halo: two rings, the outer one barely there. */
export function M06({ size }: MarkProps) {
  return (
    <S size={size} glow={3.5}>
      <circle cx="8" cy="8" r="7.5" stroke={G} strokeWidth="0.7" opacity="0.35" />
      <circle cx="8" cy="8" r="5.6" fill={G} />
      <Prompt x={5.2} s={1.5} c="#0f1411" />
    </S>
  );
}

/** 07 — brackets instead of a ring. The syntax of being inside something. */
export function M07({ size }: MarkProps) {
  return (
    <S size={size} glow={2.5}>
      <path d="M4.6 2.6 L2.2 2.6 L2.2 13.4 L4.6 13.4" stroke={G} strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path d="M11.4 2.6 L13.8 2.6 L13.8 13.4 L11.4 13.4" stroke={G} strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <rect x="5.6" y="7" width="4.8" height="2" rx="0.6" fill={G} />
    </S>
  );
}

/** 08 — a notched ring, like a stamp punched out of metal. */
export function M08({ size }: MarkProps) {
  return (
    <S size={size} glow={3}>
      <circle
        cx="8"
        cy="8"
        r="6.9"
        stroke={G}
        strokeWidth="2.2"
        fill="none"
        strokeDasharray="9 2.6"
        strokeLinecap="round"
      />
      <circle cx="8" cy="8" r="4" fill={G} />
      <Prompt x={6.2} s={1.4} c="#0f1411" />
    </S>
  );
}

/** 09 — a shield. The most literal "earned", for better or worse. */
export function M09({ size }: MarkProps) {
  return (
    <S size={size} glow={3}>
      <path d="M8 1.2 L14.4 3.9 V8.4 C14.4 11.7 11.6 14 8 14.9 C4.4 14 1.6 11.7 1.6 8.4 V3.9 Z" fill={G} />
      <Prompt x={4.9} s={1.6} c="#0f1411" />
      <rect x="9.1" y="9.4" width="2.6" height="1.4" rx="0.45" fill="#0f1411" />
    </S>
  );
}

/** 10 — a lit dot on a ring. Reads as a live signal, not a certificate. */
export function M10({ size }: MarkProps) {
  return (
    <S size={size} glow={4.5}>
      <circle cx="8" cy="8" r="7" stroke={G} strokeWidth="1" opacity="0.5" />
      <circle cx="8" cy="8" r="4.6" stroke={G} strokeWidth="1.5" opacity="0.85" />
      <circle cx="8" cy="8" r="2.1" fill={G} />
    </S>
  );
}

export const VERIFIED_MARKS = [
  { key: "01", name: "Ring", Mark: M01, note: "What ships today. Thin, quiet, and easy to miss." },
  { key: "02", name: "Filled", Mark: M02, note: "The prompt knocked out of a solid disc. Weight is what reads at 11px." },
  { key: "03", name: "Seal", Mark: M03, note: "Scalloped edge. Looks issued rather than ticked." },
  { key: "04", name: "Hex", Mark: M04, note: "Not round, so it stands out in a row of round avatars." },
  { key: "05", name: "Cursor", Mark: M05, note: "Just the cursor, lit. Nothing to read, everything to notice." },
  { key: "06", name: "Halo", Mark: M06, note: "A solid core with a faint ring off it." },
  { key: "07", name: "Brackets", Mark: M07, note: "The syntax of being inside something." },
  { key: "08", name: "Stamp", Mark: M08, note: "A punched ring around a solid centre." },
  { key: "09", name: "Shield", Mark: M09, note: "The most literal 'earned', for better or worse." },
  { key: "10", name: "Signal", Mark: M10, note: "Reads as live rather than certified." },
] as const;
