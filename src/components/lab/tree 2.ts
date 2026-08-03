import type { LineageNode } from "@/lib/queries";

export type T = LineageNode & { children: T[]; total: number; best: number };

/** Build the tree and annotate every node with subtree size and best score below it. */
export function build(nodes: LineageNode[]): T | null {
  const map = new Map<string, T>();
  for (const n of nodes) map.set(n.id, { ...n, children: [], total: 1, best: n.like_count });
  let root: T | null = null;
  for (const n of nodes) {
    const t = map.get(n.id)!;
    if (n.parent_id && map.has(n.parent_id)) map.get(n.parent_id)!.children.push(t);
    else root ??= t;
  }
  const measure = (t: T): T => {
    for (const c of t.children) measure(c);
    t.total = 1 + t.children.reduce((s, c) => s + c.total, 0);
    t.best = Math.max(t.like_count, ...t.children.map((c) => c.best));
    return t;
  };
  return root ? measure(root) : null;
}

export const name = (t: T) => t.variant_name ?? t.base_name;

export function flatten(t: T, out: T[] = []): T[] {
  out.push(t);
  for (const c of t.children) flatten(c, out);
  return out;
}

/** The single highest-scoring root-to-leaf path — the "main line" of a lineage. */
export function spine(t: T): T[] {
  const path = [t];
  let cur = t;
  while (cur.children.length) {
    cur = cur.children.reduce((a, b) => (b.best > a.best ? b : a));
    path.push(cur);
  }
  return path;
}

export function pathTo(root: T, id: string): T[] {
  const walk = (t: T, acc: T[]): T[] | null => {
    const next = [...acc, t];
    if (t.id === id) return next;
    for (const c of t.children) {
      const hit = walk(c, next);
      if (hit) return hit;
    }
    return null;
  };
  return walk(root, []) ?? [];
}

export const byVotes = (a: T, b: T) => b.like_count - a.like_count;
export const bySubtree = (a: T, b: T) => b.total - a.total;

/** Depth of the deepest node. */
export const maxDepth = (t: T): number => (t.children.length ? 1 + Math.max(...t.children.map(maxDepth)) : 0);
