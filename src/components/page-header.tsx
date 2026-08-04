import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Every page states three things: where you are (breadcrumb), what this page is
// (title), and what it's for (one plain-English line). Newcomers get oriented;
// pros can ignore it.

export type Crumb = { label: string; href?: string };

export function PageHeader({
  crumbs = [],
  title,
  purpose,
  Icon,
  accent = "text-emerald-400",
  glyph,
  action,
}: {
  crumbs?: Crumb[];
  title: string;
  purpose: string;
  Icon?: LucideIcon;
  accent?: string;
  /** Rendered instead of Icon — for sections whose mark is type, not a drawing. */
  glyph?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-6 border-b border-neutral-800 pb-5">
      {crumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 font-mono text-xs text-neutral-500">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={12} className="text-neutral-700" aria-hidden />}
              {c.href ? (
                <Link href={c.href} className="rounded px-1 py-0.5 transition hover:text-neutral-200">
                  {c.label}
                </Link>
              ) : (
                <span className="px-1 py-0.5 text-neutral-400">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 font-mono text-2xl font-bold tracking-tight text-white">
            {glyph ?? (Icon && <Icon size={22} className={accent} aria-hidden />)}
            {title}
          </h1>
          <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-400">{purpose}</p>
        </div>
        {action}
      </div>
    </header>
  );
}
