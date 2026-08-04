"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ScrollText, Compass, Menu, X, Flame, Sparkles, Megaphone, Lightbulb, ChevronRight, FlaskConical, Radio, GraduationCap, HeartHandshake } from "lucide-react";
import { GROUPS, GROUP_ORDER, categoryMeta } from "@/lib/categories";

// Same order as the rail, so the phone and the desktop agree. Saves isn't here
// because it lives next to your avatar in the header, on both.
const MAIN = [
  { href: "/", label: "Feed", Icon: ScrollText, exact: true },
  { href: "/explore", label: "Explore", Icon: Compass },
  { href: "/wire", label: "Wire", Icon: Radio },
  { href: "/tutorials", label: "Tutorials", Icon: GraduationCap },
  { href: "/ideas", label: "Ideas", Icon: Lightbulb },
  { href: "/updates", label: "Updates", Icon: Megaphone },
  { href: "/help", label: "Help wanted", Icon: HeartHandshake },
  { href: "/lab", label: "Lab", Icon: FlaskConical },
];

/** The sidebar is hidden under 768px, so phones need their own way in. */
export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const activeGroup = pathname.startsWith("/g/")
    ? pathname.split("/")[2]
    : pathname.startsWith("/s/")
      ? categoryMeta(pathname.split("/")[2]).group
      : undefined;

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

              {GROUP_ORDER.map((key) => {
                const g = GROUPS[key];
                const active = activeGroup === key;
                return (
                  <Link
                    key={key}
                    href={`/g/${key}`}
                    className={`${row} ${active ? `font-bold ${g.text}` : "text-neutral-300 hover:bg-neutral-800"}`}
                    style={active ? { background: `${g.hex}14` } : undefined}
                  >
                    <g.Icon size={17} aria-hidden /> {g.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
