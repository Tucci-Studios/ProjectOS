"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, ChevronDown } from "lucide-react";
import { timeAgo } from "@/lib/categories";

type C = { id: string; body_md: string; created_at: number; github_login: string; avatar_url: string | null };

// Peek at the conversation without leaving the list.
export function CardComments({ projectId, count }: { projectId: string; count: number }) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<C[] | null>(null);
  const [total, setTotal] = useState(count);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (open) return setOpen(false);
    setOpen(true);
    if (comments || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/project-comments?projectId=${projectId}&limit=5`);
      const data = (await res.json()) as { comments: C[]; total: number };
      setComments(data.comments);
      setTotal(data.total);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative z-[2]">
      <button
        onClick={toggle}
        aria-expanded={open}
        className={`inline-flex min-h-[30px] cursor-pointer items-center gap-1.5 rounded-md px-2 font-mono text-[11px] outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 ${
          open ? "bg-neutral-800 text-neutral-200" : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
        }`}
      >
        <MessageCircle size={12} aria-hidden /> {total}
        <ChevronDown size={11} aria-hidden className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="animate-rise mt-2 rounded-lg border border-neutral-800 bg-neutral-900/70 p-3">
          {busy && <p className="font-mono text-[11px] text-neutral-400">Loading…</p>}
          {comments && comments.length === 0 && (
            <p className="font-mono text-[11px] text-neutral-400">No comments yet.</p>
          )}
          {comments && comments.length > 0 && (
            <>
              <div className="space-y-2.5">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-2">
                    {c.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.avatar_url} alt="" className="mt-0.5 h-5 w-5 shrink-0 rounded-full border border-neutral-700" />
                    ) : (
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 font-mono text-[8px] text-neutral-400">
                        {c.github_login.slice(0, 2)}
                      </span>
                    )}
                    <p className="min-w-0 text-[13px] leading-snug text-neutral-300">
                      <span className="font-mono text-[11px] text-neutral-400">
                        @{c.github_login} · {timeAgo(c.created_at)}
                      </span>
                      <br />
                      <span className="line-clamp-2">{c.body_md}</span>
                    </p>
                  </div>
                ))}
              </div>
              <Link
                href={`/p/${projectId}/comments`}
                className="mt-3 inline-block font-mono text-[11px] text-emerald-400 transition hover:underline"
              >
                See all {total} comments →
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
