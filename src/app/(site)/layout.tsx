import { SiteHeader } from "@/components/site-header";
import { SectionsNav } from "@/components/sections-nav";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#161d18] text-neutral-200">
      <SiteHeader />
      <div className="mx-auto flex max-w-7xl gap-8 px-5 py-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="sticky top-24">
            <SectionsNav />
          </div>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
