import Link from "next/link";
import type { LineageNode } from "@/lib/queries";

// Branch tree: the trunk runs down the left, each branch hangs off it with an
// elbow connector. Built to stay readable as a lineage gets busy — deeper
// branches indent, the current one glows, and every row is a full click target.

export function BranchTree({
  nodes,
  currentId,
  accent = "#34d399",
}: {
  nodes: LineageNode[];
  currentId?: string;
  accent?: string;
}) {
  if (nodes.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900/60">
      {nodes.map((node, i) => {
        const isCurrent = node.id === currentId;
        const isRoot = node.depth === 0;
        return (
          <Link
            key={node.id}
            href={`/p/${node.id}`}
            className={`group relative flex min-h-[52px] cursor-pointer items-center gap-3 pr-4 outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400 ${
              isCurrent ? "bg-neutral-800/80" : "hover:bg-neutral-800/50"
            } ${i > 0 ? "border-t border-neutral-800" : ""}`}
            style={{ paddingLeft: 16 + node.depth * 26 }}
          >
            {/* trunk / elbow */}
            <span className="relative flex h-full w-4 shrink-0 items-center justify-center" aria-hidden>
              {!isRoot && (
                <span
                  className="absolute left-0 top-0 h-1/2 w-px"
                  style={{ backgroundColor: accent, opacity: 0.35 }}
                />
              )}
              {!isRoot && (
                <span
                  className="absolute left-0 top-1/2 h-px w-3"
                  style={{ backgroundColor: accent, opacity: 0.35 }}
                />
              )}
              <span
                className="relative z-10 h-2.5 w-2.5 rounded-full transition"
                style={{
                  backgroundColor: isCurrent ? accent : "#161d18",
                  border: `1.5px solid ${accent}`,
                  boxShadow: isCurrent ? `0 0 10px ${accent}` : "none",
                }}
              />
            </span>

            <span className="min-w-0 flex-1 py-2">
              <span
                className={`block truncate font-mono text-sm ${
                  isCurrent ? "font-bold text-white" : "text-neutral-300 group-hover:text-white"
                }`}
              >
                {isRoot ? (
                  node.base_name
                ) : (
                  <>
                    <span className="text-neutral-500">{node.base_name} // </span>
                    {node.variant_name}
                  </>
                )}
                {isRoot && <span className="ml-2 font-normal text-[10px] uppercase tracking-widest text-neutral-500">trunk</span>}
                {isCurrent && (
                  <span className="ml-2 font-normal text-[10px] uppercase tracking-widest" style={{ color: accent }}>
                    you are here
                  </span>
                )}
              </span>
              <span className="block truncate font-mono text-[11px] text-neutral-500">
                @{node.github_login} · {node.like_count} like{node.like_count === 1 ? "" : "s"}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
