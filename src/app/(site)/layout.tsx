import Link from "next/link";
import { LayoutGrid, Radio, Swords } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { CATEGORY_META } from "@/lib/categories";

const SIDE_LINK =
  "flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-lg px-3 font-mono text-sm text-neutral-400 outline-none transition duration-200 hover:bg-neutral-800 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#161d18] text-neutral-200">
      <SiteHeader />
      <div className="mx-auto flex max-w-7xl gap-8 px-5 py-8">
        {/* Sections sidebar */}
        <aside className="hidden w-52 shrink-0 md:block">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-500">Sections</p>
          <nav className="space-y-0.5">
            <Link href="/projects" className={`${SIDE_LINK} text-neutral-200`}>
              <LayoutGrid size={15} aria-hidden /> all projects
            </Link>
            {CATEGORY_META.map((c) => (
              <Link key={c.slug} href={`/s/${c.slug}`} className={SIDE_LINK}>
                <span className={`h-2 w-2 rounded-full ${c.dot} shadow-[0_0_6px_currentColor]`} />
                {c.label}
              </Link>
            ))}
          </nav>
          <p className="mt-8 mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-500">Community</p>
          <nav className="space-y-0.5">
            <Link href="/wire" className={SIDE_LINK}>
              <Radio size={15} aria-hidden /> feed
            </Link>
            <Link href="/remix-wars" className={SIDE_LINK}>
              <Swords size={15} aria-hidden /> remix wars
            </Link>
          </nav>
        </aside>

        {/* Page content */}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
