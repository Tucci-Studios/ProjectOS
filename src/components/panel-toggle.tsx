"use client";

import { useState } from "react";
import { GitFork, MessageCircle } from "lucide-react";

/**
 * The tree and the comments share one slot. Comments is a toggle: press it to
 * read them, press it again to get the tree back.
 */
export function PanelToggle({
  tree,
  comments,
  forkCount,
  commentCount,
}: {
  tree: React.ReactNode;
  comments: React.ReactNode;
  forkCount: number;
  commentCount: number;
}) {
  const [showComments, setShowComments] = useState(false);

  return (
    <section className="mt-9">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
          {showComments ? (
            <>
              <MessageCircle size={13} aria-hidden /> Comments
              <span className="font-normal normal-case tracking-normal text-neutral-400">{commentCount}</span>
            </>
          ) : (
            <>
              <GitFork size={13} aria-hidden /> Forks
              <span className="font-normal normal-case tracking-normal">
                {forkCount === 0 ? (
                  <span className="text-neutral-400">none yet</span>
                ) : (
                  <span className="font-bold text-emerald-400">{forkCount.toLocaleString()}</span>
                )}
              </span>
            </>
          )}
        </h2>

        <button
          onClick={() => setShowComments((c) => !c)}
          aria-pressed={showComments}
          className={`inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-lg border px-3 font-mono text-[13px] outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 ${
            showComments
              ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
              : "border-neutral-700 text-neutral-300 hover:border-emerald-400/50 hover:text-emerald-300"
          }`}
        >
          {showComments ? (
            <>
              <GitFork size={14} aria-hidden /> Back to forks
            </>
          ) : (
            <>
              <MessageCircle size={14} aria-hidden /> Comments {commentCount}
            </>
          )}
        </button>
      </div>

      <div key={showComments ? "comments" : "tree"} className="animate-rise">
        {showComments ? comments : tree}
      </div>
    </section>
  );
}
