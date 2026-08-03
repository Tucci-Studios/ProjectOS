"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2, Loader2 } from "lucide-react";

// Pick files off your machine — no link pasting.
export function ImageUploader({
  value,
  onChange,
  max = 6,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const room = max - value.length;
    const picked = Array.from(files).slice(0, Math.max(0, room));
    if (picked.length === 0) return;

    setBusy((b) => b + picked.length);
    const uploaded: string[] = [];
    for (const file of picked) {
      try {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body });
        const data = (await res.json()) as { url?: string; error?: string };
        if (data.url) uploaded.push(data.url);
        else setError(data.error ?? "Upload failed.");
      } catch {
        setError("Upload failed — try again.");
      } finally {
        setBusy((b) => b - 1);
      }
    }
    if (uploaded.length) onChange([...value, ...uploaded]);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        {value.map((url) => (
          <div key={url} className="group/shot relative h-[74px] w-28 overflow-hidden rounded-lg border border-neutral-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((u) => u !== url))}
              aria-label="Remove image"
              className="absolute right-1 top-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-neutral-600 bg-black/70 text-neutral-300 opacity-0 backdrop-blur transition group-hover/shot:opacity-100 hover:text-rose-300"
            >
              <Trash2 size={12} aria-hidden />
            </button>
          </div>
        ))}

        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-[74px] w-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-neutral-600 text-neutral-500 outline-none transition hover:border-emerald-400/60 hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {busy > 0 ? (
              <Loader2 size={16} className="animate-spin" aria-hidden />
            ) : (
              <>
                <ImagePlus size={16} aria-hidden />
                <span className="font-mono text-[10px]">Add image</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <p className="mt-2 text-xs leading-relaxed text-neutral-500">
        PNG, JPEG, WebP or GIF · up to 5 MB each · {value.length}/{max} added
      </p>
      {error && <p className="mt-1 font-mono text-xs text-rose-400">{error}</p>}
    </div>
  );
}
