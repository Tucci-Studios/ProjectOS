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
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
          <Link href="/projects" className="font-mono text-sm font-bold tracking-widest text-white">
            PROJECT<span className="text-cyan-400">_</span>OS
          </Link>
          <nav className="flex gap-4 font-mono text-xs text-neutral-400">
            <Link href="/projects" className="hover:text-cyan-400">
              projects
            </Link>
            <Link href="/uplink" className="hover:text-cyan-400">
              uplink
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/submit"
              className="rounded border border-cyan-400/40 px-3 py-1.5 font-mono text-xs text-cyan-400 transition hover:bg-cyan-400/10"
            >
              + publish
            </Link>
            {user ? (
              <span className="flex items-center gap-2 font-mono text-xs text-neutral-400">
                {user.avatar_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar_url} alt="" className="h-6 w-6 rounded-full border border-neutral-700" />
                )}
                @{user.github_login}
                <form action="/api/auth/logout" method="post">
                  <button type="submit" className="text-neutral-600 hover:text-neutral-300">
                    [out]
                  </button>
                </form>
              </span>
            ) : (
              <a href="/api/auth/login" className="font-mono text-xs text-neutral-400 hover:text-cyan-400">
                sign in with GitHub
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        {/* Sections sidebar */}
        <aside className="hidden w-48 shrink-0 md:block">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600">Sections</p>
          <nav className="space-y-1">
            <Link
              href="/projects"
              className="block rounded px-2 py-1.5 font-mono text-xs text-neutral-300 hover:bg-neutral-900"
            >
              ⌂ all projects
            </Link>
            {CATEGORY_META.map((c) => (
              <Link
                key={c.slug}
                href={`/s/${c.slug}`}
                className="flex items-center gap-2 rounded px-2 py-1.5 font-mono text-xs text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
              >
                <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
                {c.label}
              </Link>
            ))}
          </nav>
          <p className="mt-6 mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600">Feed</p>
          <nav className="space-y-1">
            <Link
              href="/uplink"
              className="block rounded px-2 py-1.5 font-mono text-xs text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
            >
              ⇅ uplink
            </Link>
          </nav>
        </aside>

        {/* Page content */}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
