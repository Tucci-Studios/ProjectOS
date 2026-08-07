module.exports=[93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},60520,e=>{"use strict";var t=e.i(47909),r=e.i(74017),a=e.i(96250),n=e.i(59756),o=e.i(61916),i=e.i(74677),s=e.i(69741),l=e.i(16795),u=e.i(87718),d=e.i(95169),p=e.i(47587),c=e.i(66012),h=e.i(70101),m=e.i(26937),f=e.i(10372),g=e.i(93695);e.i(52474);var v=e.i(220);let y=`# Writing a tutorial for Project Open Source

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
`;e.s(["GET",0,function(){return new Response(y,{headers:{"Content-Type":"text/markdown; charset=utf-8","Content-Disposition":'inline; filename="tutorial-template.md"',"Cache-Control":"public, max-age=3600"}})}],32164);var w=e.i(32164);let x=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/tutorial-template.md/route",pathname:"/tutorial-template.md",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/tutorial-template.md/route.ts",nextConfigOutput:"standalone",userland:w,...{}}),{workAsyncStorage:R,workUnitAsyncStorage:b,serverHooks:E}=x;async function C(e,t,a){a.requestMeta&&(0,n.setRequestMeta)(e,a.requestMeta),x.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let y="/tutorial-template.md/route";y=y.replace(/\/index$/,"")||"/";let w=await x.prepare(e,t,{srcPage:y,multiZoneDraftMode:!1});if(!w)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:R,deploymentId:b,params:E,nextConfig:C,parsedUrl:A,isDraftMode:N,prerenderManifest:S,routerServerContext:k,isOnDemandRevalidate:O,revalidateOnlyGenerated:P,resolvedPathname:T,clientReferenceManifest:q,serverActionsManifest:_}=w,j=(0,s.normalizeAppPath)(y),I=!!(S.dynamicRoutes[j]||S.routes[T]),H=async()=>((null==k?void 0:k.render404)?await k.render404(e,t,A,!1):t.end("This page could not be found"),null);if(I&&!N){let e=!!S.routes[T],t=S.dynamicRoutes[j];if(t&&!1===t.fallback&&!e){if(C.adapterPath)return await H();throw new g.NoFallbackError}}let U=null;!I||x.isDev||N||(U="/index"===(U=T)?"/":U);let D=!0===x.isDev||!I,M=I&&!D;_&&q&&(0,i.setManifestsSingleton)({page:y,clientReferenceManifest:q,serverActionsManifest:_});let F=e.method||"GET",$=(0,o.getTracer)(),K=$.getActiveScopeSpan(),W=!!(null==k?void 0:k.isWrappedByNextServer),B=!!(0,n.getRequestMeta)(e,"minimalMode"),L=(0,n.getRequestMeta)(e,"incrementalCache")||await x.getIncrementalCache(e,C,S,B);null==L||L.resetRequestCache(),globalThis.__incrementalCache=L;let G={params:E,previewProps:S.preview,renderOpts:{experimental:{authInterrupts:!!C.experimental.authInterrupts},cacheComponents:!!C.cacheComponents,supportsDynamicResponse:D,incrementalCache:L,cacheLifeProfiles:C.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,n)=>x.onRequestError(e,t,a,n,k)},sharedContext:{buildId:R,deploymentId:b}},V=new l.NodeNextRequest(e),X=new l.NodeNextResponse(t),J=u.NextRequestAdapter.fromNodeNextRequest(V,(0,u.signalFromNodeResponse)(t));try{let n,i=async e=>x.handle(J,G).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=$.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==d.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${F} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",a),n.updateName(t))}else e.updateName(`${F} ${y}`)}),s=async n=>{var o,s;let l=async({previousCacheEntry:r})=>{try{if(!B&&O&&P&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let o=await i(n);e.fetchMetrics=G.renderOpts.fetchMetrics;let s=G.renderOpts.pendingWaitUntil;s&&a.waitUntil&&(a.waitUntil(s),s=void 0);let l=G.renderOpts.collectedTags;if(!I)return await (0,c.sendResponse)(V,X,o,G.renderOpts.pendingWaitUntil),null;{let e=await o.blob(),t=(0,h.toNodeOutgoingHttpHeaders)(o.headers);l&&(t[f.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==G.renderOpts.collectedRevalidate&&!(G.renderOpts.collectedRevalidate>=f.INFINITE_CACHE)&&G.renderOpts.collectedRevalidate,a=void 0===G.renderOpts.collectedExpire||G.renderOpts.collectedExpire>=f.INFINITE_CACHE?void 0:G.renderOpts.collectedExpire;return{value:{kind:v.CachedRouteKind.APP_ROUTE,status:o.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await x.onRequestError(e,t,{routerKind:"App Router",routePath:y,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:O})},!1,k),t}},u=await x.handleResponse({req:e,nextConfig:C,cacheKey:U,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:S,isRoutePPREnabled:!1,isOnDemandRevalidate:O,revalidateOnlyGenerated:P,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:B});if(!I)return null;if((null==u||null==(o=u.value)?void 0:o.kind)!==v.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==u||null==(s=u.value)?void 0:s.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});B||t.setHeader("x-nextjs-cache",O?"REVALIDATED":u.isMiss?"MISS":u.isStale?"STALE":"HIT"),N&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let d=(0,h.fromNodeOutgoingHttpHeaders)(u.value.headers);return B&&I||d.delete(f.NEXT_CACHE_TAGS_HEADER),!u.cacheControl||t.getHeader("Cache-Control")||d.get("Cache-Control")||d.set("Cache-Control",(0,m.getCacheControlHeader)(u.cacheControl)),await (0,c.sendResponse)(V,X,new Response(u.value.body,{headers:d,status:u.value.status||200})),null};W&&K?await s(K):(n=$.getActiveScopeSpan(),await $.withPropagatedContext(e.headers,()=>$.trace(d.BaseServerSpan.handleRequest,{spanName:`${F} ${y}`,kind:o.SpanKind.SERVER,attributes:{"http.method":F,"http.target":e.url}},s),void 0,!W))}catch(t){if(t instanceof g.NoFallbackError||await x.onRequestError(e,t,{routerKind:"App Router",routePath:j,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:O})},!1,k),I)throw t;return await (0,c.sendResponse)(V,X,new Response(null,{status:500})),null}}e.s(["handler",0,C,"patchFetch",0,function(){return(0,a.patchFetch)({workAsyncStorage:R,workUnitAsyncStorage:b})},"routeModule",0,x,"serverHooks",0,E,"workAsyncStorage",0,R,"workUnitAsyncStorage",0,b],60520)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0-fnhug._.js.map