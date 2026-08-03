import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { ProjectComments, type ProjectComment } from "@/components/project-comments";

export const dynamic = "force-dynamic";

export default async function ProjectCommentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  const { env } = getCloudflareContext();

  const p = await env.DB.prepare(
    `SELECT id, base_name, variant_name FROM projects WHERE id = ?1 AND status='live'`,
  )
    .bind(id)
    .first<{ id: string; base_name: string; variant_name: string | null }>();
  if (!p) notFound();

  const { results } = await env.DB.prepare(
    `SELECT c.id, c.body_md, c.created_at, u.github_login, u.avatar_url
     FROM project_comments c JOIN users u ON u.id = c.author_id
     WHERE c.project_id = ?1 AND c.status='live' ORDER BY c.created_at DESC`,
  )
    .bind(id)
    .all<ProjectComment>();

  const name = p.variant_name ? `${p.base_name} // ${p.variant_name}` : p.base_name;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/p/${p.id}`}
        className="mb-5 inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2 font-mono text-[13px] text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
      >
        <ArrowLeft size={15} aria-hidden /> {name}
      </Link>

      <h1 className="flex items-center gap-2.5 font-mono text-xl font-bold tracking-tight text-white">
        <MessageCircle size={19} className="text-neutral-500" aria-hidden />
        Comments <span className="font-normal text-neutral-500">{results.length}</span>
      </h1>
      <p className="mb-6 mt-1.5 text-sm text-neutral-500">On {name}.</p>

      <ProjectComments projectId={p.id} comments={results} signedIn={!!user} />
    </div>
  );
}
