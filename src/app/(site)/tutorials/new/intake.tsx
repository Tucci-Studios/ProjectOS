"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PenLine, Copy, Check, Send, Eye } from "lucide-react";
import { parseGuide } from "@/lib/tutorial-guide";
import { TutorialView } from "@/components/tutorial-view";

/**
 * One box, not a form.
 *
 * The point of the format being machine-writable is that nobody should be
 * typing a tutorial into fields on a website. So the author's assistant writes
 * it, and this takes the result — pasted, or a link to it. The preview matters
 * more than the input: it's the only chance to notice the AI got something
 * wrong before it's on the site under your name.
 */
export function TutorialIntake({
  specUrl,
  editing,
  projects,
}: {
  specUrl: string;
  /** Present when changing an existing one rather than posting a new one. */
  editing?: { id: string; current: string; projectId?: string | null };
  /** Projects this tutorial could be about. */
  projects: { id: string; name: string }[];
}) {
  const router = useRouter();
  // Pretty-printed, because the thing you're about to hand back to an AI should
  // be readable rather than one long line.
  const [text, setText] = useState(() => {
    if (!editing) return "";
    try {
      return JSON.stringify(JSON.parse(editing.current), null, 2);
    } catch {
      return editing.current;
    }
  });
  const [projectId, setProjectId] = useState(editing?.projectId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  // Preview whatever is currently in the box, if it's a tutorial yet.
  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(text);
  const preview = parseGuide((fenced ? fenced[1] : text).trim());

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/tutorials", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { id: editing.id, text, projectId: projectId || null } : { text, projectId: projectId || null }),
      });
      const d = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !d.id) {
        setError(d.error ?? "That didn't post.");
        return;
      }
      router.push(`/wire/${d.id}`);
    } catch {
      setError("That didn't post.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="rounded-xl border border-neutral-700 bg-neutral-900/50 p-4">
        <p className="flex items-center gap-2 font-mono text-[13px] font-bold text-neutral-100">
          <PenLine size={14} aria-hidden /> {editing ? "Change it with your AI" : "First, have your AI write it"}
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-300">
          {editing
            ? "Paste the current version below to your AI along with this link, say what to change, and paste the result back."
            : "Give it this link and say what you want to teach. It knows the format, what it can't do, and how to hand the result back."}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(specUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }}
            className="inline-flex min-h-[32px] cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-400/50 bg-emerald-400/10 px-3 font-mono text-[12px] font-bold text-emerald-200 outline-none transition hover:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {copied ? <Check size={12} aria-hidden /> : <Copy size={12} aria-hidden />}
            {copied ? "Copied" : "Copy the link"}
          </button>
          <span className="break-all font-mono text-[11px] text-neutral-500">{specUrl}</span>
        </div>
      </div>

      <label className="mt-6 block">
        <span className="mb-1.5 block font-mono text-[12px] text-neutral-300">
          {editing ? "The current version — replace it with the new one" : "Then paste what it gave you"}
        </span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder={'{ "title": "...", "steps": [ ... ] }\n\nor a https:// link to the file'}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900/60 px-3.5 py-3 font-mono text-[12.5px] leading-relaxed text-white placeholder-neutral-600 outline-none transition focus:border-emerald-400/60"
        />
        <span className="mt-1.5 block text-[12px] text-neutral-400">
          The JSON itself, a fenced code block, or a link to a raw file — all fine.
        </span>
      </label>

      <label className="mt-5 block">
        <span className="mb-1.5 block font-mono text-[12px] text-neutral-300">Is it about a project here?</span>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900/60 px-3 py-2.5 font-mono text-[13px] text-white outline-none transition focus:border-emerald-400/60"
        >
          <option value="">Not about a specific project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <span className="mt-1.5 block text-[12px] leading-relaxed text-neutral-400">
          It gets listed on that project&apos;s page, and its owner can vouch for it — or say publicly that
          something&apos;s wrong. They can&apos;t take it down.
        </span>
      </label>

      {error && (
        <p className="mt-3 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3.5 py-2.5 text-[13px] leading-relaxed text-rose-200">
          {error}
        </p>
      )}

      {preview && (
        <section className="mt-6">
          <p className="mb-2 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-emerald-300">
            <Eye size={12} aria-hidden /> Exactly how it will look
          </p>
          <TutorialView t={preview} />
        </section>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={submit}
          disabled={busy || !preview}
          className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg bg-emerald-400 px-5 font-mono text-[13px] font-bold text-black outline-none transition hover:bg-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-default disabled:opacity-40"
        >
          <Send size={14} aria-hidden /> {busy ? (editing ? "Saving..." : "Posting...") : editing ? "Save changes" : "Post it"}
        </button>
        <span className="text-[12px] text-neutral-400">
          {preview
            ? editing
              ? "Read it through before saving."
              : "Read it through first — it goes up under your name."
            : text.trim()
              ? "Not a tutorial in our format yet."
              : "Nothing pasted yet."}
        </span>
      </div>
    </div>
  );
}
