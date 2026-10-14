import { SiteHeader } from "@/components/site-header";
import { TermsGate } from "@/components/terms-gate";
import { ViewCounter } from "@/components/view-counter";
import { getSessionUser } from "@/lib/auth";
import { SectionsNav } from "@/components/sections-nav";
import { RouteMotion } from "@/components/route-motion";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (user && !user.tos_accepted_at) return <TermsGate login={user.github_login} />;

  return (
    <div className="min-h-screen bg-[#161d18] text-neutral-200">
      <ViewCounter />
      {/* WCAG 2.4.1. Without this, reaching the content by keyboard means
          tabbing past eleven sidebar links on every single page. Hidden until
          focused, then it's the first thing you land on. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-emerald-400 focus:px-4 focus:py-2.5 focus:font-mono focus:text-[13px] focus:font-bold focus:text-black"
      >
        Skip to content
      </a>
      <SiteHeader />
      <div className="mx-auto flex max-w-7xl gap-0 px-4 md:px-5">
        <aside className="hidden w-56 shrink-0 border-r border-neutral-800 py-8 pr-6 md:block">
          <div className="sticky top-24">
            <SectionsNav isMod={user?.role === "admin" || user?.role === "mod"} />
          </div>
        </aside>
        <main id="main" tabIndex={-1} className="min-w-0 flex-1 py-6 md:py-8 md:pl-8">
          <RouteMotion>{children}</RouteMotion>
        </main>
      </div>
    </div>
  );
}
