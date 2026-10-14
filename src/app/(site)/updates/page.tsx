import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { Megaphone, Plus, Wrench, Bug, Rocket, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { getSessionUser } from "@/lib/auth";
import { BrandMark } from "@/components/brand";

export const dynamic = "force-dynamic";

type UpdateRow = {
  id: string;
  version: string | null;
  title: string;
  intro: string | null;
  body_md: string;
  published_at: number;
  github_login: string;
};

// Patch-note lines are prefixed: "+" added, "~" changed, "-" fixed, ">" shipped
// from a community idea. Everything else renders as plain text.
const LINE_KINDS = {
  "+": { Icon: Plus, cls: "text-emerald-300", label: "Added" },
  "~": { Icon: Wrench, cls: "text-amber-300", label: "Changed" },
  "-": { Icon: Bug, cls: "text-sky-300", label: "Fixed" },
  ">": { Icon: Rocket, cls: "text-fuchsia-300", label: "From an idea" },
} as const;

function dateLabel(epoch: number) {
  return new Date(epoch * 1000).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

export default async function UpdatesPage() {
  const user = await getSessionUser();
  const { env } = getCloudflareContext();
  const { results } = await env.DB.prepare(
    `SELECT u.id, u.version, u.title, u.intro, u.body_md, u.published_at, au.github_login
     FROM updates u JOIN users au ON au.id = u.author_id
     ORDER BY u.published_at DESC LIMIT 25`,
  ).all<UpdateRow>();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        crumbs={[{ label: "Updates" }]}
        title="Updates"
        Icon={Megaphone}
      />

      {user?.role === "admin" && (
        <Link
          href="/updates/new"
          className="mb-5 inline-flex min-h-[38px] items-center gap-2 rounded-lg border border-neutral-700 px-3.5 font-mono text-[13px] text-neutral-200 outline-none transition hover:border-emerald-400/50 hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <Plus size={14} aria-hidden /> Post an update
        </Link>
      )}

      {results.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-700 p-10 text-center text-sm text-neutral-400">
          No updates posted yet.
        </p>
      ) : (
        <div className="space-y-5">
          {results.map((u, i) => (
            <article
              key={u.id}
              className={`overflow-hidden rounded-xl border bg-neutral-900/40 ${
                i === 0 ? "border-emerald-400/30" : "border-neutral-700/70"
              }`}
            >
              {/* Steam-style banner strip */}
              <div className="flex flex-wrap items-center gap-3 border-b border-neutral-800 bg-neutral-900/70 px-5 py-3">
                <BrandMark size={30} />
                <div className="min-w-0 flex-1">
                  <h2 className="font-mono text-base font-bold leading-tight text-white">{u.title}</h2>
                  <p className="font-mono text-[11px] text-neutral-400">
                    {u.version && <span className="text-neutral-400">{u.version} · </span>}
                    {dateLabel(u.published_at)} · @{u.github_login}
                  </p>
                </div>
                {i === 0 && (
                  <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    Latest
                  </span>
                )}
              </div>

              <div className="px-5 py-4">
                {u.intro && <p className="mb-4 text-[15px] leading-relaxed text-neutral-300">{u.intro}</p>}
                <ul className="space-y-2">
                  {u.body_md
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((line, idx) => {
                      const mark = line[0] as keyof typeof LINE_KINDS;
                      const kind = LINE_KINDS[mark];
                      if (!kind) {
                        return (
                          <li key={idx} className="text-sm leading-relaxed text-neutral-400">
                            {line}
                          </li>
                        );
                      }
                      const text = line.slice(1).trim();
                      return (
                        <li key={idx} className="flex items-start gap-2.5">
                          <kind.Icon size={14} className={`mt-[3px] shrink-0 ${kind.cls}`} aria-hidden />
                          <span className="text-sm leading-relaxed text-neutral-300">
                            <span className={`mr-1.5 font-mono text-[10px] font-bold uppercase tracking-wider ${kind.cls}`}>
                              {kind.label}
                            </span>
                            {text}
                          </span>
                        </li>
                      );
                    })}
                </ul>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-4 rounded-xl border border-neutral-700/70 bg-neutral-900/40 px-5 py-4">
        <p className="text-sm text-neutral-400">
          Want something on this page? Build it and put it up for a vote.
        </p>
        <Link
          href="/ideas"
          className="inline-flex shrink-0 items-center gap-1.5 font-mono text-sm text-emerald-300 transition hover:underline"
        >
          Ideas <ArrowRight size={14} aria-hidden />
        </Link>
      </div>
    </div>
  );
}
