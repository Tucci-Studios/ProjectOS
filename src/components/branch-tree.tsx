"use client";

import { useState } from "react";
import Link from "next/link";
import { GitBranch, ChevronDown } from "lucide-react";
import type { LineageNode } from "@/lib/queries";
import { FollowButton } from "./follow-button";

/**
 * A real tree, drawn like `git log --graph`: a continuous trunk line, elbows
 * where a branch splits off, and vertical guides that keep running past a row
 * whenever that level still has siblings below it. That continuity is what
 * makes it read as branching instead of as an indented list.
 */
type Row = LineageNode & { guides: boolean[]; isLast: boolean };

function layout(nodes: LineageNode[]): Row[] {
  const byParent = new Map<string | null, LineageNode[]>();
  for (const n of nodes) {
    const list = byParent.get(n.parent_id) ?? [];
    list.push(n);
    byParent.set(n.parent_id, list);
  }

  const out: Row[] = [];
  const walk = (parentId: string | null, guides: boolean[]) => {
    const kids = byParent.get(parentId) ?? [];
    kids.forEach((kid, i) => {
      const isLast = i === kids.length - 1;
      out.push({ ...kid, guides, isLast });
      // A child's guides = ours plus "does this level continue below me?"
      walk(kid.id, [...guides, !isLast]);
    });
  };
  walk(null, []);
  return out;
}

const COL = 26;
const VISIBLE = 8;

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

  const rows = layout(nodes);
  const hidden = Math.max(0, rows.length - VISIBLE);
  const shown = expanded ? rows : rows.slice(0, VISIBLE);

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900/40">
      {shown.map((node, i) => {
        const isCurrent = node.id === currentId;
        const isTrunk = node.guides.length === 0;
        const indent = node.guides.length * COL;

        return (
          <div
            key={node.id}
            className={`group relative flex items-stretch transition-colors duration-200 ${
              isCurrent ? "bg-neutral-800/70" : "hover:bg-neutral-800/40"
            } ${i > 0 ? "border-t border-neutral-800/70" : ""}`}
          >
            <Link
              href={`/p/${node.id}`}
              aria-label={`Open ${node.base_name}${node.variant_name ? ` // ${node.variant_name}` : ""}`}
              className="absolute inset-0 z-0 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400"
            />

            {/* graph gutter */}
            <span className="relative shrink-0" style={{ width: indent + COL + 12 }} aria-hidden>
              {/* vertical guides for ancestor levels that continue below */}
              {node.guides.map((continues, level) =>
                continues ? (
                  <span
                    key={level}
                    className="absolute top-0 bottom-0 w-px"
                    style={{ left: 18 + level * COL, background: accent, opacity: 0.25 }}
                  />
                ) : null,
              )}

              {!isTrunk && (
                <>
                  {/* elbow: down from parent, then across to this node */}
                  <span
                    className="absolute top-0 w-px"
                    style={{ left: 18 + (node.guides.length - 1) * COL, height: 26, background: accent, opacity: 0.45 }}
                  />
                  <span
                    className="absolute h-px"
                    style={{
                      left: 18 + (node.guides.length - 1) * COL,
                      top: 26,
                      width: COL - 8,
                      background: accent,
                      opacity: 0.45,
                    }}
                  />
                  {/* keep the line running past this row if siblings follow */}
                  {!node.isLast && (
                    <span
                      className="absolute bottom-0 w-px"
                      style={{
                        left: 18 + (node.guides.length - 1) * COL,
                        top: 26,
                        background: accent,
                        opacity: 0.25,
                      }}
                    />
                  )}
                </>
              )}

              {/* trunk line continuing down from this node to its own children */}
              {node.child_count > 0 && (
                <span
                  className="absolute bottom-0 w-px"
                  style={{ left: 18 + node.guides.length * COL, top: 32, background: accent, opacity: 0.25 }}
                />
              )}

              {/* the node itself */}
              <span
                className="absolute rounded-full"
                style={{
                  left: 18 + node.guides.length * COL - (isTrunk ? 5 : 4),
                  top: isTrunk ? 20 : 22,
                  width: isTrunk ? 10 : 8,
                  height: isTrunk ? 10 : 8,
                  background: isCurrent ? accent : "#161d18",
                  border: `1.5px solid ${accent}`,
                  boxShadow: isCurrent ? `0 0 10px ${accent}` : "none",
                }}
              />
            </span>

            <span className="min-w-0 flex-1 py-3.5 pr-3">
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className={`font-mono text-sm ${isCurrent ? "font-bold text-white" : "text-neutral-100"}`}>
                  {isTrunk ? node.base_name : node.variant_name}
                </span>
                {isTrunk && (
                  <span className="rounded border border-neutral-600 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                    original
                  </span>
                )}
                {isCurrent && (
                  <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: accent }}>
                    you are here
                  </span>
                )}
                {node.child_count > 0 && (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-400">
                    <GitBranch size={10} aria-hidden /> {node.child_count} off this
                  </span>
                )}
              </span>

              <span className="mt-0.5 block text-[13px] leading-snug text-neutral-400">
                {node.change_summary ?? (isTrunk ? "Where this all started." : "No summary given.")}
              </span>

              <span className="mt-1 block font-mono text-[11px] text-neutral-500">
                @{node.github_login} · {node.like_count} vote{Math.abs(node.like_count) === 1 ? "" : "s"}
              </span>
            </span>

            {canFollow && (
              <span className="relative z-[2] flex shrink-0 items-center pr-3">
                <FollowButton projectId={node.id} initialFollowing={!!following?.has(node.id)} iconOnly />
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
