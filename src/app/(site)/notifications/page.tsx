import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { Bell, GitBranch, MessageCircle, Rocket, TrendingUp } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { ButtonLink } from "@/components/ui";
import { timeAgo } from "@/lib/categories";

export const dynamic = "force-dynamic";

const KIND_ICON = {
  reply: MessageCircle,
  branch: GitBranch,
  vote_milestone: TrendingUp,
  idea_shipped: Rocket,
} as const;

export default async function NotificationsPage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-lg">
        <PageHeader crumbs={[{ label: "Notifications" }]} title="Notifications" purpose="Replies, new branches of your work, and milestones." Icon={Bell} />
        <div className="rounded-xl border border-neutral-700 bg-neutral-900/50 p-8 text-center">
          <p className="text-sm text-neutral-400">Sign in to see your notifications.</p>
          <div className="mt-4 flex justify-center">
            <ButtonLink href="/api/auth/login" variant="primary">Sign in with GitHub</ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  const { env } = getCloudflareContext();
  const { results } = await env.DB.prepare(
    "SELECT id, kind, body, href, read_at, created_at FROM notifications WHERE user_id = ?1 ORDER BY created_at DESC LIMIT 50",
  )
    .bind(user.id)
    .all<{ id: string; kind: string; body: string; href: string; read_at: number | null; created_at: number }>();

  // Opening the page marks everything read.
  if (results.some((n) => n.read_at === null)) {
    await env.DB.prepare("UPDATE notifications SET read_at = ?1 WHERE user_id = ?2 AND read_at IS NULL")
      .bind(Math.floor(Date.now() / 1000), user.id)
      .run();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        crumbs={[{ label: "Notifications" }]}
        title="Notifications"
        purpose="Replies to your posts, new branches off your projects, and when one of your ideas ships."
        Icon={Bell}
      />

      {results.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-700 p-10 text-center text-sm text-neutral-500">
          Nothing yet. Publish something or post on the feed and this fills up.
        </p>
      ) : (
        <div className="space-y-2">
          {results.map((n) => {
            const Icon = KIND_ICON[n.kind as keyof typeof KIND_ICON] ?? Bell;
            return (
              <Link
                key={n.id}
                href={n.href}
                className={`flex items-start gap-3 rounded-xl border p-3.5 outline-none transition hover:border-neutral-500 hover:bg-neutral-800/40 focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  n.read_at === null ? "border-emerald-400/30 bg-emerald-400/[0.04]" : "border-neutral-700/70 bg-neutral-900/40"
                }`}
              >
                <Icon size={16} className="mt-0.5 shrink-0 text-neutral-500" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm leading-relaxed text-neutral-200">{n.body}</span>
                  <span className="font-mono text-[11px] text-neutral-500">{timeAgo(n.created_at)}</span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
