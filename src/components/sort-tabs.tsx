import Link from "next/link";
import { Flame, Clock, GitFork, Users } from "lucide-react";

const SORTS = [
  { key: "top", label: "Most liked", Icon: Flame },
  { key: "new", label: "Newest", Icon: Clock },
  { key: "forked", label: "Most forked", Icon: GitFork },
  { key: "followed", label: "Most followed", Icon: Users },
] as const;

export function SortTabs({ basePath, sort }: { basePath: string; sort: string }) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-lg border border-neutral-700 bg-neutral-900/60 p-1">
      {SORTS.map((s) => {
        const active = sort === s.key;
        return (
          <Link
            key={s.key}
            href={s.key === "top" ? basePath : `${basePath}${basePath.includes("?") ? "&" : "?"}sort=${s.key}`}
            aria-current={active ? "page" : undefined}
            className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-md px-3 font-mono text-[13px] outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 ${
              active ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-neutral-300"
            }`}
          >
            <s.Icon size={13} aria-hidden /> {s.label}
          </Link>
        );
      })}
    </div>
  );
}
