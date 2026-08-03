"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Code2, Image as ImageIcon } from "lucide-react";

const input =
  "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3.5 py-2.5 font-mono text-sm text-white placeholder-neutral-600 outline-none transition focus:border-emerald-400";

export function NewIdeaForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [shotUrl, setShotUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, demoUrl, repoUrl, shotUrl }),
      });
      const data = (await res.json()) as { ok?: boolean; id?: string; error?: string };
      if (data.ok && data.id) {
        router.push(`/ideas/${data.id}`);
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

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="rounded-xl border border-neutral-700/70 bg-neutral-900/40 p-4 text-sm leading-relaxed text-neutral-400">
        <span className="text-neutral-200">The strongest proposals are already built.</span> Need the site&apos;s
        code?{" "}
        <a href="/ideas/build" className="text-emerald-400 hover:underline">
          Grab a copy and run it locally
        </a>
        , make your change, deploy it, and paste the links below. People vote on what they can actually try.
      </div>

      <label className="block">
        <span className="mb-1.5 block font-mono text-xs text-neutral-400">What does your change do?</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={120}
          placeholder="Follow a branch and get notified when it grows"
          className={input}
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block font-mono text-xs text-neutral-400">
          Why it&apos;s better — what&apos;s annoying today?
        </span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={7}
          maxLength={4000}
          placeholder="Right now if I branch something I have no way to know when someone branches mine. I added a follow button that..."
          className={input}
        />
      </label>

      <div className="space-y-4 rounded-xl border border-sky-400/25 bg-sky-400/[0.04] p-4">
        <p className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-sky-300">
          <Play size={13} aria-hidden /> Show it working
        </p>
        <label className="block">
          <span className="mb-1.5 block font-mono text-xs text-neutral-400">
            Live demo URL <span className="text-neutral-600">— your deployed branch (https only)</span>
          </span>
          <input
            value={demoUrl}
            onChange={(e) => setDemoUrl(e.target.value)}
            type="url"
            placeholder="https://my-branch.pages.dev"
            className={input}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block flex items-center gap-1.5 font-mono text-xs text-neutral-400">
            <Code2 size={12} aria-hidden /> Code link <span className="text-neutral-600">— your fork or pull request</span>
          </span>
          <input
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            type="url"
            placeholder="https://github.com/you/project-os/pull/12"
            className={input}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block flex items-center gap-1.5 font-mono text-xs text-neutral-400">
            <ImageIcon size={12} aria-hidden /> Screenshot URL{" "}
            <span className="text-neutral-600">— optional, used if there&apos;s no demo</span>
          </span>
          <input
            value={shotUrl}
            onChange={(e) => setShotUrl(e.target.value)}
            type="url"
            placeholder="https://..."
            className={input}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="min-h-[44px] cursor-pointer rounded-lg bg-emerald-400 px-5 font-mono text-sm font-bold text-black transition hover:bg-emerald-300 disabled:opacity-50"
      >
        {busy ? "Submitting..." : "Submit for voting"}
      </button>
      {error && <p className="font-mono text-xs text-rose-400">▸ {error}</p>}
    </form>
  );
}
