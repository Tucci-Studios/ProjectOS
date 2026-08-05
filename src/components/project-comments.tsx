"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageCircle, Trash2, CornerDownRight } from "lucide-react";
import { timeAgo } from "@/lib/categories";
import { VerifiedMark } from "./verified-mark";

export type ProjectComment = {
  id: string;
  body_md: string;
  created_at: number;
  parent_id: string | null;
  github_login: string;
  avatar_url: string | null;
  is_shadow?: number | null;
};

type Node = ProjectComment & { children: Node[] };

/** Newest thread on top, but replies inside a thread read downwards in order. */
function build(flat: ProjectComment[]): Node[] {
  const map = new Map<string, Node>();
  for (const c of flat) map.set(c.id, { ...c, children: [] });
  const roots: Node[] = [];
  for (const c of flat) {
    const node = map.get(c.id)!;
    const parent = c.parent_id ? map.get(c.parent_id) : null;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  const walk = (ns: Node[]) => {
    ns.sort((a, b) => a.created_at - b.created_at);
    for (const n of ns) walk(n.children);
  };
  walk(roots);
  return roots.reverse();
}

const countAll = (ns: Node[]): number => ns.reduce((n, c) => n + 1 + countAll(c.children), 0);

export function ProjectComments({
  projectId,
  comments,
  signedIn,
  viewerLogin,
}: {
  projectId: string;
  comments: ProjectComment[];
  signedIn: boolean;
  viewerLogin?: string;
}) {
  const router = useRouter();
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const threads = useMemo(() => build(comments), [comments]);

  return (
    <div>
      {signedIn ? (
        <Composer projectId={projectId} onDone={() => router.refresh()} />
      ) : (
        <p className="mb-4 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 text-sm text-neutral-400">
          <a href="/login" className="text-emerald-400 hover:underline">
            Sign in
          </a>{" "}
          to join the conversation.
        </p>
      )}

      {threads.length === 0 ? (
        <p className="flex items-center gap-2 rounded-xl border border-dashed border-neutral-800 p-5 text-sm text-neutral-400">
          <MessageCircle size={15} aria-hidden /> No comments yet. Be the first.
        </p>
      ) : (
        <div className="space-y-1">
          {threads.map((c) => (
            <Comment
              key={c.id}
              node={c}
              projectId={projectId}
              signedIn={signedIn}
              viewerLogin={viewerLogin}
              replyTo={replyTo}
              setReplyTo={setReplyTo}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Comment({
  node,
  projectId,
  signedIn,
  viewerLogin,
  replyTo,
  setReplyTo,
}: {
  node: Node;
  projectId: string;
  signedIn: boolean;
  viewerLogin?: string;
  replyTo: string | null;
  setReplyTo: (id: string | null) => void;
}) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [hot, setHot] = useState(false);
  const hidden = countAll(node.children);

  async function remove() {
    await fetch("/api/project-comments/manage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId: node.id, action: "delete" }),
    });
    router.refresh();
  }

  if (collapsed)
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="flex min-h-[30px] cursor-pointer items-center gap-2 rounded-md px-1 font-mono text-[12px] text-neutral-400 transition hover:text-neutral-200"
      >
        <span className="text-emerald-400">[+]</span> @{node.github_login}
        {hidden > 0 && ` · ${hidden} more`}
      </button>
    );

  return (
    <div className="py-0.5">
      <div className="rounded-lg px-1 py-1.5">
        <div className="flex items-center gap-2">
          {node.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={node.avatar_url} alt="" className="h-6 w-6 rounded-full border border-neutral-700" />
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 font-mono text-[9px] text-neutral-400">
              {node.github_login.slice(0, 2)}
            </span>
          )}
          <Link href={`/u/${node.github_login}`} className="font-mono text-xs text-neutral-300 hover:text-white">
            @{node.github_login}
          </Link>
          {node.is_shadow === 0 && <VerifiedMark size={10} />}
          <span className="font-mono text-[11px] text-neutral-400">{timeAgo(node.created_at)}</span>

          {viewerLogin === node.github_login && (
            <button
              onClick={remove}
              aria-label="Delete comment"
              title="Delete"
              className="ml-auto flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-neutral-400 transition hover:bg-neutral-800 hover:text-rose-300"
            >
              <Trash2 size={12} aria-hidden />
            </button>
          )}
        </div>

        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-neutral-300">{node.body_md}</p>

        {signedIn && (
          <button
            onClick={() => setReplyTo(replyTo === node.id ? null : node.id)}
            className="mt-1 flex min-h-[28px] cursor-pointer items-center gap-1.5 rounded px-1 font-mono text-[11px] text-neutral-400 transition hover:text-emerald-300"
          >
            <CornerDownRight size={11} aria-hidden /> {replyTo === node.id ? "Cancel" : "Reply"}
          </button>
        )}
      </div>

      {replyTo === node.id && (
        <div className="ml-[17px] border-l border-neutral-800 pl-3">
          <Composer
            projectId={projectId}
            parentId={node.id}
            replyingTo={node.github_login}
            onDone={() => {
              setReplyTo(null);
              router.refresh();
            }}
            onCancel={() => setReplyTo(null)}
          />
        </div>
      )}

      {node.children.length > 0 && (
        <div className="flex">
          {/* The line IS the control: hover highlights the thread, clicking folds it. */}
          <button
            onMouseEnter={() => setHot(true)}
            onMouseLeave={() => setHot(false)}
            onClick={() => setCollapsed(true)}
            aria-label={`Collapse thread from @${node.github_login}`}
            className="flex w-[17px] shrink-0 cursor-pointer justify-center outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <span className={`h-full w-px transition-colors ${hot ? "bg-emerald-400" : "bg-neutral-800"}`} />
          </button>
          <div className="min-w-0 flex-1">
            {node.children.map((c) => (
              <Comment
                key={c.id}
                node={c}
                projectId={projectId}
                signedIn={signedIn}
                viewerLogin={viewerLogin}
                replyTo={replyTo}
                setReplyTo={setReplyTo}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Composer({
  projectId,
  parentId,
  replyingTo,
  onDone,
  onCancel,
}: {
  projectId: string;
  parentId?: string;
  replyingTo?: string;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/project-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, body, parentId }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (data.ok) {
        setBody("");
        onDone();
        return;
      }
      setError(data.error ?? "Failed.");
    } catch {
      setError("Network error — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className={parentId ? "my-2" : "mb-4"}>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        autoFocus={!!parentId}
        rows={parentId ? 2 : 3}
        maxLength={2000}
        placeholder={replyingTo ? `Reply to @${replyingTo}...` : "Tried it? Broke it? Have a question for the author?"}
        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 outline-none transition focus:border-emerald-400"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="min-h-[34px] cursor-pointer rounded-lg bg-emerald-400 px-4 font-mono text-[13px] font-bold text-black transition hover:bg-emerald-300 disabled:opacity-50"
        >
          {busy ? "Posting..." : parentId ? "Reply" : "Comment"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[34px] cursor-pointer font-mono text-[13px] text-neutral-400 transition hover:text-white"
          >
            Cancel
          </button>
        )}
        {error && <span className="font-mono text-[11px] text-rose-400">{error}</span>}
      </div>
    </form>
  );
}
