"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { HELP_ROLES } from "@/lib/help-roles";
import { ApplyForm } from "./apply-form";

/** The roles, each one opening into its own form. */
export function HelpBoard({ signedIn, applied }: { signedIn: boolean; applied: string[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="mt-6 space-y-3">
      {HELP_ROLES.map((r) => {
        const on = open === r.key;
        const already = applied.includes(r.key);
        return (
          <section
            key={r.key}
            className={`rounded-xl border p-4 transition ${
              on ? "border-neutral-600 bg-neutral-900/60" : "border-neutral-800 bg-neutral-900/30"
            }`}
          >
            <div className="flex items-start gap-3.5">
              <r.Icon size={19} className={`mt-0.5 shrink-0 ${r.tone}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <h2 className="font-mono text-[15px] font-bold text-white">{r.title}</h2>
                <p className={`mt-0.5 font-mono text-[12px] ${r.tone}`}>{r.need}</p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-neutral-400">{r.detail}</p>

                {already ? (
                  <p className="mt-3 font-mono text-[12px] text-emerald-400">
                    You&apos;ve applied for this — we&apos;ll be in touch.
                  </p>
                ) : (
                  <button
                    onClick={() => setOpen(on ? null : r.key)}
                    aria-expanded={on}
                    className="mt-3 inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-700 px-3 font-mono text-[13px] text-neutral-200 outline-none transition hover:border-emerald-400/50 hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    {r.key === "mod" ? "Apply to moderate" : "I can help with this"}
                    <ChevronDown size={13} className={`transition ${on ? "rotate-180" : ""}`} aria-hidden />
                  </button>
                )}

                {on && !already && (
                  <ApplyForm role={r.key} signedIn={signedIn} onDone={() => setOpen(null)} />
                )}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
