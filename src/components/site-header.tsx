import Link from "next/link";
import { getSessionUser } from "@/lib/auth";

export async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-700 bg-[#161d18]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-7 px-5">
        <Link href="/" className="font-mono text-lg font-bold tracking-widest text-white">
          PROJECT<span className="text-emerald-400">_</span>OS
        </Link>
        <nav className="hidden gap-5 font-mono text-sm text-neutral-400 sm:flex">
          <Link href="/" className="transition hover:text-emerald-400">
            home
          </Link>
          <Link href="/projects" className="transition hover:text-emerald-400">
            top
          </Link>
          <Link href="/wire" className="transition hover:text-emerald-400">
            feed
          </Link>
          <Link href="/fork-wars" className="transition hover:text-emerald-400">
            fork_wars
          </Link>
        </nav>
        <form action="/search" method="get" className="ml-auto hidden md:block">
          <input
            name="q"
            placeholder="search projects..."
            className="w-52 rounded-lg border border-neutral-700 bg-neutral-800/80 px-3 py-1.5 font-mono text-sm text-white placeholder-neutral-600 outline-none transition focus:border-emerald-400"
          />
        </form>
        <div className="flex items-center gap-4">
          <Link
            href="/submit"
            className="rounded-lg border border-emerald-400/50 px-4 py-2 font-mono text-sm font-semibold text-emerald-400 transition hover:bg-emerald-400/10 hover:shadow-[0_0_16px_rgba(52,211,153,0.25)]"
          >
            + publish
          </Link>
          {user ? (
            <span className="flex items-center gap-2 font-mono text-sm text-neutral-300">
              {user.avatar_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt="" className="h-7 w-7 rounded-full border border-neutral-700" />
              )}
              @{user.github_login}
              <form action="/api/auth/logout" method="post">
                <button type="submit" className="text-neutral-500 transition hover:text-neutral-300">
                  [out]
                </button>
              </form>
            </span>
          ) : (
            <a href="/api/auth/login" className="font-mono text-sm text-neutral-400 transition hover:text-emerald-400">
              sign in with GitHub
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
