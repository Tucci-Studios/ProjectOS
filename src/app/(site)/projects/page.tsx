import Link from "next/link";
import { Boxes } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { getSessionUser } from "@/lib/auth";
import { getProjectFeed, getUserVotes } from "@/lib/queries";
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
  const [feed, votes] = await Promise.all([getProjectFeed(undefined, sort), getUserVotes(user?.id)]);

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
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "All projects" }]}
        title="All projects"
        purpose="Everything published on Project OS, across every section. Sort by most liked or newest."
        Icon={Boxes}
        action={
          <div className="flex gap-1 rounded-lg border border-neutral-700 bg-neutral-900/60 p-1">
            {tab("top", "Most liked")}
            {tab("new", "Newest")}
          </div>
        }
      />
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
              <ProjectCard p={p} vote={votes.get(p.id) ?? 0} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
