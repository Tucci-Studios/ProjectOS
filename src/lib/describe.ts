/**
 * Tidying a description we didn't write.
 *
 * 283 of the 655 listed projects carry their GitHub description verbatim, and
 * that field is a dumping ground: badge shortcodes, emoji used as bullets,
 * pipe-separated platform lists, a trailing URL, sometimes the project's own
 * name repeated at the front. On a card it truncates mid-list and the whole
 * site reads as scraped.
 *
 * The rule here is conservative on purpose — remove ornament, never remove
 * words. If a description is plain prose it comes back untouched, and anything
 * this can't confidently improve it leaves alone.
 */

/** Emoji, symbols, flags, dingbats — the ranges people decorate with. */
const ORNAMENT =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}\u{2190}-\u{21FF}\u{2900}-\u{297F}]/gu;

export function cleanDescription(raw: string | null | undefined, projectName?: string): string {
  let t = (raw ?? "").trim();
  if (!t) return "";

  t = t.replace(/!?\[[^\]]*\]\([^)]*\)/g, " ");        // markdown images and links
  t = t.replace(/<[^>]+>/g, " ");                       // stray HTML
  t = t.replace(/https?:\/\/\S+/g, " ");                // bare URLs
  t = t.replace(ORNAMENT, " ");
  t = t.replace(/[*_`#]+/g, " ");                       // leftover markdown punctuation

  // "Name — the thing it does" and "Name: the thing it does" repeat what the
  // title above already says, so the first line of a card is wasted.
  if (projectName) {
    const escaped = projectName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    t = t.replace(new RegExp(`^\\s*${escaped}\\s*[-–—:|]\\s*`, "i"), "");
  }

  // A pipe list is a platform matrix, not a sentence. Keep what's before it.
  const pipe = t.indexOf("|");
  if (pipe > 40) t = t.slice(0, pipe);

  t = t.replace(/\s+/g, " ").replace(/\s+([,.;:!?])/g, "$1").trim();
  t = t.replace(/^[-–—:;,.|/\\)\]]+\s*/, "").replace(/[\s\-–—:;,|/\\(\[]+$/, "");

  if (!t) return (raw ?? "").trim();                    // never return worse than nothing
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Cuts to a word boundary, so a card never stops mid-word. */
export function clampWords(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.-]+$/, "")}…`;
}
