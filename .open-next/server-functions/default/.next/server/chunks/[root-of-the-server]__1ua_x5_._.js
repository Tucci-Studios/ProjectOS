module.exports=[18622,(e,t,o)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,o)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,o)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,o)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,o)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,o)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},83272,e=>{"use strict";let t=Symbol.for("__cloudflare-context__");function o(){return globalThis[t]}async function a(){let e=o();if(e)return e;{var a;let e=await r();return a=e,globalThis[t]=a,e}}async function r(e){let{getPlatformProxy:t}=await import(`${"__wrangler".replaceAll("_","")}`),o=e?.environment??process.env.NEXT_DEV_WRANGLER_ENV,{env:a,cf:r,ctx:s}=await t({...e,envFiles:[],environment:o});return{env:a,cf:r,ctx:s}}let s=`

ERROR: \`getCloudflareContext\` has been called without having called \`initOpenNextCloudflareForDev\` from the Next.js config file.
You should update your Next.js config file as shown below:

   \`\`\`
   // next.config.mjs

   import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

   initOpenNextCloudflareForDev();

   const nextConfig = { ... };
   export default nextConfig;
   \`\`\`

`;e.s(["getCloudflareContext",0,function(e={async:!1}){return e.async?a():function(){let e,t=o();if(t)return t;if(e=globalThis,e.__NEXT_DATA__?.nextExport===!0)throw Error("  - make sure that the call is not at the top level and that the route is not static\n  - call `getCloudflareContext({async: true})` to use the `async` mode\n  - avoid calling `getCloudflareContext` in the route\n");throw Error(s)}()}])},89104,e=>{"use strict";var t=e.i(83272);let o={publish:{max:10,windowS:3600,label:"projects published"},post:{max:15,windowS:3600,label:"posts"},comment:{max:40,windowS:3600,label:"comments"},update:{max:20,windowS:3600,label:"updates"},detect:{max:30,windowS:600,label:"repo checks"},idea:{max:5,windowS:3600,label:"ideas"},report:{max:20,windowS:3600,label:"reports"}};async function a(e,a){let r=o[a];if(!r)return{ok:!0};let{env:s}=(0,t.getCloudflareContext)(),i=Math.floor(Date.now()/1e3),n=i-r.windowS;await s.DB.prepare("DELETE FROM rate_events WHERE user_id = ?1 AND action = ?2 AND created_at < ?3").bind(e,a,n).run();let l=await s.DB.prepare("SELECT COUNT(*) AS n, MIN(created_at) AS oldest FROM rate_events WHERE user_id = ?1 AND action = ?2 AND created_at >= ?3").bind(e,a,n).first();if((l?.n??0)>=r.max){let e=Math.max(60,(l?.oldest??i)+r.windowS-i),t=Math.ceil(e/60);return{ok:!1,retryAfterS:e,message:`Slow down a moment — that's ${r.max} ${r.label} in an hour. Try again in ${t} minute${1===t?"":"s"}.`}}return await s.DB.prepare("INSERT INTO rate_events (user_id, action, created_at) VALUES (?1, ?2, ?3)").bind(e,a,i).run(),{ok:!0}}e.s(["checkRate",0,a])},97953,(e,t,o)=>{"use strict";t.exports=e.r(42315).vendored["react-rsc"].ReactServerDOMTurbopackServer},51313,e=>{"use strict";e.s(["default",()=>t]);let t=(0,e.i(97953).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/node_modules/lucide-react/dist/esm/Icon.mjs <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/node_modules/lucide-react/dist/esm/Icon.mjs <module evaluation>","default")},24595,e=>{"use strict";e.s(["default",()=>t]);let t=(0,e.i(97953).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/node_modules/lucide-react/dist/esm/Icon.mjs from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/node_modules/lucide-react/dist/esm/Icon.mjs","default")},89737,e=>{"use strict";e.i(51313);var t=e.i(24595);e.n(t)},23455,61851,e=>{"use strict";var t=e.i(47540);let o=e=>{let t=e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,t,o)=>o?o.toUpperCase():t.toLowerCase());return t.charAt(0).toUpperCase()+t.slice(1)};var a=e.i(89737);let r=(e,r)=>{let s=(0,t.forwardRef)(({className:s,...i},n)=>(0,t.createElement)(a.default,{ref:n,iconNode:r,className:((...e)=>e.filter((e,t,o)=>!!e&&""!==e.trim()&&o.indexOf(e)===t).join(" ").trim())(`lucide-${o(e).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${e}`,s),...i}));return s.displayName=o(e),s};e.s(["default",0,r],61851);let s=r("sparkles",[["path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",key:"1s2grr"}],["path",{d:"M20 2v4",key:"1rf3ol"}],["path",{d:"M22 4h-4",key:"gwowj6"}],["circle",{cx:"4",cy:"20",r:"2",key:"6kqj1y"}]]);e.s(["Sparkles",0,s],23455)},45348,e=>{"use strict";var t=e.i(23455),o=e.i(61851);let a=(0,o.default)("file-text",[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]]),r=(0,o.default)("plug",[["path",{d:"M12 22v-5",key:"1ega77"}],["path",{d:"M15 8V2",key:"18g5xt"}],["path",{d:"M17 8a1 1 0 0 1 1 1v4a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1z",key:"1xoxul"}],["path",{d:"M9 8V2",key:"14iosj"}]]);(0,o.default)("cpu",[["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M17 20v2",key:"1rnc9c"}],["path",{d:"M17 2v2",key:"11trls"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M2 17h2",key:"7oei6x"}],["path",{d:"M2 7h2",key:"asdhe0"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"M20 17h2",key:"1fpfkl"}],["path",{d:"M20 7h2",key:"1o8tra"}],["path",{d:"M7 20v2",key:"4gnj0m"}],["path",{d:"M7 2v2",key:"1i4yhu"}],["rect",{x:"4",y:"4",width:"16",height:"16",rx:"2",key:"1vbyd7"}],["rect",{x:"8",y:"8",width:"8",height:"8",rx:"1",key:"z9xiuo"}]]);let s=(0,o.default)("hard-drive",[["path",{d:"M10 16h.01",key:"1bzywj"}],["path",{d:"M2.212 11.577a2 2 0 0 0-.212.896V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5.527a2 2 0 0 0-.212-.896L18.55 5.11A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",key:"18tbho"}],["path",{d:"M21.946 12.013H2.054",key:"zqlbp7"}],["path",{d:"M6 16h.01",key:"1pmjb7"}]]),i=(0,o.default)("square-terminal",[["path",{d:"m7 11 2-2-2-2",key:"1lz0vl"}],["path",{d:"M11 13h4",key:"1p7l4v"}],["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2",key:"1m3agn"}]]),n=(0,o.default)("binary",[["rect",{x:"14",y:"14",width:"4",height:"6",rx:"2",key:"p02svl"}],["rect",{x:"6",y:"4",width:"4",height:"6",rx:"2",key:"xm4xkj"}],["path",{d:"M6 20h4",key:"1i6q5t"}],["path",{d:"M14 10h4",key:"ru81e7"}],["path",{d:"M6 14h2v6",key:"16z9wg"}],["path",{d:"M14 4h2v6",key:"1idq9u"}]]),l=(0,o.default)("bot",[["path",{d:"M12 8V4H8",key:"hb8ula"}],["rect",{width:"16",height:"12",x:"4",y:"8",rx:"2",key:"enze0r"}],["path",{d:"M2 14h2",key:"vft8re"}],["path",{d:"M20 14h2",key:"4cs60a"}],["path",{d:"M15 13v2",key:"1xurst"}],["path",{d:"M9 13v2",key:"rq6x2g"}]]),d=(0,o.default)("code-xml",[["path",{d:"m18 16 4-4-4-4",key:"1inbqp"}],["path",{d:"m6 8-4 4 4 4",key:"15zrgr"}],["path",{d:"m14.5 4-5 16",key:"e7oirm"}]]),h=(0,o.default)("app-window",[["rect",{x:"2",y:"4",width:"20",height:"16",rx:"2",key:"izxlao"}],["path",{d:"M10 4v4",key:"pp8u80"}],["path",{d:"M2 8h20",key:"d11cs7"}],["path",{d:"M6 4v4",key:"1svtjw"}]]),u=(0,o.default)("gamepad-2",[["line",{x1:"6",x2:"10",y1:"11",y2:"11",key:"1gktln"}],["line",{x1:"8",x2:"8",y1:"9",y2:"13",key:"qnk9ow"}],["line",{x1:"15",x2:"15.01",y1:"12",y2:"12",key:"krot7o"}],["line",{x1:"18",x2:"18.01",y1:"10",y2:"10",key:"1lcuu1"}],["path",{d:"M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z",key:"mfqc10"}]]);(0,o.default)("hammer",[["path",{d:"m15 12-9.373 9.373a1 1 0 0 1-3.001-3L12 9",key:"1hayfq"}],["path",{d:"m18 15 4-4",key:"16gjal"}],["path",{d:"m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172v-.344a2 2 0 0 0-.586-1.414l-1.657-1.657A6 6 0 0 0 12.516 3H9l1.243 1.243A6 6 0 0 1 12 8.485V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5",key:"15ts47"}]]),(0,o.default)("play",[["path",{d:"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",key:"10ikf1"}]]);let c=[{slug:"claude-skills",label:"Claude Skills",kind:"Skill",use:"Teaches Claude a new trick",group:"ai",Icon:t.Sparkles,mark:"SKL"},{slug:"claude-md",label:"CLAUDE.md Files",kind:"Instructions",use:"Drops into your repo",group:"ai",Icon:a,mark:".md"},{slug:"mcp-servers",label:"MCP Servers",kind:"MCP Server",use:"Connects Claude to something",group:"ai",Icon:r,mark:"MCP"},{slug:"local-llms",label:"Local LLMs",kind:"Local AI",use:"Runs AI on your machine",group:"ai",Icon:s,mark:"LLM"},{slug:"codex",label:"Codex",kind:"Codex Setup",use:"Set up for Codex",group:"ai",Icon:i},{slug:"grok",label:"Grok / xAI",kind:"Grok Project",use:"Built on Grok",group:"ai",Icon:l},{slug:"claude-code",label:"Claude Code Projects",kind:"Codebase",use:"Clone it and keep building",group:"build",Icon:d,mark:"</>"},{slug:"scripts-tools",label:"Scripts & Tools",kind:"Tool",use:"Run it in your terminal",group:"build",Icon:n},{slug:"apps",label:"Apps",kind:"App",use:"Install and use it",group:"play",Icon:h},{slug:"games",label:"Games",kind:"Game",use:"Play it",group:"play",Icon:u}],p=c.map(e=>e.slug);e.s(["CATEGORY_META",0,c,"CATEGORY_SLUGS",0,p,"GROUP_ORDER",0,["ai","build","play"]],45348)},60661,e=>{"use strict";let t=e.i(45348).CATEGORY_META.map(e=>`- \`${e.slug}\` — ${e.label}: ${e.use}`).join("\n"),o=`# Writing a tutorial for Project Open Source

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

${t}

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
`;e.s(["TUTORIAL_SPEC",0,o,"parseGuide",0,function(e){let t=e.trim();if(!t.startsWith("{"))return null;try{let e=JSON.parse(t);if(!e.title||!Array.isArray(e.steps)||!e.steps.length)return null;return{slug:e.slug??"",title:e.title,summary:e.summary??"",minutes:"number"==typeof e.minutes?e.minutes:5,level:e.level??"first time",category:e.category??"",outcome:e.outcome??"",prerequisites:Array.isArray(e.prerequisites)?e.prerequisites:[],steps:e.steps.map(e=>({...e,code:e.code?{...e.code,text:e.code.text.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,"&")}:void 0,image:e.image&&/^https:\/\//.test(e.image.url)?{url:e.image.url,alt:e.image.alt??"",caption:e.image.caption}:void 0})),troubleshooting:Array.isArray(e.troubleshooting)?e.troubleshooting:[],sources:Array.isArray(e.sources)?e.sources:[],verified:e.verified}}catch{return null}}])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__1ua_x5_._.js.map