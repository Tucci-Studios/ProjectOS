import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { Lightbulb, Plus, GitPullRequest } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { ButtonLink } from "@/components/ui";
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

type IdeaRow = {
  id: string;
  title: string;
  body_md: string;
  status: string;
  created_at: number;
  github_login: string;
  vote_count: number;
  voted: number;
};

export default async function IdeasPage() {
  const user = await getSessionUser();
  const { env } = getCloudflareContext();

  const { results } = await env.DB.prepare(
    `SELECT i.id, i.title, i.body_md, i.status, i.created_at, u.github_login,
            (SELECT COUNT(*) FROM idea_votes v WHERE v.idea_id = i.id) AS vote_count,
            (SELECT COUNT(*) FROM idea_votes v WHERE v.idea_id = i.id AND v.user_id = ?1) AS voted
     FROM ideas i JOIN users u ON u.id = i.author_id
     ORDER BY CASE i.status WHEN 'declined' THEN 1 ELSE 0 END, vote_count DESC, i.created_at DESC`,
  )
    .bind(user?.id ?? "")
    .all<IdeaRow>();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        crumbs={[{ label: "Ideas" }]}
        title="Ideas"
        purpose="Project OS is open source and built by the people who use it. Suggest a change, vote on what others suggested — the most-wanted ideas get built."
        Icon={Lightbulb}
        action={
          <ButtonLink href={user ? "/ideas/new" : "/api/auth/login"} variant="primary">
            <Plus size={16} aria-hidden /> New idea
          </ButtonLink>
        }
      />

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-neutral-700/70 bg-neutral-900/40 p-4">
        <GitPullRequest size={18} className="mt-0.5 shrink-0 text-emerald-400" aria-hidden />
        <p className="text-sm leading-relaxed text-neutral-400">
          <span className="text-neutral-200">How this works:</span> anyone can post an idea. Anyone with a GitHub
          account can vote. Top-voted ideas move to <span className="text-sky-300">Planned</span>, then{" "}
          <span className="text-amber-300">Building</span>, then <span className="text-emerald-300">Shipped</span>.
          Code changes still go through review before they go live.
        </p>
      </div>

      {results.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-700 p-10 text-center text-sm text-neutral-500">
          No ideas yet. What would make this place better?
        </p>
      ) : (
        <div className="space-y-3">
          {results.map((idea) => {
            const s = STATUS[idea.status] ?? STATUS.open;
            return (
              <article
                key={idea.id}
                className="group relative flex items-start gap-4 rounded-xl border border-neutral-700/70 bg-neutral-900/40 p-4 transition duration-200 hover:border-neutral-500 hover:bg-neutral-800/40"
              >
                <div className="relative z-[2] shrink-0">
                  <VoteButton ideaId={idea.id} initialCount={idea.vote_count} initialVoted={idea.voted > 0} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-mono text-base font-bold leading-snug text-white transition group-hover:text-emerald-300">
                      {idea.title}
                    </h2>
                    <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${s.cls}`}>
                      {s.label}
                    </span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-neutral-400">{idea.body_md}</p>
                  <p className="mt-2 font-mono text-[11px] text-neutral-500">
                    @{idea.github_login} · {timeAgo(idea.created_at)}
                  </p>
                </div>
                <Link
                  href={`/ideas/${idea.id}`}
                  aria-label={`Open idea: ${idea.title}`}
                  className="absolute inset-0 z-[1] rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                />
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
