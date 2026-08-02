"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputCls =
  "w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 font-mono text-sm text-white placeholder-neutral-600 outline-none focus:border-cyan-400";

export function SubmitForm({ needsTos }: { needsTos: boolean }) {
  const router = useRouter();
  const [repo, setRepo] = useState("");
  const [acceptTos, setAcceptTos] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors([]);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo, acceptTos }),
      });
      const data = (await res.json()) as { ok?: boolean; id?: string; errors?: string[] };
      if (data.ok && data.id) {
        router.push(`/p/${data.id}`);
        return;
      }
      setErrors(
        data.errors?.[0] === "TOS_REQUIRED"
          ? ["Please accept the terms below first."]
          : (data.errors ?? ["Something went wrong."]),
      );
    } catch {
      setErrors(["Network error — try again."]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="mb-1 block font-mono text-xs text-neutral-400">GitHub repo</span>
        <input
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          placeholder="owner/repo"
          required
          className={inputCls}
        />
      </label>
      {needsTos && (
        <label className="flex items-start gap-2 rounded border border-neutral-700 bg-neutral-900/50 p-3 text-sm text-neutral-300">
          <input
            type="checkbox"
            checked={acceptTos}
            onChange={(e) => setAcceptTos(e.target.checked)}
            className="mt-1"
          />
          <span>
            I agree to the{" "}
            <a href="/terms" target="_blank" className="text-cyan-400 hover:underline">
              Project OS terms
            </a>
            : my project is open source, it will never be sold or paywalled, forks stay open, and no malware — ever.
          </span>
        </label>
      )}
      <button
        type="submit"
        disabled={busy}
        className="rounded bg-cyan-400 px-5 py-2 font-mono text-sm font-semibold text-black transition hover:bg-cyan-300 disabled:opacity-50"
      >
        {busy ? "Checking repo..." : "Publish"}
      </button>
      {errors.length > 0 && (
        <ul className="space-y-1 rounded border border-rose-400/30 bg-rose-950/20 p-3 font-mono text-xs text-rose-400">
          {errors.map((e) => (
            <li key={e}>▸ {e}</li>
          ))}
        </ul>
      )}
    </form>
  );
}
