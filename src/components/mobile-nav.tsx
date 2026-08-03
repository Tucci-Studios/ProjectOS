"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, Rss, Flame, Sparkles, Megaphone, Lightbulb, Compass, ChevronRight, FlaskConical } from "lucide-react";
import { GROUPS, GROUP_ORDER, sectionsIn, categoryMeta } from "@/lib/categories";

const MAIN = [
  { href: "/", label: "Feed", Icon: Rss, exact: true },
  { href: "/popular", label: "Popular", Icon: Flame },
  { href: "/explore", label: "Explore", Icon: Sparkles },
  { href: "/news", label: "News", Icon: Megaphone },
  { href: "/ideas", label: "Ideas", Icon: Lightbulb },
  { href: "/lab", label: "Lab", Icon: FlaskConical },
];

/** The sidebar is hidden under 768px, so phones need their own way in. */
export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const activeGroup = pathname.startsWith("/s/") ? categoryMeta(pathname.split("/")[2]).group : undefined;
  const [openGroup, setOpenGroup] = useState<string | undefined>(activeGroup);

  // Any navigation closes the drawer.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const row =
    "flex min-h-[46px] items-center gap-3 rounded-lg px-3 font-mono text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-neutral-300 outline-none transition hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-emerald-400 md:hidden"
      >
        <Menu size={20} aria-hidden />
      </button>

      {open && (
        <div
          className="animate-overlay fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <nav
            aria-label="Menu"
            className="animate-rise h-full w-[86%] max-w-xs overflow-y-auto border-r border-neutral-800 bg-[#141a16] p-3"
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <span className="font-mono text-sm font-bold tracking-[0.16em] text-white">
                PROJECT<span className="text-emerald-400">_</span>OS
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
              >
                <X size={18} aria-hidden />
              </button>
            </div>

            <div className="space-y-0.5">
              {MAIN.map(({ href, label, Icon, exact }) => {
                const active = exact ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`${row} ${active ? "bg-emerald-400/10 font-bold text-emerald-300" : "text-neutral-300 hover:bg-neutral-800"}`}
                  >
                    <Icon size={17} aria-hidden /> {label}
                  </Link>
                );
              })}
            </div>

            <div className="my-3 border-t border-neutral-800 pt-3">
              <Link
                href="/explore"
                className={`${row} ${pathname === "/explore" ? "text-emerald-300" : "text-neutral-200 hover:bg-neutral-800"}`}
              >
                <Compass size={17} aria-hidden /> Everything
              </Link>

              {GROUP_ORDER.map((key) => {
                const g = GROUPS[key];
                const isOpen = openGroup === key;
                return (
                  <div key={key}>
                    <button
                      onClick={() => setOpenGroup(isOpen ? undefined : key)}
                      aria-expanded={isOpen}
                      className={`${row} w-full cursor-pointer text-neutral-300 hover:bg-neutral-800`}
                    >
                      <g.Icon size={17} className={g.text} aria-hidden />
                      <span className="flex-1 text-left">{g.label}</span>
                      <ChevronRight
                        size={15}
                        aria-hidden
                        className={`text-neutral-500 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="ml-4 border-l border-neutral-800 pl-2">
                        {sectionsIn(key).map((c) => (
                          <Link
                            key={c.slug}
                            href={`/s/${c.slug}`}
                            className={`${row} text-[13px] ${
                              pathname === `/s/${c.slug}` ? `font-bold ${g.text}` : "text-neutral-400 hover:bg-neutral-800"
                            }`}
                          >
                            {c.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
