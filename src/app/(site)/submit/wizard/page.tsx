"use client";

import { useState } from "react";
import { CATEGORY_SLUGS } from "@/lib/categories";

// Manifest wizard: generates project.json + AGENTS.md to copy into the repo root.

const CATEGORIES = CATEGORY_SLUGS;

const inputCls =
  "w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-2 font-mono text-sm text-white placeholder-neutral-600 outline-none focus:border-emerald-400";
const labelCls = "mb-1 block font-mono text-xs text-neutral-400";

function CopyBlock({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-6">
      <div className="mb-2 flex items-center gap-3">
        <h2 className="font-mono text-sm font-bold text-white">{title}</h2>
        <button
          onClick={() => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="rounded border border-emerald-400/40 px-2 py-0.5 font-mono text-[10px] text-emerald-400 hover:bg-emerald-400/10"
        >
          {copied ? "copied ✓" : "copy"}
        </button>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-neutral-700 bg-neutral-900/80 p-4 font-mono text-xs text-neutral-300">
        {text}
      </pre>
    </div>
  );
}

export default function WizardPage() {
  const [name, setName] = useState("");
  const [variant, setVariant] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [license, setLicense] = useState("GPL-3.0-or-later");
  const [howToRun, setHowToRun] = useState("");
  const [tags, setTags] = useState("");
  const [parentRepo, setParentRepo] = useState("");
  const [changeSummary, setChangeSummary] = useState("");

  const manifest: Record<string, unknown> = {
    name,
    ...(variant ? { variant } : {}),
    category,
    description,
    license,
    howToRun,
    ...(tags.trim()
      ? { tags: tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean) }
      : {}),
    ...(parentRepo ? { lineage: { parentRepo, ...(changeSummary ? { changeSummary } : {}) } } : {}),
  };

  const agentsMd = `# AGENTS.md — AI Continuation Instructions

## What this is
${description || "(describe the project)"}

## Architecture
(Key directories/files, main data flow, anything load-bearing or surprising.)

## How to build & run
${howToRun || "(exact commands from fresh clone)"}

## Conventions
(Naming, patterns to follow, what NOT to do.)

## Current state & roadmap
(What works, what's half-done, next 3-5 things worth building.)

## Fork guidance
(What's safe to rip out, what's fun to branch, what should stay stable.)
`;

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 font-mono text-lg font-bold text-white">Manifest wizard</h1>
      <p className="mb-6 text-sm text-neutral-400">
        Fill this in, copy both files into your repo root, then{" "}
        <a href="/submit" className="text-emerald-400 hover:underline">
          publish
        </a>
        .
      </p>

      <div className="space-y-4 rounded-lg border border-neutral-700 bg-neutral-900/60 p-4">
        <div className="grid grid-cols-2 gap-4">
          <label>
            <span className={labelCls}>Name (base)</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Subwolf" className={inputCls} />
          </label>
          <label>
            <span className={labelCls}>Variant (forks only)</span>
            <input value={variant} onChange={(e) => setVariant(e.target.value)} placeholder="Cyber" className={inputCls} />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label>
            <span className={labelCls}>Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            <span className={labelCls}>License</span>
            <input value={license} onChange={(e) => setLicense(e.target.value)} className={inputCls} />
          </label>
        </div>
        <label className="block">
          <span className={labelCls}>Description (20+ chars)</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputCls} />
        </label>
        <label className="block">
          <span className={labelCls}>How to run (10+ chars)</span>
          <textarea
            value={howToRun}
            onChange={(e) => setHowToRun(e.target.value)}
            rows={3}
            placeholder="npm install && npm run dev"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className={labelCls}>Tags (comma-separated)</span>
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="game, stealth, neon" className={inputCls} />
        </label>
        <div className="grid grid-cols-2 gap-4 border-t border-neutral-700 pt-4">
          <label>
            <span className={labelCls}>Parent repo (forks only)</span>
            <input value={parentRepo} onChange={(e) => setParentRepo(e.target.value)} placeholder="owner/repo" className={inputCls} />
          </label>
          <label>
            <span className={labelCls}>What changed (one line)</span>
            <input value={changeSummary} onChange={(e) => setChangeSummary(e.target.value)} className={inputCls} />
          </label>
        </div>
      </div>

      <CopyBlock title="project.json" text={JSON.stringify(manifest, null, 2)} />
      <CopyBlock title="AGENTS.md" text={agentsMd} />
    </div>
  );
}
