import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lightbulb } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { VoteButton } from "@/components/vote-button";
import { timeAgo } from "@/lib/categories";

export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; cls: string }> = {
  open: { label: "Open", cls: "border-neutral-600 text-neutral-400" },
  planned: { label: "Planned", cls: "border-sky-400/40 text-sky-300" },
  building: { label: "Building", cls: "border-amber-400/40 text-amber-300" },
  shipped: { label: "Shipped", cls: "border-emerald-400/40 text-emerald-300" },
  declined: { label: "Not doing", cls: "border-neutral-700 text-neutral-600" },
};

export default async function IdeaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  const { env } = getCloudflareContext();

  const idea = await env.DB.prepare(
    `SELECT i.id, i.title, i.body_md, i.status, i.created_at, u.github_login,
            (SELECT COUNT(*) FROM idea_votes v WHERE v.idea_id = i.id) AS vote_count,
            (SELECT COUNT(*) FROM idea_votes v WHERE v.idea_id = i.id AND v.user_id = ?2) AS voted
     FROM ideas i JOIN users u ON u.id = i.author_id WHERE i.id = ?1`,
  )
    .bind(id, user?.id ?? "")
    .first<{
      id: string; title: string; body_md: string; status: string; created_at: number;
      github_login: string; vote_count: number; voted: number;
    }>();
  if (!idea) notFound();

  const s = STATUS[idea.status] ?? STATUS.open;

  return (
    <div className="mx-auto max-w-2xl">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 font-mono text-xs text-neutral-500">
        <Link href="/ideas" className="rounded px-1 py-0.5 transition hover:text-neutral-200">
          Ideas
        </Link>
        <span className="text-neutral-700">/</span>
        <span className="text-neutral-400">this idea</span>
      </nav>

      <article className="flex items-start gap-4 rounded-xl border border-neutral-700/70 bg-neutral-900/40 p-5">
        <VoteButton ideaId={idea.id} initialCount={idea.vote_count} initialVoted={idea.voted > 0} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Lightbulb size={16} className="text-amber-300" aria-hidden />
            <h1 className="font-mono text-xl font-bold leading-snug text-white">{idea.title}</h1>
            <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${s.cls}`}>
              {s.label}
            </span>
          </div>
          <p className="mt-1.5 font-mono text-[11px] text-neutral-500">
            @{idea.github_login} · {timeAgo(idea.created_at)}
          </p>
          <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-neutral-300">{idea.body_md}</p>
        </div>
      </article>
    </div>
  );
}
