"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, Plus, Trash2 } from "lucide-react";
import { timeAgo } from "@/lib/categories";

export type ProjectUpdate = {
  id: string;
  version: string | null;
  body_md: string;
  created_at: number;
  github_login: string;
  avatar_url: string | null;
};

/**
 * A project's changelog. Only the owner can post; everyone else reads.
 * Branches are rare events — this is the weekly motion that keeps a project
 * (and the feed) alive between them.
 */
export function ProjectUpdates({
  projectId,
  updates,
  isOwner,
}: {
  projectId: string;
  updates: ProjectUpdate[];
  isOwner: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [version, setVersion] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function post(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/project-updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, version, body }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (data.ok) {
        setBody("");
        setVersion("");
        setOpen(false);
        router.refresh();
        return;
      }
      setError(data.error ?? "Something went wrong.");
    } catch {
      setError("Network error — try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    await fetch(`/api/project-updates?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    router.refresh();
  }

  const input =
    "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 font-mono text-sm text-white placeholder-neutral-600 outline-none transition focus:border-emerald-400";

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <h2 className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
          <Megaphone size={13} aria-hidden /> Updates
          {updates.length > 0 && <span className="text-neutral-600">{updates.length}</span>}
        </h2>
        {isOwner && !open && (
          <button
            onClick={() => setOpen(true)}
            className="ml-auto flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-full border border-neutral-600 px-3 font-mono text-[12px] text-neutral-300 outline-none transition hover:border-emerald-400/60 hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <Plus size={13} aria-hidden /> Post an update
          </button>
        )}
      </div>

      {isOwner && open && (
        <form onSubmit={post} className="mb-4 space-y-2.5 rounded-xl border border-emerald-400/30 bg-emerald-400/[0.04] p-3.5">
          <input
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            maxLength={24}
            placeholder="v0.3 (optional)"
            aria-label="Version label"
            className={`${input} max-w-[200px]`}
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={4}
            maxLength={2000}
            placeholder="What changed? Plain words — people following this will see it in their feed."
            className={input}
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={busy}
              className="min-h-[38px] cursor-pointer rounded-lg bg-emerald-400 px-4 font-mono text-[13px] font-bold text-black transition hover:bg-emerald-300 disabled:opacity-50"
            >
              {busy ? "Posting..." : "Post update"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="min-h-[38px] cursor-pointer rounded-lg px-3 font-mono text-[13px] text-neutral-400 transition hover:text-white"
            >
              Cancel
            </button>
            {error && <span className="font-mono text-[12px] text-rose-400">▸ {error}</span>}
          </div>
        </form>
      )}

      {updates.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-700 px-4 py-6 text-center text-sm text-neutral-500">
          {isOwner
            ? "No updates yet. Post one when you change something — everyone following this project will see it."
            : "No updates yet."}
        </p>
      ) : (
        <ol className="space-y-0">
          {updates.map((u, i) => (
            <li key={u.id} className="relative flex gap-3 pl-1">
              {/* timeline rail */}
              <span className="relative flex w-3 shrink-0 justify-center">
                <span
                  className={`absolute top-[7px] h-2.5 w-2.5 rounded-full ${
                    i === 0 ? "bg-emerald-400" : "border border-neutral-600 bg-neutral-900"
                  }`}
                />
                {i < updates.length - 1 && <span className="mt-4 w-px flex-1 bg-neutral-800" />}
              </span>

              <div className="min-w-0 flex-1 pb-5">
                <div className="flex flex-wrap items-center gap-2">
                  {u.version && (
                    <span className="rounded border border-neutral-600 px-1.5 py-px font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-300">
                      {u.version}
                    </span>
                  )}
                  <span className="font-mono text-[11px] text-neutral-500">
                    @{u.github_login} · {timeAgo(u.created_at)}
                  </span>
                  {i === 0 && (
                    <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">latest</span>
                  )}
                  {isOwner && (
                    <button
                      onClick={() => remove(u.id)}
                      aria-label="Delete this update"
                      className="ml-auto cursor-pointer rounded p-1 text-neutral-600 outline-none transition hover:text-rose-400 focus-visible:ring-2 focus-visible:ring-rose-400"
                    >
                      <Trash2 size={13} aria-hidden />
                    </button>
                  )}
                </div>
                <p className="mt-1 whitespace-pre-wrap text-[14px] leading-relaxed text-neutral-300">{u.body_md}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
