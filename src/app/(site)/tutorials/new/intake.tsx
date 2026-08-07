"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Cpu, Copy, Check, Send, Eye } from "lucide-react";
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
}: {
  specUrl: string;
  /** Present when changing an existing one rather than posting a new one. */
  editing?: { id: string; current: string };
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
        body: JSON.stringify(editing ? { id: editing.id, text } : { text }),
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
      <div className="rounded-xl border border-sky-400/30 bg-sky-400/[0.05] p-4">
        <p className="flex items-center gap-2 font-mono text-[13px] font-bold text-sky-200">
          <Cpu size={14} aria-hidden /> {editing ? "Change it with your AI" : "First, have your AI write it"}
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
            className="inline-flex min-h-[32px] cursor-pointer items-center gap-1.5 rounded-lg border border-sky-400/50 bg-sky-400/10 px-3 font-mono text-[12px] font-bold text-sky-200 outline-none transition hover:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400"
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
