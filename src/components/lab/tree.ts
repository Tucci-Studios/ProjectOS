import type { LabNode } from "@/lib/lab-data";

export type T = LabNode & { children: T[]; total: number; best: number; maxDepth: number };

/** Build the tree and annotate every node with subtree size, best score and depth. */
export function build(nodes: LabNode[]): T | null {
  const map = new Map<string, T>();
  for (const n of nodes) map.set(n.id, { ...n, children: [], total: 1, best: n.like_count, maxDepth: 0 });
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
    t.maxDepth = t.children.length ? 1 + Math.max(...t.children.map((c) => c.maxDepth)) : 0;
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

/** Rounded so server and client agree — raw floats differ in the last digit. */
export const px = (n: number) => Math.round(n * 100) / 100;

export const GOLD = "#fcd34d";
export const SILVER = "#cbd5e1";
export const BRONZE = "#d4a373";
export const ACCENT = "#34d399";

export const medal = (rank: number) => (rank === 1 ? GOLD : rank === 2 ? SILVER : rank === 3 ? BRONZE : null);

/** Size by RANK, so #1 always looks biggest even when scores are close. */
export const radius = (rank: number) => px(4 + 12 * Math.pow(1 / rank, 0.35));
