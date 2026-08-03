"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { CATEGORY_META, CATEGORY_GROUPS } from "@/lib/categories";

// The sidebar is a tree: a trunk line down the left, one branch per group,
// each opening to its sections. Collapsed by default; the branch you're on
// opens itself.

export function SectionsNav({ counts, total }: { counts: Record<string, number>; total: number }) {
  const pathname = usePathname();
  const activeSlug = pathname.startsWith("/s/") ? pathname.slice(3) : undefined;
  const activeGroup = CATEGORY_META.find((c) => c.slug === activeSlug)?.group;

  const [open, setOpen] = useState<Record<string, boolean>>(
    Object.fromEntries(CATEGORY_GROUPS.map((g) => [g, g === activeGroup])),
  );

  const groupCount = (group: string) =>
    CATEGORY_META.filter((c) => c.group === group).reduce((sum, c) => sum + (counts[c.slug] ?? 0), 0);

  return (
    <nav aria-label="Sections">
      {/* Trunk */}
      <Link
        href="/projects"
        className={`flex min-h-[44px] items-center justify-between gap-2 rounded-lg px-3 font-mono text-sm font-bold outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 ${
          pathname === "/projects"
            ? "bg-emerald-400/10 text-emerald-300"
            : "text-neutral-100 hover:bg-neutral-800"
        }`}
      >
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_currentColor]" aria-hidden />
          all projects
        </span>
        <span className="text-xs font-normal text-neutral-500">{total}</span>
      </Link>

      <div className="relative mt-1 pl-3">
        {/* the trunk line every branch hangs off */}
        <span className="absolute left-[7px] top-0 bottom-4 w-px bg-neutral-700" aria-hidden />

        {CATEGORY_GROUPS.map((group) => {
          const isOpen = open[group];
          const sections = CATEGORY_META.filter((c) => c.group === group);
          return (
            <div key={group} className="relative">
              {/* elbow from trunk to this branch */}
              <span className="absolute left-[-5px] top-[21px] h-px w-3 bg-neutral-700" aria-hidden />
              <button
                onClick={() => setOpen((o) => ({ ...o, [group]: !o[group] }))}
                aria-expanded={isOpen}
                className="flex min-h-[42px] w-full cursor-pointer items-center justify-between gap-2 rounded-lg pl-3 pr-2 font-mono text-sm text-neutral-200 outline-none transition duration-200 hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <span className="flex items-center gap-1.5">
                  <ChevronRight
                    size={14}
                    aria-hidden
                    className={`transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                  />
                  {group}
                </span>
                <span className="text-xs text-neutral-500">{groupCount(group)}</span>
              </button>

              {isOpen && (
                <div className="relative pl-4">
                  <span className="absolute left-[9px] top-0 bottom-3 w-px bg-neutral-800" aria-hidden />
                  {sections.map((c) => {
                    const isActive = activeSlug === c.slug;
                    return (
                      <Link
                        key={c.slug}
                        href={`/s/${c.slug}`}
                        aria-current={isActive ? "page" : undefined}
                        className={`relative flex min-h-[38px] cursor-pointer items-center justify-between gap-2 rounded-lg pl-4 pr-2 font-mono text-[13px] outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                          isActive ? `bg-neutral-800 ${c.text}` : "text-neutral-400 hover:bg-neutral-800/60 hover:text-white"
                        }`}
                      >
                        <span className="absolute left-[-7px] top-1/2 h-px w-3 bg-neutral-800" aria-hidden />
                        <span className="flex items-center gap-2">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${c.dot} ${isActive ? "shadow-[0_0_6px_currentColor]" : "opacity-60"}`}
                            aria-hidden
                          />
                          {c.label}
                        </span>
                        <span className={`text-xs ${isActive ? c.text : "text-neutral-600"}`}>{counts[c.slug] ?? 0}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
