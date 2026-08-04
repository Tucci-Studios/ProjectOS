import Link from "next/link";
import { UserCheck } from "lucide-react";

/**
 * The invitation, on the page it belongs to.
 *
 * 629 authors are indexed here and none of them know it. Auto-claim already
 * works — sign in and anything of yours becomes yours — but a mechanic nobody
 * can see converts nobody. This is the only place a stranger who wrote one of
 * these projects would ever land, so it's where the invitation goes.
 */
export function ClaimBanner({ login, signedIn }: { login: string; signedIn: boolean }) {
  // Once someone has signed in, their own projects claim themselves — so this
  // only ever speaks to someone who hasn't.
  if (signedIn) return null;

  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.04] px-4 py-3">
      <UserCheck size={16} className="shrink-0 text-emerald-400" aria-hidden />
      <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-neutral-300">
        <span className="font-bold text-white">Is this yours, @{login}?</span>{" "}
        We found it on GitHub and listed it.
        Sign in and it&apos;s yours to edit — nothing to fill in.
      </p>
      <Link
        href="/api/auth/login"
        className="flex min-h-[34px] shrink-0 items-center rounded-lg bg-emerald-400 px-3.5 font-mono text-[12px] font-bold text-black transition hover:bg-emerald-300"
      >
        Claim it
      </Link>
    </div>
  );
}
