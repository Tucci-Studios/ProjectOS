import { getCloudflareContext } from "@opennextjs/cloudflare";
import { SiteHeader } from "@/components/site-header";
import { SectionsNav } from "@/components/sections-nav";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { env } = getCloudflareContext();
  const { results } = await env.DB.prepare(
    "SELECT category, COUNT(*) AS n FROM projects WHERE status='live' GROUP BY category",
  ).all<{ category: string; n: number }>();
  const counts = Object.fromEntries(results.map((r) => [r.category, r.n]));
  const total = results.reduce((sum, r) => sum + r.n, 0);

  return (
    <div className="min-h-screen bg-[#161d18] text-neutral-200">
      <SiteHeader />
      <div className="mx-auto flex max-w-7xl gap-8 px-5 py-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <SectionsNav counts={counts} total={total} />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
