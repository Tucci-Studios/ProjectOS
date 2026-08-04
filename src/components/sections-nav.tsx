"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollText, Compass, Bookmark, FlaskConical, Lightbulb, Megaphone } from "lucide-react";
import { GROUPS, GROUP_ORDER, categoryMeta } from "@/lib/categories";

/**
 * The rail: three fixed rows for the site, three for the groups, three for
 * personal things.
 *
 * The groups used to unfold their sections here. They're pages now — clicking
 * AI takes you to AI, where the sections are laid out with their counts — so
 * the rail stays the same height whatever you're looking at, and the sections
 * get room to explain themselves instead of being a cramped list.
 */
export function SectionsNav() {
  const pathname = usePathname();
  const activeSlug = pathname.startsWith("/s/") ? pathname.split("/")[2] : undefined;
  const activeGroup = pathname.startsWith("/g/")
    ? pathname.split("/")[2]
    : activeSlug
      ? categoryMeta(activeSlug).group
      : undefined;

  const MAIN = [
    { href: "/", label: "Feed", Icon: ScrollText, exact: true },
    { href: "/explore", label: "Explore", Icon: Compass },
    { href: "/news", label: "News", Icon: Megaphone },
  ];

  const MINE = [
    { href: "/saves", label: "Saves", Icon: Bookmark, tone: "text-sky-300", bg: "bg-sky-400/10" },
    { href: "/ideas", label: "Ideas", Icon: Lightbulb, tone: "text-amber-300", bg: "bg-amber-400/10" },
    { href: "/lab", label: "Lab", Icon: FlaskConical, tone: "text-amber-300", bg: "bg-amber-400/10" },
  ];

  const row =
    "flex min-h-[40px] items-center gap-2.5 rounded-lg px-3 font-mono text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400";

  return (
    <nav aria-label="Browse" className="space-y-1.5">
      <div className="mb-4 space-y-0.5 border-b border-neutral-800 pb-4">
        {MAIN.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`${row} ${
                active
                  ? "bg-emerald-400/10 font-bold text-emerald-300"
                  : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
              }`}
            >
              <Icon size={16} aria-hidden /> {label}
            </Link>
          );
        })}
      </div>

      <div className="space-y-0.5 border-b border-neutral-800 pb-4">
        {GROUP_ORDER.map((key) => {
          const g = GROUPS[key];
          const active = activeGroup === key;
          return (
            <Link
              key={key}
              href={`/g/${key}`}
              aria-current={active ? "page" : undefined}
              title={g.blurb}
              className={`${row} ${active ? `font-bold ${g.text}` : "text-neutral-300 hover:bg-neutral-800 hover:text-white"}`}
              style={active ? { background: `${g.hex}14` } : undefined}
            >
              <g.Icon size={16} style={{ color: active ? g.hex : undefined }} aria-hidden /> {g.label}
            </Link>
          );
        })}
      </div>

      <div className="space-y-0.5 pt-1">
        {MINE.map(({ href, label, Icon, tone, bg }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`${row} ${active ? `${bg} font-bold ${tone}` : "text-neutral-300 hover:bg-neutral-800"}`}
            >
              <Icon size={16} aria-hidden /> {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
