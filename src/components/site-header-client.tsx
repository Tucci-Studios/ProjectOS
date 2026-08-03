"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radio, Compass, User, Search, LogOut, Plus } from "lucide-react";
import type { SessionUser } from "@/lib/auth";
import { ButtonLink } from "./ui";

const NAV = [
  { href: "/", label: "Feed", Icon: Radio, match: (p: string) => p === "/" || p.startsWith("/wire") },
  {
    href: "/projects",
    label: "Explore",
    Icon: Compass,
    match: (p: string) => p.startsWith("/projects") || p.startsWith("/s/") || p.startsWith("/p/"),
  },
  { href: "/me", label: "My stuff", Icon: User, match: (p: string) => p.startsWith("/me") },
];

export function SiteHeaderClient({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-700/80 bg-[#161d18]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-5 px-5">
        <Link
          href="/"
          className="rounded-lg py-2 pr-2 font-mono text-lg font-bold tracking-widest text-white outline-none transition-colors duration-200 hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          PROJECT<span className="text-emerald-400">_</span>OS
        </Link>

        <nav className="flex gap-1">
          {NAV.map(({ href, label, Icon, match }) => {
            const active = match(pathname);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-[44px] items-center gap-2 rounded-lg px-3 font-mono text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  active ? "bg-neutral-800 text-white" : "text-neutral-400 hover:bg-neutral-800/60 hover:text-white"
                }`}
              >
                <Icon size={16} strokeWidth={2} aria-hidden />
                <span className="hidden sm:inline">{label}</span>
                {active && (
                  <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-emerald-400" aria-hidden />
                )}
              </Link>
            );
          })}
        </nav>

        <form action="/search" method="get" className="relative ml-auto hidden md:block">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" aria-hidden />
          <input
            name="q"
            placeholder="Search..."
            aria-label="Search projects"
            className="h-10 w-44 rounded-lg border border-neutral-700 bg-neutral-800/70 pl-9 pr-3 font-mono text-sm text-white placeholder-neutral-500 outline-none transition-all duration-200 focus:w-60 focus:border-emerald-400"
          />
        </form>

        <div className="ml-auto flex items-center gap-2.5 md:ml-0">
          <ButtonLink href="/submit" variant="primary" className="!min-h-[40px] !px-3.5">
            <Plus size={16} aria-hidden /> <span className="hidden sm:inline">Publish</span>
          </ButtonLink>
          {user ? (
            <form action="/api/auth/logout" method="post" className="flex items-center gap-1.5">
              <Link href="/me" className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
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
              <button
                type="submit"
                title="Sign out"
                aria-label="Sign out"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-neutral-500 outline-none transition-colors duration-200 hover:bg-neutral-800 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <LogOut size={15} aria-hidden />
              </button>
            </form>
          ) : (
            <ButtonLink href="/api/auth/login" variant="ghost" className="!min-h-[40px] !px-3.5">
              Sign in
            </ButtonLink>
          )}
        </div>
      </div>
    </header>
  );
}
