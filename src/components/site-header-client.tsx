"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radio, Compass, Search, LogOut, Plus } from "lucide-react";
import type { SessionUser } from "@/lib/auth";
import { ButtonLink } from "./ui";
import { Wordmark } from "./brand";

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
            <div className="flex items-center gap-1 border-l border-neutral-800 pl-3">
              <Link
                href="/me"
                title={`@${user.github_login}`}
                aria-current={pathname.startsWith("/me") ? "page" : undefined}
                className={`rounded-full outline-none ring-offset-2 ring-offset-[#141a16] transition focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  pathname.startsWith("/me") ? "ring-2 ring-emerald-400" : ""
                }`}
              >
                {user.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar_url}
                    alt={`@${user.github_login}`}
                    className="h-9 w-9 rounded-full border border-neutral-600 transition hover:border-emerald-400"
                  />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-600 font-mono text-xs text-neutral-300">
                    {user.github_login.slice(0, 2)}
                  </span>
                )}
              </Link>
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  title="Sign out"
                  aria-label="Sign out"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-neutral-600 outline-none transition-colors duration-200 hover:bg-neutral-800 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <LogOut size={14} aria-hidden />
                </button>
              </form>
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
