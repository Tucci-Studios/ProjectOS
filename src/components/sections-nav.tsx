"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Boxes, Radio } from "lucide-react";
import { CATEGORY_META, CATEGORY_GROUPS } from "@/lib/categories";

// The sidebar is a tree: a trunk down the left, one branch per group, each
// opening to its sections. No counts — just places to go. The branch you're
// standing on opens itself and stays lit.

export function SectionsNav() {
  const pathname = usePathname();
  const activeSlug = pathname.startsWith("/s/") ? pathname.split("/")[2] : undefined;
  const activeGroup = CATEGORY_META.find((c) => c.slug === activeSlug)?.group;

  const [open, setOpen] = useState<Record<string, boolean>>(
    Object.fromEntries(CATEGORY_GROUPS.map((g) => [g, g === activeGroup])),
  );

  return (
    <nav aria-label="Sections" className="space-y-1">
      <Link
        href="/projects"
        aria-current={pathname === "/projects" ? "page" : undefined}
        className={`flex min-h-[42px] items-center gap-2.5 rounded-lg px-3 font-mono text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 ${
          pathname === "/projects"
            ? "bg-emerald-400/10 font-bold text-emerald-300"
            : "text-neutral-200 hover:bg-neutral-800"
        }`}
      >
        <Boxes size={16} aria-hidden /> All projects
      </Link>

      <div className="relative pl-3">
        <span className="absolute left-[7px] top-1 bottom-5 w-px bg-neutral-800" aria-hidden />

        {CATEGORY_GROUPS.map((group) => {
          const isOpen = open[group];
          const sections = CATEGORY_META.filter((c) => c.group === group);
          return (
            <div key={group} className="relative">
              <span className="absolute left-[-5px] top-[21px] h-px w-3 bg-neutral-800" aria-hidden />
              <button
                onClick={() => setOpen((o) => ({ ...o, [group]: !o[group] }))}
                aria-expanded={isOpen}
                className={`flex min-h-[42px] w-full cursor-pointer items-center gap-1.5 rounded-lg pl-2.5 pr-2 font-mono text-sm outline-none transition-colors duration-200 hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  activeGroup === group ? "text-white" : "text-neutral-300"
                }`}
              >
                <ChevronRight
                  size={14}
                  aria-hidden
                  className={`text-neutral-500 transition-transform duration-200 ease-out ${isOpen ? "rotate-90" : ""}`}
                />
                {group}
              </button>

              <div
                className="grid transition-[grid-template-rows] duration-300 ease-out"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <div className="relative pb-1 pl-4">
                    <span className="absolute left-[9px] top-0 bottom-3 w-px bg-neutral-800" aria-hidden />
                    {sections.map((c) => {
                      const isActive = activeSlug === c.slug;
                      return (
                        <Link
                          key={c.slug}
                          href={`/s/${c.slug}`}
                          aria-current={isActive ? "page" : undefined}
                          tabIndex={isOpen ? undefined : -1}
                          className={`relative flex min-h-[38px] items-center gap-2 rounded-lg pl-4 pr-2 font-mono text-[13px] outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                            isActive
                              ? `bg-neutral-800 font-bold ${c.text}`
                              : "text-neutral-400 hover:bg-neutral-800/60 hover:text-white"
                          }`}
                        >
                          <span className="absolute left-[-7px] top-1/2 h-px w-3 bg-neutral-800" aria-hidden />
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${c.dot} ${isActive ? "shadow-[0_0_6px_currentColor]" : "opacity-50"}`}
                            aria-hidden
                          />
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
      </div>

      <div className="mt-4 border-t border-neutral-800 pt-3">
        <Link
          href="/wire"
          aria-current={pathname.startsWith("/wire") ? "page" : undefined}
          className={`flex min-h-[42px] items-center gap-2.5 rounded-lg px-3 font-mono text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 ${
            pathname.startsWith("/wire")
              ? "bg-sky-400/10 font-bold text-sky-300"
              : "text-neutral-300 hover:bg-neutral-800"
          }`}
        >
          <Radio size={16} aria-hidden /> Community feed
        </Link>
      </div>
    </nav>
  );
}
