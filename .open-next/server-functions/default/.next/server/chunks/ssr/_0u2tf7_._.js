module.exports=[44501,a=>{"use strict";a.s(["TutorialView",()=>c,"VerifiedTutorialBadge",()=>d]);var b=a.i(11857);let c=(0,b.registerClientReference)(function(){throw Error("Attempted to call TutorialView() from the server but TutorialView is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/src/components/tutorial-view.tsx <module evaluation>","TutorialView"),d=(0,b.registerClientReference)(function(){throw Error("Attempted to call VerifiedTutorialBadge() from the server but VerifiedTutorialBadge is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/src/components/tutorial-view.tsx <module evaluation>","VerifiedTutorialBadge")},61055,a=>{"use strict";a.s(["TutorialView",()=>c,"VerifiedTutorialBadge",()=>d]);var b=a.i(11857);let c=(0,b.registerClientReference)(function(){throw Error("Attempted to call TutorialView() from the server but TutorialView is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/src/components/tutorial-view.tsx","TutorialView"),d=(0,b.registerClientReference)(function(){throw Error("Attempted to call VerifiedTutorialBadge() from the server but VerifiedTutorialBadge is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/src/components/tutorial-view.tsx","VerifiedTutorialBadge")},91038,a=>{"use strict";a.i(44501);var b=a.i(61055);a.n(b)},52813,a=>{"use strict";let b=a.i(15566).CATEGORY_META.map(a=>`- \`${a.slug}\` — ${a.label}: ${a.use}`).join("\n"),c=`# Writing a tutorial for Project Open Source

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
`;a.s(["TUTORIAL_SPEC",0,c,"parseGuide",0,function(a){let b=a.trim();if(!b.startsWith("{"))return null;try{let a=JSON.parse(b);if(!a.title||!Array.isArray(a.steps)||!a.steps.length)return null;return{slug:a.slug??"",title:a.title,summary:a.summary??"",minutes:"number"==typeof a.minutes?a.minutes:5,level:a.level??"first time",category:a.category??"",outcome:a.outcome??"",prerequisites:Array.isArray(a.prerequisites)?a.prerequisites:[],steps:a.steps.map(a=>({...a,code:a.code?{...a.code,text:a.code.text.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,"&")}:void 0,image:a.image&&/^https:\/\//.test(a.image.url)?{url:a.image.url,alt:a.image.alt??"",caption:a.image.caption}:void 0})),troubleshooting:Array.isArray(a.troubleshooting)?a.troubleshooting:[],sources:Array.isArray(a.sources)?a.sources:[],verified:a.verified}}catch{return null}}])},55712,a=>{"use strict";let b=(0,a.i(92277).default)("target",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]]);a.s(["Target",0,b],55712)},32112,a=>{"use strict";let b=(0,a.i(92277).default)("package",[["path",{d:"M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z",key:"1a0edw"}],["path",{d:"M12 22V12",key:"d0xqtd"}],["polyline",{points:"3.29 7 12 12 20.71 7",key:"ousv84"}],["path",{d:"m7.5 4.27 9 5.15",key:"1c824w"}]]);a.s(["Package",0,b],32112)},43411,a=>{"use strict";var b=a.i(7997),c=a.i(95936);let d=/(https?:\/\/[^\s<>"')\]]+|@\[[^\]]+\]|@[A-Za-z0-9_.-]{2,}|#[A-Za-z0-9_-]{2,})/g,e=/\.(png|jpe?g|gif|webp)(\?\S*)?$/i;a.s(["RichBody",0,function({text:a,projects:f}){let g=a.split(d);return(0,b.jsx)("span",{className:"whitespace-pre-wrap",children:g.map((a,d)=>{if(!a)return null;if(/^https?:\/\//.test(a))return e.test(a)?(0,b.jsx)("img",{src:a,alt:"",loading:"lazy",className:"my-2 block max-h-96 max-w-full rounded-lg border border-neutral-700"},d):(0,b.jsx)("a",{href:a,target:"_blank",rel:"noopener noreferrer nofollow",className:"text-emerald-400 hover:underline",children:a},d);if(a.startsWith("@")){var g;let e,h=(g=a.startsWith("@[")?a.slice(2,-1):a.slice(1),e=g.toLowerCase(),f.find(a=>a.display.toLowerCase()===e)??f.find(a=>a.base_name.toLowerCase()===e));return h?(0,b.jsxs)(c.default,{href:`/p/${h.id}`,className:"text-emerald-400 hover:underline",children:["@",h.display]},d):a}if(a.startsWith("#")){let e=a.slice(1);if(e.startsWith("post_"))return(0,b.jsx)(c.default,{href:`/wire/${e}`,className:"text-emerald-400 hover:underline",children:a},d)}return a})})}])},41314,a=>{"use strict";var b=a.i(7997),c=a.i(91038),d=a.i(52813),e=a.i(96835),f=a.i(55712),g=a.i(32112),h=a.i(72607),i=a.i(43411);function j(a){let b=a.split(/\n(?=## Step |GOAL$|NEEDS$|VERIFY$)/m),c={goal:"",needs:[],steps:[],verify:""},d=[];for(let a of b){let b=a.trim();if(!b)continue;let e=/^## Step\s*\d*\s*[—–-]?\s*(.*)$/m.exec(b.split("\n")[0]);b.startsWith("## ")&&e?c.steps.push({title:e[1].trim(),body:b.split("\n").slice(1).join("\n").trim()}):/^GOAL\b/.test(b)?c.goal=b.replace(/^GOAL\s*/,"").trim():/^NEEDS\b|^PREREQS\b/.test(b)?c.needs=b.split("\n").slice(1).map(a=>a.replace(/^\s*[-*]\s*/,"").trim()).filter(Boolean):/^VERIFY\b/.test(b)?c.verify=b.replace(/^VERIFY\s*/,"").trim():d.push(b)}return!c.goal&&d.length&&(c.goal=d.join("\n\n")),c}function k(a){return Math.max(1,Math.round([a.goal,a.verify,...a.needs,...a.steps.flatMap(a=>[a.title,a.body])].join(" ").split(/\s+/).filter(Boolean).length/180))}var l=a.i(15566);a.s(["TutorialBody",0,function({text:a,projects:l}){let m=(0,d.parseGuide)(a);if(m)return(0,b.jsx)(c.TutorialView,{t:m,spec:d.TUTORIAL_SPEC,specUrl:`${(0,e.siteUrl)()}/tutorial-template.md`});let n=j(a);return 0===n.steps.length?(0,b.jsx)(i.RichBody,{text:a,projects:l}):(0,b.jsxs)("div",{children:[(0,b.jsxs)("div",{className:"rounded-xl border border-amber-400/25 bg-amber-400/[0.05] p-4",children:[(0,b.jsxs)("p",{className:"flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-amber-400",children:[(0,b.jsx)(f.Target,{size:13,"aria-hidden":!0}),"What you'll have"]}),(0,b.jsx)("p",{className:"mt-1.5 text-[15px] leading-relaxed text-neutral-200",children:n.goal}),(0,b.jsxs)("p",{className:"mt-2.5 font-mono text-[11px] text-amber-400/60",children:[n.steps.length," step",1===n.steps.length?"":"s"," · about ",k(n)," min"]})]}),n.needs.length>0&&(0,b.jsxs)("div",{className:"mt-4 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4",children:[(0,b.jsxs)("p",{className:"flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-neutral-400",children:[(0,b.jsx)(g.Package,{size:13,"aria-hidden":!0})," Before you start"]}),(0,b.jsx)("ul",{className:"mt-2 space-y-1",children:n.needs.map((a,c)=>(0,b.jsxs)("li",{className:"flex gap-2.5 text-[14px] text-neutral-300",children:[(0,b.jsx)("span",{className:"select-none text-neutral-400",children:"·"}),(0,b.jsx)("span",{className:"min-w-0",children:a})]},c))})]}),(0,b.jsx)("ol",{className:"mt-4 space-y-3",children:n.steps.map((a,c)=>(0,b.jsxs)("li",{className:"relative rounded-xl border border-neutral-700 bg-neutral-900/70 p-4 pl-[58px]",children:[(0,b.jsx)("span",{"aria-hidden":!0,className:"absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-400/10 font-mono text-[13px] font-bold text-amber-300",children:c+1}),(0,b.jsx)("p",{className:"font-mono text-[15px] font-bold leading-snug text-white",children:a.title}),(0,b.jsx)("div",{className:"mt-1.5 text-[14.5px] leading-relaxed text-neutral-300",children:(0,b.jsx)(i.RichBody,{text:a.body,projects:l})})]},c))}),n.verify&&(0,b.jsxs)("div",{className:"mt-4 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.05] p-4",children:[(0,b.jsxs)("p",{className:"flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-emerald-400",children:[(0,b.jsx)(h.CheckCircle2,{size:13,"aria-hidden":!0}),"You're done when"]}),(0,b.jsx)("p",{className:"mt-1.5 text-[15px] leading-relaxed text-neutral-200",children:n.verify})]})]})},"TutorialCard",0,function({id:a,title:c,bodyMd:e,author:f,when:g,comments:h,category:i}){let m=(0,d.parseGuide)(e),n=m?null:j(e),o=m?m.steps.length:n.steps.length,p=m?m.minutes:k(n),q=m?m.summary:n.goal,r=i??m?.category??"",s=l.CATEGORY_META.some(a=>a.slug===r)?(0,l.categoryMeta)(r):null,t=s?l.GROUPS[s.group].hex:"#f5b544";return(0,b.jsxs)("article",{className:"group relative flex overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/40 transition hover:bg-neutral-800/40",style:{borderLeftColor:t,borderLeftWidth:3},children:[(0,b.jsxs)("div",{className:"min-w-0 flex-1 p-4",children:[(0,b.jsxs)("p",{className:"flex flex-wrap items-center gap-2 font-mono text-[10.5px] font-bold uppercase tracking-widest",children:[s?(0,b.jsx)("span",{style:{color:t},children:s.label}):(0,b.jsx)("span",{className:"text-amber-400",children:"Tutorial"}),(0,b.jsxs)("span",{className:"font-normal tracking-normal text-neutral-500",children:[o||"?"," step",1===o?"":"s"," · ",p," min"]})]}),(0,b.jsx)("h3",{className:"mt-1.5 font-mono text-[16px] font-bold leading-snug tracking-tight text-white",children:c??"(untitled)"}),q&&(0,b.jsx)("p",{className:"mt-1 line-clamp-2 text-[14px] leading-relaxed text-neutral-400",children:q}),(0,b.jsxs)("p",{className:"mt-2 font-mono text-[11.5px] text-neutral-400",children:["@",f," · ",g," · ",h," comment",1===h?"":"s"]})]}),(0,b.jsx)("a",{href:`/wire/${a}`,"aria-label":`Read ${c??"tutorial"}`,className:"absolute inset-0"})]})}],41314)}];

//# sourceMappingURL=_0u2tf7_._.js.map