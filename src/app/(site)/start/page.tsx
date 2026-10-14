import Link from "next/link";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Sparkles, GitFork, Package, Terminal, CircleHelp } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { DiscoverTile } from "@/components/discover";
import { TutorialCard } from "@/components/tutorial-body";
import { FirstHour, type PathStep } from "@/components/first-hour";
import { parseGuide } from "@/lib/tutorial-guide";
import { timeAgo } from "@/lib/categories";
import type { ProjectFeedRow } from "@/components/project-card";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Start here — Project OS",
  description: "New to this? What a repo is, what forking means, and something you can actually run today.",
};

/**
 * For the person who hasn't done this before.
 *
 * Everything else on the site assumes you know what a repo is and what forking
 * means. This is the page that doesn't. It's deliberately written for someone
 * who is a bit scared of it — because the scary part was never understanding
 * the idea, it's cloning a stranger's code, watching it fail, and quietly
 * concluding you're the problem.
 *
 * So the first thing it does is name that. The second is hand over projects we
 * have actually checked will probably run, rather than the most popular ones,
 * which are usually the hardest to get started with.
 */
export default async function StartPage() {
  const { env } = getCloudflareContext();

  // Not the biggest projects — the ones whose own files say they're set up to
  // be run by a stranger. Popular and easy are very different things.
  const easy = await env.DB.prepare(
    `SELECT p.id, p.base_name, p.variant_name, p.category, p.description, p.parent_id, p.created_at, p.image_url,
            u.github_login, u.avatar_url, u.is_shadow, p.owner_id, p.source, p.stars, p.github_forks, p.language, p.setup_tier,
            0 AS like_count, 0 AS fork_count, 0 AS comment_count, NULL AS image_urls, 0 AS follower_count, NULL AS parent_display
     FROM projects p JOIN users u ON u.id = p.owner_id
     WHERE p.status='live' AND p.setup_tier='easy' AND p.archived=0 AND p.stars > 200
     ORDER BY p.stars DESC LIMIT 4`,
  ).all<ProjectFeedRow>();

  // The ordered beginner route. Fixed ids rather than a query, because the
  // order is the point — install, then run someone else's thing, then learn to
  // save your own work. Each is the prerequisite for the next.
  const PATH_IDS = [
    "t_install_claude_code_v1",
    "t_fork_and_run_your_first_project_v1",
    "t_your_first_git_commit_v1",
    "t_push_your_first_change_v1",
  ];
  const WHY: Record<string, string> = {
    t_install_claude_code_v1:
      "Nothing else here works until this does. You'll end up with Claude Code installed and reading a real project out loud to you — which is the fastest way to stop being afraid of a codebase you didn't write.",
    t_fork_and_run_your_first_project_v1:
      "The one that matters. You take a copy of someone else's project and get it running on your own machine, and find out that you cannot break anything of theirs by doing it.",
    t_your_first_git_commit_v1:
      "How to save your work so you can always get back to a version that worked. Git has a reputation for being hard — this is only the part that stops you losing anything.",
    t_push_your_first_change_v1:
      "The last step of the loop. Your change goes from your laptop up to GitHub, and then you decide whether to offer it back to the project it came from. Keeping it to yourself is a perfectly good ending — most forks are exactly that.",
  };

  const pathRows = await env.DB.prepare(
    `SELECT id, title, body_md FROM posts WHERE id IN (?1, ?2, ?3, ?4) AND status='live'`,
  )
    .bind(...PATH_IDS)
    .all<{ id: string; title: string | null; body_md: string }>();

  const path: PathStep[] = PATH_IDS.map((id, i) => {
    const row = pathRows.results.find((r) => r.id === id);
    if (!row) return null;
    const g = parseGuide(row.body_md);
    if (!g) return null;
    return { id, n: i + 1, title: g.title, why: WHY[id] ?? g.summary, minutes: g.minutes, steps: g.steps.length };
  }).filter((s): s is PathStep => s !== null);

  const guides = await env.DB.prepare(
    `SELECT po.id, po.title, po.body_md, po.created_at, u.github_login
     FROM posts po JOIN users u ON u.id = po.author_id
     WHERE po.kind='tutorial' AND po.status='live'
     ORDER BY po.created_at ASC LIMIT 2`,
  ).all<{ id: string; title: string | null; body_md: string; created_at: number; github_login: string }>();

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader
        crumbs={[{ label: "Start here" }]}
        title="Start here"
        Icon={Sparkles}
      />

      <section className="rounded-xl border border-emerald-400/25 bg-emerald-400/[0.05] p-4">
        <p className="text-[14.5px] leading-relaxed text-neutral-200">
          The hard part of open source isn&apos;t understanding it. It&apos;s downloading someone else&apos;s code,
          watching it fail, and assuming you did something wrong.
        </p>
        <p className="mt-2 text-[14px] leading-relaxed text-neutral-400">
          Usually you didn&apos;t. Most projects are written for the person who already has everything set up. That
          is a problem with the project, not with you — and it&apos;s the reason this site checks every project and
          tells you upfront how much work it&apos;ll be.
        </p>
      </section>

      <div className="mt-9">
        <FirstHour path={path} />
      </div>

      <h2 className="mt-9 font-mono text-[17px] font-bold text-white">Three words, then you&apos;re fine</h2>
      <div className="mt-3 space-y-2.5">
        <Word Icon={Package} term="Repo" tone="#38bdf8">
          Short for repository. It&apos;s a folder of code that keeps its own history — every change anyone ever
          made, and who made it. That&apos;s all. When someone says &ldquo;the repo,&rdquo; they mean the project&apos;s
          folder on GitHub.
        </Word>
        <Word Icon={GitFork} term="Fork" tone="#34d399">
          Your own copy of someone else&apos;s repo. Making one changes nothing for them — they aren&apos;t notified,
          nothing of theirs moves, and you cannot break their project. It&apos;s the closest thing to a free action
          in software. If you take one thing from this page: <span className="font-bold text-emerald-300">forking
          is safe.</span>
        </Word>
        <Word Icon={Sparkles} term="Lineage" tone="#f5b544">
          Who started from whom. If you fork something and make it better, the chain back to the original stays
          visible — so the person who did the first version keeps their credit, and you keep yours. That chain is
          the thing this site exists to show.
        </Word>
      </div>

      <h2 className="mt-9 font-mono text-[17px] font-bold text-white">Try one that should actually work</h2>
      <p className="mt-1.5 text-[14px] leading-relaxed text-neutral-400">
        We looked at every project&apos;s own files to see whether a stranger could get it running — pinned
        dependencies, a real readme, no config to fill in first. These four passed and are widely used. Popular and
        easy to run are not the same thing, and this list is the second one.
      </p>
      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
        {easy.results.map((p) => (
          <DiscoverTile key={p.id} p={p} />
        ))}
      </div>
      <p className="mt-2.5 text-[13px] text-neutral-400">
        Every project page has a{" "}
        <span className="font-mono text-neutral-300">Can you run it?</span> panel showing exactly what we found and
        what we didn&apos;t.{" "}
        <Link href="/explore" className="text-emerald-400 underline-offset-4 hover:underline">
          Browse the rest →
        </Link>
      </p>

      <p className="mt-6 text-[13px] text-neutral-400">
        <Link href="/tutorials" className="text-emerald-400 underline-offset-4 hover:underline">
          Every tutorial →
        </Link>
      </p>

      <section className="mt-9 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
        <h2 className="flex items-center gap-2 font-mono text-[15px] font-bold text-white">
          <Terminal size={15} className="text-neutral-400" aria-hidden /> When it breaks
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-neutral-300">
          It will, and that is the normal experience — not the beginner experience. People who have done this for
          twenty years hit the same walls; they&apos;ve just seen these particular errors before.
        </p>
        <ul className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-neutral-400">
          {[
            ["Read the last line first.", "Error output is long and mostly noise. The final line usually says the actual problem."],
            ["Paste the whole error into an AI.", "This is the single biggest change in how approachable this is. It has seen your error thousands of times."],
            ["Check the version.", "A huge share of failures are the project wanting a different version of Node, Python or whatever it runs on."],
            ["Nothing you do locally can break the original.", "Delete the folder and start again as often as you like. It costs nothing."],
          ].map(([b, d]) => (
            <li key={b} className="flex gap-2.5">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-neutral-600" />
              <span>
                <span className="font-bold text-neutral-200">{b}</span> {d}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-8 flex items-start gap-2 border-t border-neutral-800 pt-5 text-[13.5px] leading-relaxed text-neutral-400">
        <CircleHelp size={15} className="mt-[3px] shrink-0 text-neutral-400" aria-hidden />
        <span>
          Still stuck? Ask on the{" "}
          <Link href="/wire" className="text-sky-300 underline-offset-4 hover:underline">
            community feed
          </Link>
          . &ldquo;I tried this and got this error&rdquo; is a completely normal post here, and a better one than
          most.
        </span>
      </p>
    </div>
  );
}

function Word({
  Icon,
  term,
  tone,
  children,
}: {
  Icon: typeof Package;
  term: string;
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-neutral-800 bg-neutral-900/40 p-3.5">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
        style={{ borderColor: `${tone}44`, backgroundColor: `${tone}14`, color: tone }}
        aria-hidden
      >
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <p className="font-mono text-[14px] font-bold" style={{ color: tone }}>
          {term}
        </p>
        <p className="mt-1 text-[13.5px] leading-relaxed text-neutral-300">{children}</p>
      </div>
    </div>
  );
}
