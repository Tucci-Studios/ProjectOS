"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radio, Compass, Search, Plus } from "lucide-react";
import type { SessionUser } from "@/lib/auth";
import { ButtonLink } from "./ui";
import { Wordmark } from "./brand";
import { UserMenu } from "./user-menu";

const NAV = [
  { href: "/", label: "Feed", Icon: Radio, match: (p: string) => p === "/" || p.startsWith("/wire") },
  {
    href: "/projects",
    label: "Explore",
    Icon: Compass,
    match: (p: string) => p.startsWith("/projects") || p.startsWith("/s/") || p.startsWith("/p/"),
  },
];

export function SiteHeaderClient({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-800 bg-[#141a16]/95 backdrop-blur">
      <div className="mx-auto flex h-[60px] max-w-6xl items-center px-5">
        {/* Left: brand */}
        <Link
          href="/"
          className="rounded-lg outline-none transition-opacity duration-200 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <Wordmark />
        </Link>

        {/* Center: the two places you go */}
        <nav className="ml-10 flex gap-1">
          {NAV.map(({ href, label, Icon, match }) => {
            const active = match(pathname);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex h-[60px] items-center gap-2 px-4 font-mono text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400 ${
                  active ? "text-white" : "text-neutral-500 hover:text-neutral-200"
                }`}
              >
                <Icon size={16} strokeWidth={2} aria-hidden />
                {label}
                {active && <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-t bg-emerald-400" aria-hidden />}
              </Link>
            );
          })}
        </nav>

        {/* Right: search, publish, you */}
        <div className="ml-auto flex items-center gap-3">
          <form action="/search" method="get" className="relative hidden md:block">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" aria-hidden />
            <input
              name="q"
              placeholder="Search"
              aria-label="Search projects"
              className="h-9 w-40 rounded-full border border-neutral-700 bg-neutral-800/60 pl-9 pr-3 font-mono text-[13px] text-white placeholder-neutral-500 outline-none transition-all duration-200 focus:w-56 focus:border-emerald-400/60"
            />
          </form>

          <ButtonLink href="/submit" variant="primary" className="!min-h-[38px] !rounded-full !px-4">
            <Plus size={15} aria-hidden /> <span className="hidden sm:inline">Publish</span>
          </ButtonLink>

          {user ? (
            <div className="border-l border-neutral-800 pl-3">
              <UserMenu user={user} />
            </div>
          ) : (
            <ButtonLink href="/api/auth/login" variant="ghost" className="!min-h-[38px] !rounded-full !px-4">
              Sign in
            </ButtonLink>
          )}
        </div>
      </div>
    </header>
  );
}
