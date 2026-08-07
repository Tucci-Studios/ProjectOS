import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { GraduationCap, Target } from "lucide-react";
import { timeAgo } from "@/lib/categories";
import { PageHeader } from "@/components/page-header";
import { ButtonLink } from "@/components/ui";
import { TutorialCard } from "@/components/tutorial-body";

export const dynamic = "force-dynamic";

/**
 * Tutorials, on their own.
 *
 * They were mixed into the community feed with a small amber label, which meant
 * the one thing a newcomer most wants — someone showing them how — was buried
 * between devlogs. Requests sit underneath, because an unanswered request is
 * the best brief a tutorial writer can get.
 */
export default async function TutorialsPage() {
  const { env } = getCloudflareContext();
  const { results } = await env.DB.prepare(
    `SELECT po.id, po.title, po.body_md, po.kind, po.created_at, u.github_login,
            (SELECT COUNT(*) FROM comments c WHERE c.post_id = po.id AND c.status = 'live') AS comment_count
     FROM posts po JOIN users u ON u.id = po.author_id
     WHERE po.status = 'live' AND po.kind IN ('tutorial','request')
     ORDER BY po.created_at DESC LIMIT 100`,
  ).all<{
    id: string;
    title: string | null;
    body_md: string;
    kind: string;
    created_at: number;
    github_login: string;
    comment_count: number;
  }>();

  const tutorials = results.filter((r) => r.kind === "tutorial");
  const requests = results.filter((r) => r.kind === "request");

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader
        crumbs={[{ label: "Tutorials" }]}
        title="Tutorials"
        purpose="Every one has the same shape: what you'll have at the end, what you need, numbered steps, and how to tell it worked."
        Icon={GraduationCap}
        accent="text-amber-400"
        action={
          <ButtonLink href="/tutorials/new" variant="outline">
            + Write one
          </ButtonLink>
        }
      />

      {tutorials.length === 0 ? (
        <div className="rounded-xl border border-dashed border-amber-400/25 p-10 text-center">
          <Target size={22} className="mx-auto text-amber-400/50" aria-hidden />
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-neutral-400">
            Tutorials are coming. They&apos;re the point of this place — how you got something working, so the next
            person doesn&apos;t lose an afternoon to it. Write one and you&apos;ve helped everybody who comes after.
          </p>
          <Link
            href="/tutorials/new"
            className="mt-3 inline-block font-mono text-[13px] font-bold text-amber-300 hover:underline"
          >
            Write one now →
          </Link>
        </div>
      ) : (
        <div className="stagger space-y-3">
          {tutorials.map((t) => (
            <TutorialCard
              key={t.id}
              id={t.id}
              title={t.title}
              bodyMd={t.body_md}
              author={t.github_login}
              when={timeAgo(t.created_at)}
              comments={t.comment_count}
            />
          ))}
        </div>
      )}

      {requests.length > 0 && (
        <section className="mt-9 border-t border-neutral-800 pt-6">
          <h2 className="font-mono text-[15px] font-bold text-white">Asked for, not written yet</h2>
          <p className="mt-0.5 text-[13px] leading-relaxed text-neutral-400">
            People stuck on something specific. Pick one off and you know somebody wants it.
          </p>
          <div className="mt-3 space-y-2">
            {requests.map((r) => (
              <Link
                key={r.id}
                href={`/wire/${r.id}`}
                className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 rounded-lg border border-neutral-800 bg-neutral-900/30 p-3 transition hover:border-violet-400/40"
              >
                <span className="font-mono text-[14px] text-neutral-200">{r.title ?? "(untitled)"}</span>
                <span className="font-mono text-[11px] text-neutral-400">
                  @{r.github_login} · {timeAgo(r.created_at)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
