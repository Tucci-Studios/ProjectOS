"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Trash2, Plus } from "lucide-react";

const input =
  "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3.5 py-2.5 font-mono text-sm text-white placeholder-neutral-600 outline-none transition focus:border-emerald-400";

export function SubmitForm({
  needsTos,
  branchOf,
}: {
  needsTos: boolean;
  /** Set when publishing a branch — unlocks the "what changed" field. */
  branchOf?: string;
}) {
  const router = useRouter();
  const [repo, setRepo] = useState("");
  const [description, setDescription] = useState("");
  const [changeSummary, setChangeSummary] = useState("");
  const [images, setImages] = useState<string[]>([""]);
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
        body: JSON.stringify({
          repo,
          acceptTos,
          description,
          changeSummary,
          images: images.filter(Boolean),
        }),
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
    <form onSubmit={submit} className="space-y-5">
      <label className="block">
        <span className="mb-1.5 block font-mono text-xs text-neutral-400">GitHub repo</span>
        <input value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="owner/repo" required className={input} />
        <span className="mt-1.5 block text-xs text-neutral-500">
          Needs project.json and AGENTS.md in the root — the{" "}
          <a href="/submit/wizard" className="text-emerald-400 hover:underline">
            wizard
          </a>{" "}
          writes both for you.
        </span>
      </label>

      <label className="block">
        <span className="mb-1.5 block font-mono text-xs text-neutral-400">
          Describe it <span className="text-neutral-600">— what it does, in plain words</span>
        </span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder="Finds every node_modules on your machine, shows the damage in GB, and yeets them with one keypress."
          className={input}
        />
        <span className="mt-1 block text-xs text-neutral-600">
          Leave blank to use the description from your project.json. {description.length}/500
        </span>
      </label>

      {branchOf && (
        <label className="block">
          <span className="mb-1.5 block font-mono text-xs text-neutral-400">
            What did you change? <span className="text-neutral-600">— vs. {branchOf}</span>
          </span>
          <input
            value={changeSummary}
            onChange={(e) => setChangeSummary(e.target.value)}
            maxLength={280}
            placeholder="Added a desktop UI with checkboxes and a size chart."
            className={input}
          />
          <span className="mt-1 block text-xs text-neutral-600">
            This is the line people read in the tree to tell your branch apart.
          </span>
        </label>
      )}

      <div>
        <span className="mb-1.5 flex items-center gap-1.5 font-mono text-xs text-neutral-400">
          <ImagePlus size={13} aria-hidden /> Images <span className="text-neutral-600">— screenshots, up to 6</span>
        </span>
        <div className="space-y-2">
          {images.map((url, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={url}
                onChange={(e) => setImages((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
                type="url"
                placeholder="https://... (paste an image link)"
                className={input}
              />
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                  aria-label="Remove image"
                  className="flex min-h-[44px] w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-neutral-700 text-neutral-500 transition hover:border-rose-400/50 hover:text-rose-300"
                >
                  <Trash2 size={15} aria-hidden />
                </button>
              )}
            </div>
          ))}
        </div>
        {images.length < 6 && (
          <button
            type="button"
            onClick={() => setImages((prev) => [...prev, ""])}
            className="mt-2 inline-flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-700 px-3 font-mono text-xs text-neutral-300 transition hover:border-emerald-400/50 hover:text-emerald-300"
          >
            <Plus size={13} aria-hidden /> Add another image
          </button>
        )}
        <p className="mt-2 text-xs leading-relaxed text-neutral-500">
          Any public image link works — a GitHub raw URL, an Imgur link, anything https. Leave blank to use the
          screenshots listed in your project.json.
        </p>
      </div>

      {needsTos && (
        <label className="flex items-start gap-2.5 rounded-xl border border-neutral-700 bg-neutral-900/50 p-4 text-sm text-neutral-300">
          <input type="checkbox" checked={acceptTos} onChange={(e) => setAcceptTos(e.target.checked)} className="mt-1" />
          <span>
            I agree to the{" "}
            <a href="/terms" target="_blank" className="text-emerald-400 hover:underline">
              Project OS terms
            </a>
            : open source, never sold or paywalled, branches stay open, no malware.
          </span>
        </label>
      )}

      <button
        type="submit"
        disabled={busy}
        className="min-h-[46px] cursor-pointer rounded-lg bg-emerald-400 px-6 font-mono text-sm font-bold text-black transition hover:bg-emerald-300 disabled:opacity-50"
      >
        {busy ? "Checking repo..." : branchOf ? "Publish my branch" : "Publish"}
      </button>

      {errors.length > 0 && (
        <ul className="space-y-1 rounded-lg border border-rose-400/30 bg-rose-950/20 p-3 font-mono text-xs text-rose-300">
          {errors.map((e) => (
            <li key={e}>▸ {e}</li>
          ))}
        </ul>
      )}
    </form>
  );
}
