module.exports=[52562,a=>{"use strict";let b=(0,a.i(64831).default)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);a.s(["Check",0,b],52562)},85650,a=>{"use strict";let b=(0,a.i(64831).default)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);a.s(["Copy",0,b],85650)},68370,a=>{"use strict";let b=(0,a.i(64831).default)("external-link",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);a.s(["ExternalLink",0,b],68370)},41146,a=>{"use strict";let b=(0,a.i(64831).default)("chevron-right",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);a.s(["ChevronRight",0,b],41146)},90629,a=>{"use strict";let b=(0,a.i(64831).default)("pencil",[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]]);a.s(["Pencil",0,b],90629)},74746,a=>{"use strict";let b=(0,a.i(64831).default)("send",[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]]);a.s(["Send",0,b],74746)},8480,a=>{"use strict";let b=a.i(80995).CATEGORY_META.map(a=>`- \`${a.slug}\` — ${a.label}: ${a.use}`).join("\n"),c=`# Writing a tutorial for Project Open Source

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

## Sections

\`category\` must be exactly one of these. Anything else is rejected:

${b}

If none of them genuinely fits your subject, **stop and say so** rather than
picking the nearest one. A guide filed in the wrong section is worse than one
that waited for a section to exist — say which subject you were asked to cover
and that no section matches it, and let a person decide.

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
`;a.s(["TUTORIAL_SPEC",0,c,"parseGuide",0,function(a){let b=a.trim();if(!b.startsWith("{"))return null;try{let a=JSON.parse(b);if(!a.title||!Array.isArray(a.steps)||!a.steps.length)return null;return{slug:a.slug??"",title:a.title,summary:a.summary??"",minutes:"number"==typeof a.minutes?a.minutes:5,level:a.level??"first time",category:a.category??"",outcome:a.outcome??"",prerequisites:Array.isArray(a.prerequisites)?a.prerequisites:[],steps:a.steps.map(a=>({...a,image:a.image&&/^https:\/\//.test(a.image.url)?{url:a.image.url,alt:a.image.alt??"",caption:a.image.caption}:void 0})),troubleshooting:Array.isArray(a.troubleshooting)?a.troubleshooting:[],sources:Array.isArray(a.sources)?a.sources:[],verified:a.verified}}catch{return null}}])},55681,a=>{"use strict";let b=(0,a.i(64831).default)("eye",[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);a.s(["Eye",0,b],55681)},1e4,a=>{"use strict";var b=a.i(87924),c=a.i(72131),d=a.i(50944),e=a.i(85953),f=a.i(85650),g=a.i(52562),h=a.i(74746),i=a.i(55681),j=a.i(8480),k=a.i(80961);a.s(["TutorialIntake",0,function({specUrl:a,editing:l}){let m=(0,d.useRouter)(),[n,o]=(0,c.useState)(()=>{if(!l)return"";try{return JSON.stringify(JSON.parse(l.current),null,2)}catch{return l.current}}),[p,q]=(0,c.useState)(null),[r,s]=(0,c.useState)(!1),[t,u]=(0,c.useState)(!1),v=/```(?:json)?\s*([\s\S]*?)```/.exec(n),w=(0,j.parseGuide)((v?v[1]:n).trim());async function x(){s(!0),q(null);try{let a=await fetch("/api/tutorials",{method:l?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(l?{id:l.id,text:n}:{text:n})}),b=await a.json();if(!a.ok||!b.id)return void q(b.error??"That didn't post.");m.push(`/wire/${b.id}`)}catch{q("That didn't post.")}finally{s(!1)}}return(0,b.jsxs)("div",{children:[(0,b.jsxs)("div",{className:"rounded-xl border border-sky-400/30 bg-sky-400/[0.05] p-4",children:[(0,b.jsxs)("p",{className:"flex items-center gap-2 font-mono text-[13px] font-bold text-sky-200",children:[(0,b.jsx)(e.Cpu,{size:14,"aria-hidden":!0})," ",l?"Change it with your AI":"First, have your AI write it"]}),(0,b.jsx)("p",{className:"mt-1.5 text-[13px] leading-relaxed text-neutral-300",children:l?"Paste the current version below to your AI along with this link, say what to change, and paste the result back.":"Give it this link and say what you want to teach. It knows the format, what it can't do, and how to hand the result back."}),(0,b.jsxs)("div",{className:"mt-3 flex flex-wrap items-center gap-2",children:[(0,b.jsxs)("button",{onClick:async()=>{await navigator.clipboard.writeText(a),u(!0),setTimeout(()=>u(!1),1600)},className:"inline-flex min-h-[32px] cursor-pointer items-center gap-1.5 rounded-lg border border-sky-400/50 bg-sky-400/10 px-3 font-mono text-[12px] font-bold text-sky-200 outline-none transition hover:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400",children:[t?(0,b.jsx)(g.Check,{size:12,"aria-hidden":!0}):(0,b.jsx)(f.Copy,{size:12,"aria-hidden":!0}),t?"Copied":"Copy the link"]}),(0,b.jsx)("span",{className:"break-all font-mono text-[11px] text-neutral-500",children:a})]})]}),(0,b.jsxs)("label",{className:"mt-6 block",children:[(0,b.jsx)("span",{className:"mb-1.5 block font-mono text-[12px] text-neutral-300",children:l?"The current version — replace it with the new one":"Then paste what it gave you"}),(0,b.jsx)("textarea",{value:n,onChange:a=>o(a.target.value),rows:10,placeholder:'{ "title": "...", "steps": [ ... ] }\n\nor a https:// link to the file',className:"w-full rounded-lg border border-neutral-700 bg-neutral-900/60 px-3.5 py-3 font-mono text-[12.5px] leading-relaxed text-white placeholder-neutral-600 outline-none transition focus:border-emerald-400/60"}),(0,b.jsx)("span",{className:"mt-1.5 block text-[12px] text-neutral-400",children:"The JSON itself, a fenced code block, or a link to a raw file — all fine."})]}),p&&(0,b.jsx)("p",{className:"mt-3 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3.5 py-2.5 text-[13px] leading-relaxed text-rose-200",children:p}),w&&(0,b.jsxs)("section",{className:"mt-6",children:[(0,b.jsxs)("p",{className:"mb-2 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-emerald-300",children:[(0,b.jsx)(i.Eye,{size:12,"aria-hidden":!0})," Exactly how it will look"]}),(0,b.jsx)(k.TutorialView,{t:w})]}),(0,b.jsxs)("div",{className:"mt-6 flex flex-wrap items-center gap-3",children:[(0,b.jsxs)("button",{onClick:x,disabled:r||!w,className:"inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg bg-emerald-400 px-5 font-mono text-[13px] font-bold text-black outline-none transition hover:bg-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-default disabled:opacity-40",children:[(0,b.jsx)(h.Send,{size:14,"aria-hidden":!0})," ",r?l?"Saving...":"Posting...":l?"Save changes":"Post it"]}),(0,b.jsx)("span",{className:"text-[12px] text-neutral-400",children:w?l?"Read it through before saving.":"Read it through first — it goes up under your name.":n.trim()?"Not a tutorial in our format yet.":"Nothing pasted yet."})]})]})}])}];

//# sourceMappingURL=_0gwvcdu._.js.map