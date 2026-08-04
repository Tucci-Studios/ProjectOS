"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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

/**
 * Turns the HTML that READMEs are full of into plain markdown-ish text.
 *
 * GitHub renders HTML, so people write it — centred logo blocks, badge tables,
 * <details> sections. Showing those tags as literal text was safe and awful to
 * read. This keeps the safety, because tags are *removed* rather than trusted:
 * the few that carry meaning become their markdown equivalent and everything
 * else is dropped, so a <script> body never survives to be rendered at all.
 */
function detag(md: string): string {
  return md
    .replace(/<(script|style|iframe|object|embed|svg|noscript)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|tr|li|details|summary|table|blockquote)>/gi, "\n")
    .replace(/<img\b[^>]*?\balt=["']([^"']*)["'][^>]*?\bsrc=["']([^"']+)["'][^>]*>/gi, "![$1]($2)")
    .replace(/<img\b[^>]*?\bsrc=["']([^"']+)["'][^>]*>/gi, "![]($1)")
    .replace(/<a\b[^>]*?\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_m, href, text) => {
      const label = String(text).replace(/<[^>]+>/g, "").trim();
      // A link wrapped round a badge or logo: keep the image, drop the wrapper.
      // Nesting one inside the other just yields a broken image.
      if (label.startsWith("![")) return label;
      return label ? `[${label}](${href})` : "";
    })
    .replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, "**$2**")
    .replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, "*$2*")
    .replace(/<code>([\s\S]*?)<\/code>/gi, "`$1`")
    .replace(/<[^>]+>/g, "")            // whatever is left carries no meaning
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n");
}

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
              // Badge rows are half dead links in most READMEs. A broken-image
              // icon is worse than no image, so anything that fails disappears.
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
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
  const lines = detag(md).split("\n");
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
 * under a crawl. Takes the whole window when it opens: a README is the document
 * you came to read, not a preview of one, and reading it shouldn't mean peering
 * through a hole in the page behind it.
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open || md !== null || state === "loading") return;
    setState("loading");
    fetch(`/api/readme?projectId=${encodeURIComponent(projectId)}`)
      .then((r) => r.json() as Promise<{ md?: string | null }>)
      .then((d) => {
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

      {open && mounted &&
        createPortal(
          <div
            role="dialog"
          aria-label={`Readme for ${repo}`}
          className="fixed inset-0 z-50 flex flex-col bg-[#0f1411]"
        >
          <div className="flex h-full w-full flex-col overflow-hidden">
            <header className="flex shrink-0 items-center gap-3 border-b border-neutral-800 px-4 py-3 sm:px-6">
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

            {/* The text stays a readable column even though the panel is the
                whole window — full screen is about getting the page out of the
                way, not about setting line lengths nobody can follow. */}
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
              <div className="mx-auto w-full max-w-3xl">
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
            </div>

            <footer className="shrink-0 border-t border-neutral-800 px-4 py-2.5 sm:px-6">
              <p className="mx-auto max-w-3xl font-mono text-[11px] text-neutral-600">
                Formatting is simplified. Any HTML is stripped out rather than run.
              </p>
            </footer>
          </div>
          </div>,
          document.body,
        )}
    </>
  );
}
