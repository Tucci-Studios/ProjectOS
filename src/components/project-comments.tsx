"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { timeAgo } from "@/lib/categories";

export type ProjectComment = {
  id: string;
  body_md: string;
  created_at: number;
  github_login: string;
  avatar_url: string | null;
};

export function ProjectComments({
  projectId,
  comments,
  signedIn,
}: {
  projectId: string;
  comments: ProjectComment[];
  signedIn: boolean;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/project-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, body }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (data.ok) {
        setBody("");
        router.refresh();
        return;
      }
      setError(data.error ?? "Failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {signedIn ? (
        <form onSubmit={submit} className="mb-4">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={3}
            maxLength={2000}
            placeholder="Tried it? Broke it? Have a question for the author?"
            className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3.5 py-3 text-sm text-white placeholder-neutral-600 outline-none transition focus:border-emerald-400"
          />
          <div className="mt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="min-h-[38px] cursor-pointer rounded-lg bg-emerald-400 px-4 font-mono text-[13px] font-bold text-black transition hover:bg-emerald-300 disabled:opacity-50"
            >
              {busy ? "Posting..." : "Comment"}
            </button>
            {error && <span className="font-mono text-[11px] text-rose-400">{error}</span>}
          </div>
        </form>
      ) : (
        <p className="mb-4 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 text-sm text-neutral-400">
          <a href="/api/auth/login" className="text-emerald-400 hover:underline">
            Sign in
          </a>{" "}
          to leave a comment.
        </p>
      )}

      {comments.length === 0 ? (
        <p className="flex items-center gap-2 rounded-xl border border-dashed border-neutral-800 p-5 text-sm text-neutral-500">
          <MessageCircle size={15} aria-hidden /> No comments yet.
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-3.5">
              <div className="flex items-center gap-2">
                {c.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.avatar_url} alt="" className="h-6 w-6 rounded-full border border-neutral-700" />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 font-mono text-[9px] text-neutral-400">
                    {c.github_login.slice(0, 2)}
                  </span>
                )}
                <Link href={`/u/${c.github_login}`} className="font-mono text-xs text-neutral-300 hover:text-white">
                  @{c.github_login}
                </Link>
                <span className="font-mono text-[11px] text-neutral-500">{timeAgo(c.created_at)}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-300">{c.body_md}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
