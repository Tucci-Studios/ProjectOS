import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getProjectFeed, getBadgesFor } from "@/lib/queries";
import { GROUPS, GROUP_ORDER, sectionsIn, type GroupKey } from "@/lib/categories";
import { SectionMark } from "@/components/section-mark";
import { DiscoverTile } from "@/components/discover";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

/**
 * A group as a page rather than a dropdown.
 *
 * The sections are laid out in the page itself, each with a live count, so
 * clicking AI shows you what's inside AI instead of unfolding a list in the
 * rail. A few of the group's best projects sit underneath, so the page is worth
 * landing on rather than just being a menu.
 */
export default async function GroupPage({ params }: { params: Promise<{ group: string }> }) {
  const { group } = await params;
  if (!GROUP_ORDER.includes(group as GroupKey)) notFound();
  const key = group as GroupKey;
  const g = GROUPS[key];
  const sections = sectionsIn(key);

  const { env } = getCloudflareContext();
  const user = await getSessionUser();

  const [counts, top] = await Promise.all([
    env.DB.prepare(
      `SELECT category, COUNT(*) AS n FROM projects WHERE status='live' GROUP BY category`,
    ).all<{ category: string; n: number }>(),
    getProjectFeed(key, "top", { limit: 6, viewerId: user?.id }),
  ]);
  const count = new Map(counts.results.map((r) => [r.category, r.n]));
  const total = sections.reduce((n, s) => n + (count.get(s.slug) ?? 0), 0);

  await getBadgesFor([]);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader
        crumbs={[{ label: "Explore", href: "/explore" }, { label: g.label }]}
        title={g.label}
        purpose={`${g.blurb}. ${total.toLocaleString()} project${total === 1 ? "" : "s"} across ${sections.length} sections.`}
        accent={g.text}
        Icon={g.Icon}
      />

      <div className="grid gap-2.5 sm:grid-cols-2">
        {sections.map((s) => {
          const n = count.get(s.slug) ?? 0;
          return (
            <Link
              key={s.slug}
              href={`/s/${s.slug}`}
              className="group flex items-center gap-3.5 rounded-xl border border-neutral-800 bg-neutral-900/40 p-3.5 outline-none transition duration-200 hover:border-neutral-600 hover:bg-neutral-800/40 focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <span
                className="relative flex h-[52px] w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900 pl-[3px]"
                aria-hidden
              >
                <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: g.hex }} />
                <SectionMark category={s.slug} size={24} color={g.hex} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate font-mono text-[14px] font-bold text-white transition group-hover:text-emerald-300">
                  {s.label}
                </span>
                <span className="mt-0.5 block truncate text-[13px] text-neutral-400">{s.use}</span>
              </span>

              <span className="shrink-0 font-mono text-[13px] tabular-nums text-neutral-500">{n}</span>
            </Link>
          );
        })}
      </div>

      {top.results.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4">
            <h2 className="font-mono text-[15px] font-bold text-white">Popular in {g.label}</h2>
            <Link
              href={`/explore?in=${key}`}
              className="flex items-center gap-1.5 font-mono text-[12px] text-neutral-400 transition hover:text-emerald-300"
            >
              See all <ArrowRight size={12} aria-hidden />
            </Link>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {top.results.map((p) => (
              <DiscoverTile key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
