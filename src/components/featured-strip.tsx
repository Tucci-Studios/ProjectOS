import Link from "next/link";
import { Sparkles, GitFork, ArrowRight } from "lucide-react";
import { categoryMeta, groupOf } from "@/lib/categories";
import { ProjectMark } from "./project-mark";
import { BrandMark } from "./brand";
import { ButtonLink } from "./ui";

export type FeaturedProject = {
  id: string;
  base_name: string;
  variant_name: string | null;
  category: string;
  description: string;
  github_login: string;
  github_repo: string;
  like_count: number;
  fork_count: number;
};

// Pinned at the top of the feed — the one project the site is pointing at today.
export function FeaturedStrip({ p }: { p: FeaturedProject }) {
  const meta = categoryMeta(p.category);
  const g = groupOf(p.category);
  const fullName = p.variant_name ? `${p.base_name} // ${p.variant_name}` : p.base_name;

  return (
    <section
      className="relative overflow-hidden rounded-xl border bg-neutral-900/60 p-5"
      style={{ borderColor: `${g.hex}35` }}
    >
      <span
        className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full opacity-[0.07] blur-3xl"
        style={{ background: g.hex }}
        aria-hidden
      />
      <p className="mb-3 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: g.hex }}>
        <Sparkles size={12} aria-hidden /> Featured this week
      </p>
      <div className="flex items-start gap-4">
        <ProjectMark category={p.category} size={64} />
        <div className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-400/25 bg-emerald-400/[0.07] py-0.5 pl-1 pr-2">
              <BrandMark size={16} className="!border-neutral-600 !bg-transparent" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-300/90">Project</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-700 bg-neutral-800/60 px-2 py-1 font-mono text-[11px] text-neutral-300">
              <meta.Icon size={12} strokeWidth={2} className="text-neutral-400" aria-hidden />
              {meta.use}
            </span>
          </span>
          <h2 className="mt-1.5 font-mono text-2xl font-bold tracking-tight text-white">
            <Link href={`/p/${p.id}`} className="outline-none transition hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400">
              {p.base_name}
              {p.variant_name && (
                <>
                  <span className="text-neutral-400"> // </span>
                  {p.variant_name}
                </>
              )}
            </Link>
          </h2>
          <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-300">{p.description}</p>
          <p className="mt-2 font-mono text-[11px] text-neutral-400">
            @{p.github_login} · {p.like_count} likes · {p.fork_count} fork{p.fork_count === 1 ? "" : "es"}
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <ButtonLink href={`/p/${p.id}`} variant="primary" className="!min-h-[40px]">
              Open <ArrowRight size={15} aria-hidden />
            </ButtonLink>
            <ButtonLink
              href={`https://github.com/${p.github_repo}/fork`}
              variant="ghost"
              className="!min-h-[40px]"
              external
            >
              <GitFork size={15} aria-hidden /> Fork on GitHub
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
