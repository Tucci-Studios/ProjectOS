"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Plus, Wrench, Bug, Rocket, Download, GitFork, Vote, ArrowRight } from "lucide-react";
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
 * Two separate things, never mixed: the wordmark opens "what is this", and a
 * new update opens itself once. No tabs — each visit answers one question.
 */
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
  const [mode, setMode] = useState<"welcome" | "new">(firstTime ? "welcome" : "new");

  useEffect(() => {
    if (!trigger) return;
    setMode("welcome");
    setOpen(true);
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
    <div
      role="dialog"
      aria-modal="true"
      aria-label={mode === "welcome" ? "What is Project OS" : "What's new"}
      className="animate-overlay fixed inset-0 z-50 flex flex-col bg-[#141a16]"
    >
      <div className="flex shrink-0 items-center gap-3 border-b border-neutral-800 px-5 py-3.5">
        <BrandMark size={30} />
        <span className="font-mono text-[15px] font-bold tracking-[0.16em] text-white">
          PROJECT<span className="text-emerald-400">_</span>OS
        </span>
        <button
          onClick={close}
          aria-label="Close"
          className="ml-auto flex h-11 items-center gap-2 rounded-lg border border-neutral-700 px-3.5 font-mono text-[13px] text-neutral-300 outline-none transition hover:border-neutral-500 hover:bg-neutral-800 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <X size={17} aria-hidden /> <span className="hidden sm:inline">Close</span>
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-5 py-6">
        {mode === "welcome" ? (
          <div className="animate-rise w-full max-w-3xl">
            {/* The pitch, first and biggest */}
            <p className="text-center font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-emerald-400">
              Project Open Source
            </p>
            <h1 className="mt-4 text-center font-mono text-3xl font-bold leading-tight tracking-tight text-white sm:text-[40px]">
              This site is yours
              <br />
              to <span className="text-emerald-400">build and rebuild</span>.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-center text-[16px] leading-relaxed text-neutral-300">
              Project OS is open source on itself. Don&apos;t like how something works here — forking, the feed, any
              of it? Take a copy of the site, build the change, and put it up for a vote.{" "}
              <span className="text-white">Whatever the community votes for gets built into the real thing.</span>{" "}
              Nothing here is permanent, including this.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/ideas"
                onClick={close}
                className="inline-flex min-h-[46px] items-center gap-2 rounded-lg bg-emerald-400 px-6 font-mono text-sm font-bold text-black transition hover:bg-emerald-300"
              >
                <Vote size={16} aria-hidden /> See what people are proposing
              </Link>
              <Link
                href="/ideas/build"
                onClick={close}
                className="inline-flex min-h-[46px] items-center gap-2 rounded-lg border border-neutral-700 px-5 font-mono text-sm text-neutral-300 transition hover:border-emerald-400/50 hover:text-emerald-300"
              >
                Get the code <ArrowRight size={15} aria-hidden />
              </Link>
            </div>

            {/* Then the mechanic that makes it work */}
            <div className="mt-10 border-t border-neutral-800 pt-7">
              <p className="mb-4 text-center font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
                And the same goes for everything on it
              </p>
              <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-neutral-700/70 bg-neutral-900/50 p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-600 bg-neutral-800 text-neutral-300">
                    <Download size={18} aria-hidden />
                  </span>
                  <p className="mt-3.5 font-mono text-[15px] font-bold text-white">Take anything</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">
                    Skills, MCP servers, tools, games — every project installs with one copy-paste command. All free,
                    all open, none of it for sale.
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-700/70 bg-neutral-900/50 p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-600 bg-neutral-800 text-neutral-300">
                    <GitFork size={18} aria-hidden />
                  </span>
                  <p className="mt-3.5 font-mono text-[15px] font-bold text-white">Fork anything</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">
                    A <span className="text-neutral-200">fork</span> is your own version of someone&apos;s project. It
                    keeps their name and adds yours — Subwolf // Cyber — and joins a public family tree showing where
                    every idea came from.
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-7 text-center text-xs text-neutral-600">
              Code lives on GitHub — projects here are community-submitted, so read before you run.{" "}
              <Link href="/updates" onClick={close} className="text-neutral-400 hover:text-emerald-300 hover:underline">
                See what&apos;s new →
              </Link>
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
              <Link href="/updates" onClick={close} className="font-mono text-[13px] text-neutral-500 transition hover:text-neutral-300">
                All past updates
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
