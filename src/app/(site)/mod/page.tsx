import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { ModActions } from "./mod-actions";
import { timeAgo } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function ModPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-lg">
        <PageHeader crumbs={[{ label: "Moderation" }]} title="Moderation" purpose="Reports from the community." Icon={ShieldAlert} />
        <p className="rounded-xl border border-neutral-700 bg-neutral-900/50 p-8 text-center text-sm text-neutral-400">
          This queue is for admins.
        </p>
      </div>
    );
  }

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
