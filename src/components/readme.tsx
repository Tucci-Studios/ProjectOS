"use client";

import { useEffect, useState } from "react";
import { BookOpen, X, Loader2 } from "lucide-react";

/**
 * A README, rendered.
 *
 * Safe by construction: this never emits raw HTML, so anything a stranger has
 * written in their README — a script tag, an onclick, an iframe — comes out as
 * inert text. That's the reason this is hand-rolled rather than a markdown
 * library with an HTML plugin: the moment raw HTML is allowed, every README on
 * GitHub becomes an injection surface on your site.
 *
 * Covers what READMEs actually use: headings, paragraphs, fenced and inline
 * code, lists, quotes, rules, images, links, bold and italic. Anything else
 * falls through as plain text rather than breaking.
 */

const INLINE =
  /(!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|_[^_\n]+_|https?:\/\/[^\s<>"')\]]+)/g;

/** Absolute-ises repo-relative image paths so they resolve off GitHub. */
function absolute(src: string, repo: string) {
  if (/^https?:\/\//.test(src)) return src;
  return `https://raw.githubusercontent.com/${repo}/HEAD/${src.replace(/^\.?\//, "")}`;
}

function Inline({ text, repo }: { text: string; repo: string }) {
  const parts = text.split(INLINE);
  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;

        const img = /^!\[([^\]]*)\]\(([^)\s]+)/.exec(part);
        if (img)
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={absolute(img[2], repo)}
              alt={img[1]}
              loading="lazy"
              className="my-2 inline-block max-h-80 max-w-full rounded-lg border border-neutral-800"
            />
          );

        const link = /^\[([^\]]+)\]\(([^)\s]+)/.exec(part);
        if (link)
          return (
            <a
              key={i}
              href={/^https?:\/\//.test(link[2]) ? link[2] : `https://github.com/${repo}`}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-emerald-400 hover:underline"
            >
              {link[1]}
            </a>
          );

        if (/^`[^`]+`$/.test(part))
          return (
            <code key={i} className="rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-[0.9em] text-emerald-200">
              {part.slice(1, -1)}
            </code>
          );

        if (/^(\*\*|__).+(\*\*|__)$/.test(part))
          return (
            <strong key={i} className="font-bold text-white">
              {part.slice(2, -2)}
            </strong>
          );

        if (/^[*_][^*_].*[*_]$/.test(part))
          return (
            <em key={i} className="italic">
              {part.slice(1, -1)}
            </em>
          );

        if (/^https?:\/\//.test(part))
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="break-all text-emerald-400 hover:underline"
            >
              {part}
            </a>
          );

        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export function Readme({ md, repo }: { md: string; repo: string }) {
  const lines = md.split("\n");
  const out: React.ReactNode[] = [];

  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // fenced code
    if (/^\s*```/.test(line)) {
      const lang = line.replace(/^\s*```/, "").trim();
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) body.push(lines[i++]);
      i++;
      out.push(
        <pre
          key={key++}
          className="my-3 overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950/70 p-3.5 font-mono text-[12.5px] leading-relaxed text-neutral-200"
        >
          {lang && <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-600">{lang}</span>}
          <code>{body.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    // headings
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const size =
        level === 1
          ? "mt-6 text-[22px]"
          : level === 2
            ? "mt-5 text-[18px]"
            : level === 3
              ? "mt-4 text-[15px]"
              : "mt-3 text-[14px]";
      out.push(
        <p key={key++} className={`${size} mb-2 font-mono font-bold leading-snug text-white`}>
          <Inline text={h[2].replace(/#+\s*$/, "")} repo={repo} />
        </p>,
      );
      i++;
      continue;
    }

    // horizontal rule
    if (/^\s*([-*_])\s*\1\s*\1[\s\-*_]*$/.test(line)) {
      out.push(<hr key={key++} className="my-5 border-neutral-800" />);
      i++;
      continue;
    }

    // quote
    if (/^\s*>/.test(line)) {
      const body: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) body.push(lines[i++].replace(/^\s*>\s?/, ""));
      out.push(
        <blockquote key={key++} className="my-3 border-l-2 border-neutral-700 pl-3.5 text-neutral-400">
          <Inline text={body.join(" ")} repo={repo} />
        </blockquote>,
      );
      continue;
    }

    // list
    if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
      const items: string[] = [];
      const ordered = /^\s*\d+\./.test(line);
      while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i]))
        items.push(lines[i++].replace(/^\s*([-*+]|\d+\.)\s+/, ""));
      out.push(
        <ul key={key++} className="my-2.5 space-y-1 pl-1">
          {items.map((it, n) => (
            <li key={n} className="flex gap-2.5 text-neutral-300">
              <span className="shrink-0 select-none font-mono text-[13px] text-neutral-600">
                {ordered ? `${n + 1}.` : "·"}
              </span>
              <span className="min-w-0">
                <Inline text={it} repo={repo} />
              </span>
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    // blank
    if (!line.trim()) {
      i++;
      continue;
    }

    // paragraph
    const body: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^\s*(```|#{1,6}\s|>|([-*+]|\d+\.)\s)/.test(lines[i])
    )
      body.push(lines[i++]);
    out.push(
      <p key={key++} className="my-2.5 leading-relaxed text-neutral-300">
        <Inline text={body.join(" ")} repo={repo} />
      </p>,
    );
  }

  return <div className="text-[14.5px]">{out}</div>;
}

/**
 * The README behind a button.
 *
 * Loaded when asked for, never during the page render — a project page must not
 * wait on GitHub, and making it do so was enough to take the dev server down
 * under a crawl. Opens as a full overlay with its own close, the same way the
 * welcome screen does.
 */
export function ReadmeButton({
  projectId,
  repo,
  hasReadme,
}: {
  projectId: string;
  repo: string;
  hasReadme: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [md, setMd] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "empty">("idle");

  useEffect(() => {
    if (!open || md !== null || state === "loading") return;
    setState("loading");
    fetch(`/api/readme?projectId=${encodeURIComponent(projectId)}`)
      .then((r) => r.json())
      .then((d: { md?: string | null }) => {
        if (d.md?.trim()) {
          setMd(d.md);
          setState("idle");
        } else setState("empty");
      })
      .catch(() => setState("empty"));
  }, [open, md, state, projectId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-7 flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900/40 font-mono text-[13px] text-neutral-200 outline-none transition hover:border-emerald-400/50 hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400"
      >
        <BookOpen size={15} aria-hidden /> Read the readme
        {!hasReadme && <span className="text-neutral-600">· from GitHub</span>}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={`Readme for ${repo}`}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-8"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-neutral-700 bg-[#0f1411]">
            <header className="flex shrink-0 items-center gap-3 border-b border-neutral-800 px-5 py-3">
              <BookOpen size={15} className="text-emerald-400" aria-hidden />
              <p className="min-w-0 flex-1 truncate font-mono text-[13px] text-neutral-300">{repo}</p>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-neutral-400 outline-none transition hover:bg-neutral-800 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <X size={17} aria-hidden />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {state === "loading" && (
                <p className="flex items-center gap-2 py-8 font-mono text-[13px] text-neutral-500">
                  <Loader2 size={14} className="animate-spin" aria-hidden /> Fetching it from GitHub...
                </p>
              )}
              {state === "empty" && (
                <p className="py-8 text-center text-sm text-neutral-500">This project has no readme on GitHub.</p>
              )}
              {md && <Readme md={md} repo={repo} />}
            </div>

            <footer className="shrink-0 border-t border-neutral-800 px-5 py-2.5">
              <p className="font-mono text-[11px] text-neutral-600">
                Formatting is simplified, and any HTML in it is shown as text rather than run.
              </p>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
