import Link from "next/link";
import { PenLine, GraduationCap } from "lucide-react";

export type CreditedPost = {
  id: string;
  title: string | null;
  kind: string;
  created_at: number;
  github_login: string;
  owner_mark?: string | null;
  by_owner?: number;
  likes?: number;
};

/**
 * What people wrote about this project.
 *
 * Posts could always credit a project; nothing ever showed it back. That made
 * crediting a dead end — you linked a project and the project never knew, so
 * there was no reason to bother.
 *
 * This is the half that makes the loop worth closing. GitHub can tell you a
 * fork exists; it can't tell you someone got this working with Claude Code on a
 * Tuesday and wrote down how. That's the thing only this site can hold, and it
 * belongs on the project's own page.
 */
export function BuiltWith({ posts, repo }: { posts: CreditedPost[]; repo: string }) {
  if (!posts.length) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-2.5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-neutral-400">
        <PenLine size={12} aria-hidden /> Written about
      </h2>
      <div className="space-y-1.5">
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/wire/${p.id}`}
            className="flex items-center gap-2.5 rounded-lg border border-neutral-800 px-3.5 py-2.5 outline-none transition hover:border-emerald-400/40 focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {p.kind === "tutorial" && <GraduationCap size={13} className="shrink-0 text-amber-300" aria-hidden />}
            <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-neutral-200">
              {p.title ?? "(untitled)"}
            </span>
            {p.by_owner ? (
              <span className="shrink-0 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
                by owner
              </span>
            ) : p.owner_mark === "approved" ? (
              <span className="shrink-0 rounded-full border border-emerald-400/30 px-2 py-0.5 font-mono text-[10px] text-emerald-300/80">
                approved
              </span>
            ) : p.owner_mark === "disputed" ? (
              <span className="shrink-0 rounded-full border border-rose-400/40 px-2 py-0.5 font-mono text-[10px] text-rose-300">
                disputed
              </span>
            ) : null}
            <span className="shrink-0 font-mono text-[11px] text-neutral-400">@{p.github_login}</span>
          </Link>
        ))}
      </div>
      <p className="mt-2 font-mono text-[11px] text-neutral-400">
        Built something with {repo.split("/")[1]}?{" "}
        <Link href="/wire/new" className="text-emerald-400 hover:underline">
          Write it up
        </Link>{" "}
        — it lands here.
      </p>
    </section>
  );
}
