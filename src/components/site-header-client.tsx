"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Boxes, Radio, Search, LogOut, Plus } from "lucide-react";
import type { SessionUser } from "@/lib/auth";
import { ButtonLink } from "./ui";

const NAV = [
  { href: "/", label: "Home", Icon: Home, match: (p: string) => p === "/" },
  { href: "/projects", label: "Projects", Icon: Boxes, match: (p: string) => p.startsWith("/projects") || p.startsWith("/s/") || p.startsWith("/p/") },
  { href: "/wire", label: "Feed", Icon: Radio, match: (p: string) => p.startsWith("/wire") },
];

export function SiteHeaderClient({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-700 bg-[#161d18]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5">
        <Link
          href="/"
          className="rounded-lg px-2 py-2 font-mono text-lg font-bold tracking-widest text-white outline-none transition-colors duration-200 hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          PROJECT<span className="text-emerald-400">_</span>OS
        </Link>
        <nav className="hidden gap-1 sm:flex">
          {NAV.map(({ href, label, Icon, match }) => {
            const active = match(pathname);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-[44px] items-center gap-2 rounded-lg px-3.5 font-mono text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  active ? "bg-neutral-800 text-white" : "text-neutral-400 hover:bg-neutral-800/60 hover:text-white"
                }`}
              >
                <Icon size={16} strokeWidth={2} aria-hidden />
                {label}
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
            placeholder="Search projects..."
            aria-label="Search projects"
            className="h-11 w-56 rounded-lg border border-neutral-700 bg-neutral-800/80 pl-9 pr-3 font-mono text-sm text-white placeholder-neutral-500 outline-none transition-all duration-200 focus:w-64 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
          />
        </form>
        <div className="flex items-center gap-3">
          <ButtonLink href="/submit" variant="outline">
            <Plus size={16} aria-hidden /> Publish
          </ButtonLink>
          {user ? (
            <span className="flex items-center gap-2 font-mono text-sm text-neutral-300">
              {user.avatar_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt="" className="h-8 w-8 rounded-full border border-neutral-600" />
              )}
              <span className="hidden lg:inline">@{user.github_login}</span>
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  title="Sign out"
                  aria-label="Sign out"
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-neutral-500 outline-none transition-colors duration-200 hover:bg-neutral-800 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <LogOut size={16} aria-hidden />
                </button>
              </form>
            </span>
          ) : (
            <ButtonLink href="/api/auth/login" variant="ghost">
              Sign in with GitHub
            </ButtonLink>
          )}
        </div>
      </div>
    </header>
  );
}
