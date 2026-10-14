import Link from "next/link";
import { Newspaper } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { stories } from "@/lib/content";

export const metadata = { title: "What's happening — Project Open Source" };

/** Why any of this matters this month. Explained plainly, sourced, no downloads. */
export default function NowPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader crumbs={[{ label: "What's happening" }]} title="What's happening" Icon={Newspaper} accent="text-sky-400" />
      <div className="-mt-1 divide-y divide-neutral-800">
        {stories().map((s) => (
          <article key={s.slug} className="group relative py-4">
            <p className="font-mono text-[10.5px] uppercase tracking-widest text-neutral-500">{s.date}</p>
            <h2 className="mt-1 font-mono text-[16px] font-bold leading-snug tracking-tight text-white transition group-hover:text-sky-300">{s.title}</h2>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-neutral-400">{s.summary}</p>
            <Link href={`/now/${s.slug}`} aria-label={`Read: ${s.title}`} className="absolute inset-0" />
          </article>
        ))}
      </div>
    </div>
  );
}
