"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputCls =
  "w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 font-mono text-sm text-white placeholder-neutral-600 outline-none focus:border-cyan-400";

export function NewPostForm({ projects }: { projects: { id: string; display: string }[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState<"post" | "tutorial">("post");
  const [projectId, setProjectId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, kind, projectId: projectId || undefined }),
      });
      const data = (await res.json()) as { ok?: boolean; id?: string; error?: string };
      if (data.ok && data.id) {
        router.push(`/uplink/${data.id}`);
        return;
      }
      setError(data.error ?? "Something went wrong.");
    } catch {
      setError("Network error — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="mb-1 block font-mono text-xs text-neutral-400">Title</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} className={inputCls} />
      </label>
      <label className="block">
        <span className="mb-1 block font-mono text-xs text-neutral-400">Body</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={10}
          maxLength={5000}
          className={inputCls}
          placeholder="Devlog, tip, tutorial, hot take..."
        />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label>
          <span className="mb-1 block font-mono text-xs text-neutral-400">Type</span>
          <select value={kind} onChange={(e) => setKind(e.target.value as "post" | "tutorial")} className={inputCls}>
            <option value="post">post</option>
            <option value="tutorial">tutorial</option>
          </select>
        </label>
        <label>
          <span className="mb-1 block font-mono text-xs text-neutral-400">Attach a project (optional)</span>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={inputCls}>
            <option value="">— none —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.display}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="submit"
        disabled={busy}
        className="rounded bg-cyan-400 px-5 py-2 font-mono text-sm font-semibold text-black transition hover:bg-cyan-300 disabled:opacity-50"
      >
        {busy ? "Posting..." : "Post to Uplink"}
      </button>
      {error && <p className="font-mono text-xs text-rose-400">▸ {error}</p>}
    </form>
  );
}
