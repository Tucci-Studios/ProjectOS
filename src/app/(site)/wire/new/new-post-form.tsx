"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputCls =
  "w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 font-mono text-sm text-white placeholder-neutral-600 outline-none focus:border-cyan-400";

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

// The tutorial template: a structure any human or AI can fill in.
// "## Step N — title" lines render as neon step cards.
export const TUTORIAL_TEMPLATE = `GOAL
One sentence: what the reader will have working by the end.

PREREQS
- what they need installed / signed up for

## Step 1 — Name the step
What to do, exactly. Paste commands and screenshots (image URLs render inline).

## Step 2 — Name the step
Keep steps small. One action each.

## Step 3 — Name the step
...

VERIFY
How the reader knows it worked — what they should see.`;

type Kind = "post" | "tutorial" | "request";

export function NewPostForm({
  projects,
  initialKind = "post",
  initialCategory = "",
}: {
  projects: { id: string; display: string }[];
  initialKind?: Kind;
  initialCategory?: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState(initialKind === "tutorial" ? TUTORIAL_TEMPLATE : "");
  const [kind, setKind] = useState<Kind>(initialKind);
  const [category, setCategory] = useState(initialCategory);
  const [projectId, setProjectId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function switchKind(next: Kind) {
    setKind(next);
    if (next === "tutorial" && !body.trim()) setBody(TUTORIAL_TEMPLATE);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          kind,
          category: category || undefined,
          projectId: projectId || undefined,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; id?: string; error?: string };
      if (data.ok && data.id) {
        router.push(`/wire/${data.id}`);
        return;
      }
      setError(data.error ?? "Something went wrong.");
    } catch {
      setError("Network error — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <label>
          <span className="mb-1 block font-mono text-xs text-neutral-400">Type</span>
          <select value={kind} onChange={(e) => switchKind(e.target.value as Kind)} className={inputCls}>
            <option value="post">post</option>
            <option value="tutorial">tutorial</option>
            <option value="request">tutorial request</option>
          </select>
        </label>
        <label>
          <span className="mb-1 block font-mono text-xs text-neutral-400">
            Section {kind !== "post" && <span className="text-amber-400">(required)</span>}
          </span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
            <option value="">— none —</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block font-mono text-xs text-neutral-400">
          {kind === "request" ? "What do you need a tutorial for?" : "Title"}
        </span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} className={inputCls} />
      </label>
      <label className="block">
        <div className="mb-1 flex items-center justify-between">
          <span className="font-mono text-xs text-neutral-400">Body</span>
          {kind === "tutorial" && (
            <button
              type="button"
              onClick={() => setBody(TUTORIAL_TEMPLATE)}
              className="font-mono text-[11px] text-amber-400 hover:underline"
            >
              ↺ reset to template
            </button>
          )}
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={kind === "tutorial" ? 16 : 8}
          maxLength={5000}
          className={inputCls}
          placeholder={
            kind === "request"
              ? "Describe what you're stuck on and what you already tried..."
              : "Devlog, tip, hot take..."
          }
        />
      </label>
      <label className="block">
        <span className="mb-1 block font-mono text-xs text-neutral-400">Attach a project (optional)</span>
        <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={inputCls}>
          <option value="">— none —</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.display}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={busy}
        className="rounded bg-cyan-400 px-5 py-2 font-mono text-sm font-semibold text-black transition hover:bg-cyan-300 disabled:opacity-50"
      >
        {busy ? "Posting..." : kind === "request" ? "Post request" : kind === "tutorial" ? "Publish tutorial" : "Post to The Wire"}
      </button>
      {error && <p className="font-mono text-xs text-rose-400">▸ {error}</p>}
    </form>
  );
}
