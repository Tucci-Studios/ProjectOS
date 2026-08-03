"use client";

import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";

// Per-category "get this into your setup" instructions. Every category answers
// the question "I want this — now what?" with a copy-paste command.

type Step = { label: string; code?: string; note?: string };

function stepsFor(category: string, repo: string): { title: string; steps: Step[] } {
  const name = repo.split("/")[1] ?? "project";
  const clone = `git clone https://github.com/${repo}.git`;

  switch (category) {
    case "claude-skills":
      return {
        title: "Install this skill",
        steps: [
          {
            label: "Drop it into your Claude skills folder",
            code: `git clone https://github.com/${repo}.git ~/.claude/skills/${name}`,
            note: "Personal skills live in ~/.claude/skills. For one project only, use .claude/skills in that repo instead.",
          },
          { label: "Restart Claude Code", note: `Then invoke it by name: /${name}` },
        ],
      };
    case "claude-md":
      return {
        title: "Add to your project",
        steps: [
          {
            label: "Copy the CLAUDE.md into your repo root",
            code: `curl -o CLAUDE.md https://raw.githubusercontent.com/${repo}/HEAD/CLAUDE.md`,
            note: "Already have a CLAUDE.md? Open both and merge the parts you want.",
          },
          { label: "Claude Code reads it automatically", note: "Next session in that folder picks it up." },
        ],
      };
    case "mcp-servers":
      return {
        title: "Connect this MCP server",
        steps: [
          { label: "Clone and install", code: `${clone} && cd ${name} && npm install` },
          {
            label: "Register it with Claude Code",
            code: `claude mcp add ${name} -- node $(pwd)/index.js`,
            note: "Check the project's README for the exact run command and any API keys it needs.",
          },
        ],
      };
    case "claude-code":
      return {
        title: "Run this project",
        steps: [
          { label: "Clone it", code: clone },
          {
            label: "Open it with Claude Code",
            code: `cd ${name} && claude`,
            note: "Its AGENTS.md tells Claude how to build, run, and continue the project.",
          },
        ],
      };
    case "codex":
      return {
        title: "Run with Codex",
        steps: [
          { label: "Clone it", code: clone },
          { label: "Open the folder in Codex", note: "AGENTS.md carries the build and continuation instructions." },
        ],
      };
    case "grok":
      return {
        title: "Use with Grok",
        steps: [
          { label: "Clone it", code: clone },
          { label: "Follow the project's README", note: "Most Grok projects need an xAI API key in .env." },
        ],
      };
    case "local-llms":
      return {
        title: "Run locally",
        steps: [
          { label: "Clone it", code: clone },
          { label: "Follow the how-to-run in the manifest", note: "Model downloads are usually the slow part — check hardware notes first." },
        ],
      };
    case "scripts-tools":
      return {
        title: "Get the tool",
        steps: [
          { label: "Clone it", code: clone },
          { label: "Read before you run", note: "This is community code. Skim the script before executing it." },
        ],
      };
    case "games":
    case "apps":
      return {
        title: "Build and play",
        steps: [
          { label: "Clone it", code: clone },
          { label: "Follow the how-to-run steps", note: "Source-only for now — Project OS never hosts binaries." },
        ],
      };
    default:
      return { title: "Get this project", steps: [{ label: "Clone it", code: clone }] };
  }
}

function CodeLine({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-1.5 flex items-stretch gap-2">
      <code className="min-w-0 flex-1 overflow-x-auto rounded-lg border border-neutral-700 bg-[#0d120f] px-3 py-2.5 font-mono text-xs text-emerald-300">
        {code}
      </code>
      <button
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        aria-label="Copy command"
        title="Copy command"
        className="flex min-h-[44px] w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-neutral-700 text-neutral-400 outline-none transition duration-200 hover:border-emerald-400/60 hover:bg-neutral-800 hover:text-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400"
      >
        {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
      </button>
    </div>
  );
}

export function InstallBlock({ category, repo }: { category: string; repo: string }) {
  const { title, steps } = stepsFor(category, repo);

  return (
    <section className="mt-6 rounded-xl border border-emerald-400/25 bg-neutral-900/60 p-5">
      <h2 className="flex items-center gap-2 font-mono text-sm font-bold text-emerald-400">
        <Download size={16} aria-hidden /> {title}
      </h2>
      <ol className="mt-4 space-y-4">
        {steps.map((s, i) => (
          <li key={i}>
            <p className="font-mono text-xs text-neutral-300">
              <span className="text-neutral-500">{i + 1}.</span> {s.label}
            </p>
            {s.code && <CodeLine code={s.code} />}
            {s.note && <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">{s.note}</p>}
          </li>
        ))}
      </ol>
    </section>
  );
}
