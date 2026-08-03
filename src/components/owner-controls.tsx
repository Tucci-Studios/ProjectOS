"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { ImageUploader } from "./image-uploader";

/** Edit or delist something you published. */
export function OwnerControls({
  projectId,
  initialDescription,
  initialChangeSummary,
  initialImages,
  isFork,
}: {
  projectId: string;
  initialDescription: string;
  initialChangeSummary: string | null;
  initialImages: string[];
  isFork: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [description, setDescription] = useState(initialDescription);
  const [changeSummary, setChangeSummary] = useState(initialChangeSummary ?? "");
  const [images, setImages] = useState(initialImages);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(payload: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/projects/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, ...payload }),
      });
      const data = (await res.json()) as { ok?: boolean; deleted?: boolean; error?: string };
      if (data.ok) {
        if (data.deleted) router.push("/popular");
        else {
          setEditing(false);
          router.refresh();
        }
        return;
      }
      setError(data.error ?? "Failed.");
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <div className="mt-5 rounded-xl border border-emerald-400/30 bg-neutral-900/60 p-4">
        <p className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-emerald-300">Editing</p>

        <label className="block">
          <span className="mb-1.5 block font-mono text-xs text-neutral-400">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
          />
        </label>

        {isFork && (
          <label className="mt-3 block">
            <span className="mb-1.5 block font-mono text-xs text-neutral-400">What you changed</span>
            <input
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              maxLength={280}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
            />
          </label>
        )}

        <div className="mt-3">
          <span className="mb-2 block font-mono text-xs text-neutral-400">Images</span>
          <ImageUploader value={images} onChange={setImages} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => send({ description, changeSummary, images })}
            disabled={busy}
            className="inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-400 px-4 font-mono text-[13px] font-bold text-black transition hover:bg-emerald-300 disabled:opacity-50"
          >
            <Check size={14} aria-hidden /> {busy ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-700 px-3 font-mono text-[13px] text-neutral-300 transition hover:border-neutral-500"
          >
            <X size={14} aria-hidden /> Cancel
          </button>
          {error && <span className="font-mono text-xs text-rose-400">{error}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <button
        onClick={() => setEditing(true)}
        className="inline-flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-700 px-2.5 font-mono text-[12px] text-neutral-400 transition hover:border-neutral-500 hover:text-white"
      >
        <Pencil size={12} aria-hidden /> Edit
      </button>

      {confirming ? (
        <span className="inline-flex items-center gap-2">
          <button
            onClick={() => send({ action: "delete" })}
            disabled={busy}
            className="inline-flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-lg border border-rose-400/50 bg-rose-500/10 px-2.5 font-mono text-[12px] text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-50"
          >
            <Trash2 size={12} aria-hidden /> Yes, take it down
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="min-h-[34px] cursor-pointer px-2 font-mono text-[12px] text-neutral-500 transition hover:text-neutral-300"
          >
            Never mind
          </button>
        </span>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="inline-flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-700 px-2.5 font-mono text-[12px] text-neutral-500 transition hover:border-rose-400/50 hover:text-rose-300"
        >
          <Trash2 size={12} aria-hidden /> Take it down
        </button>
      )}
      <span className="font-mono text-[11px] text-neutral-600">Forks off this keep their history.</span>
    </div>
  );
}
