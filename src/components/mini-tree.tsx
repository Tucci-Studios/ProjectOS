import type { LineageNode } from "@/lib/queries";

// Small SVG lineage tree: depth → column, order → row. Glowing circuit style.
export function MiniTree({ nodes, highlightId, accent = "#22d3ee" }: { nodes: LineageNode[]; highlightId?: string; accent?: string }) {
  const COL_W = 120;
  const ROW_H = 40;
  const R = 6;

  const pos = new Map<string, { x: number; y: number }>();
  nodes.forEach((n, i) => {
    pos.set(n.id, { x: 24 + n.depth * COL_W, y: 24 + i * ROW_H });
  });

  const width = 24 + (Math.max(0, ...nodes.map((n) => n.depth)) + 1) * COL_W + 60;
  const height = 24 + nodes.length * ROW_H;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full max-w-md" role="img" aria-label="lineage tree">
      {/* connectors: right-angle circuit traces */}
      {nodes.map((n) => {
        if (!n.parent_id) return null;
        const from = pos.get(n.parent_id);
        const to = pos.get(n.id);
        if (!from || !to) return null;
        const midX = from.x + (to.x - from.x) / 2;
        return (
          <path
            key={`e-${n.id}`}
            d={`M ${from.x + R} ${from.y} H ${midX} V ${to.y} H ${to.x - R}`}
            fill="none"
            stroke={accent}
            strokeOpacity={0.35}
            strokeWidth={1.5}
          />
        );
      })}
      {nodes.map((n) => {
        const p = pos.get(n.id)!;
        const hot = n.id === highlightId;
        return (
          <g key={n.id}>
            <circle cx={p.x} cy={p.y} r={hot ? R + 2 : R} fill={hot ? accent : "#0a0a0f"} stroke={accent} strokeWidth={1.5}>
              {hot && <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />}
            </circle>
            {hot && <circle cx={p.x} cy={p.y} r={R + 7} fill="none" stroke={accent} strokeOpacity={0.25} strokeWidth={1} />}
            <text
              x={p.x + R + 8}
              y={p.y + 4}
              fill={hot ? "#ffffff" : "#a3a3a3"}
              fontSize={12}
              fontFamily="var(--font-geist-mono), monospace"
            >
              {n.variant_name ? `// ${n.variant_name}` : n.base_name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
