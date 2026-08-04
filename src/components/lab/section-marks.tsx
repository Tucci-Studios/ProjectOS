"use client";

import { CATEGORY_META, GROUPS, groupOf } from "@/lib/categories";

/**
 * Original marks for the sections.
 *
 * The problem: half these sections are "things for product X", and the only
 * honest picture of product X is its logo — which we can't use, and shouldn't.
 * A generic sparkle or plug tells you nothing about whether it's a Claude Skill
 * or an MCP server.
 *
 * Three systems that get around it, all drawn from scratch:
 *
 *   Monogram — set the thing in type. `.md`, `>_`, `{}` are what these actually
 *              look like when you use them, so they need no learning.
 *   Glyph    — one abstract shape per section, built from a shared vocabulary of
 *              dots, bars and rings so the ten read as one family.
 *   Slot     — a common frame with a different fill, so what varies is small and
 *              the set stays extremely consistent.
 */

type MarkProps = { slug: string; size?: number; color: string };

/* ── 01 · Monogram ────────────────────────────────────────────── */

const TEXT: Record<string, string> = {
  "claude-skills": "SK",
  "claude-md": ".md",
  "mcp-servers": "MCP",
  "local-llms": "LLM",
  codex: ">_",
  grok: "xA",
  "claude-code": "{}",
  "scripts-tools": "$",
  apps: "▢",
  games: "▶",
};

export function Monogram({ slug, size = 18, color }: MarkProps) {
  const t = TEXT[slug] ?? "?";
  return (
    <span
      className="font-mono font-bold leading-none tracking-tight"
      style={{ color, fontSize: t.length > 2 ? size * 0.52 : size * 0.7 }}
      aria-hidden
    >
      {t}
    </span>
  );
}

/* ── 02 · Glyph ───────────────────────────────────────────────── */

/** Every shape is dots, bars and rings on a 24 grid, so the set stays a family. */
const GLYPH: Record<string, React.ReactNode> = {
  // a taught trick: one node teaching three
  "claude-skills": (
    <>
      <circle cx="7" cy="12" r="3" />
      <path d="M11 12h3M14 12l3-4M14 12l3 4" strokeWidth="1.6" fill="none" />
      <circle cx="18.5" cy="7.5" r="1.6" />
      <circle cx="18.5" cy="16.5" r="1.6" />
    </>
  ),
  // a page of rules
  "claude-md": (
    <>
      <rect x="5" y="4" width="14" height="16" rx="2" fill="none" strokeWidth="1.6" />
      <path d="M8 9h5M8 12.5h8M8 16h6" strokeWidth="1.6" />
    </>
  ),
  // two things joined
  "mcp-servers": (
    <>
      <circle cx="7" cy="12" r="3" fill="none" strokeWidth="1.6" />
      <circle cx="17" cy="12" r="3" fill="none" strokeWidth="1.6" />
      <path d="M10 12h4" strokeWidth="1.8" />
    </>
  ),
  // a model sitting on your own box
  "local-llms": (
    <>
      <rect x="4" y="13" width="16" height="7" rx="1.5" fill="none" strokeWidth="1.6" />
      <circle cx="12" cy="7" r="3" fill="none" strokeWidth="1.6" />
      <path d="M12 10v3" strokeWidth="1.6" />
    </>
  ),
  // a prompt
  codex: (
    <>
      <path d="M6 8l4 4-4 4" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 16h5" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  // a crossing
  grok: (
    <>
      <path d="M6 6l12 12M18 6L6 18" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2.4" />
    </>
  ),
  // code being written for you
  "claude-code": (
    <>
      <path d="M9 7L4.5 12 9 17" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 7l4.5 5-4.5 5" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="1.4" />
    </>
  ),
  // one command, one result
  "scripts-tools": (
    <>
      <path d="M5 12h6" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14 8l5 4-5 4" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  // a window
  apps: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" fill="none" strokeWidth="1.6" />
      <path d="M4 9h16" strokeWidth="1.6" />
      <circle cx="7" cy="7" r="0.9" />
    </>
  ),
  // a thing you press
  games: (
    <>
      <rect x="3" y="8" width="18" height="9" rx="4.5" fill="none" strokeWidth="1.6" />
      <path d="M7.5 12.5h3M9 11v3" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="16" cy="12.5" r="1.3" />
    </>
  ),
};

export function Glyph({ slug, size = 18, color }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} aria-hidden>
      {GLYPH[slug] ?? <circle cx="12" cy="12" r="3" />}
    </svg>
  );
}

/* ── 03 · Slot ────────────────────────────────────────────────── */

/** Same frame every time; only the pattern inside changes. */
const SLOT: Record<string, React.ReactNode> = {
  "claude-skills": <circle cx="12" cy="12" r="3.2" />,
  "claude-md": <path d="M8 9h8M8 12h8M8 15h5" strokeWidth="1.8" strokeLinecap="round" />,
  "mcp-servers": <path d="M8 12h8M12 8v8" strokeWidth="1.8" strokeLinecap="round" />,
  "local-llms": <rect x="8.5" y="8.5" width="7" height="7" rx="1" />,
  codex: <path d="M9 9l3 3-3 3M14 15h2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
  grok: <path d="M9 9l6 6M15 9l-6 6" strokeWidth="1.8" strokeLinecap="round" />,
  "claude-code": <path d="M10 9l-3 3 3 3M14 9l3 3-3 3" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  "scripts-tools": <path d="M8 12h8" strokeWidth="1.8" strokeLinecap="round" />,
  apps: <rect x="8.5" y="8.5" width="7" height="7" rx="1.5" fill="none" strokeWidth="1.7" />,
  games: <path d="M12 8.5l3.2 5.5H8.8z" />,
};

export function Slot({ slug, size = 18, color }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke={color} strokeOpacity="0.35" strokeWidth="1.3" />
      <g>{SLOT[slug] ?? <circle cx="12" cy="12" r="3" />}</g>
    </svg>
  );
}

/* ── the comparison ───────────────────────────────────────────── */

const SYSTEMS = [
  {
    key: "monogram",
    name: "Monogram",
    note: "Set the thing in type. `.md`, `>_` and `{}` are literally what these look like when you use them, so nothing has to be learned — and it sidesteps the logo problem entirely. Weakest where there's no obvious shorthand, like Grok.",
    Mark: Monogram,
  },
  {
    key: "glyph",
    name: "Glyph",
    note: "One drawn shape per section, all built from the same dots, bars and rings so the ten read as a set. Most characteristic and the most work to learn — a new person won't know what any of them mean until they've clicked once.",
    Mark: Glyph,
  },
  {
    key: "slot",
    name: "Slot",
    note: "A shared frame with a different fill each time. The most consistent of the three by a distance, and the least informative — at a glance you see the frame, not the difference.",
    Mark: Slot,
  },
];

export function SectionMarks() {
  return (
    <div className="space-y-4">
      {SYSTEMS.map((sys, i) => (
        <section key={sys.key} className="overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900/30">
          <header className="border-b border-neutral-800 px-5 py-3">
            <h2 className="flex items-baseline gap-2.5 font-mono text-[15px] font-bold text-white">
              <span className="text-neutral-600">{String(i + 1).padStart(2, "0")}</span>
              {sys.name}
            </h2>
            <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-neutral-400">{sys.note}</p>
          </header>

          <div className="flex flex-wrap gap-x-5 gap-y-4 p-5">
            {CATEGORY_META.map((c) => {
              const hex = GROUPS[groupOf(c.slug).key].hex;
              return (
                <div key={c.slug} className="flex w-[104px] flex-col items-center gap-1.5">
                  <span
                    className="relative flex h-[52px] w-11 items-center justify-center overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900 pl-[3px]"
                    title={c.label}
                  >
                    <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: hex }} aria-hidden />
                    <sys.Mark slug={c.slug} color={hex} size={18} />
                  </span>
                  <span className="text-center font-mono text-[10px] leading-tight text-neutral-500">{c.label}</span>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
