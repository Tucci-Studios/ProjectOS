import { getSessionUser } from "@/lib/auth";
import { getProjectFeed, getLikedIds } from "@/lib/queries";
import { ProjectCard } from "@/components/project-card";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const user = await getSessionUser();
  const [feed, liked] = await Promise.all([getProjectFeed(), getLikedIds(user?.id)]);

  return (
    <div>
      <h1 className="mb-4 font-mono text-lg font-bold text-white">
        All projects <span className="text-neutral-600">({feed.length})</span>
      </h1>
      <div className="space-y-2">
        {feed.map((p) => (
          <ProjectCard key={p.id} p={p} liked={liked.has(p.id)} />
        ))}
      </div>
    </div>
  );
}
