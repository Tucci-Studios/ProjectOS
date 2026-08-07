"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Clock,
  GraduationCap,
  ExternalLink,
  AlertCircle,
  Check,
  BadgeCheck,
  Copy,
  PenLine,
  Link2,
  Download,
  ChevronRight,
  X,
  Heart,
  Bookmark,
  Pencil,
} from "lucide-react";
import type { Guide } from "@/lib/tutorial-guide";
import { OwnerBanner, OwnerControls, type OwnerMark } from "@/components/owner-mark";

/**
 * How a tutorial reads.
 *
 * Built to look unlike a project page on purpose: projects are things you take,
 * tutorials are things you follow. The two rules that came out of watching
 * someone actually use one — every block of code is copyable, and anything that
 * changes the shape of a directory gets drawn rather than described, because a
 * written-out file path is the thing readers skim and then get wrong.
 */

function CopyButton({ text, label = "Copy", className = "" }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1600);
      }}
      className={`inline-flex min-h-[26px] shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-neutral-700 px-2 font-mono text-[10.5px] text-neutral-300 outline-none transition hover:border-emerald-400/50 hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400 ${className}`}
    >
      {done ? <Check size={11} aria-hidden /> : <Copy size={11} aria-hidden />}
      {done ? "Copied" : label}
    </button>
  );
}

function Code({ lang, text, filename }: { lang: string; text: string; filename?: string }) {
  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-neutral-800 bg-[#0d120f]">
      <div className="flex items-center justify-between gap-3 border-b border-neutral-800 px-3 py-1.5">
        <span className="truncate font-mono text-[10.5px] text-neutral-400">{filename ?? lang}</span>
        <CopyButton text={text} />
      </div>
      <pre className="overflow-x-auto px-3.5 py-3 font-mono text-[12.5px] leading-relaxed text-neutral-200">
        <code>{text}</code>
      </pre>
    </div>
  );
}

/** A directory, drawn. */
function Tree({ figure }: { figure: NonNullable<Guide["steps"][number]["figure"]> }) {
  return (
    <figure className="mt-3 rounded-lg border border-neutral-800 bg-neutral-900/40 p-3.5">
      <div className="font-mono text-[12px] leading-[1.75]">
        {figure.lines.map((l, i) =>
          l.text ? (
            <div key={i} className="flex flex-wrap items-baseline gap-x-3">
              <span className={l.dim ? "whitespace-pre text-neutral-500" : "whitespace-pre text-neutral-100"}>
                {l.text}
              </span>
              {l.note && <span className="text-[10.5px] text-neutral-500">← {l.note}</span>}
            </div>
          ) : (
            <div key={i} className="h-2.5" />
          ),
        )}
      </div>
      {figure.caption && (
        <figcaption className="mt-2.5 border-t border-neutral-800 pt-2 text-[11.5px] text-neutral-400">
          {figure.caption}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * The mark a moderator sets after following the steps themselves.
 *
 * Blue rather than amber: amber is the colour every interface uses for "not
 * finished yet", so a checked tutorial wearing it read as pending review — the
 * opposite of what it means.
 */
export function VerifiedTutorialBadge({ by }: { by?: string }) {
  return (
    <span
      title={by ? `Checked by @${by} — a moderator followed these steps` : undefined}
      className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/50 bg-sky-400/10 px-2.5 py-1 font-mono text-[11px] font-bold text-sky-200"
    >
      <BadgeCheck size={12} aria-hidden /> Checked
    </span>
  );
}

/**
 * Everything an AI needs to write one of these, behind one button.
 *
 * Sky blue and a CPU, matching the site's AI section — this is the one control
 * on the page aimed at a machine rather than the reader, and it should look it.
 * Top right, because that's where a tool sits when the page itself is the
 * content.
 */
function AiPanel({ spec, specUrl }: { spec: string; specUrl?: string }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={box} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Write one of these with AI"
        title="Write one of these"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-neutral-700 text-neutral-400 outline-none transition hover:border-neutral-500 hover:text-neutral-200 focus-visible:ring-2 focus-visible:ring-emerald-400"
      >
        <PenLine size={15} aria-hidden />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-[min(92vw,340px)] rounded-xl border border-neutral-700 bg-[#101614] p-4 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.9)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 font-mono text-[13px] font-bold text-neutral-100">
                <PenLine size={13} aria-hidden /> Write one of these
              </p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-neutral-300">
                Give your AI the link and say what you want to teach. No prompt to write — the file is the prompt.
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-800 hover:text-white"
            >
              <X size={14} aria-hidden />
            </button>
          </div>

          <div className="mt-3.5 flex flex-col gap-2">
            <p className="text-[11.5px] leading-relaxed text-neutral-400">
              Your AI writes it from this link — no prompt to compose.
            </p>
            {specUrl && <CopyButton text={specUrl} label="Copy the link" className="!min-h-[30px] justify-center !text-[11px]" />}
            <CopyButton text={spec} label="Copy the whole thing" className="!min-h-[30px] justify-center !text-[11px]" />
            <a
              href="/tutorial-template.md"
              download
              className="inline-flex min-h-[30px] items-center justify-center gap-1.5 rounded-md border border-neutral-700 px-2.5 font-mono text-[11px] text-neutral-400 transition hover:border-neutral-500 hover:text-neutral-200"
            >
              <Download size={11} aria-hidden /> Download the .md
            </a>
          </div>

          {specUrl && (
            <p className="mt-3 flex items-center gap-1.5 break-all border-t border-neutral-800 pt-2.5 font-mono text-[10.5px] text-neutral-500">
              <Link2 size={10} className="shrink-0" aria-hidden />
              {specUrl}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** Like and save, on the post rather than the project. */
function Reactions({
  postId,
  likes,
  saved,
  liked,
  canReact,
}: {
  postId: string;
  likes: number;
  saved: boolean;
  liked: boolean;
  canReact: boolean;
}) {
  const [state, setState] = useState({ likes, liked, saved });
  const [busy, setBusy] = useState(false);

  async function toggle(kind: "like" | "save") {
    if (!canReact || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/post-react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, kind }),
      });
      const d = (await res.json()) as { on?: boolean; count?: number };
      if (!res.ok) return;
      setState((s) =>
        kind === "like" ? { ...s, liked: !!d.on, likes: d.count ?? s.likes } : { ...s, saved: !!d.on },
      );
    } finally {
      setBusy(false);
    }
  }

  const base =
    "inline-flex min-h-[30px] items-center gap-1.5 rounded-lg border px-2.5 font-mono text-[11.5px] outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50";

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => toggle("like")}
        disabled={!canReact || busy}
        aria-pressed={state.liked}
        title={canReact ? "Useful" : "Sign in to react"}
        className={`${base} ${
          state.liked
            ? "border-rose-400/60 bg-rose-400/10 text-rose-200"
            : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
        } ${canReact ? "cursor-pointer" : "cursor-default"}`}
      >
        <Heart size={12} className={state.liked ? "fill-current" : ""} aria-hidden />
        {state.likes > 0 ? state.likes : "Useful"}
      </button>
      <button
        onClick={() => toggle("save")}
        disabled={!canReact || busy}
        aria-pressed={state.saved}
        aria-label={state.saved ? "Saved" : "Save for later"}
        title={canReact ? "Save for later" : "Sign in to save"}
        className={`${base} ${
          state.saved
            ? "border-sky-400/60 bg-sky-400/10 text-sky-200"
            : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
        } ${canReact ? "cursor-pointer" : "cursor-default"}`}
      >
        <Bookmark size={12} className={state.saved ? "fill-current" : ""} aria-hidden />
        {state.saved ? "Saved" : "Save"}
      </button>
    </div>
  );
}

export function TutorialView({
  t,
  spec,
  specUrl,
  post,
  owner,
}: {
  t: Guide;
  spec?: string;
  specUrl?: string;
  /** Present when rendered as a real post rather than a preview. */
  post?: {
    id: string;
    author: string;
    when: string;
    likes: number;
    liked: boolean;
    saved: boolean;
    canReact: boolean;
    canEdit?: boolean;
    editedWhen?: string | null;
  };
  /** Present when the tutorial is attached to a project. */
  owner?: { mark: OwnerMark; writtenByOwner: boolean; viewerIsOwner: boolean };
}) {
  return (
    <article className="rounded-2xl border border-neutral-800 bg-gradient-to-b from-[#1a1a14] to-[#161d18] p-6 sm:p-8">
      <div className="flex items-start justify-between gap-3">
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
        {spec && <AiPanel spec={spec} specUrl={specUrl} />}
      </div>

      <h1 className="mt-4 font-mono text-[26px] font-bold leading-tight tracking-tight text-white sm:text-[30px]">
        {t.title}
      </h1>
      <p className="mt-2 text-[15.5px] leading-relaxed text-neutral-300">{t.summary}</p>

      {post && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-neutral-800 py-2.5">
          <p className="font-mono text-[12px] text-neutral-400">
            by <span className="text-neutral-200">@{post.author}</span> · {post.when}
            {post.editedWhen && (
              <>
                {" · "}
                <span title="The guide has changed since it was first posted">edited {post.editedWhen}</span>
              </>
            )}
          </p>
          <div className="flex items-center gap-1.5">
            {post.canEdit && (
              <Link
                href={`/tutorials/${post.id}/edit`}
                className="inline-flex min-h-[30px] items-center gap-1.5 rounded-lg border border-neutral-700 px-2.5 font-mono text-[11.5px] text-neutral-400 transition hover:border-neutral-500 hover:text-neutral-200"
              >
                <Pencil size={12} aria-hidden /> Edit
              </Link>
            )}
            <Reactions
              postId={post.id}
              likes={post.likes}
              liked={post.liked}
              saved={post.saved}
              canReact={post.canReact}
            />
          </div>
        </div>
      )}

      {/* Above the steps, always. Someone about to follow instructions the
          maintainer says are wrong needs to know before step one. */}
      {owner && <OwnerBanner mark={owner.mark} ownProject={owner.writtenByOwner} />}
      {owner?.viewerIsOwner && post && !owner.writtenByOwner && (
        <OwnerControls postId={post.id} mark={owner.mark} />
      )}

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
              {s.image && (
                <figure className="mt-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.image.url}
                    alt={s.image.alt}
                    loading="lazy"
                    className="w-full rounded-lg border border-neutral-800"
                  />
                  {s.image.caption && (
                    <figcaption className="mt-1.5 text-[11.5px] text-neutral-400">{s.image.caption}</figcaption>
                  )}
                </figure>
              )}
              {s.figure && <Tree figure={s.figure} />}
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

      {/* Boxed in red: it's the section people reach already stuck, and it
          should be findable by scrolling fast without reading anything. */}
      {t.troubleshooting.length > 0 && (
        <section className="mt-9 rounded-xl border border-rose-400/30 bg-rose-500/[0.05] p-4">
          <h2 className="flex items-center gap-2 font-mono text-[13px] font-bold text-rose-200">
            <AlertCircle size={14} className="text-rose-400" aria-hidden /> When it doesn&apos;t work
          </h2>
          {/* Symptoms visible, fixes folded away. Nobody reads all of these —
              you scan for the one that matches you, so the list should be
              scannable rather than a page of prose. */}
          <div className="mt-2.5 divide-y divide-rose-400/15 overflow-hidden rounded-lg border border-rose-400/20 bg-[#160f11]">
            {t.troubleshooting.map((x) => (
              <details key={x.symptom} className="group">
                <summary className="flex cursor-pointer list-none items-center gap-2 px-3.5 py-2.5 text-[13px] text-neutral-200 transition hover:bg-rose-500/[0.07]">
                  <ChevronRight
                    size={12}
                    className="shrink-0 text-rose-400/70 transition group-open:rotate-90"
                    aria-hidden
                  />
                  {x.symptom}
                </summary>
                <p className="px-3.5 pb-3 pl-[30px] text-[12.5px] leading-relaxed text-neutral-400">{x.fix}</p>
              </details>
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
