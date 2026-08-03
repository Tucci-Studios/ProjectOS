"use client";

import { useState } from "react";
import Link from "next/link";
import { GitBranch, ChevronDown } from "lucide-react";
import type { LineageNode } from "@/lib/queries";
import { FollowButton } from "./follow-button";

// Each row answers "what is this branch?" with its change summary — the thing
// that actually distinguishes one branch from another. Deep chains collapse so
// a busy tree stays readable.
const VISIBLE_BEFORE_COLLAPSE = 6;

export function BranchTree({
  nodes,
  currentId,
  accent = "#34d399",
  following,
  canFollow = false,
}: {
  nodes: LineageNode[];
  currentId?: string;
  accent?: string;
  following?: Set<string>;
  canFollow?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  if (nodes.length === 0) return null;

  const hidden = Math.max(0, nodes.length - VISIBLE_BEFORE_COLLAPSE);
  const shown = expanded ? nodes : nodes.slice(0, VISIBLE_BEFORE_COLLAPSE);

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900/50">
      {shown.map((node, i) => {
        const isCurrent = node.id === currentId;
        const isRoot = node.depth === 0;
        return (
          <div
            key={node.id}
            className={`group relative flex items-start gap-3 py-3 pr-3 transition-colors duration-200 ${
              isCurrent ? "bg-neutral-800/70" : "hover:bg-neutral-800/40"
            } ${i > 0 ? "border-t border-neutral-800" : ""}`}
            style={{ paddingLeft: 14 + node.depth * 22 }}
          >
            <Link
              href={`/p/${node.id}`}
              aria-label={`Open ${node.base_name}${node.variant_name ? ` // ${node.variant_name}` : ""}`}
              className="absolute inset-0 z-0 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400"
            />

            {/* connector */}
            <span className="relative mt-1 flex w-4 shrink-0 justify-center" aria-hidden>
              {!isRoot && (
                <>
                  <span className="absolute -top-4 left-0 h-6 w-px" style={{ background: accent, opacity: 0.3 }} />
                  <span className="absolute left-0 top-2 h-px w-3" style={{ background: accent, opacity: 0.3 }} />
                </>
              )}
              <span
                className="relative z-10 mt-1 h-2 w-2 rounded-full"
                style={{
                  background: isCurrent ? accent : "#161d18",
                  border: `1.5px solid ${accent}`,
                  boxShadow: isCurrent ? `0 0 8px ${accent}` : "none",
                }}
              />
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className={`font-mono text-sm ${isCurrent ? "font-bold text-white" : "text-neutral-200"}`}>
                  {isRoot ? (
                    <>
                      {node.base_name}
                      <span className="ml-2 font-normal text-[10px] uppercase tracking-widest text-neutral-500">original</span>
                    </>
                  ) : (
                    node.variant_name
                  )}
                </span>
                {isCurrent && (
                  <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: accent }}>
                    you are here
                  </span>
                )}
                {node.child_count > 0 && (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-400">
                    <GitBranch size={10} aria-hidden /> {node.child_count}
                  </span>
                )}
              </span>

              {/* the line that makes branches distinguishable */}
              <span className="mt-0.5 block text-[13px] leading-snug text-neutral-400">
                {node.change_summary ?? (isRoot ? "Where this all started." : "No summary given.")}
              </span>

              <span className="mt-1 block font-mono text-[11px] text-neutral-500">
                @{node.github_login} · {node.like_count} vote{Math.abs(node.like_count) === 1 ? "" : "s"}
              </span>
            </span>

            {canFollow && (
              <span className="relative z-[2] mt-0.5 shrink-0">
                <FollowButton projectId={node.id} initialFollowing={!!following?.has(node.id)} size="sm" />
              </span>
            )}
          </div>
        );
      })}

      {hidden > 0 && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex w-full cursor-pointer items-center justify-center gap-2 border-t border-neutral-800 py-3 font-mono text-[13px] text-neutral-400 outline-none hover:bg-neutral-800/60 hover:text-white focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400"
        >
          <ChevronDown size={14} className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} aria-hidden />
          {expanded ? "Show fewer" : `Show ${hidden} more branch${hidden === 1 ? "" : "es"}`}
        </button>
      )}
    </div>
  );
}
