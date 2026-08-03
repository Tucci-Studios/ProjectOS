"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Plus, Wrench, Bug, Rocket, Download, GitBranch, Vote } from "lucide-react";
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

// Three steps, not four paragraphs. Whole thing fits on one screen.
const STEPS = [
  {
    Icon: Download,
    title: "Take it",
    body: "Every project installs with one copy-paste command. Skills, MCP servers, tools, games — all free, all open.",
  },
  {
    Icon: GitBranch,
    title: "Branch it",
    body: "Change anything you find. Your version keeps the original name and adds yours, and joins its family tree.",
  },
  {
    Icon: Vote,
    title: "Vote on it",
    body: "Vote projects up, and vote on changes to this site. What wins gets built.",
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
    <div role="dialog" aria-modal="true" aria-label="About Project OS" className="animate-overlay fixed inset-0 z-50 flex flex-col bg-[#141a16]">
      {/* Top bar — brand, tabs, and a close target you can't miss */}
      <div className="flex shrink-0 items-center gap-5 border-b border-neutral-800 px-5 py-3.5">
        <span className="flex items-center gap-2.5">
          <BrandMark size={30} />
          <span className="hidden font-mono text-[15px] font-bold tracking-[0.16em] text-white sm:block">
            PROJECT<span className="text-emerald-400">_</span>OS
          </span>
        </span>

        <div className="flex gap-1">
          {(["welcome", "new"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              aria-current={tab === t ? "page" : undefined}
              className={`relative min-h-[38px] cursor-pointer rounded-lg px-3 font-mono text-[13px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                tab === t ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {t === "welcome" ? "What is this?" : "What's new"}
            </button>
          ))}
        </div>

        <button
          onClick={close}
          aria-label="Close"
          className="ml-auto flex h-11 items-center gap-2 rounded-lg border border-neutral-700 px-3.5 font-mono text-[13px] text-neutral-300 outline-none transition hover:border-neutral-500 hover:bg-neutral-800 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <X size={17} aria-hidden /> <span className="hidden sm:inline">Close</span>
        </button>
      </div>

      {/* Body — sized to the screen, scrolls only if it truly must */}
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-5 py-6">
        {tab === "welcome" ? (
          <div className="animate-rise w-full max-w-4xl">
            <h1 className="text-center font-mono text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
              Publish what you build.
              <br />
              <span className="text-emerald-400">Branch</span> what everyone else built.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-center text-[15px] leading-relaxed text-neutral-400">
              Project OS is a home for open-source projects — mostly built with AI. Nothing here can be sold, and every
              version stays linked to the one it came from.
            </p>

            <div className="mt-9 grid gap-4 sm:grid-cols-3">
              {STEPS.map((s, i) => (
                <div key={s.title} className="rounded-xl border border-neutral-700/70 bg-neutral-900/50 p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
                    <s.Icon size={18} aria-hidden />
                  </span>
                  <p className="mt-3.5 font-mono text-[15px] font-bold text-white">
                    <span className="text-neutral-600">{i + 1}. </span>
                    {s.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">{s.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={close}
                className="min-h-[46px] cursor-pointer rounded-lg bg-emerald-400 px-7 font-mono text-sm font-bold text-black transition hover:bg-emerald-300"
              >
                Start exploring
              </button>
              <button
                onClick={() => setTab("new")}
                className="min-h-[46px] cursor-pointer rounded-lg border border-neutral-700 px-5 font-mono text-sm text-neutral-300 transition hover:border-neutral-500 hover:text-white"
              >
                See what&apos;s new
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-neutral-600">
              Code lives on GitHub — projects here are community-submitted, so read before you run.
            </p>
          </div>
        ) : (
          <div className="animate-rise w-full max-w-2xl">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-300">What&apos;s new</p>
            <h1 className="mt-1.5 font-mono text-2xl font-bold leading-tight tracking-tight text-white">{update.title}</h1>
            <p className="mt-1 font-mono text-[11px] text-neutral-500">
              {update.version && <span className="text-neutral-400">{update.version} · </span>}
              {date} · @{update.github_login}
            </p>

            {update.intro && <p className="mt-4 text-[15px] leading-relaxed text-neutral-300">{update.intro}</p>}

            <ul className="mt-5 space-y-2.5">
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

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={close}
                className="min-h-[44px] cursor-pointer rounded-lg bg-emerald-400 px-6 font-mono text-sm font-bold text-black transition hover:bg-emerald-300"
              >
                Got it
              </button>
              <Link
                href="/news"
                onClick={close}
                className="font-mono text-[13px] text-neutral-500 transition hover:text-neutral-300"
              >
                All past updates
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
