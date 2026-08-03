import { GitFork } from "lucide-react";
import type { LineageNode } from "@/lib/queries";
import type { UnpublishedFork } from "@/lib/forks";
import { ForkOrbit, type OrbitNode } from "./fork-orbit";

/** Past this it stops being readable and starts being a fog of dots. */
const MAX_NODES = 140;

/**
 * The forks of a project, as something to be a bit proud of.
 *
 * Built from BOTH sources, because they're the same thing at different levels
 * of proof: forks published here sit on the tree with votes and a page, and
 * forks that only exist on GitHub are drawn hollow. Nothing is invented — if we
 * don't hold a fork's details, it isn't on the picture, only in the count.
 */
export function ForkTrophy({
  lineage,
  unpublished,
  total,
  published,
  projectName,
}: {
  lineage: LineageNode[];
  unpublished: UnpublishedFork[];
  total: number;
  published: number;
  projectName: string;
}) {
  const nodes: OrbitNode[] = [];
  const rootId = lineage.find((n) => !n.parent_id)?.id ?? "root";

  for (const n of lineage) {
    nodes.push({
      id: n.id,
      label: n.variant_name ?? n.base_name,
      parentId: n.parent_id,
      depth: n.depth,
      score: n.like_count,
      published: true,
      meta: `@${n.github_login}`,
    });
  }

  // GitHub-only forks hang off the original as one more generation.
  for (const f of unpublished.slice(0, MAX_NODES - nodes.length)) {
    nodes.push({
      id: `gh:${f.full_name}`,
      label: f.full_name,
      parentId: rootId,
      depth: 1,
      score: f.stars,
      published: false,
      meta: f.stars > 0 ? `${f.stars}★` : undefined,
    });
  }

  // A single dot is not a trophy.
  if (nodes.length < 2) return null;

  const generations = Math.max(...nodes.map((n) => n.depth));
  const drawn = nodes.length - 1;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-5 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.03] p-4">
      <div className="shrink-0">
        <ForkOrbit nodes={nodes} size={150} interactive />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-mono text-[34px] font-bold leading-none text-white tabular-nums">
          {total.toLocaleString()}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 font-mono text-[11px] uppercase tracking-[0.18em] text-emerald-400">
          <GitFork size={11} aria-hidden />
          fork{total === 1 ? "" : "s"}
          {generations > 1 && <span className="text-neutral-500">· {generations} generations</span>}
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-neutral-400">
          {published > 0 ? (
            <>
              <span className="text-neutral-200">{published}</span> published here and on the tree.{" "}
            </>
          ) : null}
          {drawn < total ? (
            <>Showing the {drawn} most recent — the rest are on GitHub.</>
          ) : (
            <>Every one of them came from {projectName}.</>
          )}
        </p>
      </div>
    </div>
  );
}
