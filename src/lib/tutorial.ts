/**
 * The tutorial format.
 *
 * One shape, enforced by the composer rather than suggested by a template: a
 * goal, what you need, numbered steps, and how you know it worked. A template
 * in a textarea is advice — half the tutorials follow it and the other half are
 * a wall of prose. Building the form out of the format means every tutorial on
 * the site reads the same way, and a reader knows where to look before they
 * start reading.
 *
 * Stored as markdown so it stays readable outside Project OS and older posts
 * still render, but written and parsed through here.
 */
export type Tutorial = {
  goal: string;
  needs: string[];
  steps: { title: string; body: string }[];
  verify: string;
};

export const EMPTY: Tutorial = {
  goal: "",
  needs: [""],
  steps: [{ title: "", body: "" }],
  verify: "",
};

export function serialize(t: Tutorial): string {
  const out: string[] = [];
  if (t.goal.trim()) out.push(`GOAL\n${t.goal.trim()}`);
  const needs = t.needs.map((n) => n.trim()).filter(Boolean);
  if (needs.length) out.push(`NEEDS\n${needs.map((n) => `- ${n}`).join("\n")}`);
  t.steps
    .filter((s) => s.title.trim() || s.body.trim())
    .forEach((s, i) => out.push(`## Step ${i + 1} — ${s.title.trim()}\n${s.body.trim()}`));
  if (t.verify.trim()) out.push(`VERIFY\n${t.verify.trim()}`);
  return out.join("\n\n");
}

/**
 * Reads the format back, and tolerates posts written before it existed —
 * anything unrecognised becomes the goal, so nothing renders as blank.
 */
export function parse(md: string): Tutorial {
  const sections = md.split(/\n(?=## Step |GOAL$|NEEDS$|VERIFY$)/m);
  const t: Tutorial = { goal: "", needs: [], steps: [], verify: "" };
  const loose: string[] = [];

  for (const raw of sections) {
    const block = raw.trim();
    if (!block) continue;
    const step = /^## Step\s*\d*\s*[—–-]?\s*(.*)$/m.exec(block.split("\n")[0]);
    if (block.startsWith("## ") && step) {
      t.steps.push({ title: step[1].trim(), body: block.split("\n").slice(1).join("\n").trim() });
    } else if (/^GOAL\b/.test(block)) {
      t.goal = block.replace(/^GOAL\s*/, "").trim();
    } else if (/^NEEDS\b|^PREREQS\b/.test(block)) {
      t.needs = block
        .split("\n")
        .slice(1)
        .map((l) => l.replace(/^\s*[-*]\s*/, "").trim())
        .filter(Boolean);
    } else if (/^VERIFY\b/.test(block)) {
      t.verify = block.replace(/^VERIFY\s*/, "").trim();
    } else {
      loose.push(block);
    }
  }

  if (!t.goal && loose.length) t.goal = loose.join("\n\n");
  return t;
}

/** What the format is missing, in the order a writer should fix it. */
export function problems(t: Tutorial): string[] {
  const p: string[] = [];
  if (t.goal.trim().length < 10) p.push("Say what the reader will have working at the end.");
  if (!t.steps.some((s) => s.title.trim() && s.body.trim())) p.push("Add at least one step with a title and instructions.");
  if (t.steps.some((s) => s.title.trim() && !s.body.trim())) p.push("Every step needs instructions, not just a title.");
  return p;
}

/** Reading time, rounded to something a person would say out loud. */
export function minutes(t: Tutorial): number {
  const words = [t.goal, t.verify, ...t.needs, ...t.steps.flatMap((s) => [s.title, s.body])]
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}
