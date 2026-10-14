#!/usr/bin/env node
/**
 * Fails if any colour we put text in drops below WCAG 2.2 AA (4.5:1) against
 * the page background. Run it after touching the palette.
 */
const BG = "#161d18";
const hex = (h) => { h = h.replace("#", ""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); };
const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const L = (h) => { const [r, g, b] = hex(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const l1 = L(a), l2 = L(b); const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]; return (hi + 0.05) / (lo + 0.05); };

const CHECK = {
  "tone.ok": "#34d399", "tone.caution": "#fbbf24", "tone.danger": "#fb7185",
  "tone.info": "#38bdf8", "tone.muted": "#a1a1a1",
  "group.ai": "#7cc4ff", "group.build": "#a78bfa", "group.play": "#fb923c",
  "body": "#d4d4d4", "heading": "#f5f5f5",
};

let failed = 0;
for (const [name, color] of Object.entries(CHECK)) {
  const r = ratio(color, BG);
  const ok = r >= 4.5;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${r.toFixed(2).padStart(5)}:1  ${name}`);
}
console.log(failed ? `\n${failed} colour(s) below AA.` : "\nAll pass WCAG AA (4.5:1).");
process.exit(failed ? 1 : 0);
