"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Boxes, BookOpen, HelpCircle, ArrowRight } from "lucide-react";
import { CATEGORY_META, GROUPS, GROUP_ORDER } from "@/lib/categories";
import { ImageUploader } from "@/components/image-uploader";

const input =
  "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3.5 py-2.5 font-mono text-sm text-white placeholder-neutral-600 outline-none transition focus:border-emerald-400";

const KINDS = [
  { key: "project", label: "A project", blurb: "Code people can install, run, or branch.", Icon: Boxes },
  { key: "tutorial", label: "A tutorial", blurb: "How to do something, step by step.", Icon: BookOpen },
  { key: "request", label: "A request", blurb: "Ask someone to build or explain something.", Icon: HelpCircle },
] as const;

export function SubmitForm({ needsTos, branchOf }: { needsTos: boolean; branchOf?: string }) {
  const router = useRouter();
  const [kind, setKind] = useState<"project" | "tutorial" | "request">("project");
  const [category, setCategory] = useState("");
  const [repo, setRepo] = useState("");
  const [description, setDescription] = useState("");
  const [changeSummary, setChangeSummary] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [acceptTos, setAcceptTos] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  // Tutorials and requests are posts, not repos — hand them to the post composer.
  if (kind !== "project") {
    return (
      <div className="space-y-5">
        <KindPicker kind={kind} setKind={setKind} />
        <SectionPicker category={category} setCategory={setCategory} required />
        <button
          onClick={() =>
            router.push(`/wire/new?kind=${kind}${category ? `&category=${category}` : ""}`)
          }
          disabled={!category}
          className="inline-flex min-h-[46px] cursor-pointer items-center gap-2 rounded-lg bg-emerald-400 px-6 font-mono text-sm font-bold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Write it <ArrowRight size={15} aria-hidden />
        </button>
        {!category && <p className="font-mono text-xs text-neutral-500">Pick a section first.</p>}
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors([]);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo, acceptTos, description, changeSummary, images, category }),
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
      {!branchOf && <KindPicker kind={kind} setKind={setKind} />}
      <SectionPicker category={category} setCategory={setCategory} />

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
          Blank uses the description from your project.json. {description.length}/500
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
        <span className="mb-2 block font-mono text-xs text-neutral-400">
          Images <span className="text-neutral-600">— screenshots of it working</span>
        </span>
        <ImageUploader value={images} onChange={setImages} />
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

function KindPicker({
  kind,
  setKind,
}: {
  kind: string;
  setKind: (k: "project" | "tutorial" | "request") => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 font-mono text-xs text-neutral-400">What are you publishing?</legend>
      <div className="grid gap-2.5 sm:grid-cols-3">
        {KINDS.map((k) => {
          const active = kind === k.key;
          return (
            <button
              key={k.key}
              type="button"
              onClick={() => setKind(k.key)}
              aria-pressed={active}
              className={`cursor-pointer rounded-xl border p-3.5 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                active
                  ? "border-emerald-400/50 bg-emerald-400/10"
                  : "border-neutral-700 bg-neutral-900/40 hover:border-neutral-500"
              }`}
            >
              <k.Icon size={16} className={active ? "text-emerald-300" : "text-neutral-500"} aria-hidden />
              <span className={`mt-2 block font-mono text-sm font-bold ${active ? "text-white" : "text-neutral-200"}`}>
                {k.label}
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-neutral-500">{k.blurb}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function SectionPicker({
  category,
  setCategory,
  required = false,
}: {
  category: string;
  setCategory: (c: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-xs text-neutral-400">
        Which section? {required && <span className="text-amber-400">(required)</span>}
      </span>
      <select value={category} onChange={(e) => setCategory(e.target.value)} className={input}>
        <option value="">— pick where it belongs —</option>
        {GROUP_ORDER.map((g) => (
          <optgroup key={g} label={GROUPS[g].label}>
            {CATEGORY_META.filter((c) => c.group === g).map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <span className="mt-1 block text-xs text-neutral-600">
        Is it a Claude skill? An MCP server? A Grok project? This decides where people find it.
      </span>
    </label>
  );
}
