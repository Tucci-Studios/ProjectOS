import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { GraduationCap, Target } from "lucide-react";
import { timeAgo, CATEGORY_META, categoryMeta, GROUPS, GROUP_ORDER } from "@/lib/categories";
import { parseGuide } from "@/lib/tutorial-guide";
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
            po.category,
            (SELECT COUNT(*) FROM comments c WHERE c.post_id = po.id AND c.status = 'live') AS comment_count
     FROM posts po JOIN users u ON u.id = po.author_id
     WHERE po.status = 'live' AND po.kind = 'tutorial'
     ORDER BY po.created_at DESC LIMIT 100`,
  ).all<{
    id: string;
    title: string | null;
    body_md: string;
    kind: string;
    created_at: number;
    github_login: string;
    category: string | null;
    comment_count: number;
  }>();

  const tutorials = results.filter((r) => r.kind === "tutorial");

  // A tutorial's section is on the post row; fall back to the guide body for
  // anything written before the column existed.
  const groupOf = (r: (typeof results)[number]) => {
    const slug = r.category || parseGuide(r.body_md)?.category || "";
    return CATEGORY_META.some((c) => c.slug === slug) ? categoryMeta(slug).group : null;
  };

  const byGroup = GROUP_ORDER.map((key) => ({
    key,
    group: GROUPS[key],
    items: tutorials.filter((t) => groupOf(t) === key),
  })).filter((g) => g.items.length > 0);

  const unfiled = tutorials.filter((t) => groupOf(t) === null);

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
        <div className="space-y-9">
          {byGroup.map(({ key, group, items }) => (
            <section key={key}>
              <div className="mb-3 flex items-baseline gap-2.5 border-b border-neutral-800 pb-2">
                <group.Icon size={15} style={{ color: group.hex }} aria-hidden />
                <h2 className="font-mono text-[15px] font-bold" style={{ color: group.hex }}>
                  {group.label}
                </h2>
                <span className="font-mono text-[11.5px] text-neutral-400">
                  {items.length} guide{items.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="stagger space-y-2.5">
                {items.map((t) => (
                  <TutorialCard
                    key={t.id}
                    id={t.id}
                    title={t.title}
                    bodyMd={t.body_md}
                    author={t.github_login}
                    when={timeAgo(t.created_at)}
                    comments={t.comment_count}
                    category={t.category ?? undefined}
                  />
                ))}
              </div>
            </section>
          ))}

          {unfiled.length > 0 && (
            <section>
              <h2 className="mb-3 border-b border-neutral-800 pb-2 font-mono text-[15px] font-bold text-neutral-400">
                Everything else
              </h2>
              <div className="stagger space-y-2.5">
                {unfiled.map((t) => (
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
            </section>
          )}
        </div>
      )}

    </div>
  );
}
