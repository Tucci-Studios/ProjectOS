import Link from "next/link";
import { Clock, GraduationCap, ExternalLink, AlertCircle, Check, ShieldCheck } from "lucide-react";
import type { Guide } from "@/lib/tutorial-guide";

/**
 * How a tutorial reads.
 *
 * Built to look unlike a project page on purpose: projects are things you take,
 * tutorials are things you follow, and the two shouldn't wear the same clothes.
 * Numbered rail down the left, code blocks that don't fight the prose, and the
 * troubleshooting given real estate instead of being buried at the bottom in
 * small type — it's the part people scroll back to.
 */

function Code({ lang, text, filename }: { lang: string; text: string; filename?: string }) {
  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-neutral-800 bg-[#0d120f]">
      <div className="flex items-center justify-between border-b border-neutral-800 px-3 py-1.5">
        <span className="font-mono text-[10.5px] text-neutral-400">{filename ?? lang}</span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-600">{lang}</span>
      </div>
      <pre className="overflow-x-auto px-3.5 py-3 font-mono text-[12.5px] leading-relaxed text-neutral-200">
        <code>{text}</code>
      </pre>
    </div>
  );
}

/** The mark a tutorial gets once a moderator has actually followed it. */
export function VerifiedTutorialBadge({ by }: { by?: string }) {
  return (
    <span
      title={by ? `Checked by @${by} — a moderator followed these steps` : undefined}
      className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-400/10 px-2.5 py-1 font-mono text-[11px] font-bold text-amber-200"
    >
      <ShieldCheck size={12} aria-hidden /> Checked
    </span>
  );
}

export function TutorialView({ t }: { t: Guide }) {
  return (
    <article className="rounded-2xl border border-amber-400/20 bg-gradient-to-b from-[#1a1a14] to-[#161d18] p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 font-mono text-[11px] font-bold text-amber-300">
          <GraduationCap size={12} aria-hidden /> Tutorial
        </span>
        {t.verified && <VerifiedTutorialBadge by={t.verified.by} />}
        <span className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-neutral-400">
          <Clock size={11} aria-hidden /> {t.minutes} min
        </span>
        <span className="font-mono text-[11.5px] text-neutral-400">· {t.level}</span>
      </div>

      <h1 className="mt-4 font-mono text-[26px] font-bold leading-tight tracking-tight text-white sm:text-[30px]">
        {t.title}
      </h1>
      <p className="mt-2 text-[15.5px] leading-relaxed text-neutral-300">{t.summary}</p>

      <div className="mt-5 rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-emerald-300">What you&apos;ll end up with</p>
        <p className="mt-1.5 text-[14px] leading-relaxed text-neutral-300">{t.outcome}</p>
      </div>

      {t.prerequisites.length > 0 && (
        <section className="mt-6">
          <h2 className="font-mono text-[12px] uppercase tracking-widest text-neutral-400">Before you start</h2>
          <ul className="mt-2.5 space-y-1.5">
            {t.prerequisites.map((p) => (
              <li key={p} className="flex gap-2.5 text-[14px] leading-relaxed text-neutral-300">
                <Check size={14} className="mt-[3px] shrink-0 text-emerald-400" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <ol className="space-y-7">
          {t.steps.map((s, i) => (
            <li key={s.title} className="relative pl-11">
              <span
                aria-hidden
                className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full border border-emerald-400/50 bg-emerald-400/10 font-mono text-[12px] font-bold text-emerald-300"
              >
                {i + 1}
              </span>
              {i < t.steps.length - 1 && (
                <span aria-hidden className="absolute bottom-[-28px] left-[13px] top-8 w-px bg-neutral-800" />
              )}
              <h3 className="font-mono text-[15.5px] font-bold text-white">{s.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-neutral-300">{s.body}</p>
              {s.code && <Code {...s.code} />}
              {s.check && (
                <p className="mt-2.5 flex gap-2 rounded-lg border border-neutral-800 bg-neutral-900/40 px-3 py-2 text-[13px] leading-relaxed text-neutral-400">
                  <Check size={13} className="mt-[3px] shrink-0 text-emerald-400" aria-hidden />
                  <span>
                    <span className="font-bold text-neutral-200">Worked if:</span> {s.check}
                  </span>
                </p>
              )}
            </li>
          ))}
        </ol>
      </section>

      {t.troubleshooting.length > 0 && (
        <section className="mt-9">
          <h2 className="flex items-center gap-2 font-mono text-[13px] font-bold text-white">
            <AlertCircle size={14} className="text-amber-400" aria-hidden /> When it doesn&apos;t work
          </h2>
          <div className="mt-3 space-y-2">
            {t.troubleshooting.map((x) => (
              <div key={x.symptom} className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3.5">
                <p className="text-[13.5px] font-bold text-neutral-100">{x.symptom}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-neutral-400">{x.fix}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8 border-t border-neutral-800 pt-5">
        <h2 className="font-mono text-[12px] uppercase tracking-widest text-neutral-400">The official docs</h2>
        <ul className="mt-2 space-y-1.5">
          {t.sources.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13.5px] text-emerald-400 hover:underline"
              >
                {s.label} <ExternalLink size={11} aria-hidden />
              </a>
            </li>
          ))}
        </ul>
        {/* Says plainly what this is and isn't. A community guide that reads as
            though it might be official is the fastest way to a problem. */}
        <p className="mt-4 text-[12px] leading-relaxed text-neutral-400">
          Community guide, written by a Project OS member. Not affiliated with, endorsed by, or produced by the makers
          of any tool it describes — product names are used only to say what this is about. Anything version-specific
          belongs to the official documentation above, which wins wherever it disagrees with this page.{" "}
          <Link href="/tutorials" className="text-neutral-300 hover:text-emerald-300 hover:underline">
            Spotted something wrong?
          </Link>
        </p>
      </section>
    </article>
  );
}
