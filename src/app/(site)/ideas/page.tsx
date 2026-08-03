import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { Lightbulb, Plus, Play, Code2, Clock, Trophy, Hammer, CheckCircle2 } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { ButtonLink } from "@/components/ui";
import { VoteButton } from "@/components/vote-button";
import { IdeaTabs, type IdeaTab } from "@/components/idea-tabs";
import { timeAgo } from "@/lib/categories";
import { currentCycle, closesInWords } from "@/lib/cycles";

export const dynamic = "force-dynamic";

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

export default async function IdeasPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab: raw } = await searchParams;
  const tab: IdeaTab = raw === "winners" || raw === "archive" ? raw : "vote";

  const user = await getSessionUser();
  const { env } = getCloudflareContext();
  const cycle = currentCycle();

  const { results } = await env.DB.prepare(
    `SELECT i.id, i.title, i.body_md, i.status, i.demo_url, i.repo_url, i.created_at, u.github_login,
            (SELECT COALESCE(SUM(v.value),0) FROM idea_votes v WHERE v.idea_id = i.id) AS vote_count,
            (SELECT COALESCE(SUM(v.value),0) FROM idea_votes v WHERE v.idea_id = i.id AND v.user_id = ?1) AS voted
     FROM ideas i JOIN users u ON u.id = i.author_id
     ORDER BY vote_count DESC, i.created_at DESC`,
  )
    .bind(user?.id ?? "")
    .all<IdeaRow>();

  const upForVote = results.filter((i) => i.status === "open");
  const incoming = results.filter((i) => i.status === "planned" || i.status === "building");
  const shipped = results.filter((i) => i.status === "shipped");
  const declined = results.filter((i) => i.status === "declined");
  const counts = { vote: upForVote.length, winners: incoming.length + shipped.length, archive: declined.length };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-x-5 gap-y-3">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2.5 font-mono text-2xl font-bold tracking-tight text-white">
            <Lightbulb size={22} className="text-amber-300" aria-hidden /> Ideas
          </h1>
          <p className="mt-1 font-mono text-[13px] text-neutral-400">
            {tab === "vote" ? (
              <>
                <span className="font-bold text-emerald-300">Round {cycle.n}</span>
                <span className="text-neutral-600"> · </span>
                voting {closesInWords(cycle.daysLeft)}
                <span className="text-neutral-600"> · </span>
                most votes ships
              </>
            ) : tab === "winners" ? (
              <>Changes that won a round — shipped, or on the way.</>
            ) : (
              <>Everything that didn&apos;t make it. Nothing is ever deleted.</>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/ideas/build" variant="ghost" className="!min-h-[38px] !text-[13px]">
            <Code2 size={14} aria-hidden /> Get the code
          </ButtonLink>
          <ButtonLink
            href={user ? "/ideas/new" : "/api/auth/login"}
            variant="primary"
            className="!min-h-[38px] !text-[13px]"
          >
            <Plus size={15} aria-hidden /> Submit a change
          </ButtonLink>
        </div>
      </div>

      <IdeaTabs active={tab} counts={counts} />

      {tab === "vote" && (
        <>
          {upForVote.length === 0 ? (
            <Empty>Nothing up for vote this round. Fork the site, build something, and show everyone.</Empty>
          ) : (
            <ol className="space-y-3">
              {upForVote.map((idea, i) => (
                <li key={idea.id}>
                  <article
                    className={`group relative flex items-start gap-3.5 rounded-xl border p-4 transition duration-200 hover:bg-neutral-800/40 ${
                      i === 0 && idea.vote_count > 0
                        ? "border-emerald-400/40 bg-emerald-400/[0.04]"
                        : "border-neutral-700/70 bg-neutral-900/40 hover:border-neutral-500"
                    }`}
                  >
                    <span className="w-5 shrink-0 pt-1 text-right font-mono text-[13px] text-neutral-600">{i + 1}</span>
                    <div className="relative z-[2] shrink-0">
                      <VoteButton ideaId={idea.id} initialCount={idea.vote_count} initialVote={idea.voted} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {i === 0 && idea.vote_count > 0 && (
                          <Chip tone="emerald">
                            <Trophy size={10} aria-hidden /> Leading
                          </Chip>
                        )}
                        {idea.demo_url && (
                          <Chip tone="sky">
                            <Play size={10} aria-hidden /> Live demo
                          </Chip>
                        )}
                        {idea.repo_url && (
                          <Chip tone="grey">
                            <Code2 size={10} aria-hidden /> Code
                          </Chip>
                        )}
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
                </li>
              ))}
            </ol>
          )}
        </>
      )}

      {tab === "winners" && (
        <>
          {incoming.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-1 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
                <Hammer size={13} aria-hidden /> Shipping soon
              </h2>
              <p className="mb-3 text-sm leading-relaxed text-neutral-500">
                Won a round. The code is public and going through a security check before it goes live.
              </p>
              <div className="space-y-3">
                {incoming.map((idea) => (
                  <article
                    key={idea.id}
                    className="group relative rounded-xl border border-amber-400/35 bg-amber-400/[0.05] p-4 transition hover:bg-amber-400/[0.08]"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Chip tone="amber">
                        <Trophy size={10} aria-hidden /> Won round {Math.max(1, cycle.n - 1)}
                      </Chip>
                      <span className="font-mono text-[11px] text-neutral-400">
                        {idea.vote_count} vote{Math.abs(idea.vote_count) === 1 ? "" : "s"} ·{" "}
                        {idea.status === "planned" ? "security check" : "being built"}
                      </span>
                    </div>
                    <h3 className="mt-2 font-mono text-base font-bold leading-snug text-white transition group-hover:text-amber-200">
                      &ldquo;{idea.title}&rdquo;
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-neutral-400">{idea.body_md}</p>
                    <p className="mt-2 font-mono text-[11px] text-neutral-500">
                      built by @{idea.github_login} · lands in{" "}
                      <Link href="/news" className="relative z-[2] text-amber-300 hover:underline">
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

          <section>
            <h2 className="mb-1 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              <CheckCircle2 size={13} aria-hidden /> Already in the site
            </h2>
            <p className="mb-3 text-sm leading-relaxed text-neutral-500">
              Past rounds that shipped. You&apos;re using them right now.
            </p>
            {shipped.length === 0 ? (
              <Empty>Nothing has shipped yet.</Empty>
            ) : (
              <div className="space-y-2.5">
                {shipped.map((idea) => (
                  <Link
                    key={idea.id}
                    href={`/ideas/${idea.id}`}
                    className="block rounded-xl border border-emerald-400/25 bg-emerald-400/[0.04] px-4 py-3 transition hover:border-emerald-400/50"
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <Chip tone="emerald">
                        <CheckCircle2 size={10} aria-hidden /> Shipped
                      </Chip>
                      <span className="font-mono text-[11px] text-neutral-500">
                        {idea.vote_count} vote{Math.abs(idea.vote_count) === 1 ? "" : "s"} · by @{idea.github_login}
                      </span>
                    </span>
                    <span className="mt-1.5 block font-mono text-[15px] font-bold text-white">
                      &ldquo;{idea.title}&rdquo;
                    </span>
                  </Link>
                ))}
              </div>
            )}
            <Link
              href="/news"
              className="mt-3 inline-block font-mono text-[12px] text-neutral-500 transition hover:text-emerald-300"
            >
              Read the release notes in News →
            </Link>
          </section>
        </>
      )}

      {tab === "archive" && (
        <section>
          <p className="mb-3 text-sm leading-relaxed text-neutral-500">
Proposals that lost their round or were turned down. Nothing is ever deleted — the reasoning stays readable.
          </p>
          {declined.length === 0 ? (
            <Empty>The archive is empty — nothing has been turned down yet.</Empty>
          ) : (
            <div className="space-y-2">
              {declined.map((idea) => (
                <Link
                  key={idea.id}
                  href={`/ideas/${idea.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-900/30 px-3.5 py-2.5 transition hover:border-neutral-600"
                >
                  <span className="min-w-0 truncate font-mono text-[13px] text-neutral-500">{idea.title}</span>
                  <span className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                    Not doing
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
      <p className="mt-8 border-t border-neutral-800 pt-5 text-[13px] leading-relaxed text-neutral-500">
        <span className="text-neutral-300">How this works:</span>{" "}the site is built on itself. Fork it, build your
        change, deploy it, and post it here — everyone tries the real thing before they vote. The round&apos;s winner
        gets a security check, then ships.
      </p>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-neutral-700 p-10 text-center text-sm text-neutral-500">
      {children}
    </p>
  );
}

const TONES = {
  emerald: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  amber: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  sky: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  grey: "border-neutral-600 text-neutral-400",
};

function Chip({ tone, children }: { tone: keyof typeof TONES; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
