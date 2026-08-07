"use client";

import { useState } from "react";
import { FlaskConical, FileCode2, Copy, Check } from "lucide-react";
import { TutorialView } from "./tutorial-view";
import { CLAUDE_SKILLS } from "@/lib/tutorials/claude-skills";
import { TUTORIAL_SPEC } from "@/lib/tutorial-guide";

export function LabClient() {
  const [tab, setTab] = useState<"guide" | "spec">("guide");
  const [copied, setCopied] = useState(false);

  async function copySpec() {
    await navigator.clipboard.writeText(TUTORIAL_SPEC);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-300">
        <FlaskConical size={13} aria-hidden /> Test area — nothing here is live
      </div>
      <h1 className="font-mono text-[28px] font-bold text-white">Lab</h1>
      <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
        Where things get tried before they earn a place on the site.
      </p>

      <section className="mt-8">
        <h2 className="font-mono text-[15px] font-bold text-white">The tutorial format</h2>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-neutral-400">
          One worked example and the spec that produces more of them. The shape is fixed on purpose — a reader should
          always know where the prerequisites are and where the thing that usually goes wrong is written down. That
          also makes it machine-writable, which matters because most of these will be drafted by an AI.
        </p>

        <div className="mt-4 flex gap-1.5">
          {(
            [
              ["guide", "The worked example"],
              ["spec", "What you hand your AI"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              aria-pressed={tab === k}
              className={`min-h-[34px] cursor-pointer rounded-full border px-3.5 font-mono text-[12px] outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                tab === k
                  ? "border-emerald-400 bg-emerald-400/10 font-bold text-emerald-300"
                  : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {tab === "guide" ? (
            <TutorialView t={{ ...CLAUDE_SKILLS, verified: { by: "Tucci-Studios", at: 0 } }} />
          ) : (
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <a
                  href="/tutorial-template.md"
                  download
                  className="inline-flex min-h-[38px] items-center gap-2 rounded-lg bg-emerald-400 px-4 font-mono text-[12.5px] font-bold text-black transition hover:bg-emerald-300"
                >
                  <FileCode2 size={14} aria-hidden /> Download the .md
                </a>
                <button
                  onClick={copySpec}
                  className="inline-flex min-h-[38px] cursor-pointer items-center gap-2 rounded-lg border border-neutral-700 px-4 font-mono text-[12.5px] text-neutral-200 outline-none transition hover:border-neutral-500 focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
                  {copied ? "Copied" : "Copy to clipboard"}
                </button>
              </div>
              <p className="mb-3 text-[13px] leading-relaxed text-neutral-400">
                Hand this to Claude Code, or drop it in your repo, and say what you want to teach. No prompt to write —
                the file is the prompt, and what comes back already fits the format.
              </p>
              <pre className="max-h-[60vh] overflow-auto rounded-xl border border-neutral-800 bg-[#0d120f] p-4 font-mono text-[12px] leading-relaxed text-neutral-300">
                {TUTORIAL_SPEC}
              </pre>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
