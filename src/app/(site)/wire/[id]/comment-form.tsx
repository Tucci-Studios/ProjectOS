"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CommentForm({ postId, signedIn }: { postId: string; signedIn: boolean }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!signedIn) {
    return (
      <p className="mt-4 font-mono text-xs text-neutral-500">
        <a href="/api/auth/login" className="text-emerald-400 hover:underline">
          sign in with GitHub
        </a>{" "}
        to comment
      </p>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, body }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (data.ok) {
        setBody("");
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
    <form onSubmit={submit} className="mt-4 space-y-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        rows={3}
        maxLength={2000}
        placeholder="Add a comment... (@Project and #post_id refs work here too)"
        className="w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-2 font-mono text-sm text-white placeholder-neutral-600 outline-none focus:border-emerald-400"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded bg-emerald-400 px-4 py-1.5 font-mono text-xs font-semibold text-black transition hover:bg-emerald-300 disabled:opacity-50"
        >
          {busy ? "..." : "Comment"}
        </button>
        {error && <p className="font-mono text-xs text-rose-400">▸ {error}</p>}
      </div>
    </form>
  );
}
