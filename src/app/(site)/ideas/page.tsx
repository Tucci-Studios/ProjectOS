import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { Lightbulb, Plus, Play, Code2, Clock, Trophy, Hammer, CheckCircle2 } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { ButtonLink } from "@/components/ui";
import { VoteButton } from "@/components/vote-button";
import { timeAgo } from "@/lib/categories";
import { currentCycle, closesInWords } from "@/lib/cycles";

export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; cls: string }> = {
  open: { label: "Up for vote", cls: "border-neutral-600 text-neutral-400" },
  planned: { label: "Winning the vote", cls: "border-sky-400/40 text-sky-300" },
  building: { label: "Getting built", cls: "border-amber-400/40 text-amber-300" },
  shipped: { label: "Shipped", cls: "border-emerald-400/40 text-emerald-300" },
  declined: { label: "Not doing", cls: "border-neutral-700 text-neutral-600" },
};

type IdeaRow = {
  id: string;
  title: string;
  body_md: string;
  status: string;
  demo_url: string | null;
  repo_url: string | null;
  created_at: number;
  github_login: string;
  vote_count: number;
  voted: number;
};

export default async function IdeasPage() {
  const user = await getSessionUser();
  const { env } = getCloudflareContext();
  const cycle = currentCycle();

  const { results } = await env.DB.prepare(
    `SELECT i.id, i.title, i.body_md, i.status, i.demo_url, i.repo_url, i.created_at, u.github_login,
            (SELECT COALESCE(SUM(v.value),0) FROM idea_votes v WHERE v.idea_id = i.id) AS vote_count,
            (SELECT COALESCE(SUM(v.value),0) FROM idea_votes v WHERE v.idea_id = i.id AND v.user_id = ?1) AS voted
     FROM ideas i JOIN users u ON u.id = i.author_id
     ORDER BY CASE i.status WHEN 'declined' THEN 2 WHEN 'shipped' THEN 1 ELSE 0 END,
              vote_count DESC, i.created_at DESC`,
  )
    .bind(user?.id ?? "")
    .all<IdeaRow>();

  // Winners are out of the running — they already won a round and are being built.
  const winners = results.filter((i) => i.status === "planned" || i.status === "building");
  const upForVote = results.filter((i) => i.status === "open");
  const settled = results.filter((i) => i.status === "shipped" || i.status === "declined");
  const leader = upForVote[0]?.id;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        crumbs={[{ label: "Ideas" }]}
        title="Ideas"
        purpose="Project OS is built on itself. Branch it, build your change, deploy it, and post it here — everyone tries the real thing and votes. When a round closes, the winner goes to a community security check, then ships."
        Icon={Lightbulb}
        action={
          <ButtonLink href={user ? "/ideas/new" : "/api/auth/login"} variant="primary">
            <Plus size={16} aria-hidden /> Submit a change
          </ButtonLink>
        }
      />

      {/* Cycle banner */}
      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.05] px-4 py-3">
        <span className="flex items-center gap-2 font-mono text-sm font-bold text-emerald-300">
          <Clock size={15} aria-hidden /> Round {cycle.n}
        </span>
        <span className="font-mono text-sm text-neutral-300">Voting {closesInWords(cycle.daysLeft)}</span>
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px] text-neutral-500">
          <Trophy size={12} aria-hidden /> Winner ships after a security check
        </span>
      </div>

      {/* Won a previous round — being built now, not competing again */}
      {winners.length > 0 && (
        <section className="mb-7">
          <h2 className="mb-3 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
            <Hammer size={13} aria-hidden /> Won a round — getting built
          </h2>
          <div className="space-y-3">
            {winners.map((idea) => (
              <article
                key={idea.id}
                className="group relative rounded-xl border border-amber-400/35 bg-amber-400/[0.05] p-4 transition hover:bg-amber-400/[0.08]"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    <Trophy size={10} aria-hidden /> Won round {Math.max(1, cycle.n - 1)}
                  </span>
                  <span className="font-mono text-[11px] text-neutral-400">
                    {idea.vote_count} vote{Math.abs(idea.vote_count) === 1 ? "" : "s"} · being built now
                  </span>
                </div>
                <h3 className="mt-2 font-mono text-base font-bold leading-snug text-white transition group-hover:text-amber-200">
                  &ldquo;{idea.title}&rdquo;
                </h3>
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-neutral-400">{idea.body_md}</p>
                <p className="mt-2 font-mono text-[11px] text-neutral-500">
                  built by @{idea.github_login} · lands in{" "}
                  <Link href="/news" className="text-amber-300 hover:underline">
                    News
                  </Link>{" "}
                  when it ships
                </p>
                <Link
                  href={`/ideas/${idea.id}`}
                  aria-label={`Open ${idea.title}`}
                  className="absolute inset-0 z-[1] rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                />
              </article>
            ))}
          </div>
        </section>
      )}

      {upForVote.length > 0 && (
        <h2 className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
          Up for vote this round
        </h2>
      )}

      {results.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-700 p-10 text-center text-sm text-neutral-500">
          Nothing proposed yet. Branch the site, build something, and show everyone.
        </p>
      ) : (
        <div className="space-y-3">
          {upForVote.map((idea) => {
            const s = STATUS[idea.status] ?? STATUS.open;
            const isLeader = idea.id === leader && idea.vote_count > 0;
            return (
              <article
                key={idea.id}
                className={`group relative flex items-start gap-4 rounded-xl border p-4 transition duration-200 hover:bg-neutral-800/40 ${
                  isLeader
                    ? "border-emerald-400/40 bg-emerald-400/[0.04]"
                    : "border-neutral-700/70 bg-neutral-900/40 hover:border-neutral-500"
                }`}
              >
                <div className="relative z-[2] shrink-0">
                  <VoteButton ideaId={idea.id} initialCount={idea.vote_count} initialVote={idea.voted} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {isLeader && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                        <Trophy size={10} aria-hidden /> Leading
                      </span>
                    )}
                    {idea.demo_url && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/40 bg-sky-400/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-sky-300">
                        <Play size={10} aria-hidden /> Live demo
                      </span>
                    )}
                    {idea.repo_url && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-neutral-600 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        <Code2 size={10} aria-hidden /> Code
                      </span>
                    )}
                    <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${s.cls}`}>
                      {s.label}
                    </span>
                  </div>

                  <h2 className="mt-1.5 font-mono text-base font-bold leading-snug text-white transition group-hover:text-emerald-300">
                    {idea.title}
                  </h2>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-neutral-400">{idea.body_md}</p>
                  <p className="mt-2 font-mono text-[11px] text-neutral-500">
                    built by @{idea.github_login} · {timeAgo(idea.created_at)}
                  </p>
                </div>

                <Link
                  href={`/ideas/${idea.id}`}
                  aria-label={`Open proposal: ${idea.title}`}
                  className="absolute inset-0 z-[1] rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                />
              </article>
            );
          })}
        </div>
      )}

      {settled.length > 0 && (
        <section className="mt-8 border-t border-neutral-800 pt-6">
          <h2 className="mb-3 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
            <CheckCircle2 size={13} aria-hidden /> Settled
          </h2>
          <div className="space-y-2">
            {settled.map((idea) => (
              <Link
                key={idea.id}
                href={`/ideas/${idea.id}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-900/30 px-3.5 py-2.5 transition hover:border-neutral-600"
              >
                <span className="min-w-0 truncate font-mono text-[13px] text-neutral-400">{idea.title}</span>
                <span
                  className={`shrink-0 font-mono text-[10px] font-bold uppercase tracking-wider ${
                    idea.status === "shipped" ? "text-emerald-400" : "text-neutral-600"
                  }`}
                >
                  {idea.status === "shipped" ? "Shipped" : "Not doing"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
