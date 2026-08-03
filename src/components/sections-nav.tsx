"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { CATEGORY_META, CATEGORY_GROUPS } from "@/lib/categories";

// Grouped section tree: Claude / AI / Software. Counts, no decorative dots —
// each row is a full-width control with a left accent bar when active.

export function SectionsNav({ counts, total }: { counts: Record<string, number>; total: number }) {
  const pathname = usePathname();
  const active = pathname.startsWith("/s/") ? pathname.slice(3) : undefined;
  const onEverything = pathname === "/projects";

  return (
    <nav className="space-y-6">
      <Link
        href="/projects"
        className={`flex min-h-[42px] cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 font-mono text-sm outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 ${
          onEverything
            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
            : "border-neutral-700 text-neutral-200 hover:border-neutral-500 hover:bg-neutral-800"
        }`}
      >
        <span className="flex items-center gap-2">
          <LayoutGrid size={15} aria-hidden /> everything
        </span>
        <span className="text-xs text-neutral-500">{total}</span>
      </Link>

      {CATEGORY_GROUPS.map((group) => (
        <div key={group}>
          <p className="mb-1.5 px-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">
            {group}
          </p>
          <div className="space-y-px">
            {CATEGORY_META.filter((c) => c.group === group).map((c) => {
              const isActive = active === c.slug;
              return (
                <Link
                  key={c.slug}
                  href={`/s/${c.slug}`}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex min-h-[40px] cursor-pointer items-center justify-between gap-2 rounded-lg border-l-2 px-3 font-mono text-sm outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                    isActive
                      ? `${c.border.replace("/30", "")} bg-neutral-800 ${c.text}`
                      : "border-transparent text-neutral-400 hover:border-neutral-600 hover:bg-neutral-800/70 hover:text-white"
                  }`}
                >
                  {c.label}
                  <span className={`text-xs ${isActive ? c.text : "text-neutral-600"}`}>{counts[c.slug] ?? 0}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
