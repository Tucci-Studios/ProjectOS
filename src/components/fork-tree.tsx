"use client";

import { useState } from "react";
import Link from "next/link";
import { GitFork, Plus } from "lucide-react";
import type { LineageNode } from "@/lib/queries";
import { FollowButton } from "./follow-button";

/**
 * Reddit's threadline model: every reply block hangs off a vertical line that
 * starts under its parent's avatar. The line itself is the control — hover
 * highlights it, clicking collapses the whole thread beneath it. Collapsed
 * threads become a single [+] row you can click to bring back.
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

function countAll(n: TreeNode): number {
  return n.children.reduce((sum, c) => sum + 1 + countAll(c), 0);
}

export function ForkTree({
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
  return (
    <div className="rounded-xl border border-neutral-700 bg-neutral-900/40 px-3 py-2">
      {build(nodes).map((n) => (
        <Node key={n.id} node={n} depth={0} currentId={currentId} accent={accent} following={following} canFollow={canFollow} />
      ))}
      <TreeLegend accent={accent} />
    </div>
  );
}

function Node({
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
  const [collapsed, setCollapsed] = useState(false);
  const [lineHot, setLineHot] = useState(false);
  const isCurrent = node.id === currentId;
  const isRoot = depth === 0;
  const kids = node.children.length;
  const hidden = countAll(node);

  if (collapsed) {
    return (
      <div className="py-1">
        <button
          onClick={() => setCollapsed(false)}
          className="flex min-h-[30px] cursor-pointer items-center gap-2 rounded-md px-1.5 font-mono text-[12px] text-neutral-500 outline-none transition hover:bg-neutral-800 hover:text-neutral-200 focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <span className="flex h-4 w-4 items-center justify-center rounded border border-neutral-600 text-neutral-400">
            <Plus size={10} aria-hidden />
          </span>
          <span className="text-neutral-300">{isRoot ? node.base_name : node.variant_name}</span>
          <span>· {hidden} hidden</span>
        </button>
      </div>
    );
  }

  return (
    <div className="py-0.5">
      {/* the fork itself */}
      <div className={`group relative flex items-start gap-2.5 rounded-lg px-1.5 py-2 ${isCurrent ? "bg-neutral-800/70" : ""}`}>
        <Link
          href={`/p/${node.id}`}
          aria-label={`Open ${node.base_name}${node.variant_name ? ` // ${node.variant_name}` : ""}`}
          className="absolute inset-0 z-0 rounded-lg outline-none transition hover:bg-neutral-800/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400"
        />

        <span
          title={
            isCurrent
              ? "You're looking at this one"
              : kids > 0
                ? `${kids} fork${kids === 1 ? "" : "es"} came off this`
                : "Nothing has forked off this yet"
          }
          className="relative z-[1] mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border"
          style={{ borderColor: accent, background: isCurrent ? accent : "transparent" }}
          aria-hidden
        >
          {kids > 0 && <span className="h-1 w-1 rounded-full" style={{ background: isCurrent ? "#161d18" : accent }} />}
        </span>

        <span className="relative z-[1] min-w-0 flex-1 pointer-events-none">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className={`font-mono text-sm ${isCurrent ? "font-bold text-white" : "text-neutral-100"}`}>
              {isRoot ? node.base_name : node.variant_name}
            </span>
            <span className="font-mono text-[11px] text-neutral-500">
              @{node.github_login} · {node.like_count} vote{Math.abs(node.like_count) === 1 ? "" : "s"}
            </span>
            {isRoot && (
              <span className="rounded border border-neutral-600 px-1.5 py-px font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                original
              </span>
            )}
            {isCurrent && (
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: accent }}>
                you are here
              </span>
            )}
          </span>
          <span className="mt-0.5 block text-[13px] leading-snug text-neutral-400">
            {node.change_summary ?? (isRoot ? "Where this all started." : "No summary given.")}
          </span>
        </span>

        {canFollow && (
          <span className="relative z-[2] mt-0.5 shrink-0">
            <FollowButton projectId={node.id} initialFollowing={!!following?.has(node.id)} iconOnly />
          </span>
        )}
      </div>

      {/* children hang off a clickable threadline */}
      {kids > 0 && (
        <div className="flex">
          <button
            onClick={() => setCollapsed(true)}
            onMouseEnter={() => setLineHot(true)}
            onMouseLeave={() => setLineHot(false)}
            aria-label={`Collapse ${kids} fork${kids === 1 ? "" : "es"} of ${node.variant_name ?? node.base_name}`}
            title="Collapse this thread"
            className="group/line relative flex w-[17px] shrink-0 cursor-pointer justify-center outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <span
              className="h-full w-px transition-all duration-150"
              style={{
                background: accent,
                opacity: lineHot ? 1 : 0.35,
                width: lineHot ? 2 : 1,
              }}
              aria-hidden
            />
          </button>

          <div className="min-w-0 flex-1">
            {node.children.map((c) => (
              <Node
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
      )}
    </div>
  );
}

/** The dots mean something — say so, instead of making people guess. */
function TreeLegend({ accent }: { accent: string }) {
  const dot = "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border";
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-neutral-800 px-1.5 pb-1 pt-2.5 font-mono text-[11px] text-neutral-500">
      <span className="flex items-center gap-1.5">
        <span className={dot} style={{ borderColor: accent }} aria-hidden />
        end of the line
      </span>
      <span className="flex items-center gap-1.5">
        <span className={dot} style={{ borderColor: accent }} aria-hidden>
          <span className="h-[3px] w-[3px] rounded-full" style={{ background: accent }} />
        </span>
        has forks
      </span>
      <span className="flex items-center gap-1.5">
        <span className={dot} style={{ borderColor: accent, background: accent }} aria-hidden />
        you are here
      </span>
      <span className="text-neutral-600">click a line to fold that thread</span>
    </div>
  );
}
