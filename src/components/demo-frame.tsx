"use client";

import { useState } from "react";
import { Play, ExternalLink, ShieldAlert, Monitor, Smartphone } from "lucide-react";

// Live preview of someone's fork of Project OS.
//
// SAFETY: the iframe is sandboxed WITHOUT allow-same-origin, so the embedded
// page gets a unique opaque origin — it cannot read our cookies, our DOM, or
// our localStorage, and it cannot navigate the top window. It also only loads
// after an explicit click, so nobody's browser silently hits a stranger's
// server on page load.
export function DemoFrame({ url, title }: { url: string; title: string }) {
  const [live, setLive] = useState(false);
  const [wide, setWide] = useState(true);

  let host = "";
  let safe = false;
  try {
    const u = new URL(url);
    host = u.host;
    safe = u.protocol === "https:";
  } catch {
    safe = false;
  }

  if (!safe) {
    return (
      <p className="rounded-xl border border-neutral-700 bg-neutral-900/40 p-4 font-mono text-xs text-neutral-500">
        Demo link is not a valid https URL.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900/40">
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 bg-neutral-900/70 px-3 py-2">
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-400">
          <Play size={12} className="text-emerald-400" aria-hidden /> Live demo
        </span>
        <span className="truncate font-mono text-[11px] text-neutral-600">{host}</span>
        <div className="ml-auto flex items-center gap-1">
          {live && (
            <>
              <button
                onClick={() => setWide(true)}
                aria-pressed={wide}
                title="Desktop width"
                className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition ${wide ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-300"}`}
              >
                <Monitor size={14} aria-hidden />
              </button>
              <button
                onClick={() => setWide(false)}
                aria-pressed={!wide}
                title="Phone width"
                className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition ${!wide ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-300"}`}
              >
                <Smartphone size={14} aria-hidden />
              </button>
            </>
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex h-8 items-center gap-1.5 rounded-md px-2 font-mono text-[11px] text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
          >
            Open <ExternalLink size={12} aria-hidden />
          </a>
        </div>
      </div>

      {live ? (
        <div className="flex justify-center bg-[#0d120f] p-3">
          <iframe
            src={url}
            title={`Demo of ${title}`}
            sandbox="allow-scripts allow-forms allow-popups"
            referrerPolicy="no-referrer"
            loading="lazy"
            className="h-[560px] rounded-lg border border-neutral-800 bg-white transition-all duration-300"
            style={{ width: wide ? "100%" : 390 }}
          />
        </div>
      ) : (
        <button
          onClick={() => setLive(true)}
          className="flex w-full cursor-pointer flex-col items-center gap-2 px-4 py-10 text-center transition hover:bg-neutral-800/40"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/10 text-emerald-300">
            <Play size={18} aria-hidden />
          </span>
          <span className="font-mono text-sm text-neutral-200">Load the demo</span>
          <span className="max-w-sm text-xs leading-relaxed text-neutral-500">
            Runs {host} in a sandboxed frame — it can&apos;t touch your Project OS session.
          </span>
        </button>
      )}

      <p className="flex items-start gap-2 border-t border-neutral-800 px-3 py-2 text-[11px] leading-relaxed text-neutral-500">
        <ShieldAlert size={13} className="mt-0.5 shrink-0" aria-hidden />
        Community-built demo hosted by its author. Sandboxed, but treat it like any other link — don&apos;t enter
        passwords or personal info.
      </p>
    </div>
  );
}
