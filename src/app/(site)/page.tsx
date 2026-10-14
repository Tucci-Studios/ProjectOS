import Link from "next/link";
import { Repeat, GraduationCap, Newspaper, ArrowRight, Radio } from "lucide-react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { stories, replaceCards } from "@/lib/content";
import { REPO_IS_PUBLIC, SOURCE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * Three doors.
 *
 * You open the site and there are exactly three things to click, each answering
 * one question a person actually arrives with. Everything else is reachable
 * from the rail, and nothing on this page needs a paragraph to explain itself.
 */
export default async function Home() {
  const { env } = getCloudflareContext();
  const guides = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM posts WHERE kind='tutorial' AND status='live'",
  ).first<{ n: number }>().catch(() => ({ n: 0 }));
  const yes = replaceCards().filter((c) => c.verdict === "yes").length;
  const latest = stories()[0];

  const doors = [
    { href: "/replace", Icon: Repeat, hex: "#34d399", title: "Replace", q: "Can I build what I'm paying for?", meta: `${yes} things a beginner can rebuild. ${replaceCards().length - yes} you shouldn't.` },
    { href: "/start", Icon: GraduationCap, hex: "#f5b544", title: "Learn", q: "How do I even start?", meta: `${guides?.n ?? 0} guides. First one takes an hour and ends with a real thing.` },
    { href: "/now", Icon: Newspaper, hex: "#38bdf8", title: "What's happening", q: "Why does this matter right now?", meta: latest ? latest.title : "Plain explanations, sourced." },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl">
      <header className="mb-8 mt-2">
        <h1 className="font-mono text-[28px] font-bold leading-tight tracking-tight text-white sm:text-[34px]">
          Build your own software<br />
          <span className="text-emerald-400">instead of renting it.</span>
        </h1>
        <p className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-neutral-300">
          For people who&apos;ve never written code. Free tools, honest verdicts, and no downloads of anything you&apos;d get in trouble for.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {doors.map((d) => (
          <Link key={d.href} href={d.href} className="group rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 outline-none transition hover:bg-neutral-800/50 focus-visible:ring-2 focus-visible:ring-emerald-400" style={{ borderTopColor: d.hex, borderTopWidth: 3 }}>
            <d.Icon size={20} style={{ color: d.hex }} aria-hidden />
            <h2 className="mt-3 font-mono text-[18px] font-bold tracking-tight text-white">{d.title}</h2>
            <p className="mt-1 text-[14.5px] leading-snug text-neutral-200">{d.q}</p>
            <p className="mt-3 text-[12.5px] leading-relaxed text-neutral-400">{d.meta}</p>
            <p className="mt-4 inline-flex items-center gap-1 font-mono text-[12px] transition group-hover:gap-2" style={{ color: d.hex }}>Open <ArrowRight size={12} aria-hidden /></p>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-neutral-800 pt-5 text-[13px] text-neutral-400">
        <Link href="/wire" className="inline-flex items-center gap-1.5 text-neutral-300 underline-offset-4 hover:underline"><Radio size={13} aria-hidden /> What people are building</Link>
        {REPO_IS_PUBLIC && <a href={SOURCE_URL} className="underline-offset-4 hover:underline">This site is open source. Fix anything.</a>}
      </div>
    </div>
  );
}
