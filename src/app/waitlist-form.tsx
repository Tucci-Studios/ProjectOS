"use client";

import { useState } from "react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="font-mono text-sm text-emerald-400">
        ▸ You&apos;re on the list. See you at Fork Wars.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex max-w-md gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="flex-1 rounded border border-neutral-700 bg-neutral-900 px-4 py-2.5 font-mono text-sm text-white placeholder-neutral-600 outline-none focus:border-cyan-400"
      />
      <button
        type="submit"
        disabled={state === "sending"}
        className="rounded bg-cyan-400 px-5 py-2.5 font-mono text-sm font-semibold text-black transition hover:bg-cyan-300 disabled:opacity-50"
      >
        {state === "sending" ? "..." : "Join waitlist"}
      </button>
      {state === "error" && (
        <p className="self-center font-mono text-xs text-rose-400">Try again?</p>
      )}
    </form>
  );
}
