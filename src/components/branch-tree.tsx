"use client";

import { useState } from "react";
import Link from "next/link";
import { GitBranch, ChevronDown, ChevronRight } from "lucide-react";
import type { LineageNode } from "@/lib/queries";
import { FollowButton } from "./follow-button";

/**
 * Branches nest inside their parent, the way threaded replies do: one vertical
 * line per level, and everything under that line belongs to the branch above
 * it. No crossing guides, no ambiguity about which line means what.
 */
type TreeNode = LineageNode & { children: TreeNode[] };

function build(nodes: LineageNode[]): TreeNode[] {
  const map = new Map<string, TreeNode>(nodes.map((n) => [n.id, { ...n, children: [] }]));
  const roots: TreeNode[] = [];
  for (const n of map.values()) {
    const parent = n.parent_id ? map.get(n.parent_id) : null;
    if (parent) parent.children.push(n);
    else roots.push(n);
  }
  return roots;
}

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
  if (nodes.length === 0) return null;
  const roots = build(nodes);

  return (
    <div className="rounded-xl border border-neutral-700 bg-neutral-900/40 p-3">
      {roots.map((n) => (
        <Branch key={n.id} node={n} depth={0} currentId={currentId} accent={accent} following={following} canFollow={canFollow} />
      ))}
    </div>
  );
}

function Branch({
  node,
  depth,
  currentId,
  accent,
  following,
  canFollow,
}: {
  node: TreeNode;
  depth: number;
  currentId?: string;
  accent: string;
  following?: Set<string>;
  canFollow: boolean;
}) {
  // Deep levels start closed so the top of the tree stays readable.
  const [open, setOpen] = useState(depth < 2);
  const isCurrent = node.id === currentId;
  const isRoot = depth === 0;
  const kids = node.children.length;

  return (
    <div>
      <div
        className={`group relative flex items-start gap-2 rounded-lg py-2.5 pl-2 pr-2 transition-colors ${
          isCurrent ? "bg-neutral-800/80" : "hover:bg-neutral-800/40"
        }`}
      >
        <Link
          href={`/p/${node.id}`}
          aria-label={`Open ${node.base_name}${node.variant_name ? ` // ${node.variant_name}` : ""}`}
          className="absolute inset-0 z-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400"
        />

        {/* expander, only where there's something to expand */}
        {kids > 0 ? (
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? `Hide branches of ${node.variant_name ?? node.base_name}` : `Show branches of ${node.variant_name ?? node.base_name}`}
            className="relative z-[2] mt-0.5 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded text-neutral-500 transition hover:bg-neutral-700 hover:text-white"
          >
            <ChevronRight size={14} aria-hidden className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
          </button>
        ) : (
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center" aria-hidden>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent, opacity: 0.5 }} />
          </span>
        )}

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={`font-mono text-sm ${isCurrent ? "font-bold text-white" : "text-neutral-100"}`}>
              {isRoot ? node.base_name : node.variant_name}
            </span>
            {isRoot && (
              <span className="rounded border border-neutral-600 px-1.5 py-px font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                the original
              </span>
            )}
            {isCurrent && (
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: accent }}>
                you are here
              </span>
            )}
            {kids > 0 && (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-400">
                <GitBranch size={10} aria-hidden /> {kids} branch{kids === 1 ? "" : "es"} off this
              </span>
            )}
          </span>

          <span className="mt-0.5 block text-[13px] leading-snug text-neutral-400">
            {node.change_summary ?? (isRoot ? "Where this all started." : "No summary given.")}
          </span>
          <span className="mt-1 block font-mono text-[11px] text-neutral-500">
            @{node.github_login} · {node.like_count} vote{Math.abs(node.like_count) === 1 ? "" : "s"}
          </span>
        </span>

        {canFollow && (
          <span className="relative z-[2] mt-0.5 shrink-0">
            <FollowButton projectId={node.id} initialFollowing={!!following?.has(node.id)} iconOnly />
          </span>
        )}
      </div>

      {/* children live inside their parent's line */}
      {kids > 0 && (
        <div
          className="grid transition-[grid-template-rows] duration-200 ease-out"
          style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <div className="ml-[15px] border-l pl-3" style={{ borderColor: accent, borderLeftWidth: 1.5, opacity: 0.95 }}>
              {node.children.map((c) => (
                <Branch
                  key={c.id}
                  node={c}
                  depth={depth + 1}
                  currentId={currentId}
                  accent={accent}
                  following={following}
                  canFollow={canFollow}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {kids > 0 && !open && (
        <button
          onClick={() => setOpen(true)}
          className="ml-[15px] flex cursor-pointer items-center gap-1.5 border-l pl-3 py-1.5 font-mono text-[11px] text-neutral-500 transition hover:text-emerald-300"
          style={{ borderColor: accent, borderLeftWidth: 1.5, opacity: 0.6 }}
        >
          <ChevronDown size={12} aria-hidden /> show {kids} branch{kids === 1 ? "" : "es"}
        </button>
      )}
    </div>
  );
}
