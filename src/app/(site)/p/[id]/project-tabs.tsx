import Link from "next/link";

const TABS = [
  { key: "about", label: "About" },
  { key: "install", label: "Get it" },
  { key: "branches", label: "Branches" },
] as const;

export function ProjectTabs({
  projectId,
  tab,
  branchCount,
}: {
  projectId: string;
  tab: string;
  branchCount: number;
}) {
  return (
    <div className="mb-5 mt-7 flex gap-1 border-b border-neutral-800">
      {TABS.map((t) => {
        const active = tab === t.key;
        return (
          <Link
            key={t.key}
            href={t.key === "about" ? `/p/${projectId}` : `/p/${projectId}?tab=${t.key}`}
            aria-current={active ? "page" : undefined}
            className={`relative -mb-px flex min-h-[42px] items-center gap-1.5 px-4 font-mono text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 ${
              active ? "text-white" : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            {t.label}
            {t.key === "branches" && branchCount > 0 && (
              <span className="rounded-full bg-neutral-800 px-1.5 py-0.5 font-mono text-[10px] text-neutral-300">
                {branchCount}
              </span>
            )}
            {active && <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-t bg-emerald-400" aria-hidden />}
          </Link>
        );
      })}
    </div>
  );
}
