"use client";

import { useState } from "react";
import { Plus, X, GripVertical, Target, Package, CheckCircle2 } from "lucide-react";
import { EMPTY, serialize, problems, type Tutorial } from "@/lib/tutorial";

/**
 * Writing a tutorial, one field at a time.
 *
 * There is no free-text box here, and that's the point: the old version handed
 * you a template in a textarea and hoped. Filling in four labelled fields is
 * less work than editing a template, and it means every tutorial published
 * here has a goal, steps, and a way to check you got it right.
 */
const field =
  "w-full rounded-lg border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-[14px] text-neutral-100 outline-none transition placeholder:text-neutral-400 focus:border-amber-400/60 focus-visible:ring-2 focus-visible:ring-amber-400/30";

const legend = "flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest";

export function TutorialComposer({ value, onChange }: { value: string; onChange: (md: string) => void }) {
  const [t, setT] = useState<Tutorial>(EMPTY);

  const update = (next: Tutorial) => {
    setT(next);
    onChange(serialize(next));
  };

  const setStep = (i: number, patch: Partial<Tutorial["steps"][number]>) =>
    update({ ...t, steps: t.steps.map((s, n) => (n === i ? { ...s, ...patch } : s)) });

  const left = problems(t);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-amber-400/25 bg-amber-400/[0.04] p-4">
        <label htmlFor="tut-goal" className={`${legend} text-amber-400`}>
          <Target size={13} aria-hidden /> What will they have at the end?
        </label>
        <input
          id="tut-goal"
          value={t.goal}
          onChange={(e) => update({ ...t, goal: e.target.value })}
          maxLength={160}
          className={`${field} mt-2`}
          placeholder="A working MCP server Claude can call"
        />
        <p className="mt-1.5 font-mono text-[11px] text-neutral-400">One sentence. This is all most people read.</p>
      </section>

      <section className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
        <p className={`${legend} text-neutral-400`}>
          <Package size={13} aria-hidden /> What do they need first?
        </p>
        <div className="mt-2 space-y-2">
          {t.needs.map((n, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={n}
                onChange={(e) => update({ ...t, needs: t.needs.map((x, k) => (k === i ? e.target.value : x)) })}
                aria-label={`Requirement ${i + 1}`}
                className={field}
                placeholder="Node 20 or newer"
              />
              {t.needs.length > 1 && (
                <button
                  type="button"
                  onClick={() => update({ ...t, needs: t.needs.filter((_, k) => k !== i) })}
                  aria-label={`Remove requirement ${i + 1}`}
                  className="shrink-0 cursor-pointer rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-800 hover:text-rose-300"
                >
                  <X size={15} aria-hidden />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => update({ ...t, needs: [...t.needs, ""] })}
          className="mt-2 inline-flex cursor-pointer items-center gap-1.5 font-mono text-[12px] text-neutral-400 transition hover:text-neutral-300"
        >
          <Plus size={13} aria-hidden /> Add another
        </button>
      </section>

      <section>
        <p className={`${legend} text-amber-400`}>
          <GripVertical size={13} aria-hidden /> The steps
        </p>
        <div className="mt-2 space-y-2.5">
          {t.steps.map((s, i) => (
            <div key={i} className="relative rounded-xl border border-neutral-700 bg-neutral-900/60 p-3.5 pl-[54px]">
              <span
                aria-hidden
                className="absolute left-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-400/10 font-mono text-[13px] font-bold text-amber-300"
              >
                {i + 1}
              </span>
              {t.steps.length > 1 && (
                <button
                  type="button"
                  onClick={() => update({ ...t, steps: t.steps.filter((_, k) => k !== i) })}
                  aria-label={`Remove step ${i + 1}`}
                  className="absolute right-2.5 top-2.5 cursor-pointer rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-800 hover:text-rose-300"
                >
                  <X size={15} aria-hidden />
                </button>
              )}
              <input
                value={s.title}
                onChange={(e) => setStep(i, { title: e.target.value })}
                aria-label={`Step ${i + 1} title`}
                maxLength={90}
                className={`${field} font-mono font-bold`}
                placeholder="Install the package"
              />
              <textarea
                value={s.body}
                onChange={(e) => setStep(i, { body: e.target.value })}
                aria-label={`Step ${i + 1} instructions`}
                rows={3}
                className={`${field} mt-2 resize-y`}
                placeholder="Exactly what to do. Paste commands — they render as code."
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => update({ ...t, steps: [...t.steps, { title: "", body: "" }] })}
          className="mt-2.5 inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-neutral-700 px-3 font-mono text-[12.5px] text-neutral-400 transition hover:border-amber-400/50 hover:text-amber-300"
        >
          <Plus size={13} aria-hidden /> Add step {t.steps.length + 1}
        </button>
      </section>

      <section className="rounded-xl border border-emerald-400/25 bg-emerald-400/[0.04] p-4">
        <label htmlFor="tut-verify" className={`${legend} text-emerald-400`}>
          <CheckCircle2 size={13} aria-hidden /> How do they know it worked?
        </label>
        <input
          id="tut-verify"
          value={t.verify}
          onChange={(e) => update({ ...t, verify: e.target.value })}
          maxLength={160}
          className={`${field} mt-2`}
          placeholder="Claude lists your tool when you ask what it can do"
        />
      </section>

      {left.length > 0 && (
        <ul className="space-y-1 rounded-xl border border-neutral-800 bg-neutral-900/40 p-3.5">
          {left.map((p, i) => (
            <li key={i} className="font-mono text-[12px] text-neutral-400">
              · {p}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
