"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Loader2, Send } from "lucide-react";
import { HELP_ROLES } from "@/lib/help-roles";

/**
 * The form, opened from a role rather than sitting under all of them.
 *
 * Clicking a role preselects it, so nobody reads four descriptions and then has
 * to pick from a dropdown repeating what they just read.
 */
export function ApplyForm({ role, signedIn, onDone }: { role: string; signedIn: boolean; onDone: () => void }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [contact, setContact] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const meta = HELP_ROLES.find((r) => r.key === role)!;

  if (!signedIn)
    return (
      <div className="mt-3 rounded-xl border border-neutral-700 bg-neutral-900/50 p-4">
        <p className="text-[13px] text-neutral-400">
          Sign in with GitHub first — we want to see what you&apos;ve built.{" "}
          <Link href="/api/auth/login" className="font-bold text-emerald-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    );

  if (state === "sent")
    return (
      <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-emerald-400/30 bg-emerald-400/[0.06] p-4">
        <Check size={16} className="shrink-0 text-emerald-400" aria-hidden />
        <p className="text-[13px] text-neutral-300">
          Sent. We read every one of these — expect a reply on GitHub.
        </p>
      </div>
    );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setError(null);
    const res = await fetch("/api/help", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, body, contact }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "That didn't send.");
      setState("idle");
      return;
    }
    setState("sent");
    router.refresh();
    onDone();
  }

  return (
    <form onSubmit={submit} className="mt-3 rounded-xl border border-neutral-700 bg-neutral-900/50 p-4">
      <label htmlFor={`body-${role}`} className="block font-mono text-[12px] text-neutral-400">
        {meta.key === "mod"
          ? "Why you'd be good at this, and how you'd handle a call you weren't sure about."
          : meta.key === "other"
            ? "What you'd work on, and why it matters."
            : "What you'd change first, and anything you've built that's like it."}
      </label>
      <textarea
        id={`body-${role}`}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={5}
        maxLength={2000}
        required
        className="mt-2 w-full resize-y rounded-lg border border-neutral-700 bg-neutral-950/60 p-3 text-[14px] text-neutral-100 outline-none transition focus:border-emerald-400/60 focus-visible:ring-2 focus-visible:ring-emerald-400/40"
        placeholder="A few sentences is plenty."
      />

      <label htmlFor={`contact-${role}`} className="mt-3 block font-mono text-[12px] text-neutral-400">
        Somewhere else to reach you — optional
      </label>
      <input
        id={`contact-${role}`}
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        maxLength={200}
        className="mt-1.5 w-full rounded-lg border border-neutral-700 bg-neutral-950/60 px-3 py-2 font-mono text-[13px] text-neutral-100 outline-none transition focus:border-emerald-400/60 focus-visible:ring-2 focus-visible:ring-emerald-400/40"
        placeholder="Discord, email, wherever"
      />

      {error && <p className="mt-2.5 text-[13px] text-rose-300">{error}</p>}

      <div className="mt-3.5 flex items-center gap-3">
        <button
          type="submit"
          disabled={state === "sending" || body.trim().length < 20}
          className="inline-flex min-h-[38px] cursor-pointer items-center gap-2 rounded-lg bg-emerald-400 px-4 font-mono text-[13px] font-bold text-black outline-none transition hover:bg-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {state === "sending" ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Send size={14} aria-hidden />}
          Send it
        </button>
        <button
          type="button"
          onClick={onDone}
          className="cursor-pointer font-mono text-[13px] text-neutral-400 transition hover:text-neutral-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
