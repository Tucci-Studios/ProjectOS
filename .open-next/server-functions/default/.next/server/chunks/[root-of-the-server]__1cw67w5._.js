module.exports=[93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},60661,e=>{"use strict";let t=`# Writing a tutorial for Project Open Source

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

- **No HTML.** Every field is plain text and is rendered as text. Markup will show up as characters.
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
`;e.s(["TUTORIAL_SPEC",0,t,"parseGuide",0,function(e){let t=e.trim();if(!t.startsWith("{"))return null;try{let e=JSON.parse(t);if(!e.title||!Array.isArray(e.steps)||!e.steps.length)return null;return{slug:e.slug??"",title:e.title,summary:e.summary??"",minutes:"number"==typeof e.minutes?e.minutes:5,level:e.level??"first time",category:e.category??"",outcome:e.outcome??"",prerequisites:Array.isArray(e.prerequisites)?e.prerequisites:[],steps:e.steps.map(e=>({...e,image:e.image&&/^https:\/\//.test(e.image.url)?{url:e.image.url,alt:e.image.alt??"",caption:e.image.caption}:void 0})),troubleshooting:Array.isArray(e.troubleshooting)?e.troubleshooting:[],sources:Array.isArray(e.sources)?e.sources:[],verified:e.verified}}catch{return null}}])},60520,e=>{"use strict";var t=e.i(47909),r=e.i(74017),a=e.i(96250),n=e.i(59756),o=e.i(61916),i=e.i(74677),s=e.i(69741),l=e.i(16795),u=e.i(87718),d=e.i(95169),p=e.i(47587),c=e.i(66012),h=e.i(70101),m=e.i(26937),g=e.i(10372),f=e.i(93695);e.i(52474);var y=e.i(220),w=e.i(60661);e.s(["GET",0,function(){return new Response(w.TUTORIAL_SPEC,{headers:{"Content-Type":"text/markdown; charset=utf-8","Content-Disposition":'inline; filename="tutorial-template.md"',"Cache-Control":"public, max-age=3600"}})}],32164);var v=e.i(32164);let x=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/tutorial-template.md/route",pathname:"/tutorial-template.md",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/tutorial-template.md/route.ts",nextConfigOutput:"standalone",userland:v,...{}}),{workAsyncStorage:b,workUnitAsyncStorage:R,serverHooks:A}=x;async function E(e,t,a){a.requestMeta&&(0,n.setRequestMeta)(e,a.requestMeta),x.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let w="/tutorial-template.md/route";w=w.replace(/\/index$/,"")||"/";let v=await x.prepare(e,t,{srcPage:w,multiZoneDraftMode:!1});if(!v)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:b,deploymentId:R,params:A,nextConfig:E,parsedUrl:C,isDraftMode:k,prerenderManifest:N,routerServerContext:S,isOnDemandRevalidate:T,revalidateOnlyGenerated:O,resolvedPathname:P,clientReferenceManifest:q,serverActionsManifest:I}=v,_=(0,s.normalizeAppPath)(w),j=!!(N.dynamicRoutes[_]||N.routes[P]),U=async()=>((null==S?void 0:S.render404)?await S.render404(e,t,C,!1):t.end("This page could not be found"),null);if(j&&!k){let e=!!N.routes[P],t=N.dynamicRoutes[_];if(t&&!1===t.fallback&&!e){if(E.adapterPath)return await U();throw new f.NoFallbackError}}let H=null;!j||x.isDev||k||(H="/index"===(H=P)?"/":H);let D=!0===x.isDev||!j,M=j&&!D;I&&q&&(0,i.setManifestsSingleton)({page:w,clientReferenceManifest:q,serverActionsManifest:I});let L=e.method||"GET",W=(0,o.getTracer)(),F=W.getActiveScopeSpan(),K=!!(null==S?void 0:S.isWrappedByNextServer),$=!!(0,n.getRequestMeta)(e,"minimalMode"),B=(0,n.getRequestMeta)(e,"incrementalCache")||await x.getIncrementalCache(e,E,N,$);null==B||B.resetRequestCache(),globalThis.__incrementalCache=B;let G={params:A,previewProps:N.preview,renderOpts:{experimental:{authInterrupts:!!E.experimental.authInterrupts},cacheComponents:!!E.cacheComponents,supportsDynamicResponse:D,incrementalCache:B,cacheLifeProfiles:E.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,n)=>x.onRequestError(e,t,a,n,S)},sharedContext:{buildId:b,deploymentId:R}},J=new l.NodeNextRequest(e),V=new l.NodeNextResponse(t),X=u.NextRequestAdapter.fromNodeNextRequest(J,(0,u.signalFromNodeResponse)(t));try{let n,i=async e=>x.handle(X,G).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=W.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==d.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${L} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",a),n.updateName(t))}else e.updateName(`${L} ${w}`)}),s=async n=>{var o,s;let l=async({previousCacheEntry:r})=>{try{if(!$&&T&&O&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let o=await i(n);e.fetchMetrics=G.renderOpts.fetchMetrics;let s=G.renderOpts.pendingWaitUntil;s&&a.waitUntil&&(a.waitUntil(s),s=void 0);let l=G.renderOpts.collectedTags;if(!j)return await (0,c.sendResponse)(J,V,o,G.renderOpts.pendingWaitUntil),null;{let e=await o.blob(),t=(0,h.toNodeOutgoingHttpHeaders)(o.headers);l&&(t[g.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==G.renderOpts.collectedRevalidate&&!(G.renderOpts.collectedRevalidate>=g.INFINITE_CACHE)&&G.renderOpts.collectedRevalidate,a=void 0===G.renderOpts.collectedExpire||G.renderOpts.collectedExpire>=g.INFINITE_CACHE?void 0:G.renderOpts.collectedExpire;return{value:{kind:y.CachedRouteKind.APP_ROUTE,status:o.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await x.onRequestError(e,t,{routerKind:"App Router",routePath:w,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:T})},!1,S),t}},u=await x.handleResponse({req:e,nextConfig:E,cacheKey:H,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:N,isRoutePPREnabled:!1,isOnDemandRevalidate:T,revalidateOnlyGenerated:O,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:$});if(!j)return null;if((null==u||null==(o=u.value)?void 0:o.kind)!==y.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==u||null==(s=u.value)?void 0:s.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});$||t.setHeader("x-nextjs-cache",T?"REVALIDATED":u.isMiss?"MISS":u.isStale?"STALE":"HIT"),k&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let d=(0,h.fromNodeOutgoingHttpHeaders)(u.value.headers);return $&&j||d.delete(g.NEXT_CACHE_TAGS_HEADER),!u.cacheControl||t.getHeader("Cache-Control")||d.get("Cache-Control")||d.set("Cache-Control",(0,m.getCacheControlHeader)(u.cacheControl)),await (0,c.sendResponse)(J,V,new Response(u.value.body,{headers:d,status:u.value.status||200})),null};K&&F?await s(F):(n=W.getActiveScopeSpan(),await W.withPropagatedContext(e.headers,()=>W.trace(d.BaseServerSpan.handleRequest,{spanName:`${L} ${w}`,kind:o.SpanKind.SERVER,attributes:{"http.method":L,"http.target":e.url}},s),void 0,!K))}catch(t){if(t instanceof f.NoFallbackError||await x.onRequestError(e,t,{routerKind:"App Router",routePath:_,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:T})},!1,S),j)throw t;return await (0,c.sendResponse)(J,V,new Response(null,{status:500})),null}}e.s(["handler",0,E,"patchFetch",0,function(){return(0,a.patchFetch)({workAsyncStorage:b,workUnitAsyncStorage:R})},"routeModule",0,x,"serverHooks",0,A,"workAsyncStorage",0,b,"workUnitAsyncStorage",0,R],60520)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__1cw67w5._.js.map