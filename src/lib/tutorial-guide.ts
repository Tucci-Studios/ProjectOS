/**
 * A richer tutorial format — proposed, not live.
 *
 * The site already has one (src/lib/tutorial.ts): goal, needs, numbered steps,
 * verify. It's enforced by the composer and every post uses it. This adds the
 * three things that format can't carry, and which the first real guide needed:
 * per-step code blocks with filenames, a troubleshooting section, and cited
 * sources — because a tutorial about someone else's product must point at their
 * documentation rather than pretend to be it.
 *
 * Kept separate so nothing already written breaks while it's being judged.
 */

export type GuideStep = {
  /** Imperative and specific: "Create the folder", not "Setting up". */
  title: string;
  /** Prose. Why this step exists, not a restatement of the command. */
  body: string;
  code?: { lang: string; text: string; filename?: string };
  /**
   * A drawing of the state after this step. Text descriptions of file layouts
   * are the thing readers skim past and then get wrong, so where a step changes
   * the shape of a directory, the step shows the shape.
   */
  figure?: { kind: "tree"; caption?: string; lines: { text: string; note?: string; dim?: boolean }[] };
  /** What you should see if it worked. */
  check?: string;
};

export type Guide = {
  slug: string;
  title: string;
  summary: string;
  minutes: number;
  level: "first time" | "comfortable" | "deep end";
  category: string;
  outcome: string;
  prerequisites: string[];
  steps: GuideStep[];
  /** Symptom → fix. The section people actually come back for. */
  troubleshooting: { symptom: string; fix: string }[];
  /** Official documentation. Always present: we are not the source of truth. */
  sources: { label: string; url: string }[];
  /** Set by a moderator who followed the steps, never by the author. */
  verified?: { by: string; at: number };
};

/**
 * The instructions handed to somebody's AI.
 *
 * The point is that an author shouldn't have to write a prompt. They point
 * their assistant at this file, say what they want to teach, and get back
 * something that already fits. Written as instructions to a model rather than
 * documentation for a person, because that's what will read it.
 */
export const TUTORIAL_SPEC = `# Writing a tutorial for Project Open Source

You are drafting a tutorial for Project Open Source. Read this whole file, then
write the tutorial as a single JSON object matching the shape at the end.

## What a good one looks like

Write for someone competent who has never done this specific thing. Assume they
can use a terminal and have never seen the tool you're describing.

- **One outcome.** A tutorial teaches one thing. If it needs "and also", it's two tutorials.
- **Every step is doable.** No "configure as appropriate". Say what to type.
- **Say why, once.** A step that explains its reason is remembered; one that only gives a command is copied and forgotten.
- **Write the unhappy path.** Troubleshooting is the most re-read part of any guide. Put the real failures in it — the ones you hit — not invented ones.
- **Never claim affiliation.** Project OS is not affiliated with the makers of any tool it covers. Name products factually. Use nobody's logos. Imply no endorsement.
- **Cite the official docs.** You are a guide, not the source of truth. Send the reader there for anything version-specific.
- **Don't reproduce documentation.** Explain it in your own words with your own examples. Quoting a line for precision is fine; copying a page is not.
- **Be honest about time.** Estimate for a careful first-timer, not for you.

## Field rules

- \`title\`: what the reader will be able to do. Not a noun phrase.
- \`summary\`: one sentence, under 140 characters, no marketing.
- \`minutes\`: integer, rounded up.
- \`level\`: "first time" | "comfortable" | "deep end".
- \`outcome\`: the concrete thing they end up with.
- \`prerequisites\`: what must already be true, with versions where they matter.
- \`steps[].title\`: imperative. "Create the folder", not "Folder creation".
- \`steps[].body\`: 1–3 sentences. Why this step, and what it does.
- \`steps[].code\`: optional. Include \`filename\` when it's a file's contents rather than a command.
- \`steps[].check\`: what they should see if it worked. Include wherever it's possible to get it wrong.
- \`troubleshooting\`: symptom as the reader experiences it, fix as an action.
- \`sources\`: official documentation only. At least one.

## Output

Return only the JSON object, no commentary:

\`\`\`json
{
  "slug": "kebab-case-url-slug",
  "title": "...",
  "summary": "...",
  "minutes": 10,
  "level": "first time",
  "category": "claude-skills",
  "outcome": "...",
  "prerequisites": ["..."],
  "steps": [{ "title": "...", "body": "...", "code": { "lang": "bash", "text": "...", "filename": "..." }, "check": "..." }],
  "troubleshooting": [{ "symptom": "...", "fix": "..." }],
  "sources": [{ "label": "...", "url": "https://..." }]
}
\`\`\`
`;
