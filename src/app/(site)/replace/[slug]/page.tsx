import Link from "next/link";
import { notFound } from "next/navigation";
import { Repeat, Clock, Wrench, AlertTriangle, ThumbsDown } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EditOnGitHub } from "@/components/edit-on-github";
import { replaceCard, replaceCards, VERDICT } from "@/lib/content";

export function generateStaticParams() {
  return replaceCards().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const c = replaceCard((await params).slug);
  return { title: c ? `${c.title} — Replace — Project Open Source` : "Replace" };
}

export default async function ReplaceDetail({ params }: { params: Promise<{ slug: string }> }) {
  const c = replaceCard((await params).slug);
  if (!c) notFound();
  const m = VERDICT[c.verdict];

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader crumbs={[{ label: "Replace", href: "/replace" }, { label: c.title }]} title={c.title} Icon={Repeat} accent="text-emerald-400" />

      <div className="-mt-2 rounded-xl border px-4 py-3.5" style={{ borderColor: `${m.hex}55`, backgroundColor: `${m.hex}10` }}>
        <p className="font-mono text-[11px] font-bold uppercase tracking-widest" style={{ color: m.hex }}>{m.label}</p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-neutral-100">{c.why}</p>
      </div>

      <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <Row Icon={Repeat} k="What it does" v={c.oneLine} />
        <Row Icon={ThumbsDown} k="What people pay for" v={`${c.examples.join(", ")} — about $${c.costPerYear} a year`} />
        <Row Icon={Wrench} k={c.verdict === "no" ? "What to use instead" : "The free way to build it"} v={c.tool} />
        {c.hours > 0 && <Row Icon={Clock} k="How long, first time" v={`About ${c.hours} hour${c.hours === 1 ? "" : "s"}`} />}
      </dl>

      {c.verdict !== "no" && (
        <div className="mt-6 space-y-4">
          <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
            <h2 className="font-mono text-[12px] font-bold uppercase tracking-widest text-neutral-300">What you give up</h2>
            <p className="mt-1.5 text-[14px] leading-relaxed text-neutral-300">{c.keep}</p>
          </section>
          <section className="rounded-lg border border-amber-400/30 bg-amber-400/[0.05] p-4">
            <h2 className="flex items-center gap-1.5 font-mono text-[12px] font-bold uppercase tracking-widest text-amber-200"><AlertTriangle size={12} aria-hidden /> What breaks later</h2>
            <p className="mt-1.5 text-[14px] leading-relaxed text-neutral-200">{c.breaks}</p>
          </section>
          <p className="text-[13.5px] leading-relaxed text-neutral-400">
            Never built anything before? <Link href="/start" className="text-emerald-300 underline-offset-4 hover:underline">Start here</Link> takes about an hour and ends with you having made a real thing.
          </p>
        </div>
      )}

      <section className="mt-8">
        <h2 className="font-mono text-[12px] font-bold uppercase tracking-widest text-neutral-400">Where this comes from</h2>
        <ul className="mt-2 space-y-1.5">
          {c.sources.map((s) => (
            <li key={s.url}><a href={s.url} className="text-[13.5px] text-emerald-300 underline-offset-4 hover:underline" rel="noopener">{s.label}</a></li>
          ))}
        </ul>
      </section>

      <EditOnGitHub file={c.file} verified={c.verified} />
    </div>
  );
}

function Row({ Icon, k, v }: { Icon: typeof Repeat; k: string; v: string }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-neutral-500"><Icon size={11} aria-hidden /> {k}</dt>
      <dd className="mt-1 text-[14px] leading-relaxed text-neutral-200">{v}</dd>
    </div>
  );
}
