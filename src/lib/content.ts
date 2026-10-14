import { REPLACE_CARDS, NOW_STORIES } from "@/generated/content";

/**
 * Content that lives in the repository rather than the database.
 *
 * A Replace card or a story is a file under content/. That's deliberate: it
 * means "fix this" is a pull request anyone can open from GitHub's web editor,
 * with review and history, and no account on this site needed.
 */
export type Verdict = "yes" | "partly" | "no";

export type ReplaceCard = {
  slug: string;
  /** Neutral description of the category, never a product name. */
  title: string;
  /** The products people actually pay for. Shown as "like X", never as ours. */
  examples: string[];
  costPerYear: number;
  verdict: Verdict;
  oneLine: string;
  why: string;
  tool: string;
  hours: number;
  keep: string;
  breaks: string;
  sources: { label: string; url: string }[];
  verified: string;
  file: string;
};

export type Story = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  sources: { label: string; url: string }[];
  body: string;
  file: string;
};

export const VERDICT: Record<Verdict, { label: string; short: string; hex: string; blurb: string }> = {
  yes: { label: "Yes, build it", short: "Yes", hex: "#34d399", blurb: "A beginner can rebuild the part they actually use, usually in a day." },
  partly: { label: "Partly", short: "Partly", hex: "#f5b544", blurb: "Building it is easy. Keeping it working is the real cost." },
  no: { label: "No, use free software", short: "No", hex: "#fb7185", blurb: "Not yet, or not safely. A free alternative already exists." },
};

export function replaceCards(): ReplaceCard[] {
  const order: Verdict[] = ["yes", "partly", "no"];
  return [...REPLACE_CARDS].sort((a, b) => order.indexOf(a.verdict) - order.indexOf(b.verdict) || b.costPerYear - a.costPerYear);
}
export function replaceCard(slug: string): ReplaceCard | undefined {
  return REPLACE_CARDS.find((c) => c.slug === slug);
}
export function stories(): Story[] {
  return NOW_STORIES;
}
export function story(slug: string): Story | undefined {
  return NOW_STORIES.find((s) => s.slug === slug);
}
