"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Plus, Wrench, Bug, Rocket, GitBranch, Download, MessageSquare, Lightbulb } from "lucide-react";
import { BrandMark } from "./brand";

export type SplashUpdate = {
  id: string;
  version: string | null;
  title: string;
  intro: string | null;
  body_md: string;
  published_at: number;
  github_login: string;
};

const LINE_KINDS = {
  "+": { Icon: Plus, cls: "text-emerald-300", label: "Added" },
  "~": { Icon: Wrench, cls: "text-amber-300", label: "Changed" },
  "-": { Icon: Bug, cls: "text-sky-300", label: "Fixed" },
  ">": { Icon: Rocket, cls: "text-fuchsia-300", label: "From an idea" },
} as const;

/**
 * Shows the newest update once per person, as an overlay on top of whatever
 * page they're on. Closing it leaves them exactly where they were.
 * `trigger` lets the header re-open it on demand.
 */
const WELCOME = [
  {
    Icon: Download,
    title: "Take what you need",
    body: "Skills, MCP servers, CLAUDE.md files, tools, apps, games — every project has a copy-paste line that installs it into your setup. Nothing is behind a paywall, because nothing here can be sold.",
  },
  {
    Icon: GitBranch,
    title: "Branch anything",
    body: "See a project you'd do differently? Branch it. Your version keeps the original's name and adds yours — Subwolf // Cyber — and joins a public family tree that shows where every idea came from.",
  },
  {
    Icon: MessageSquare,
    title: "Ask, answer, show off",
    body: "Post what you're building, ask when you're stuck, or write a tutorial for the thing you just figured out. Every section has its own tutorials and help-wanted list.",
  },
  {
    Icon: Lightbulb,
    title: "Change the site itself",
    body: "Project OS is open source and runs on its own rules. Build a change, deploy it, and put it up for a vote — the ones people want most get merged.",
  },
];

export function UpdateSplash({
  update,
  unseen,
  firstTime = false,
  trigger,
  onClosed,
}: {
  update: SplashUpdate;
  unseen: boolean;
  firstTime?: boolean;
  trigger?: number;
  onClosed?: () => void;
}) {
  const [open, setOpen] = useState(unseen || firstTime);
  const [tab, setTab] = useState<"welcome" | "new">(firstTime ? "welcome" : "new");

  useEffect(() => {
    if (trigger) setOpen(true);
  }, [trigger]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    setOpen(false);
    onClosed?.();
    // Mark seen; failure is harmless — they'd just see it once more.
    void fetch("/api/updates/seen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updateId: update.id }),
    }).catch(() => {});
  }

  if (!open) return null;

  const date = new Date(update.published_at * 1000).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="What's new"
      className="animate-overlay fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div className="animate-dialog my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-emerald-400/30 bg-[#161d18] shadow-2xl shadow-black/70">
        {/* Banner */}
        <div className="relative flex items-center gap-3 border-b border-neutral-800 bg-neutral-900/70 px-5 py-4">
          <BrandMark size={36} />
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-300">
              {tab === "welcome" ? "Welcome" : "What's new"}
            </p>
            <h2 className="truncate font-mono text-lg font-bold leading-tight text-white">
              {tab === "welcome" ? "Project OS — open source" : update.title}
            </h2>
            <p className="font-mono text-[11px] text-neutral-500">
              {tab === "welcome" ? (
                "publish · branch · vote"
              ) : (
                <>
                  {update.version && <span className="text-neutral-400">{update.version} · </span>}
                  {date}
                </>
              )}
            </p>
          </div>
          <button
            onClick={close}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-neutral-500 outline-none transition hover:bg-neutral-800 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        <div className="flex gap-1 border-b border-neutral-800 px-4 pt-2">
          {(["welcome", "new"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              aria-current={tab === t ? "page" : undefined}
              className={`relative min-h-[40px] cursor-pointer px-3 font-mono text-[13px] outline-none transition-colors ${
                tab === t ? "text-white" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {t === "welcome" ? "What is this?" : "What's new"}
              {tab === t && <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-t bg-emerald-400" aria-hidden />}
            </button>
          ))}
        </div>

        <div className="max-h-[58vh] overflow-y-auto px-5 py-5">
          {tab === "welcome" ? (
            <div>
              <p className="text-[15px] leading-relaxed text-neutral-300">
                <span className="font-bold text-white">Project OS is where open-source projects grow branches.</span>{" "}
                People publish things they built — mostly with AI — and anyone can take one, change it, and publish
                their own version. Every version stays connected to the one it came from.
              </p>
              <ul className="mt-5 space-y-3.5">
                {WELCOME.map((w) => (
                  <li key={w.title} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
                      <w.Icon size={15} aria-hidden />
                    </span>
                    <span>
                      <span className="block font-mono text-sm font-bold text-white">{w.title}</span>
                      <span className="mt-0.5 block text-sm leading-relaxed text-neutral-400">{w.body}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 rounded-lg border border-neutral-800 bg-neutral-900/60 p-3.5 text-xs leading-relaxed text-neutral-500">
                Code lives on GitHub — Project OS lists it, tracks its branches, and helps people install it. Projects
                are community-submitted, so read before you run.
              </p>
            </div>
          ) : (
            <>
          {update.intro && <p className="mb-4 text-[15px] leading-relaxed text-neutral-300">{update.intro}</p>}
          <ul className="space-y-2.5">
            {update.body_md
              .split("\n")
              .map((l) => l.trim())
              .filter(Boolean)
              .map((line, i) => {
                const kind = LINE_KINDS[line[0] as keyof typeof LINE_KINDS];
                if (!kind)
                  return (
                    <li key={i} className="text-sm leading-relaxed text-neutral-400">
                      {line}
                    </li>
                  );
                return (
                  <li key={i} className="flex items-start gap-2.5">
                    <kind.Icon size={14} className={`mt-[3px] shrink-0 ${kind.cls}`} aria-hidden />
                    <span className="text-sm leading-relaxed text-neutral-300">
                      <span className={`mr-1.5 font-mono text-[10px] font-bold uppercase tracking-wider ${kind.cls}`}>
                        {kind.label}
                      </span>
                      {line.slice(1).trim()}
                    </span>
                  </li>
                );
              })}
          </ul>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 px-5 py-3.5">
          <Link
            href="/news"
            onClick={close}
            className="font-mono text-[12px] text-neutral-500 transition hover:text-neutral-300"
          >
            All past updates
          </Link>
          <button
            onClick={close}
            className="min-h-[40px] cursor-pointer rounded-lg bg-emerald-400 px-5 font-mono text-sm font-bold text-black transition hover:bg-emerald-300"
          >
            {tab === "welcome" ? "Start exploring" : "Got it"}
          </button>
        </div>
      </div>
    </div>
  );
}
