import Link from "next/link";
import { Home, Trophy, Search, LogOut, Plus } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { ButtonLink } from "./ui";

const NAV = [
  { href: "/", label: "home", Icon: Home },
  { href: "/projects", label: "browse", Icon: Trophy },
];

export async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-700 bg-[#161d18]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5">
        <Link
          href="/"
          className="rounded-lg px-2 py-2 font-mono text-lg font-bold tracking-widest text-white outline-none transition hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          PROJECT<span className="text-emerald-400">_</span>OS
        </Link>
        <nav className="hidden gap-1 sm:flex">
          {NAV.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg px-3 font-mono text-sm text-neutral-400 outline-none transition duration-200 hover:bg-neutral-800 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <Icon size={16} strokeWidth={2} aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
        <form action="/search" method="get" className="relative ml-auto hidden md:block">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" aria-hidden />
          <input
            name="q"
            placeholder="search..."
            aria-label="Search projects"
            className="h-11 w-52 rounded-lg border border-neutral-700 bg-neutral-800/80 pl-9 pr-3 font-mono text-sm text-white placeholder-neutral-500 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
          />
        </form>
        <div className="flex items-center gap-3">
          <ButtonLink href="/submit" variant="outline">
            <Plus size={16} aria-hidden /> publish
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
                  title="sign out"
                  aria-label="Sign out"
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-neutral-500 outline-none transition duration-200 hover:bg-neutral-800 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <LogOut size={16} aria-hidden />
                </button>
              </form>
            </span>
          ) : (
            <ButtonLink href="/api/auth/login" variant="ghost">
              sign in with GitHub
            </ButtonLink>
          )}
        </div>
      </div>
    </header>
  );
}
