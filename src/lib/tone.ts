/**
 * What each colour means.
 *
 * The site had colour everywhere and meaning nowhere — emerald was the brand,
 * and also success, and also "help wanted"; amber was the Tutorials section,
 * and also a warning, and also the Lab. When the same hue means three things,
 * it means none of them, and a reader can't learn the language.
 *
 * So there are two palettes and they never mix:
 *
 *   IDENTITY  — which part of the site this is. Arbitrary by definition; the
 *               AI / Build / Play group hues live in categories.ts. Identity
 *               colour is only ever used on marks, labels and section chrome.
 *
 *   STATUS    — how something IS. The five below. Never decorative, never used
 *               to make a section look nice. If you see amber on this site it
 *               means "this needs your attention", every time.
 *
 * Green stays the brand. It's also `ok`, and that's deliberate rather than
 * sloppy: on this site green consistently means go, safe, verified, yours.
 * The rule that keeps it honest is the other direction — nothing that is
 * merely *present* gets to be green. It has to be affirmatively good.
 *
 * Every value below is checked against the page background (#161d18) for
 * WCAG 2.2 contrast; see scripts/contrast.mjs, which fails the build's audit
 * if any drops under 4.5:1.
 */

export type Tone = "ok" | "caution" | "danger" | "info" | "muted";

export type ToneSpec = {
  /** Foreground text/icon colour. */
  hex: string;
  /** What this tone is allowed to mean. */
  meaning: string;
};

export const TONES: Record<Tone, ToneSpec> = {
  ok: {
    hex: "#34d399", // emerald-400 — 8.93:1
    meaning: "Verified, safe, yours, ready. Affirmative — never just 'present'.",
  },
  caution: {
    hex: "#fbbf24", // amber-400 — 10.29:1
    meaning: "Needs your attention before you rely on it. Unfinished, experimental, more work than usual.",
  },
  danger: {
    hex: "#fb7185", // rose-400 — 6.38:1
    meaning: "Destructive, disputed, failed. Something is wrong or cannot be undone.",
  },
  info: {
    hex: "#38bdf8", // sky-400 — 8.01:1
    meaning: "Neutral fact worth noticing. Carries no judgement either way.",
  },
  muted: {
    hex: "#a1a1a1", // neutral-400 — 6.65:1
    meaning: "Absent, unknown, not applicable. The deliberate lack of a signal.",
  },
};

/** Tailwind classes for a tone, for the common cases. */
export const TONE_CLASS: Record<Tone, { text: string; border: string; bg: string }> = {
  ok: { text: "text-emerald-400", border: "border-emerald-400/40", bg: "bg-emerald-400/10" },
  caution: { text: "text-amber-400", border: "border-amber-400/40", bg: "bg-amber-400/10" },
  danger: { text: "text-rose-400", border: "border-rose-400/40", bg: "bg-rose-400/10" },
  info: { text: "text-sky-400", border: "border-sky-400/40", bg: "bg-sky-400/10" },
  muted: { text: "text-neutral-400", border: "border-neutral-700", bg: "bg-neutral-800/40" },
};

/**
 * The lowest grey that still passes AA on small text.
 *
 * neutral-500 is 3.62:1 and neutral-600 is 2.20:1 against our background —
 * both fail for body copy. They were being used for bylines and captions,
 * which is exactly the text someone with low vision most needs. Anything
 * under ~16px uses this instead.
 */
export const DIM_TEXT = "text-neutral-400";
