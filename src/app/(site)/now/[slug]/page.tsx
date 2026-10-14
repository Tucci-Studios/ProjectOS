import { notFound } from "next/navigation";
import { Newspaper } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EditOnGitHub } from "@/components/edit-on-github";
import { Readme } from "@/components/readme";
import { story, stories } from "@/lib/content";
import { SOURCE_REPO } from "@/lib/site";

export function generateStaticParams() {
  return stories().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const s = story((await params).slug);
  return { title: s ? `${s.title} — Project Open Source` : "What's happening", description: s?.summary };
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const s = story((await params).slug);
  if (!s) notFound();
  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader crumbs={[{ label: "What's happening", href: "/now" }, { label: s.title }]} title={s.title} Icon={Newspaper} accent="text-sky-400" />
      <p className="-mt-2 font-mono text-[11px] uppercase tracking-widest text-neutral-500">{s.date}</p>
      <p className="mt-3 text-[16px] leading-relaxed text-neutral-200">{s.summary}</p>
      <div className="mt-5">
        <Readme md={s.body} repo={SOURCE_REPO} />
      </div>
      <section className="mt-8">
        <h2 className="font-mono text-[12px] font-bold uppercase tracking-widest text-neutral-400">Sources</h2>
        <ul className="mt-2 space-y-1.5">
          {s.sources.map((x) => (
            <li key={x.url}><a href={x.url} className="text-[13.5px] text-sky-300 underline-offset-4 hover:underline" rel="noopener">{x.label}</a></li>
          ))}
        </ul>
      </section>
      <EditOnGitHub file={s.file} verified={s.date} />
    </div>
  );
}
