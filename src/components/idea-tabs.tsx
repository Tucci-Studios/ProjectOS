import Link from "next/link";

export type IdeaTab = "vote" | "winners" | "passed";

const TABS: { key: IdeaTab; label: string }[] = [
  { key: "vote", label: "Up for vote" },
  { key: "winners", label: "Winners" },
  { key: "passed", label: "Turned down" },
];

export function IdeaTabs({ active, counts }: { active: IdeaTab; counts: Record<IdeaTab, number> }) {
  return (
    <div className="mb-5 flex gap-1 border-b border-neutral-800">
      {TABS.map(({ key, label }) => {
        const on = key === active;
        return (
          <Link
            key={key}
            href={key === "vote" ? "/ideas" : `/ideas?tab=${key}`}
            aria-current={on ? "page" : undefined}
            className={`-mb-px flex min-h-[42px] items-center gap-2 border-b-2 px-3.5 font-mono text-[13px] outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 ${
              on
                ? "border-emerald-400 font-bold text-white"
                : "border-transparent text-neutral-500 hover:text-neutral-200"
            }`}
          >
            {label}
            <span className={`font-mono text-[11px] ${on ? "text-emerald-400" : "text-neutral-600"}`}>
              {counts[key]}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
