import { SiteHeader } from "@/components/site-header";
import { TermsGate } from "@/components/terms-gate";
import { getSessionUser } from "@/lib/auth";
import { SectionsNav } from "@/components/sections-nav";
import { RouteMotion } from "@/components/route-motion";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (user && !user.tos_accepted_at) return <TermsGate login={user.github_login} />;

  return (
    <div className="min-h-screen bg-[#161d18] text-neutral-200">
      <SiteHeader />
      <div className="mx-auto flex max-w-7xl gap-0 px-4 md:px-5">
        <aside className="hidden w-56 shrink-0 border-r border-neutral-800 py-8 pr-6 md:block">
          <div className="sticky top-24">
            <SectionsNav isAdmin={user?.role === "admin"} />
          </div>
        </aside>
        <div className="min-w-0 flex-1 py-6 md:py-8 md:pl-8">
          <RouteMotion>{children}</RouteMotion>
        </div>
      </div>
    </div>
  );
}
