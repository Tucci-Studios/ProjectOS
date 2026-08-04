"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2, ArrowRight, Star } from "lucide-react";

type Project = { id: string; base_name: string; github_repo: string; stars: number; category: string };

/**
 * What happens right after the mark is granted.
 *
 * The claim mechanic worked from day one and converted nobody, because the only
 * place it appeared was a project page you had to already be standing on. This
 * puts it in the one moment every new account passes through, and ends on the
 * thing that matters more than the claiming: now write about one.
 */
export function ClaimStep({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [mine, setMine] = useState<Project[]>([]);
  const [claimable, setClaimable] = useState<Project[]>([]);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [state, setState] = useState<"loading" | "ready" | "saving">("loading");

  useEffect(() => {
    fetch("/api/claim")
      .then((r) => r.json() as Promise<{ mine?: Project[]; claimable?: Project[] }>)
      .then((d) => {
        setMine(d.mine ?? []);
        setClaimable(d.claimable ?? []);
        setPicked(new Set((d.claimable ?? []).map((p) => p.id)));
        setState("ready");
      })
      .catch(() => setState("ready"));
  }, []);

  const toggle = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  async function claim() {
    setState("saving");
    try {
      await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectIds: [...picked] }),
      });
      router.refresh();
    } finally {
      onDone();
    }
  }

  const total = mine.length + claimable.length;

  if (state === "loading")
    return (
      <p className="flex items-center gap-2 py-10 font-mono text-[13px] text-neutral-400">
        <Loader2 size={14} className="animate-spin" aria-hidden /> Looking for your work...
      </p>
    );

  // Nothing of theirs is listed. Say so plainly and point at the useful door.
  if (!total)
    return (
      <div className="text-center">
        <h2 className="font-mono text-2xl font-bold text-white">You&apos;re in</h2>
        <p className="mx-auto mt-2.5 max-w-md text-[15px] leading-relaxed text-neutral-400">
          Nothing of yours is listed here yet. Publish a project, or write up something you&apos;ve built with one of
          the {""}
          projects already here — that&apos;s the part people actually come for.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/submit"
            onClick={onDone}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-emerald-400 px-5 font-mono text-[13px] font-bold text-black transition hover:bg-emerald-300"
          >
            Publish a project
          </Link>
          <button
            onClick={onDone}
            className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg border border-neutral-700 px-5 font-mono text-[13px] text-neutral-300 transition hover:border-neutral-500"
          >
            Look around first
          </button>
        </div>
      </div>
    );

  return (
    <div className="w-full">
      <h2 className="text-center font-mono text-2xl font-bold text-white">We found your work</h2>
      <p className="mx-auto mt-2.5 max-w-lg text-center text-[15px] leading-relaxed text-neutral-400">
        {mine.length > 0 && (
          <>
            <span className="font-bold text-emerald-300">
              {mine.length} project{mine.length === 1 ? "" : "s"}
            </span>{" "}
            {mine.length === 1 ? "is" : "are"} already yours.{" "}
          </>
        )}
        {claimable.length > 0 && <>Tick anything else that belongs to you.</>}
      </p>

      <div className="mx-auto mt-6 max-h-[38vh] w-full max-w-lg space-y-1.5 overflow-y-auto">
        {mine.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 rounded-lg border border-emerald-400/30 bg-emerald-400/[0.05] px-3 py-2"
          >
            <Check size={14} className="shrink-0 text-emerald-400" aria-hidden />
            <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-white">{p.base_name}</span>
            <span className="shrink-0 font-mono text-[11px] text-amber-300/70">
              {p.stars.toLocaleString()}
              <Star size={9} className="ml-0.5 inline fill-current" aria-hidden />
            </span>
          </div>
        ))}

        {claimable.map((p) => {
          const on = picked.has(p.id);
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              aria-pressed={on}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                on ? "border-emerald-400/50 bg-emerald-400/[0.05]" : "border-neutral-700 hover:border-neutral-500"
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                  on ? "border-emerald-400 bg-emerald-400 text-black" : "border-neutral-600"
                }`}
                aria-hidden
              >
                {on && <Check size={11} strokeWidth={3} />}
              </span>
              <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-neutral-200">{p.github_repo}</span>
              <span className="shrink-0 font-mono text-[11px] text-amber-300/70">
                {p.stars.toLocaleString()}
                <Star size={9} className="ml-0.5 inline fill-current" aria-hidden />
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        {claimable.length > 0 ? (
          <button
            onClick={claim}
            disabled={state === "saving"}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg bg-emerald-400 px-5 font-mono text-[13px] font-bold text-black transition hover:bg-emerald-300 disabled:opacity-50"
          >
            {state === "saving" ? "Claiming..." : `Claim ${picked.size || "none"}`}
          </button>
        ) : (
          <Link
            href="/wire/new"
            onClick={onDone}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-emerald-400 px-5 font-mono text-[13px] font-bold text-black transition hover:bg-emerald-300"
          >
            Write about one <ArrowRight size={14} aria-hidden />
          </Link>
        )}
        <button
          onClick={onDone}
          className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg border border-neutral-700 px-5 font-mono text-[13px] text-neutral-300 transition hover:border-neutral-500"
        >
          Later
        </button>
      </div>
    </div>
  );
}
