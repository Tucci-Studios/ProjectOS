import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { CATEGORY_META } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-neutral-200">
      <SiteHeader />
      <div className="mx-auto flex max-w-7xl gap-8 px-5 py-8">
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
          <p className="mt-8 mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-600">Community</p>
          <nav className="space-y-0.5">
            <Link
              href="/wire"
              className="block rounded-lg px-3 py-2 font-mono text-sm text-neutral-400 transition hover:bg-neutral-900 hover:text-white"
            >
              ⇅ feed
            </Link>
            <Link
              href="/fork-wars"
              className="block rounded-lg px-3 py-2 font-mono text-sm text-neutral-400 transition hover:bg-neutral-900 hover:text-white"
            >
              ⑂ fork wars
            </Link>
          </nav>
        </aside>

        {/* Page content */}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
