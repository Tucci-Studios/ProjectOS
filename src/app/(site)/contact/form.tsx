"use client";

import { useState } from "react";
import { Send, Check } from "lucide-react";

const KINDS = [
  { key: "takedown", label: "Take my project down", hint: "Something of yours is listed here and you want it gone." },
  { key: "privacy", label: "A data request", hint: "See, correct, export or erase what we hold about you." },
  { key: "other", label: "Something else", hint: "Anything that isn't the two above." },
];

/**
 * A form rather than a published address.
 *
 * Deliberate: an email address on a public page is scraped within days, and the
 * inbox behind it becomes something someone has to keep watching. This lands in
 * the database and is read from the moderator page — same obligation met, no
 * inbox to maintain. The reply address is optional because a takedown request
 * shouldn't require handing over more personal data than the request itself.
 */
export function ContactForm() {
  const [kind, setKind] = useState("takedown");
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setState("sending");
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, body, replyTo }),
      });
      const d = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !d.ok) {
        setError(d.error ?? "That didn't send.");
        setState("idle");
        return;
      }
      setState("sent");
    } catch {
      setError("That didn't send.");
      setState("idle");
    }
  }

  if (state === "sent")
    return (
      <div className="rounded-xl border border-emerald-400/35 bg-emerald-400/[0.06] p-5">
        <p className="flex items-center gap-2 font-mono text-[14px] font-bold text-emerald-200">
          <Check size={16} aria-hidden /> Got it.
        </p>
        <p className="mt-2 text-[13.5px] leading-relaxed text-emerald-100/80">
          {replyTo
            ? `We'll reply to ${replyTo}. Takedown requests are actioned first.`
            : "You didn't leave an address, so there's no way to reply — but the message was received."}
        </p>
      </div>
    );

  return (
    <div>
      <fieldset>
        <legend className="font-mono text-[12px] text-neutral-300">What is this about?</legend>
        <div className="mt-2 space-y-2">
          {KINDS.map((k) => (
            <label
              key={k.key}
              className={`flex cursor-pointer gap-2.5 rounded-lg border p-3 transition ${
                kind === k.key
                  ? "border-emerald-400/60 bg-emerald-400/[0.06]"
                  : "border-neutral-700 hover:border-neutral-600"
              }`}
            >
              <input
                type="radio"
                name="kind"
                value={k.key}
                checked={kind === k.key}
                onChange={() => setKind(k.key)}
                className="mt-0.5 accent-emerald-400"
              />
              <span className="min-w-0">
                <span className="block font-mono text-[13px] font-bold text-white">{k.label}</span>
                <span className="mt-0.5 block text-[12.5px] leading-relaxed text-neutral-400">{k.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="mt-5 block">
        <span className="mb-1.5 block font-mono text-[12px] text-neutral-300">Your message</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          placeholder="If it's a takedown, a link to the project here or the repo on GitHub is enough."
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900/60 px-3.5 py-3 text-[13.5px] leading-relaxed text-white placeholder-neutral-500 outline-none transition focus:border-emerald-400/60"
        />
      </label>

      <label className="mt-4 block">
        <span className="mb-1.5 block font-mono text-[12px] text-neutral-300">
          Email <span className="text-neutral-500">— optional, only so we can reply</span>
        </span>
        <input
          type="email"
          value={replyTo}
          onChange={(e) => setReplyTo(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900/60 px-3.5 py-2.5 font-mono text-[13px] text-white placeholder-neutral-500 outline-none transition focus:border-emerald-400/60"
        />
      </label>

      {error && (
        <p role="alert" className="mt-3 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3.5 py-2.5 text-[13px] text-rose-200">
          {error}
        </p>
      )}

      <button
        onClick={submit}
        disabled={state === "sending" || body.trim().length < 20}
        className="mt-5 inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg bg-emerald-400 px-5 font-mono text-[13px] font-bold text-black outline-none transition hover:bg-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-default disabled:opacity-40"
      >
        <Send size={14} aria-hidden /> {state === "sending" ? "Sending..." : "Send"}
      </button>
    </div>
  );
}
