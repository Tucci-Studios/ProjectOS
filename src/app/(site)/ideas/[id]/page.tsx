import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Code2, ExternalLink, Clock } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { VoteButton } from "@/components/vote-button";
import { DemoFrame } from "@/components/demo-frame";
import { ButtonLink } from "@/components/ui";
import { timeAgo } from "@/lib/categories";
import { currentCycle, closesInWords } from "@/lib/cycles";

export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; cls: string }> = {
  open: { label: "Up for vote", cls: "border-neutral-600 text-neutral-400" },
  planned: { label: "Winning the vote", cls: "border-sky-400/40 text-sky-300" },
  building: { label: "Getting built", cls: "border-amber-400/40 text-amber-300" },
  shipped: { label: "Shipped", cls: "border-emerald-400/40 text-emerald-300" },
  declined: { label: "Not doing", cls: "border-neutral-700 text-neutral-400" },
};

type Row = {
  id: string;
  title: string;
  body_md: string;
  status: string;
  demo_url: string | null;
  repo_url: string | null;
  shot_url: string | null;
  created_at: number;
  github_login: string;
  vote_count: number;
  voted: number;
};

export default async function IdeaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  const { env } = getCloudflareContext();
  const cycle = currentCycle();

  const idea = await env.DB.prepare(
    `SELECT i.id, i.title, i.body_md, i.status, i.demo_url, i.repo_url, i.shot_url, i.created_at, u.github_login,
            (SELECT COALESCE(SUM(v.value),0) FROM idea_votes v WHERE v.idea_id = i.id) AS vote_count,
            (SELECT COALESCE(SUM(v.value),0) FROM idea_votes v WHERE v.idea_id = i.id AND v.user_id = ?2) AS voted
     FROM ideas i JOIN users u ON u.id = i.author_id WHERE i.id = ?1`,
  )
    .bind(id, user?.id ?? "")
    .first<Row>();
  if (!idea) notFound();

  const s = STATUS[idea.status] ?? STATUS.open;

  return (
    <div className="mx-auto max-w-3xl">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 font-mono text-xs text-neutral-400">
        <Link href="/ideas" className="rounded px-1 py-0.5 transition hover:text-neutral-200">
          Ideas
        </Link>
        <span className="text-neutral-700">/</span>
        <span className="truncate text-neutral-400">{idea.title}</span>
      </nav>

      <div className="flex items-start gap-4">
        <VoteButton ideaId={idea.id} initialCount={idea.vote_count} initialVote={idea.voted} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${s.cls}`}>
              {s.label}
            </span>
            <span className="flex items-center gap-1 font-mono text-[11px] text-neutral-400">
              <Clock size={11} aria-hidden /> Round {cycle.n} · {closesInWords(cycle.daysLeft)}
            </span>
          </div>
          <h1 className="mt-2 font-mono text-2xl font-bold leading-tight tracking-tight text-white">{idea.title}</h1>
          <p className="mt-1.5 font-mono text-[11px] text-neutral-400">
            built by @{idea.github_login} · {timeAgo(idea.created_at)}
          </p>
        </div>
      </div>

      <p className="mt-5 whitespace-pre-wrap text-[15px] leading-relaxed text-neutral-300">{idea.body_md}</p>

      {/* The demo — try it before you vote */}
      {idea.demo_url ? (
        <section className="mt-6">
          <h2 className="mb-2.5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
            Try the change
          </h2>
          <DemoFrame url={idea.demo_url} title={idea.title} />
        </section>
      ) : idea.shot_url ? (
        <section className="mt-6">
          <h2 className="mb-2.5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">Screenshot</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={idea.shot_url}
            alt={`Screenshot of ${idea.title}`}
            className="w-full rounded-xl border border-neutral-700"
          />
        </section>
      ) : (
        <p className="mt-6 rounded-xl border border-dashed border-neutral-700 p-5 text-center text-sm text-neutral-400">
          No demo attached — this one&apos;s a written proposal. Want it to happen?{" "}
          <Link href="/ideas/new" className="text-emerald-400 hover:underline">
            Build it and submit a version with a demo.
          </Link>
        </p>
      )}

      {idea.repo_url && (
        <div className="mt-4">
          <ButtonLink href={idea.repo_url} variant="ghost" external>
            <Code2 size={15} aria-hidden /> Read the code <ExternalLink size={14} aria-hidden />
          </ButtonLink>
        </div>
      )}

      <p className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 text-xs leading-relaxed text-neutral-400">
        <span className="text-neutral-300">How this gets shipped:</span> when round {cycle.n} closes, the top-voted
        proposals go to code review. Nothing merges automatically — a human reads the diff before it touches the live
        site. Votes decide <em>what</em> gets built, review decides <em>whether it&apos;s safe</em>.
      </p>
    </div>
  );
}
