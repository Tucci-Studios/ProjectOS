"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const input =
  "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3.5 py-2.5 font-mono text-sm text-white placeholder-neutral-600 outline-none transition focus:border-emerald-400";

export function NewIdeaForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
      const data = (await res.json()) as { ok?: boolean; id?: string; error?: string };
      if (data.ok) {
        router.push("/ideas");
        router.refresh();
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
      <label className="block">
        <span className="mb-1.5 block font-mono text-xs text-neutral-400">The idea, in one line</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={120}
          placeholder="Let people follow a branch and get notified when it grows"
          className={input}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block font-mono text-xs text-neutral-400">
          Why it matters — what&apos;s annoying today?
        </span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={8}
          maxLength={4000}
          placeholder="Right now if I branch something I have no way to know when someone branches mine..."
          className={input}
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="min-h-[44px] cursor-pointer rounded-lg bg-emerald-400 px-5 font-mono text-sm font-bold text-black transition hover:bg-emerald-300 disabled:opacity-50"
      >
        {busy ? "Posting..." : "Post idea"}
      </button>
      {error && <p className="font-mono text-xs text-rose-400">▸ {error}</p>}
    </form>
  );
}
