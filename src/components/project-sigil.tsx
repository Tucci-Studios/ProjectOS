import { groupOf } from "@/lib/categories";

// Every project gets a recognizable tile — deterministic from its name, so the
// same project always looks the same and you learn to spot it at a glance.
// No uploads required, which matters when most projects are text repos.

const PATTERNS = ["circuit", "grid", "waves", "blocks", "rings"] as const;

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initials(name: string): string {
  const words = name.replace(/[^\w\s.]/g, " ").split(/[\s.]+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function ProjectSigil({
  name,
  category,
  size = 48,
}: {
  name: string;
  category: string;
  size?: number;
}) {
  const g = groupOf(category);
  const h = hash(name);
  const pattern = PATTERNS[h % PATTERNS.length];
  const rotate = (h >> 3) % 4;
  const id = `sig-${h.toString(36)}`;

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-xl border"
      style={{
        width: size,
        height: size,
        borderColor: `${g.hex}40`,
        background: `linear-gradient(135deg, ${g.hex}22, #0d120f 70%)`,
      }}
      aria-hidden
    >
      <svg width={size} height={size} viewBox="0 0 48 48" className="absolute inset-0 opacity-45">
        <defs>
          <pattern id={id} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform={`rotate(${rotate * 45})`}>
            {pattern === "circuit" && (
              <path d="M0 6 H5 M7 6 H12 M6 0 V5 M6 7 V12" stroke={g.hex} strokeWidth="1" fill="none" />
            )}
            {pattern === "grid" && <path d="M0 0 H12 M0 0 V12" stroke={g.hex} strokeWidth="0.8" fill="none" />}
            {pattern === "waves" && (
              <path d="M0 6 q3 -4 6 0 t6 0" stroke={g.hex} strokeWidth="1" fill="none" />
            )}
            {pattern === "blocks" && <rect x="1" y="1" width="5" height="5" fill={g.hex} opacity="0.7" />}
            {pattern === "rings" && <circle cx="6" cy="6" r="3.5" stroke={g.hex} strokeWidth="1" fill="none" />}
          </pattern>
        </defs>
        <rect width="48" height="48" fill={`url(#${id})`} />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-mono font-bold tracking-tight"
        style={{ color: g.hex, fontSize: size * 0.34, textShadow: `0 0 12px ${g.hex}55` }}
      >
        {initials(name)}
      </span>
    </div>
  );
}
