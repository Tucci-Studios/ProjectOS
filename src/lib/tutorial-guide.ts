import { CATEGORY_META } from "@/lib/categories";

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
   * A picture. Hosted anywhere over https — a raw GitHub URL is the usual
   * answer, since the author's AI is already working in a repo.
   */
  image?: { url: string; alt: string; caption?: string };
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
/**
 * Generated from the sections themselves rather than typed out, so the list a
 * writer sees can never drift from the list the API enforces. Without it, an
 * AI guesses the slug, gets a 400, and has nothing to correct against.
 */
const SECTION_LIST = CATEGORY_META.map((c) => `- \`${c.slug}\` — ${c.label}: ${c.use}`).join("\n");

export const TUTORIAL_SPEC = `# Writing a tutorial for Project Open Source

You are drafting a tutorial for Project Open Source. Read this whole file, then
follow the three phases below in order. Do not skip to writing.

## Phase 1 — Ask before you write

Do not start drafting. Ask the author these questions first, in one message, and
wait for answers. A tutorial written from a one-line request is generic, and the
things that make it useful are exactly the things only they know.

1. **What should the reader be able to do at the end?** One sentence.
2. **Who is it for** — someone who has never touched this, or someone who knows the tool and wants this specific technique?
3. **How long should it take them?** Roughly 5, 15 or 30 minutes. This decides how much gets cut.
4. **Have you done it yourself?** If so, what went wrong the first time — that is the most valuable part of the whole guide and no documentation contains it.
5. **Any screenshots?** If they have images already hosted somewhere public, ask for the URLs. If not, say so and move on; pictures are optional.

If they answer briefly or say "you decide", proceed on your own judgement rather
than asking again. One round of questions, not an interrogation.

## Phase 2 — Research, then write

Work from official documentation, not memory. Version-specific details go stale
and a guide that is confidently wrong is worse than none. If the docs contradict
what you think you know, the docs win. If you cannot verify a claim, leave it out.

Then write the tutorial as a single JSON object matching the shape at the end.

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

## Sections

\`category\` must be exactly one of these. Anything else is rejected:

${SECTION_LIST}

If none of them genuinely fits your subject, **stop and say so** rather than
picking the nearest one. A guide filed in the wrong section is worse than one
that waited for a section to exist — say which subject you were asked to cover
and that no section matches it, and let a person decide.

## Field rules

- \`title\`: start with **"How to"** and finish the sentence — "How to make a Claude Code skill". House style, so a list of them scans. Not a noun phrase, and not a slogan.
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

## Drawings

Where a step changes the shape of a directory, draw it rather than describing it
in prose — a written-out path is what readers skim and then get wrong:

\`"figure": { "kind": "tree", "caption": "...", "lines": [{ "text": "  SKILL.md", "note": "required", "dim": false }] }\`

- \`text\` is the line, indented with spaces to show nesting.
- \`note\` is an optional label rendered to the right with an arrow.
- \`dim\` greys a line out — use it for the optional or alternative parts.
- An empty \`text\` inserts a gap.

## Pictures

A step can carry one image: \`"image": { "url": "https://...", "alt": "...", "caption": "..." }\`.

- **https only.** No data: URIs, no http. A raw GitHub URL from the repo you're working in is the usual answer.
- **alt is required.** Describe what it shows, for anyone who can't see it.
- Use a picture when the thing is visual — a screenshot of what success looks like. Don't screenshot a terminal you could paste as text; text can be copied and searched, a picture can't.

## What you cannot do

- **No HTML in prose fields.** \`title\`, \`summary\`, \`body\` and the rest are plain text and render as text; markup shows up as characters.
- **Do not HTML-escape code samples.** A \`code.text\` value is displayed exactly as written, so write \`<style>\`, not \`&lt;style&gt;\`. Escaping it makes the reader copy entities that won't run.
- **No scripts, no iframes, no embeds.**
- **No links except in \`sources\`.** Cite documentation there, not inline.
- **One image per step**, and it must already be hosted somewhere public.
- **Don't invent fields.** Anything outside the shape below is dropped.

## How to post it

Take the JSON you produced and give it to the author. They paste it — or a link
to it — at project-open-source.com/tutorials/new. Nothing gets published without
a signed-in human doing that; you cannot post on their behalf.

## Phase 3 — Show them before anything is posted

Write two files into the working directory, then stop:

- \`tutorial.json\` — the JSON object.
- \`tutorial-preview.html\` — a rough local preview so they can read it as a page instead of as JSON.

Tell them to open the preview in a browser, and that when it looks right they
paste \`tutorial.json\` at project-open-source.com/tutorials/new, where the site
shows the real rendering before anything is published.

Keep the preview minimal — it is a proofreading aid, not a design exercise, and
the site's own preview is what actually decides how it looks. This is enough:

\`\`\`html
<!doctype html><meta charset="utf-8"><title>Tutorial preview</title>
<style>
 body{background:#161d18;color:#e5e5e5;font:16px/1.6 system-ui,sans-serif;max-width:720px;margin:0 auto;padding:40px 24px}
 h1{font-size:28px;margin:.2em 0}h2{font-size:15px;text-transform:uppercase;letter-spacing:.1em;color:#9aa5a0;margin-top:2em}
 .sum{color:#c5c5c5}.meta{color:#8b9490;font-size:13px}
 li{margin:1.4em 0}li h3{margin:0 0 .3em;font-size:16px}
 pre{background:#0d120f;border:1px solid #262626;border-radius:8px;padding:12px;overflow-x:auto;font-size:13px}
 .chk{color:#9aa5a0;font-size:14px;border-left:2px solid #4ade80;padding-left:10px}
 .tr{border:1px solid rgba(244,63,94,.3);background:rgba(244,63,94,.05);border-radius:10px;padding:12px 16px}
 .tr p{margin:.5em 0;font-size:14px}img{max-width:100%;border-radius:8px}
</style>
<div id="out"></div>
<script>
const t = /* paste the same object you wrote to tutorial.json */;
const esc = s => String(s ?? "").replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
out.innerHTML = \`
<p class="meta">TUTORIAL &middot; \${esc(t.minutes)} min &middot; \${esc(t.level)}</p>
<h1>\${esc(t.title)}</h1><p class="sum">\${esc(t.summary)}</p>
<h2>What you'll end up with</h2><p>\${esc(t.outcome)}</p>
<h2>Before you start</h2><ul>\${t.prerequisites.map(p=>\`<li>\${esc(p)}</li>\`).join("")}</ul>
<h2>Steps</h2><ol>\${t.steps.map(s=>\`<li><h3>\${esc(s.title)}</h3><p>\${esc(s.body)}</p>
 \${s.code?\`<pre>\${esc(s.code.text)}</pre>\`:""}
 \${s.image?\`<img src="\${esc(s.image.url)}" alt="\${esc(s.image.alt)}">\`:""}
 \${s.check?\`<p class="chk">Worked if: \${esc(s.check)}</p>\`:""}</li>\`).join("")}</ol>
<h2>When it doesn't work</h2><div class="tr">\${t.troubleshooting.map(x=>\`<p><b>\${esc(x.symptom)}</b><br>\${esc(x.fix)}</p>\`).join("")}</div>
<h2>Sources</h2><ul>\${t.sources.map(s=>\`<li>\${esc(s.label)} — \${esc(s.url)}</li>\`).join("")}</ul>\`;
</script>
\`\`\`

Do not try to publish anything yourself. You cannot, and you should not: a person
signs in and presses the button, and that is deliberate.

## Output

The JSON object, written to \`tutorial.json\` and also shown in your reply:

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

/**
 * Reads a stored guide back, and says no to anything that isn't one.
 *
 * Post bodies are free text, so this has to be certain rather than hopeful — a
 * half-parsed guide would render as a tutorial with missing sections, which is
 * worse than falling through to the prose renderer.
 */
/** The handful a model actually produces. Deliberately not a full HTML decoder. */
function unescapeEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

export function parseGuide(text: string): Guide | null {
  const t = text.trim();
  if (!t.startsWith("{")) return null;
  try {
    const g = JSON.parse(t) as Partial<Guide>;
    if (!g.title || !Array.isArray(g.steps) || !g.steps.length) return null;
    return {
      slug: g.slug ?? "",
      title: g.title,
      summary: g.summary ?? "",
      minutes: typeof g.minutes === "number" ? g.minutes : 5,
      level: g.level ?? "first time",
      category: g.category ?? "",
      outcome: g.outcome ?? "",
      prerequisites: Array.isArray(g.prerequisites) ? g.prerequisites : [],
      steps: g.steps.map((st) => ({
        ...st,
        // Models keep handing back &lt;style&gt; in code samples however plainly
        // the spec asks them not to, and a reader copying entities out of a
        // code block gets something that doesn't run. Decoded here so the
        // instruction isn't the only thing standing between them and it.
        code: st.code ? { ...st.code, text: unescapeEntities(st.code.text) } : undefined,
        // https only, and no data: URIs — a tutorial body is author-supplied
        // text and an <img src> is the easiest place to smuggle something.
        image:
          st.image && /^https:\/\//.test(st.image.url)
            ? { url: st.image.url, alt: st.image.alt ?? "", caption: st.image.caption }
            : undefined,
      })),
      troubleshooting: Array.isArray(g.troubleshooting) ? g.troubleshooting : [],
      sources: Array.isArray(g.sources) ? g.sources : [],
      verified: g.verified,
    };
  } catch {
    return null;
  }
}
