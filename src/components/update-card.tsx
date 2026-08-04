import Link from "next/link";
import { Megaphone } from "lucide-react";
import { timeAgo } from "@/lib/categories";

export type FeedUpdate = {
  id: string;
  project_id: string;
  version: string | null;
  body_md: string;
  created_at: number;
  github_login: string;
  project_display: string;
};

/**
 * An update in the feed. Deliberately lighter than a project card — a new
 * fork is the big event, an update is the steady drumbeat, and the feed
 * should read that way at a glance.
 */
export function UpdateCard({ u }: { u: FeedUpdate }) {
  return (
    <article className="group relative rounded-xl border border-neutral-800 bg-neutral-900/30 p-4 transition duration-200 hover:border-neutral-600 hover:bg-neutral-800/40">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          <Megaphone size={11} aria-hidden /> Update
        </span>
        <span className="font-mono text-[13px] font-bold text-neutral-100 transition group-hover:text-emerald-300">
          {u.project_display}
        </span>
        {u.version && (
          <span className="rounded border border-neutral-600 px-1.5 py-px font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-300">
            {u.version}
          </span>
        )}
        <span className="font-mono text-[11px] text-neutral-400">
          @{u.github_login} · {timeAgo(u.created_at)}
        </span>
      </div>

      <p className="mt-1.5 line-clamp-3 whitespace-pre-wrap text-[14px] leading-relaxed text-neutral-400">
        {u.body_md}
      </p>

      <Link
        href={`/p/${u.project_id}`}
        aria-label={`Open ${u.project_display}`}
        className="absolute inset-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      />
    </article>
  );
}
