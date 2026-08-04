import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, HeartHandshake, ArrowUpRight } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { ModActions } from "./mod-actions";
import { ApplicationActions } from "./application-actions";
import { roleByKey } from "@/lib/help-roles";
import { timeAgo } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function ModPage() {
  const user = await getSessionUser();
  // Not a locked door with a sign on it. If you aren't a moderator this page
  // doesn't exist, which is also the honest answer — it's a tool, not a feature.
  const isMod = user?.role === "admin" || user?.role === "mod";
  if (!isMod) notFound();

  const { env } = getCloudflareContext();
  const { results } = await env.DB.prepare(
    `SELECT r.id, r.target_type, r.target_id, r.reason, r.status, r.created_at, u.github_login AS reporter
     FROM reports r JOIN users u ON u.id = r.reporter_id
     ORDER BY CASE r.status WHEN 'open' THEN 0 ELSE 1 END, r.created_at DESC LIMIT 100`,
  ).all<{
    id: string;
    target_type: string;
    target_id: string;
    reason: string;
    status: string;
    created_at: number;
    reporter: string;
  }>();

  const { results: apps } = user!.role === "admin" ? await env.DB.prepare(
    `SELECT a.id, a.role, a.body, a.contact, a.created_at, u.github_login, u.avatar_url
     FROM help_applications a JOIN users u ON u.id = a.user_id
     WHERE a.status = 'open' ORDER BY a.created_at DESC LIMIT 50`,
  ).all<{
    id: string;
    role: string;
    body: string;
    contact: string | null;
    created_at: number;
    github_login: string;
    avatar_url: string | null;
  }>() : { results: [] as never[] };

  const open = results.filter((r) => r.status === "open");
  const closed = results.filter((r) => r.status !== "open");

  const hrefFor = (t: string, id: string) =>
    t === "project" ? `/p/${id}` : t === "post" ? `/wire/${id}` : t === "user" ? `/u/${id}` : "#";

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        crumbs={[{ label: "Moderation" }]}
        title="Moderation"
        purpose={`${open.length} open report${open.length === 1 ? "" : "s"}. Removing delists the content; dismissing keeps it up.`}
        Icon={ShieldAlert}
      />

      {user!.role === "admin" && (
      <section className="mb-7 rounded-xl border border-neutral-800 bg-neutral-900/30 p-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <HeartHandshake size={17} className="shrink-0 text-emerald-400" aria-hidden />
          <div className="min-w-0 flex-1">
            <h2 className="font-mono text-[14px] font-bold text-white">Looking for help</h2>
            <p className="mt-0.5 text-[13px] leading-relaxed text-neutral-400">
              {apps.length
                ? `${apps.length} application${apps.length === 1 ? "" : "s"} waiting below.`
                : "Nobody has applied yet. The board is public — send people to it."}
            </p>
          </div>
          <Link
            href="/help"
            className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-lg border border-emerald-400/40 px-3 font-mono text-[13px] text-emerald-300 outline-none transition hover:bg-emerald-400/10 focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            See the board <ArrowUpRight size={13} aria-hidden />
          </Link>
        </div>

        {apps.length > 0 && (
          <div className="mt-4 space-y-3 border-t border-neutral-800 pt-4">
            {apps.map((a) => (
              <article key={a.id} className="rounded-lg border border-neutral-800 bg-neutral-950/40 p-3.5">
                <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                  <Link href={`/u/${a.github_login}`} className="font-mono text-[13px] font-bold text-white hover:text-emerald-300">
                    @{a.github_login}
                  </Link>
                  <span className="font-mono text-[12px] text-emerald-400">
                    {roleByKey(a.role)?.title ?? a.role}
                  </span>
                  <span className="font-mono text-[11px] text-neutral-600">{timeAgo(a.created_at)}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-relaxed text-neutral-300">{a.body}</p>
                {a.contact && (
                  <p className="mt-2 font-mono text-[12px] text-neutral-500">Reach them at {a.contact}</p>
                )}
                <ApplicationActions id={a.id} />
              </article>
            ))}
          </div>
        )}
      </section>
      )}

      {open.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-700 p-10 text-center text-sm text-neutral-500">
          Nothing reported. Quiet is good.
        </p>
      ) : (
        <div className="space-y-3">
          {open.map((r) => (
            <article key={r.id} className="rounded-xl border border-rose-400/25 bg-rose-500/[0.04] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-rose-400/40 bg-rose-400/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-rose-300">
                  {r.target_type}
                </span>
                <span className="font-mono text-[11px] text-neutral-500">
                  reported by @{r.reporter} · {timeAgo(r.created_at)}
                </span>
                <Link
                  href={hrefFor(r.target_type, r.target_id)}
                  className="ml-auto font-mono text-[12px] text-neutral-400 transition hover:text-white"
                >
                  View it →
                </Link>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-neutral-200">{r.reason}</p>
              <ModActions reportId={r.id} />
            </article>
          ))}
        </div>
      )}

      {closed.length > 0 && (
        <section className="mt-8 border-t border-neutral-800 pt-6">
          <h2 className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-600">Handled</h2>
          <div className="space-y-2">
            {closed.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-900/30 px-3.5 py-2.5"
              >
                <span className="min-w-0 truncate font-mono text-[12px] text-neutral-500">
                  {r.target_type} · {r.reason}
                </span>
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-neutral-600">{r.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
