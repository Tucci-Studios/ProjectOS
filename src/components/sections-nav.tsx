"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ScrollText, Compass, FlaskConical, Lightbulb, Megaphone, ShieldCheck, Radio, HeartHandshake, GraduationCap, Sparkles, Repeat, Newspaper } from "lucide-react";
import { GROUPS, GROUP_ORDER, categoryMeta } from "@/lib/categories";
import { sampleSpring } from "@/lib/spring";

/**
 * The rail: where you browse at the top, the three groups in the middle, and
 * the housekeeping — ideas, updates, help wanted, the lab, moderation — kept
 * together at the bottom, out of the way of the reading.
 *
 * The highlight is a single element rather than a background on each row, so
 * moving between pages reads as one thing travelling rather than two things
 * blinking. It moves whole: the entire pill slides to the new row and nothing
 * about it deforms on the way.
 *
 * Earlier versions collapsed it to a sliver mid-flight — first vertically, then
 * to a dot. Both looked like a stray box loose in the rail rather than the
 * highlight going somewhere. Deforming the thing that is meant to be a stable
 * marker of "you are here" reads as breakage, however briefly.
 *
 * It takes on that section's colour on the way, so the rail changes hue as you
 * move through the site.
 */
/**
 * The colour crossfade. The travel itself has no fixed duration — the spring
 * decides, so a short hop finishes sooner than a long slide, the way a real
 * object would.
 */
const TINT_MS = 260;

export function SectionsNav({ isMod = false }: { isMod?: boolean }) {
  const pathname = usePathname();
  const activeSlug = pathname.startsWith("/s/") ? pathname.split("/")[2] : undefined;
  const activeGroup = pathname.startsWith("/g/")
    ? pathname.split("/")[2]
    : activeSlug
      ? categoryMeta(activeSlug).group
      : undefined;

  const MAIN = [
    // First in the rail on purpose: the person who needs it is the least likely
    // to go looking for it.
    { href: "/", label: "Home", Icon: Sparkles, exact: true, hex: "#34d399" },
    { href: "/replace", label: "Replace", Icon: Repeat, hex: "#34d399" },
    { href: "/start", label: "Learn", Icon: GraduationCap, hex: "#f5b544" },
    { href: "/now", label: "What's happening", Icon: Newspaper, hex: "#38bdf8" },
    { href: "/wire", label: "Feed", Icon: Radio, hex: "#38bdf8" },
  ];

  // Saves moved to the header, next to your avatar — it's yours, not a section.
  const MINE = [
    { href: "/tutorials", label: "All guides", Icon: ScrollText, hex: "#f5b544" },
    { href: "/explore", label: "Projects", Icon: Compass, hex: "#d4d4d4" },
    { href: "/updates", label: "Updates", Icon: Megaphone, hex: "#d4d4d4" },
    { href: "/help", label: "Help wanted", Icon: HeartHandshake, hex: "#34d399" },
    // Moderators only — for everyone else this row isn't here.
    ...(isMod ? [{ href: "/mod", label: "Mod", Icon: ShieldCheck, hex: "#fb7185" }] : []),
  ];

  // Which row is lit, as a stable key we can look the element up by.
  const activeKey =
    activeGroup !== undefined
      ? `g:${activeGroup}`
      : (MAIN.find((m) => (m.exact ? pathname === m.href : pathname.startsWith(m.href)))?.href ??
         MINE.find((m) => pathname.startsWith(m.href))?.href ??
         null);

  const activeHex =
    activeGroup !== undefined
      ? GROUPS[activeGroup as keyof typeof GROUPS]?.hex
      : ([...MAIN, ...MINE].find((m) => m.href === activeKey)?.hex ?? "#34d399");

  const navRef = useRef<HTMLElement | null>(null);
  const pillRef = useRef<HTMLSpanElement | null>(null);
  /** Where the pill currently is, so the spring knows what to travel from. */
  const fromTop = useRef<number | null>(null);
  const running = useRef<Animation | null>(null);
  const rows = useRef(new Map<string, HTMLAnchorElement | null>());
  const [pill, setPill] = useState<{ top: number; height: number } | null>(null);
  const first = useRef(true);

  useLayoutEffect(() => {
    const el = activeKey ? rows.current.get(activeKey) : null;
    if (!el || !navRef.current) {
      setPill(null);
      return;
    }
    const next = { top: el.offsetTop, height: el.offsetHeight };

    // No animation on the first paint — the pill should already be where it
    // belongs when the page arrives, not fly in from the top.
    if (first.current) {
      first.current = false;
      fromTop.current = next.top;
      setPill(next);
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = fromTop.current;
    setPill(next);
    fromTop.current = next.top;
    if (reduce || from === null || from === next.top || !pillRef.current) return;

    // Hand the browser the whole curve up front. It runs on the compositor and
    // we never touch layout mid-flight.
    const { positions, durationMs } = sampleSpring(from, next.top);
    running.current?.cancel();
    running.current = pillRef.current.animate(
      positions.map((y) => ({ transform: `translateY(${y}px)` })),
      { duration: durationMs, easing: "linear", fill: "both" },
    );
  }, [activeKey]);

  // Keep it aligned if the rail reflows (font loading, the Mod row appearing).
  useEffect(() => {
    const onResize = () => {
      const el = activeKey ? rows.current.get(activeKey) : null;
      if (el) {
        fromTop.current = el.offsetTop;
        setPill({ top: el.offsetTop, height: el.offsetHeight });
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeKey]);

  const row =
    "relative z-10 flex min-h-[40px] items-center gap-2.5 rounded-lg px-3 font-mono text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400";

  const register = (key: string) => (el: HTMLAnchorElement | null) => {
    rows.current.set(key, el);
  };

  return (
    <nav ref={navRef} aria-label="Browse" className="relative space-y-1.5">
      {pill && (
        <span
          ref={pillRef}
          aria-hidden
          data-nav-pill
          className="pointer-events-none absolute left-0 right-0 z-0 rounded-lg"
          style={{
            height: pill.height,
            backgroundColor: `${activeHex}1f`,
            transform: `translateY(${pill.top}px)`,
            transition: `background-color ${TINT_MS}ms ease, height 180ms ease`,
            willChange: "transform",
          }}
        />
      )}

      <div className="mb-4 space-y-0.5 border-b border-neutral-800 pb-4">
        {MAIN.map(({ href, label, Icon, exact, hex }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              ref={register(href)}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`${row} ${active ? "font-bold" : "text-neutral-300 hover:bg-neutral-800 hover:text-white"}`}
              style={active ? { color: hex } : undefined}
            >
              <Icon size={16} aria-hidden /> {label}
            </Link>
          );
        })}
      </div>

      <div className="space-y-0.5 border-b border-neutral-800 pb-4">
        {GROUP_ORDER.map((key) => {
          const g = GROUPS[key];
          const active = activeGroup === key;
          return (
            <Link
              key={key}
              ref={register(`g:${key}`)}
              href={`/g/${key}`}
              aria-current={active ? "page" : undefined}
              title={g.blurb}
              className={`${row} ${active ? "font-bold" : "text-neutral-300 hover:bg-neutral-800 hover:text-white"}`}
              style={active ? { color: g.hex } : undefined}
            >
              <g.Icon size={16} style={{ color: active ? g.hex : undefined }} aria-hidden /> {g.label}
            </Link>
          );
        })}
      </div>

      <div className="space-y-0.5 pt-1">
        {MINE.map(({ href, label, Icon, hex }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              ref={register(href)}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`${row} ${active ? "font-bold" : "text-neutral-300 hover:bg-neutral-800"}`}
              style={active ? { color: hex } : undefined}
            >
              <Icon size={16} aria-hidden /> {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
