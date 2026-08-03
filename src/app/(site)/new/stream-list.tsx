"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, BookOpen, HelpCircle, Megaphone } from "lucide-react";
import { ProjectCard, type ProjectFeedRow } from "@/components/project-card";
import { timeAgo } from "@/lib/categories";

type StreamPost = {
  kind: "post";
  id: string;
  created_at: number;
  title: string | null;
  body_md: string;
  post_kind: string;
  github_login: string;
  avatar_url: string | null;
  comment_count: number;
  project_display: string | null;
  project_id: string | null;
};
type StreamProject = { kind: "project"; created_at: number; project: ProjectFeedRow };
export type StreamItem = StreamPost | StreamProject;

const KIND = {
  post: { label: "Update", Icon: Megaphone, cls: "text-neutral-300 border-neutral-600" },
  tutorial: { label: "Tutorial", Icon: BookOpen, cls: "text-amber-300 border-amber-400/40" },
  request: { label: "Question", Icon: HelpCircle, cls: "text-sky-300 border-sky-400/40" },
} as const;

export function StreamList({
  initialItems,
  initialCursor,
  initialVotes,
}: {
  initialItems: StreamItem[];
  initialCursor: number | null;
  initialVotes: Record<string, number>;
}) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [votes, setVotes] = useState(initialVotes);
  const [busy, setBusy] = useState(false);

  async function loadMore() {
    if (busy || cursor === null) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/stream?before=${cursor}`);
      const data = (await res.json()) as {
        items: StreamItem[];
        nextCursor: number | null;
        votes: Record<string, number>;
      };
      setItems((prev) => [...prev, ...data.items]);
      setCursor(data.nextCursor);
      setVotes((v) => ({ ...v, ...data.votes }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="space-y-3">
        {items.map((item) =>
          item.kind === "project" ? (
            <ProjectCard key={`p-${item.project.id}`} p={item.project} vote={votes[item.project.id] ?? 0} />
          ) : (
            <PostCard key={`w-${item.id}`} post={item} />
          ),
        )}
      </div>

      {cursor !== null ? (
        <div className="mt-5 flex justify-center">
          <button
            onClick={loadMore}
            disabled={busy}
            className="min-h-[44px] cursor-pointer rounded-lg border border-neutral-700 px-6 font-mono text-sm text-neutral-300 outline-none transition hover:border-emerald-400/60 hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50"
          >
            {busy ? "Loading..." : "Load more"}
          </button>
        </div>
      ) : (
        items.length > 0 && (
          <p className="mt-6 text-center font-mono text-xs text-neutral-600">
            That&apos;s everything — you&apos;re all caught up.
          </p>
        )
      )}
    </div>
  );
}

function PostCard({ post }: { post: StreamPost }) {
  const k = KIND[post.post_kind as keyof typeof KIND] ?? KIND.post;
  return (
    <article className="group relative rounded-xl border border-neutral-700/70 bg-neutral-900/40 p-4 transition duration-200 hover:border-neutral-500 hover:bg-neutral-800/40">
      <div className="flex items-center gap-2.5">
        {post.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.avatar_url} alt="" className="h-7 w-7 rounded-full border border-neutral-700" />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 font-mono text-[10px] text-neutral-400">
            {post.github_login.slice(0, 2)}
          </span>
        )}
        <Link
          href={`/u/${post.github_login}`}
          className="relative z-[2] font-mono text-xs text-neutral-300 transition hover:text-white"
        >
          @{post.github_login}
        </Link>
        <span className="font-mono text-[11px] text-neutral-500">{timeAgo(post.created_at)}</span>
        <span
          className={`ml-auto inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${k.cls}`}
        >
          <k.Icon size={11} aria-hidden /> {k.label}
        </span>
      </div>

      <h2 className="mt-2.5 font-mono text-base font-bold leading-snug text-white transition group-hover:text-emerald-300">
        <Link href={`/wire/${post.id}`} className="outline-none after:absolute after:inset-0 after:content-['']">
          {post.title ?? "(untitled)"}
        </Link>
      </h2>
      <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-neutral-400">{post.body_md}</p>

      <div className="relative z-[1] mt-2.5 flex flex-wrap items-center gap-3 font-mono text-[11px] text-neutral-500">
        <span className="inline-flex items-center gap-1">
          <MessageCircle size={12} aria-hidden /> {post.comment_count}
        </span>
        {post.project_display && post.project_id && (
          <Link
            href={`/p/${post.project_id}`}
            className="rounded border border-neutral-700 px-1.5 py-0.5 text-neutral-300 transition hover:border-emerald-400/50 hover:text-emerald-300"
          >
            {post.project_display}
          </Link>
        )}
      </div>
    </article>
  );
}
