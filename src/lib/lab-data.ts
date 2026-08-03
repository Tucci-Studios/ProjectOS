import type { LineageNode } from "./queries";

export type LabNode = LineageNode & { created_at: number };

/**
 * A fake project with a real-feeling fork tree, for designing views against.
 *
 * Deterministic on purpose — a seeded PRNG rather than Math.random — so the
 * server and the client draw the identical tree and React doesn't complain
 * about hydration. Same seed, same tree, every time.
 */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

const HANDLES = [
  "nyx", "patchcable", "solder", "vhs-ghost", "mothlight", "kilobyte", "rustbelt", "anode",
  "gutterpunk", "wirefox", "halcyon", "deadlink", "quartz", "byte-me", "nullptr", "sunkcost",
  "riverbed", "tinfoil", "chromeless", "spindle", "lofi-cat", "grimoire", "pixelrot", "ember",
];

const CHANGES = [
  "Swapped the renderer for something that doesn't melt laptops.",
  "Added controller support.",
  "Rewrote the save system — no more corrupt files.",
  "Made it work offline.",
  "Cut the dependency count from 40 to 3.",
  "Added a level editor.",
  "Ported it to the browser.",
  "Added multiplayer. It barely works, but it works.",
  "Made the whole thing 4x faster.",
  "Added mod support.",
  "Stripped it to the smallest version that still does the job.",
  "Accessibility pass: keyboard-only play, real focus states.",
  "Replaced the art with something less ugly.",
  "Fixed the thing everyone complained about.",
];

const VARIANTS = [
  "Cyber", "Lite", "Neon", "Zero", "Prime", "Noir", "Turbo", "Mini", "Deep", "Ghost", "Iron",
  "Solar", "Void", "Echo", "Drift", "Ember", "Onyx", "Halo", "Rift", "Nova", "Pulse", "Vapor",
  "Slate", "Flux", "Cinder", "Static", "Bloom", "Quartz", "Tundra", "Verve",
];

export type LabShape = "small" | "wide" | "deep" | "monster";

export const SHAPES: { key: LabShape; label: string; blurb: string }[] = [
  { key: "small", label: "Small", blurb: "12 forks — the happy case everything looks fine in." },
  { key: "wide", label: "Wide", blurb: "100 forks off ONE parent. The case that breaks lists." },
  { key: "deep", label: "Deep", blurb: "A 14-deep chain. The case that breaks indentation." },
  { key: "monster", label: "Monster", blurb: "260 forks, lumpy and uneven. The realistic worst case." },
];

/** How many children each node gets, by shape. */
function spread(shape: LabShape, depth: number, r: () => number): number {
  switch (shape) {
    case "small":
      return depth >= 3 ? 0 : Math.floor(r() * 3);
    case "wide":
      if (depth === 0) return 100;
      return depth >= 2 ? 0 : r() < 0.15 ? 1 : 0;
    case "deep":
      if (depth >= 14) return 0;
      return r() < 0.22 ? 2 : 1;
    case "monster": {
      if (depth === 0) return 9;
      if (depth >= 6) return 0;
      const roll = r();
      if (roll < 0.55) return 0;
      if (roll < 0.9) return 1 + Math.floor(r() * 3);
      return 8 + Math.floor(r() * 26);
    }
  }
}

const CAP = 400;
const DAY = 86_400;

/** The fake project every lab view is built against. */
export const LAB_PROJECT = {
  name: "Subwolf",
  repo: "nyx/subwolf",
  description: "A neon stealth game about a wolf that hacks security systems.",
};

export function labLineage(shape: LabShape): LabNode[] {
  const r = rng({ small: 7, wide: 21, deep: 88, monster: 404 }[shape]);
  const base = LAB_PROJECT.name;
  // Fixed epoch, not Date.now() — timestamps must not shift between renders.
  const EPOCH = 1_780_000_000;

  const out: LabNode[] = [
    {
      id: "lab-0",
      base_name: base,
      variant_name: null,
      parent_id: null,
      change_summary: "Where this all started.",
      child_count: 0,
      github_login: HANDLES[0],
      like_count: 240 + Math.floor(r() * 90),
      depth: 0,
      created_at: EPOCH,
    },
  ];

  let n = 1;
  const queue: LabNode[] = [out[0]];
  while (queue.length && out.length < CAP) {
    const parent = queue.shift()!;
    const kids = spread(shape, parent.depth, r);
    for (let i = 0; i < kids && out.length < CAP; i++) {
      const variant = VARIANTS[Math.floor(r() * VARIANTS.length)];
      const node: LabNode = {
        id: `lab-${n}`,
        base_name: base,
        variant_name: `${variant}${n % 7 === 0 ? " " + (1 + (n % 4)) : ""}`,
        parent_id: parent.id,
        change_summary: CHANGES[Math.floor(r() * CHANGES.length)],
        child_count: 0,
        github_login: HANDLES[Math.floor(r() * HANDLES.length)],
        like_count: Math.max(
          -4,
          Math.floor(r() ** 2.2 * 220 * Math.max(0.15, 1 - parent.depth * 0.1)) - (r() < 0.06 ? 9 : 0),
        ),
        depth: parent.depth + 1,
          // Children always come after their parent, so a timeline reads forward.
        created_at: parent.created_at + Math.floor(r() * 40 + 3) * DAY,
      };
      parent.child_count++;
      out.push(node);
      queue.push(node);
      n++;
    }
  }
  return out;
}

