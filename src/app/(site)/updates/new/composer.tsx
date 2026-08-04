"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Wrench, Bug, Rocket, Send } from "lucide-react";

/**
 * The composer for update posts.
 *
 * The line prefixes aren't documented anywhere a person would find them, so the
 * legend sits next to the box rather than in a comment in the renderer. Write
 * the lines, see what they'll become.
 */
const KINDS = [
  { p: "+", Icon: Plus, cls: "text-emerald-300", label: "Added" },
  { p: "~", Icon: Wrench, cls: "text-amber-300", label: "Changed" },
  { p: "-", Icon: Bug, cls: "text-sky-300", label: "Fixed" },
  { p: ">", Icon: Rocket, cls: "text-fuchsia-300", label: "From an idea" },
];

const field =
  "w-full rounded-lg border border-neutral-700 bg-neutral-900/60 px-3.5 py-2.5 font-mono text-[13px] text-white placeholder-neutral-600 outline-none transition focus:border-emerald-400/60";

export function UpdateComposer() {
  const router = useRouter();
  const [f, setF] = useState({ version: "", title: "", intro: "", body: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const d = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(d.error ?? "That didn't post.");
        return;
      }
      router.push("/updates");
      router.refresh();
    } catch {
      setError("That didn't post.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[7rem_1fr]">
        <input value={f.version} onChange={set("version")} placeholder="v0.3" aria-label="Version" className={field} />
        <input value={f.title} onChange={set("title")} placeholder="What shipped" aria-label="Title" required className={field} />
      </div>

      <input
        value={f.intro}
        onChange={set("intro")}
        placeholder="One line of context (optional)"
        aria-label="Intro"
        className={field}
      />

      <div>
        <textarea
          value={f.body}
          onChange={set("body")}
          required
          rows={10}
          aria-label="Lines"
          placeholder={"+ Readmes now open full screen\n~ News is Updates, and moved to the bottom\n- Fixed the header sitting on top of the readme\n> Saves in the header — asked for in Ideas"}
          className={`${field} resize-y leading-relaxed`}
        />
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
          {KINDS.map(({ p, Icon, cls, label }) => (
            <span key={p} className="inline-flex items-center gap-1.5 font-mono text-[11px] text-neutral-500">
              <Icon size={12} className={cls} aria-hidden />
              <code className="text-neutral-400">{p}</code> {label}
            </span>
          ))}
        </div>
      </div>

      {error && <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3.5 py-2.5 text-[13px] text-rose-200">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="flex min-h-[42px] cursor-pointer items-center gap-2 rounded-lg bg-emerald-400 px-5 font-mono text-[13px] font-bold text-black outline-none transition hover:bg-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50"
      >
        <Send size={14} aria-hidden /> {busy ? "Posting..." : "Post it"}
      </button>
    </form>
  );
}
