import { TIER_COPY, type SetupTier, type SetupFacts } from "@/lib/setup";
import { Check, Minus } from "lucide-react";

const isTier = (t?: string | null): t is SetupTier =>
  t === "easy" || t === "some" || t === "rough" || t === "unknown";

/**
 * The one-line answer to "can I actually run this?".
 *
 * Small on purpose — it's a scanning aid on a card, not a verdict on the
 * project's worth. "unknown" is drawn as quietly as possible, because not
 * finding an install step usually means it's a library or a set of docs, not
 * that anything is wrong with it.
 */
export function SetupChip({ tier }: { tier?: string | null }) {
  if (!isTier(tier)) return null;
  const c = TIER_COPY[tier];
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-px font-mono text-[10px] font-bold"
      style={{ borderColor: `${c.hex}44`, backgroundColor: `${c.hex}12`, color: c.hex }}
      title={c.blurb}
    >
      <span className="h-1 w-1 rounded-full" style={{ backgroundColor: c.hex }} aria-hidden />
      {c.label}
    </span>
  );
}

/**
 * The same judgement with its working shown.
 *
 * Nobody should have to take a rating on trust, least of all someone who is
 * already nervous about cloning a stranger's repo — so this lists the actual
 * files we found and lets the reader disagree with the conclusion.
 */
export function SetupPanel({ tier, factsJson }: { tier?: string | null; factsJson?: string | null }) {
  if (!isTier(tier) || !factsJson) return null;

  let f: SetupFacts;
  try {
    f = JSON.parse(factsJson) as SetupFacts;
  } catch {
    return null;
  }

  const c = TIER_COPY[tier];
  const checks: [boolean, string, string][] = [
    [f.containerized, "Ships a Dockerfile", "No Dockerfile"],
    [f.pinnedDeps, "Dependency versions are pinned", "Dependencies aren't pinned to exact versions"],
    [f.installs, `Has an install step${f.stack ? ` (${f.stack})` : ""}`, "No dependency manifest at the repo root"],
    [f.documented, "Readme is substantial", "Readme is thin or missing"],
    [!f.needsConfig, "No config needed to start", "Ships an example config — needs keys or settings"],
  ];

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-mono text-[13px] font-bold text-white">Can you run it?</h2>
        <SetupChip tier={tier} />
      </div>
      <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-400">{c.blurb}</p>

      <ul className="mt-3 space-y-1.5">
        {checks.map(([ok, yes, no]) => (
          <li key={yes} className="flex items-start gap-2 text-[12.5px] leading-relaxed">
            {ok ? (
              <Check size={13} className="mt-[3px] shrink-0 text-emerald-400" aria-hidden />
            ) : (
              <Minus size={13} className="mt-[3px] shrink-0 text-neutral-400" aria-hidden />
            )}
            <span className={ok ? "text-neutral-300" : "text-neutral-400"}>{ok ? yes : no}</span>
          </li>
        ))}
      </ul>

      <p className="mt-3 border-t border-neutral-800 pt-2.5 font-mono text-[11px] leading-relaxed text-neutral-400">
        Read from the repository&apos;s own files, not from anyone&apos;s opinion. It says what&apos;s there — a
        Dockerfile means someone wrote down how to build it, not that it&apos;s guaranteed to work.
      </p>
    </section>
  );
}
