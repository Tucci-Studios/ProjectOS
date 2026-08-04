import { Target, Package, CheckCircle2 } from "lucide-react";
import { RichBody, type ProjectRef } from "./rich-body";
import { parse, minutes } from "@/lib/tutorial";

/**
 * A tutorial, rendered in the one shape every tutorial has.
 *
 * Goal at the top so a reader can bail in three seconds, what they need before
 * they start, numbered steps, and the check at the end. Amber throughout — the
 * same colour the cards use — so a tutorial announces itself before you've read
 * a word of it.
 */
export function TutorialBody({ text, projects }: { text: string; projects: ProjectRef[] }) {
  const t = parse(text);
  if (t.steps.length === 0) return <RichBody text={text} projects={projects} />;

  return (
    <div>
      <div className="rounded-xl border border-amber-400/25 bg-amber-400/[0.05] p-4">
        <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-amber-400">
          <Target size={13} aria-hidden /> What you&apos;ll have
        </p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-neutral-200">{t.goal}</p>
        <p className="mt-2.5 font-mono text-[11px] text-amber-400/60">
          {t.steps.length} step{t.steps.length === 1 ? "" : "s"} · about {minutes(t)} min
        </p>
      </div>

      {t.needs.length > 0 && (
        <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
          <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-neutral-400">
            <Package size={13} aria-hidden /> Before you start
          </p>
          <ul className="mt-2 space-y-1">
            {t.needs.map((n, i) => (
              <li key={i} className="flex gap-2.5 text-[14px] text-neutral-300">
                <span className="select-none text-neutral-400">·</span>
                <span className="min-w-0">{n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ol className="mt-4 space-y-3">
        {t.steps.map((step, i) => (
          <li key={i} className="relative rounded-xl border border-neutral-700 bg-neutral-900/70 p-4 pl-[58px]">
            <span
              aria-hidden
              className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-400/10 font-mono text-[13px] font-bold text-amber-300"
            >
              {i + 1}
            </span>
            <p className="font-mono text-[15px] font-bold leading-snug text-white">{step.title}</p>
            <div className="mt-1.5 text-[14.5px] leading-relaxed text-neutral-300">
              <RichBody text={step.body} projects={projects} />
            </div>
          </li>
        ))}
      </ol>

      {t.verify && (
        <div className="mt-4 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.05] p-4">
          <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-emerald-400">
            <CheckCircle2 size={13} aria-hidden /> You&apos;re done when
          </p>
          <p className="mt-1.5 text-[15px] leading-relaxed text-neutral-200">{t.verify}</p>
        </div>
      )}
    </div>
  );
}

/**
 * A tutorial in a feed.
 *
 * Deliberately unlike a post card: amber spine, the goal instead of the first
 * two lines of body, and the step count up front. In a mixed feed you should be
 * able to tell what's a tutorial without reading the label.
 */
export function TutorialCard({
  id,
  title,
  bodyMd,
  author,
  when,
  comments,
}: {
  id: string;
  title: string | null;
  bodyMd: string;
  author: string;
  when: string;
  comments: number;
}) {
  const t = parse(bodyMd);

  return (
    <article className="group relative flex overflow-hidden rounded-xl border border-amber-400/20 bg-amber-400/[0.03] transition hover:border-amber-400/45 hover:bg-amber-400/[0.06]">
      <span aria-hidden className="w-[3px] shrink-0 bg-amber-400/60" />
      <div className="min-w-0 flex-1 p-4">
        <p className="flex items-center gap-2 font-mono text-[10.5px] font-bold uppercase tracking-widest text-amber-400">
          <Target size={11} aria-hidden /> Tutorial
          <span className="font-normal tracking-normal text-amber-400/50">
            {t.steps.length || "?"} step{t.steps.length === 1 ? "" : "s"} · {minutes(t)} min
          </span>
        </p>
        <h3 className="mt-1.5 font-mono text-[16px] font-bold leading-snug tracking-tight text-white transition group-hover:text-amber-200">
          {title ?? "(untitled)"}
        </h3>
        {t.goal && <p className="mt-1 line-clamp-2 text-[14px] leading-relaxed text-neutral-400">{t.goal}</p>}
        <p className="mt-2 font-mono text-[11.5px] text-neutral-400">
          @{author} · {when} · {comments} comment{comments === 1 ? "" : "s"}
        </p>
      </div>
      <a href={`/wire/${id}`} aria-label={`Read ${title ?? "tutorial"}`} className="absolute inset-0" />
    </article>
  );
}
