import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { CATEGORY_META } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-neutral-200">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-neutral-800 bg-[#0a0a0f]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-5">
          <Link href="/projects" className="font-mono text-lg font-bold tracking-widest text-white">
            PROJECT<span className="text-cyan-400">_</span>OS
          </Link>
          <nav className="flex gap-5 font-mono text-sm text-neutral-400">
            <Link href="/projects" className="transition hover:text-cyan-400">
              projects
            </Link>
            <Link href="/wire" className="transition hover:text-cyan-400">
              wire
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <Link
              href="/submit"
              className="rounded-lg border border-cyan-400/50 px-4 py-2 font-mono text-sm font-semibold text-cyan-400 transition hover:bg-cyan-400/10 hover:shadow-[0_0_16px_rgba(34,211,238,0.25)]"
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
                  <button type="submit" className="text-neutral-600 transition hover:text-neutral-300">
                    [out]
                  </button>
                </form>
              </span>
            ) : (
              <a href="/api/auth/login" className="font-mono text-sm text-neutral-400 transition hover:text-cyan-400">
                sign in with GitHub
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-5 py-8">
        {/* Sections sidebar */}
        <aside className="hidden w-52 shrink-0 md:block">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-600">Sections</p>
          <nav className="space-y-0.5">
            <Link
              href="/projects"
              className="block rounded-lg px-3 py-2 font-mono text-sm text-neutral-200 transition hover:bg-neutral-900"
            >
              ⌂ all projects
            </Link>
            {CATEGORY_META.map((c) => (
              <Link
                key={c.slug}
                href={`/s/${c.slug}`}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 font-mono text-sm text-neutral-400 transition hover:bg-neutral-900 hover:text-white"
              >
                <span className={`h-2 w-2 rounded-full ${c.dot} shadow-[0_0_6px_currentColor]`} />
                {c.label}
              </Link>
            ))}
          </nav>
          <p className="mt-8 mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-600">Feed</p>
          <nav className="space-y-0.5">
            <Link
              href="/wire"
              className="block rounded-lg px-3 py-2 font-mono text-sm text-neutral-400 transition hover:bg-neutral-900 hover:text-white"
            >
              ⇅ wire
            </Link>
          </nav>
        </aside>

        {/* Page content */}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
