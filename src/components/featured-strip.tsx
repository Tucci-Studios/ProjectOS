import Link from "next/link";
import { Sparkles, GitBranch, ArrowRight } from "lucide-react";
import { categoryMeta, groupOf } from "@/lib/categories";
import { ProjectSigil } from "./project-sigil";
import { ButtonLink } from "./ui";

export type FeaturedProject = {
  id: string;
  base_name: string;
  variant_name: string | null;
  category: string;
  description: string;
  github_login: string;
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
        <ProjectSigil name={fullName} category={p.category} size={64} />
        <div className="min-w-0 flex-1">
          <span className={`rounded border ${g.border} px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${g.text}`}>
            {meta.kind}
          </span>
          <h2 className="mt-1.5 font-mono text-2xl font-bold tracking-tight text-white">
            <Link href={`/p/${p.id}`} className="outline-none transition hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400">
              {p.base_name}
              {p.variant_name && (
                <>
                  <span className="text-neutral-500"> // </span>
                  {p.variant_name}
                </>
              )}
            </Link>
          </h2>
          <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-neutral-300">{p.description}</p>
          <p className="mt-2 font-mono text-[11px] text-neutral-500">
            @{p.github_login} · {p.like_count} likes · {p.fork_count} branch{p.fork_count === 1 ? "" : "es"}
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <ButtonLink href={`/p/${p.id}`} variant="primary" className="!min-h-[40px]">
              Open <ArrowRight size={15} aria-hidden />
            </ButtonLink>
            <ButtonLink href={`/p/${p.id}/branch`} variant="ghost" className="!min-h-[40px]">
              <GitBranch size={15} aria-hidden /> Branch it
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
