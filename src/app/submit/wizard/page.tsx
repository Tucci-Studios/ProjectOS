"use client";

import { useState } from "react";

// Manifest wizard: generates project.json + AGENTS.md to copy into the repo root.
// Unstyled until L7.

const CATEGORIES = [
  "claude-code",
  "claude-skills",
  "claude-md",
  "mcp-servers",
  "codex",
  "local-llms",
  "scripts-tools",
  "games",
];

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
    ...(parentRepo
      ? { lineage: { parentRepo, ...(changeSummary ? { changeSummary } : {}) } }
      : {}),
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
(What's safe to rip out, what's fun to remix, what should stay stable.)
`;

  return (
    <main style={{ padding: 24, fontFamily: "monospace", maxWidth: 720 }}>
      <h1>Manifest wizard</h1>
      <p>Fill this in, then copy both files into your repo root and <a href="/submit">publish</a>.</p>

      <fieldset style={{ marginBottom: 16 }}>
        <legend>Project</legend>
        <p><label>Name (base): <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Subwolf" /></label></p>
        <p><label>Variant (forks only): <input value={variant} onChange={(e) => setVariant(e.target.value)} placeholder="Cyber" /></label></p>
        <p>
          <label>
            Category:{" "}
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
        </p>
        <p><label>Description (20+ chars):<br /><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} cols={60} /></label></p>
        <p><label>License: <input value={license} onChange={(e) => setLicense(e.target.value)} /></label></p>
        <p><label>How to run (10+ chars):<br /><textarea value={howToRun} onChange={(e) => setHowToRun(e.target.value)} rows={3} cols={60} placeholder="npm install && npm run dev" /></label></p>
        <p><label>Tags (comma-separated): <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="game, stealth, neon" /></label></p>
      </fieldset>

      <fieldset style={{ marginBottom: 16 }}>
        <legend>Fork? (leave empty for a new project)</legend>
        <p><label>Parent repo: <input value={parentRepo} onChange={(e) => setParentRepo(e.target.value)} placeholder="jacob/subwolf" /></label></p>
        <p><label>What changed (one line): <input value={changeSummary} onChange={(e) => setChangeSummary(e.target.value)} size={50} /></label></p>
      </fieldset>

      <h2>project.json</h2>
      <pre style={{ border: "1px solid #999", padding: 12, whiteSpace: "pre-wrap" }}>{JSON.stringify(manifest, null, 2)}</pre>

      <h2>AGENTS.md</h2>
      <p>(Starter — fill in the parenthesized sections before publishing.)</p>
      <pre style={{ border: "1px solid #999", padding: 12, whiteSpace: "pre-wrap" }}>{agentsMd}</pre>
    </main>
  );
}
