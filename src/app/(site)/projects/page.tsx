import { getSessionUser } from "@/lib/auth";
import { getProjectFeed, getLikedIds } from "@/lib/queries";
import { ProjectCard } from "@/components/project-card";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const user = await getSessionUser();
  const [feed, liked] = await Promise.all([getProjectFeed(), getLikedIds(user?.id)]);

  return (
    <div>
      <h1 className="mb-5 font-mono text-2xl font-bold tracking-tight text-white">
        All projects <span className="text-neutral-600">({feed.length})</span>
      </h1>
      <div className="space-y-3">
        {feed.map((p) => (
          <ProjectCard key={p.id} p={p} liked={liked.has(p.id)} />
        ))}
      </div>
    </div>
  );
}
