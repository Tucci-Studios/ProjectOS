import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getProjectFeed, getLikedIds } from "@/lib/queries";
import { ProjectCard } from "@/components/project-card";
import { CATEGORY_META, categoryMeta } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function SectionPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  if (!CATEGORY_META.some((c) => c.slug === category)) notFound();
  const meta = categoryMeta(category);

  const user = await getSessionUser();
  const [feed, liked] = await Promise.all([getProjectFeed(category), getLikedIds(user?.id)]);

  return (
    <div>
      <h1 className="mb-1 flex items-center gap-3 font-mono text-2xl font-bold tracking-tight text-white">
        <span className={`h-2.5 w-2.5 rounded-full ${meta.dot} shadow-[0_0_8px_currentColor]`} />
        {meta.label} <span className="text-neutral-600">({feed.length})</span>
      </h1>
      <p className={`mb-5 font-mono text-sm ${meta.text}`}>s/{meta.slug}</p>
      {feed.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-800 p-8 text-center font-mono text-xs text-neutral-600">
          Nothing here yet. Be the first — hit + publish.
        </p>
      ) : (
        <div className="space-y-3">
          {feed.map((p) => (
            <ProjectCard key={p.id} p={p} liked={liked.has(p.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
