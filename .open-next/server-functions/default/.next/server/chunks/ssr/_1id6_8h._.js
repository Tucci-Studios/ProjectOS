module.exports=[52562,a=>{"use strict";let b=(0,a.i(64831).default)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);a.s(["Check",0,b],52562)},85650,a=>{"use strict";let b=(0,a.i(64831).default)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);a.s(["Copy",0,b],85650)},68370,a=>{"use strict";let b=(0,a.i(64831).default)("external-link",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);a.s(["ExternalLink",0,b],68370)},41146,a=>{"use strict";let b=(0,a.i(64831).default)("chevron-right",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);a.s(["ChevronRight",0,b],41146)},90629,a=>{"use strict";let b=(0,a.i(64831).default)("pencil",[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]]);a.s(["Pencil",0,b],90629)},8480,a=>{"use strict";let b=a.i(80995).CATEGORY_META.map(a=>`- \`${a.slug}\` — ${a.label}: ${a.use}`).join("\n"),c=`# Writing a tutorial for Project Open Source

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

${b}

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
`;a.s(["TUTORIAL_SPEC",0,c,"parseGuide",0,function(a){let b=a.trim();if(!b.startsWith("{"))return null;try{let a=JSON.parse(b);if(!a.title||!Array.isArray(a.steps)||!a.steps.length)return null;return{slug:a.slug??"",title:a.title,summary:a.summary??"",minutes:"number"==typeof a.minutes?a.minutes:5,level:a.level??"first time",category:a.category??"",outcome:a.outcome??"",prerequisites:Array.isArray(a.prerequisites)?a.prerequisites:[],steps:a.steps.map(a=>({...a,image:a.image&&/^https:\/\//.test(a.image.url)?{url:a.image.url,alt:a.image.alt??"",caption:a.image.caption}:void 0})),troubleshooting:Array.isArray(a.troubleshooting)?a.troubleshooting:[],sources:Array.isArray(a.sources)?a.sources:[],verified:a.verified}}catch{return null}}])},75992,a=>{"use strict";var b=a.i(87924),c=a.i(53704),d=a.i(80961);let e={slug:"write-your-first-claude-skill",title:"How to make a Claude Code skill",summary:"Turn a set of instructions you keep repeating into a skill Claude loads by itself.",minutes:10,level:"first time",category:"claude-skills",outcome:"A skill Claude loads on its own when it's relevant, and that you can run with a slash.",prerequisites:["Claude Code installed.","A terminal and a text editor.","Something you've pasted into a chat more than twice."],steps:[{title:"Pick the thing you keep re-explaining",body:"Use something real — the format is trivial, the content is the hard part. Commit message style, release steps, your pre-PR checklist."},{title:"Make the folder",body:"A skill is a folder with a SKILL.md inside it. The folder name becomes the command you type, so name it the way you'd ask for it.",code:{lang:"bash",text:"mkdir -p ~/.claude/skills/commit-style"},figure:{kind:"tree",caption:"Two places a skill can live. Pick one.",lines:[{text:"~/.claude/skills/",note:"personal — every project"},{text:"  commit-style/",note:"the folder name is the command"},{text:"    SKILL.md",note:"required"},{text:""},{text:"your-project/.claude/skills/",note:"project — this repo only",dim:!0},{text:"  commit-style/",dim:!0},{text:"    SKILL.md",dim:!0}]},check:"The folder exists."},{title:"Write SKILL.md",body:"Frontmatter between --- markers, then instructions. Every field is optional, but write a description: it's the only thing Claude sees when deciding to use the skill. The body only loads when the skill runs, so length costs nothing.",code:{lang:"markdown",filename:"~/.claude/skills/commit-style/SKILL.md",text:`---
name: commit-style
description: Writes commit messages in this project's house style. Use when the user asks for a commit message, or is about to commit.
---

Write commit messages as:

- A subject line under 60 characters, imperative mood, no trailing full stop.
- A blank line.
- A body explaining WHY the change was made, not what changed — the diff
  already says what changed.

Never mention the tools used to make the change. Never pad with filler like
"this commit". If the change is trivial, the subject line alone is enough.`},check:"Saved, with --- above and below the frontmatter."},{title:"Use it",body:"New files are picked up during the session — no restart. Either ask in plain language and let the description match, or invoke it by name.",code:{lang:"text",text:"/commit-style"},check:"Claude follows your instructions instead of its defaults."},{title:"Tighten the description",body:'The step people skip, and the one that decides whether it ever fires on its own. Claude sees only the description, never the body — so put the trigger words in it. "Use when the user asks for a commit message" works; "commit helper" doesn\'t.',check:"In a new chat, ask in your own words without naming it — see if it loads."},{title:"Grow it when it earns it",body:"Add templates, examples or scripts next to SKILL.md and mention them in the body. Only when the skill needs it — one clear file beats a folder nobody reads.",figure:{kind:"tree",caption:"Only SKILL.md is required. The rest is there when you need it.",lines:[{text:"commit-style/"},{text:"  SKILL.md",note:"required"},{text:"  template.md",note:"optional — for Claude to fill in",dim:!0},{text:"  examples/",note:"optional — what good output looks like",dim:!0},{text:"  check.sh",note:"optional — a script it can run",dim:!0}]}}],troubleshooting:[{symptom:"Typing /my-skill does nothing, or the name isn't recognised.",fix:"The command comes from the directory name, not the name field in the frontmatter. Rename the folder to match what you're typing."},{symptom:"The skill never loads on its own — only when invoked by name.",fix:"The description doesn't match how you ask. Rewrite it to include what the skill does and the situations it applies to, in the words you'd naturally use."},{symptom:"Claude Code doesn't see a newly created top-level skills folder.",fix:"Edits to existing skill directories are picked up live, but a skills directory that didn't exist when the session started isn't being watched. Restart Claude Code once."},{symptom:"The skill works locally but not in a cloud or scheduled session.",fix:"Those sessions don't read your machine's ~/.claude/skills/. Commit it to the repo's .claude/skills/ instead, or enable it for your account."},{symptom:"Uploading or packaging the skill fails with an unexpected-key error.",fix:"Outside Claude Code, only the Agent Skills spec fields are allowed — name, description, license, compatibility, metadata and allowed-tools. Remove Claude Code-only fields before packaging."}],sources:[{label:"Claude Code — Skills documentation",url:"https://code.claude.com/docs/en/skills"},{label:"Agent Skills open standard",url:"https://agentskills.io"}]};var f=a.i(8480);a.s(["LabClient",0,function({specUrl:a}){return(0,b.jsxs)("div",{className:"mx-auto w-full max-w-3xl",children:[(0,b.jsxs)("div",{className:"mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-300",children:[(0,b.jsx)(c.FlaskConical,{size:13,"aria-hidden":!0})," Test area — nothing here is live"]}),(0,b.jsx)("h1",{className:"font-mono text-[28px] font-bold text-white",children:"Lab"}),(0,b.jsx)("p",{className:"mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-400",children:"Where things get tried before they earn a place on the site."}),(0,b.jsxs)("section",{className:"mt-8",children:[(0,b.jsx)("h2",{className:"font-mono text-[15px] font-bold text-white",children:"The tutorial format"}),(0,b.jsx)("p",{className:"mt-1 max-w-2xl text-[13.5px] leading-relaxed text-neutral-400",children:"One worked example, and at the bottom the spec that produces more of them. The shape is fixed on purpose — a reader should always know where the prerequisites are and where the thing that usually goes wrong is written down."}),(0,b.jsx)("div",{className:"mt-5",children:(0,b.jsx)(d.TutorialView,{t:{...e,verified:{by:"Tucci-Studios",at:0}},spec:f.TUTORIAL_SPEC,specUrl:a})})]})]})}],75992)}];

//# sourceMappingURL=_1id6_8h._.js.map