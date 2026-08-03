"use client";

import { useState } from "react";
import { GitBranch, MessageCircle } from "lucide-react";

/**
 * The tree and the comments share one slot. Comments is a toggle: press it to
 * read them, press it again to get the tree back.
 */
export function PanelToggle({
  tree,
  comments,
  branchCount,
  commentCount,
}: {
  tree: React.ReactNode;
  comments: React.ReactNode;
  branchCount: number;
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
              <span className="font-normal normal-case tracking-normal text-neutral-500">{commentCount}</span>
            </>
          ) : (
            <>
              <GitBranch size={13} aria-hidden /> The tree
              <span className="font-normal normal-case tracking-normal">
                {branchCount === 0 ? (
                  <span className="text-neutral-500">no branches yet</span>
                ) : (
                  <>
                    <span className="font-bold text-emerald-400">{branchCount}</span>
                    <span className="text-neutral-500"> grew from this</span>
                  </>
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
              <GitBranch size={14} aria-hidden /> Back to the tree
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
