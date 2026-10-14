import { TutorialView } from "@/components/tutorial-view";
import { parseGuide, TUTORIAL_SPEC } from "@/lib/tutorial-guide";
import { siteUrl } from "@/lib/site";
import { Target, Package, CheckCircle2, GraduationCap } from "lucide-react";
import { RichBody, type ProjectRef } from "./rich-body";
import { parse, minutes } from "@/lib/tutorial";
import { CATEGORY_META, categoryMeta, GROUPS } from "@/lib/categories";
import { GroupTile } from "@/components/project-card";

/**
 * A tutorial, rendered in the one shape every tutorial has.
 *
 * Goal at the top so a reader can bail in three seconds, what they need before
 * they start, numbered steps, and the check at the end. Amber throughout — the
 * same colour the cards use — so a tutorial announces itself before you've read
 * a word of it.
 */
export function TutorialBody({ text, projects }: { text: string; projects: ProjectRef[] }) {
  // Posts written to the richer guide format store JSON. Anything else is the
  // original prose format and renders as it always did.
  const guide = parseGuide(text);
  if (guide) return <TutorialView t={guide} spec={TUTORIAL_SPEC} specUrl={`${siteUrl()}/tutorial-template.md`} />;

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
  category,
}: {
  id: string;
  title: string | null;
  bodyMd: string;
  author: string;
  when: string;
  comments: number;
  category?: string;
}) {
  const guide = parseGuide(bodyMd);
  const t = guide ? null : parse(bodyMd);
  const stepCount = guide ? guide.steps.length : t!.steps.length;
  const mins = guide ? guide.minutes : minutes(t!);
  const blurb = guide ? guide.summary : t!.goal;
  const slug = category ?? guide?.category ?? "";
  const meta = CATEGORY_META.some((c) => c.slug === slug) ? categoryMeta(slug) : null;
  const hex = meta ? GROUPS[meta.group].hex : "#f5b544";

  // Same bones as an Explore tile — square mark, title, two lines, a stat row —
  // so a shelf of guides scans at the same rhythm as a shelf of projects. The
  // vibe differs where it should: the mark is the section's, and the stats are
  // steps and minutes rather than stars and forks.
  return (
    <article className="group relative flex min-w-0 items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-900/40 p-3 transition duration-200 hover:border-neutral-600 hover:bg-neutral-800/40">
      {meta ? (
        <GroupTile category={slug} />
      ) : (
        <span
          className="relative flex h-full min-h-[52px] w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900 pl-[3px]"
          aria-hidden
        >
          <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: hex }} />
          <GraduationCap size={24} style={{ color: hex }} />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 font-mono text-[14px] font-bold leading-snug text-white transition group-hover:text-emerald-300">
          {title ?? "(untitled)"}
        </p>
        {blurb && <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-neutral-400">{blurb}</p>}
        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 font-mono text-[11px] text-neutral-400">
          <span className="inline-flex items-center gap-1 font-bold" style={{ color: hex }}>
            <GraduationCap size={10} aria-hidden />
            {stepCount || "?"} steps
          </span>
          <span>{mins} min</span>
          {meta && <span className="truncate text-neutral-400">{meta.label}</span>}
          {comments > 0 && <span className="text-neutral-400">{comments}</span>}
        </p>
      </div>

      <a href={`/wire/${id}`} aria-label={`Read ${title ?? "tutorial"}`} className="absolute inset-0 rounded-xl" />
    </article>
  );
}
