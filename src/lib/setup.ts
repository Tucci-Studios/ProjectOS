import { TONES, type Tone } from "@/lib/tone";

/**
 * How much work is it to get this running?
 *
 * The scariest thing about an unfamiliar repo isn't understanding it, it's
 * cloning it and losing an afternoon to a setup failure that had nothing to do
 * with the idea. Every fact here is read off the repository's own root file
 * listing, so the answer is checkable rather than a guess — and the UI shows
 * the facts, not just the verdict, so nobody has to trust a score they can't
 * see the reasoning for.
 *
 * Deliberately conservative: this says what the files imply and nothing more.
 * A Dockerfile means someone described how to build it, not that it will work.
 */

export type SetupFacts = {
  /** A Dockerfile or compose file — the closest thing to a guarantee. */
  containerized: boolean;
  /** A lockfile: the dependency versions are pinned, so they resolve the same today. */
  pinnedDeps: boolean;
  /** A dependency manifest of any kind, i.e. there's a defined install step. */
  installs: boolean;
  /** An example env/config file — it needs configuring before it runs. */
  needsConfig: boolean;
  /** A Makefile or task runner — there's a named command to start it. */
  hasCommands: boolean;
  /** A readme worth reading. */
  documented: boolean;
  /** Ecosystem we detected, for the install hint. */
  stack: string | null;
};

export type SetupTier = "easy" | "some" | "rough" | "unknown";

const LOCKFILES = [
  "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "bun.lockb",
  "poetry.lock", "pdm.lock", "uv.lock", "cargo.lock", "go.sum",
  "gemfile.lock", "composer.lock", "requirements.txt",
];

const MANIFESTS: [string, string][] = [
  ["package.json", "Node"], ["pyproject.toml", "Python"], ["requirements.txt", "Python"],
  ["setup.py", "Python"], ["cargo.toml", "Rust"], ["go.mod", "Go"],
  ["gemfile", "Ruby"], ["composer.json", "PHP"], ["pom.xml", "Java"],
  ["build.gradle", "Java"], ["pubspec.yaml", "Dart"],
];

const CONFIG_HINTS = [".env.example", ".env.sample", ".env.template", "config.example.yml", "config.example.yaml", "config.example.json", ".env.local.example"];

/** Read the facts off a root-level file listing. Names are lowercased. */
export function readSetupFacts(names: string[], readmeBytes: number): SetupFacts {
  const has = (n: string) => names.includes(n);
  const stack = MANIFESTS.find(([f]) => has(f))?.[1] ?? null;

  return {
    containerized: has("dockerfile") || names.some((n) => n.startsWith("docker-compose") || n === "compose.yml" || n === "compose.yaml"),
    pinnedDeps: LOCKFILES.some(has),
    installs: MANIFESTS.some(([f]) => has(f)),
    needsConfig: CONFIG_HINTS.some(has),
    hasCommands: has("makefile") || has("justfile") || has("taskfile.yml") || has("package.json"),
    documented: readmeBytes > 800,
    stack,
  };
}

/**
 * The verdict.
 *
 * Weighted toward the two things that actually decide whether a stranger gets
 * it running: is it containerised, and are the dependency versions pinned.
 * Everything else is a tiebreaker.
 */
export function setupTier(f: SetupFacts): SetupTier {
  // Nothing to install and nothing to build — a library, docs, or set up by hand.
  if (!f.installs && !f.containerized) return "unknown";

  // The two things that actually decide whether a stranger gets it running.
  const reproducible = f.containerized || (f.installs && f.pinnedDeps);
  if (!reproducible || !f.documented) return "rough";

  // Reproducible and documented, but it wants API keys or a config file before
  // it does anything. That's a real afternoon's difference and deserves saying.
  return f.needsConfig ? "some" : "easy";
}

/**
 * Tiers map onto the site's status tones rather than picking their own colours:
 * ok / info / caution / muted. That's why a green chip here means the same
 * thing a green banner means anywhere else.
 */
export const TIER_TONE: Record<SetupTier, Tone> = {
  easy: "ok",
  some: "info",
  rough: "caution",
  unknown: "muted",
};

export const TIER_COPY: Record<SetupTier, { label: string; blurb: string; hex: string }> = {
  easy: {
    label: "Should just run",
    blurb: "Pinned dependencies and instructions. The usual reasons a clone fails aren't here.",
    hex: TONES.ok.hex,
  },
  some: {
    label: "Runs after config",
    blurb: "Pinned and documented, but it ships an example config — expect to supply keys or settings first.",
    hex: TONES.info.hex,
  },
  rough: {
    label: "Expect to dig",
    blurb: "There's an install step, but versions aren't pinned or there's no real readme. Budget an evening.",
    hex: TONES.caution.hex,
  },
  unknown: {
    label: "No install step found",
    blurb: "We couldn't find a dependency manifest at the repo root. It may be a library, docs, or set up by hand.",
    hex: TONES.muted.hex,
  },
};
