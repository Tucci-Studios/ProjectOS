"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical, ChevronRight, Compass, Lightbulb, Rss, Flame, Sparkles, Megaphone } from "lucide-react";
import { GROUPS, GROUP_ORDER, sectionsIn, categoryMeta } from "@/lib/categories";

// Three doors: AI, Build, Play. Each opens to its sections. The group you're in
// stays open and wears its color down the whole spine, so an expanded group is
// unmistakable.

export function SectionsNav() {
  const pathname = usePathname();
  const activeSlug = pathname.startsWith("/s/") ? pathname.split("/")[2] : undefined;
  const activeGroup = activeSlug ? categoryMeta(activeSlug).group : undefined;

  const [open, setOpen] = useState<Record<string, boolean>>(
    Object.fromEntries(GROUP_ORDER.map((g) => [g, g === activeGroup])),
  );

  const MAIN = [
    { href: "/", label: "Feed", Icon: Rss, exact: true },
    { href: "/popular", label: "Popular", Icon: Flame },
    { href: "/explore", label: "Explore", Icon: Sparkles },
    { href: "/news", label: "News", Icon: Megaphone },
  ];

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
              className={`flex min-h-[40px] items-center gap-2.5 rounded-lg px-3 font-mono text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                active ? "bg-emerald-400/10 font-bold text-emerald-300" : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
              }`}
            >
              <Icon size={16} aria-hidden /> {label}
            </Link>
          );
        })}
      </div>

      <Link
        href="/popular"
        aria-current={pathname === "/popular" ? "page" : undefined}
        className={`flex min-h-[42px] items-center gap-2.5 rounded-lg px-3 font-mono text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 ${
          pathname === "/popular"
            ? "bg-emerald-400/10 font-bold text-emerald-300"
            : "text-neutral-200 hover:bg-neutral-800"
        }`}
      >
        <Compass size={16} aria-hidden /> Everything
      </Link>

      {GROUP_ORDER.map((key) => {
        const g = GROUPS[key];
        const isOpen = open[key];
        const isActiveGroup = activeGroup === key;

        return (
          <div
            key={key}
            className={`overflow-hidden rounded-lg border transition-colors duration-200 ${
              isOpen ? "border-neutral-700 bg-neutral-900/60" : "border-transparent"
            }`}
          >
            <button
              onClick={() => setOpen((o) => ({ ...o, [key]: !o[key] }))}
              aria-expanded={isOpen}
              className="flex min-h-[44px] w-full cursor-pointer items-center gap-2 px-3 text-left outline-none transition-colors duration-200 hover:bg-neutral-800/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400"
            >
              <g.Icon size={15} strokeWidth={2} className={`shrink-0 ${isOpen || isActiveGroup ? g.text : "text-neutral-500"}`} aria-hidden />
              <span className={`flex-1 font-mono text-sm font-bold ${isOpen || isActiveGroup ? g.text : "text-neutral-300"}`}>
                {g.label}
              </span>
              <ChevronRight
                size={14}
                aria-hidden
                className={`text-neutral-500 transition-transform duration-200 ease-out ${isOpen ? "rotate-90" : ""}`}
              />
            </button>

            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="px-3 pb-2 text-[11px] leading-snug text-neutral-500">{g.blurb}</p>
                <div className="relative pb-2 pl-3">
                  {/* group-colored spine */}
                  <span
                    className="absolute left-[15px] top-0 bottom-3 w-px opacity-40"
                    style={{ background: g.hex }}
                    aria-hidden
                  />
                  {sectionsIn(key).map((c) => {
                    const isActive = activeSlug === c.slug;
                    return (
                      <Link
                        key={c.slug}
                        href={`/s/${c.slug}`}
                        aria-current={isActive ? "page" : undefined}
                        tabIndex={isOpen ? undefined : -1}
                        className={`relative ml-3 flex min-h-[36px] items-center rounded-md pl-3 pr-2 font-mono text-[13px] outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                          isActive
                            ? `bg-neutral-800 font-bold ${g.text}`
                            : "text-neutral-400 hover:bg-neutral-800/60 hover:text-white"
                        }`}
                      >
                        {isActive && (
                          <span
                            className="absolute left-[-1px] top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full"
                            style={{ background: g.hex }}
                            aria-hidden
                          />
                        )}
                        <c.Icon size={13} strokeWidth={2} className="mr-2 shrink-0 opacity-80" aria-hidden />
                        {c.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div className="mt-4 border-t border-neutral-800 pt-3">
        <Link
          href="/ideas"
          aria-current={pathname.startsWith("/ideas") ? "page" : undefined}
          className={`flex min-h-[42px] items-center gap-2.5 rounded-lg px-3 font-mono text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 ${
            pathname.startsWith("/ideas")
              ? "bg-amber-400/10 font-bold text-amber-300"
              : "text-neutral-300 hover:bg-neutral-800"
          }`}
        >
          <Lightbulb size={16} aria-hidden /> Ideas
        </Link>
        <Link
          href="/lab"
          aria-current={pathname.startsWith("/lab") ? "page" : undefined}
          className={`flex min-h-[42px] items-center gap-2.5 rounded-lg px-3 font-mono text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 ${
            pathname.startsWith("/lab")
              ? "bg-amber-400/10 font-bold text-amber-300"
              : "text-neutral-300 hover:bg-neutral-800"
          }`}
        >
          <FlaskConical size={16} aria-hidden /> Lab
        </Link>
      </div>
    </nav>
  );
}
