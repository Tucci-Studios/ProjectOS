import { categoryMeta } from "@/lib/categories";

/**
 * Marks drawn here rather than pulled from the icon set, where nothing in a
 * library says the thing properly.
 *
 * Apps is a file with APP written on it — a page with a folded corner, which
 * pairs with the `.md` mark next to it: both say "this is a kind of file".
 */
const DRAWN: Record<string, (color: string) => React.ReactNode> = {
  apps: (c) => (
    <>
      {/* The page fills nearly the whole box so APP has room to be legible at
          18px — the first attempt left it unreadable on a card. */}
      <path d="M3.5 2h9.5L20.5 9.5V22H3.5z" fill="none" stroke={c} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M13 2v7.5h7.5" fill="none" stroke={c} strokeWidth="1.7" strokeLinejoin="round" />
      <text
        x="12"
        y="19.2"
        textAnchor="middle"
        fill={c}
        fontSize="9.4"
        fontWeight="700"
        fontFamily="ui-monospace, SFMono-Regular, monospace"
        letterSpacing="-0.8"
      >
        APP
      </text>
    </>
  ),
};

/**
 * A section's mark — short type where it has an obvious written form, its icon
 * where it doesn't.
 *
 * One component so the card tile and the sidebar can't drift apart: change a
 * mark in the category table and both follow.
 */
export function SectionMark({
  category,
  size = 18,
  color,
  className = "",
}: {
  category: string;
  size?: number;
  color: string;
  className?: string;
}) {
  const meta = categoryMeta(category);

  const drawn = DRAWN[category];
  if (drawn)
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
        {drawn(color)}
      </svg>
    );

  if (meta.mark)
    return (
      <span
        className={`font-mono font-bold leading-none tracking-tight ${className}`}
        // Longer marks step down so "MCP" and ".md" occupy the same optical
        // width as a single glyph would.
        style={{ color, fontSize: size * (meta.mark.length > 2 ? 0.62 : 0.8) }}
        aria-hidden
      >
        {meta.mark}
      </span>
    );

  return <meta.Icon size={size} strokeWidth={1.7} style={{ color }} className={className} aria-hidden />;
}
