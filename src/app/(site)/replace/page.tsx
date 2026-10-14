import Link from "next/link";
import { Repeat } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { replaceCards, VERDICT, type ReplaceCard, type Verdict } from "@/lib/content";
import { SOURCE_REPO } from "@/lib/site";

export const metadata = { title: "Replace — Project Open Source" };

/**
 * "Can I rebuild what I'm paying for?"
 *
 * One card per kind of subscription, with an honest verdict. The "no" cards are
 * what make the "yes" cards believable: a page that says everything is
 * replaceable is advertising, not advice.
 */
export default function ReplacePage() {
  const cards = replaceCards();
  const groups = (["yes", "partly", "no"] as Verdict[]).map((v) => ({ v, meta: VERDICT[v], items: cards.filter((c) => c.verdict === v) }));
  const total = cards.filter((c) => c.verdict === "yes").reduce((n, c) => n + c.costPerYear, 0);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader crumbs={[{ label: "Replace" }]} title="Replace" Icon={Repeat} accent="text-emerald-400" />
      <p className="-mt-2 mb-6 max-w-2xl text-[15px] leading-relaxed text-neutral-300">
        What you pay for every month, and whether a beginner can honestly rebuild it with free AI tools. The
        &ldquo;yes&rdquo; cards on this page add up to about <span className="text-white">${total.toLocaleString()} a year</span>.
        The &ldquo;no&rdquo; cards are here so you don&apos;t waste a weekend.
      </p>

      {groups.map(({ v, meta, items }) => (
        <section key={v} className="mt-7">
          <div className="mb-3 flex items-baseline gap-2.5 border-b border-neutral-800 pb-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.hex }} aria-hidden />
            <h2 className="font-mono text-[15px] font-bold" style={{ color: meta.hex }}>{meta.label}</h2>
            <span className="text-[12.5px] text-neutral-400">{meta.blurb}</span>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {items.map((c) => <Card key={c.slug} c={c} />)}
          </div>
        </section>
      ))}

      <p className="mt-10 border-t border-neutral-800 pt-4 text-[12.5px] leading-relaxed text-neutral-400">
        Missing something you pay for?{" "}
        <a href={`https://github.com/${SOURCE_REPO}/issues/new?template=suggest-a-subscription.md`} className="text-emerald-300 underline-offset-4 hover:underline">
          Suggest it
        </a>
        . Every card is a file anyone can fix.
      </p>
    </div>
  );
}

function Card({ c }: { c: ReplaceCard }) {
  const m = VERDICT[c.verdict];
  return (
    <article className="group relative rounded-lg border border-neutral-800/80 bg-neutral-900/30 px-3.5 py-3 transition hover:border-neutral-700 hover:bg-neutral-800/40" style={{ borderLeftColor: m.hex, borderLeftWidth: 3 }}>
      <p className="flex items-center justify-between gap-2 font-mono text-[10px] font-bold uppercase tracking-widest">
        <span style={{ color: m.hex }}>{m.short}</span>
        <span className="font-normal tracking-normal text-neutral-500">~${c.costPerYear}/yr</span>
      </p>
      <h3 className="mt-1.5 font-mono text-[13.5px] font-bold leading-snug tracking-tight text-white">{c.title}</h3>
      <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-neutral-400">{c.oneLine}</p>
      <p className="mt-1.5 truncate font-mono text-[10.5px] text-neutral-500">like {c.examples.join(", ")}</p>
      <Link href={`/replace/${c.slug}`} aria-label={`Read about ${c.title}`} className="absolute inset-0" />
    </article>
  );
}
