import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getProjectFeed, getLikedIds } from "@/lib/queries";
import { ProjectCard } from "@/components/project-card";

export const dynamic = "force-dynamic";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort: sortParam } = await searchParams;
  const sort = sortParam === "new" ? "new" : "top";
  const user = await getSessionUser();
  const [feed, liked] = await Promise.all([getProjectFeed(undefined, sort), getLikedIds(user?.id)]);

  const tab = (key: string, label: string) => (
    <Link
      href={key === "top" ? "/projects" : `/projects?sort=${key}`}
      className={`rounded-lg px-4 py-1.5 font-mono text-sm transition ${
        sort === key
          ? "bg-emerald-400/10 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.15)]"
          : "text-neutral-500 hover:text-neutral-300"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-mono text-2xl font-bold tracking-tight text-white">
          {sort === "top" ? "Top on Project OS" : "Newest"}
        </h1>
        <div className="flex gap-1 rounded-lg border border-neutral-800 bg-neutral-950/60 p-1">
          {tab("top", "▲ top")}
          {tab("new", "◷ new")}
        </div>
      </div>
      <div className="space-y-3">
        {feed.map((p, i) => (
          <div key={p.id} className="flex items-center gap-3">
            {sort === "top" && (
              <span
                className={`w-9 shrink-0 text-right font-mono text-lg font-bold ${
                  i === 0 ? "text-emerald-400" : i < 3 ? "text-neutral-300" : "text-neutral-700"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <ProjectCard p={p} liked={liked.has(p.id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
