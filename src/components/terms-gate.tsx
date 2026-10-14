import Link from "next/link";
import { ShieldCheck, Check } from "lucide-react";
import { BrandMark } from "./brand";

// Shown once, right after a new account's first sign-in. Nothing else on the
// site is reachable until it's accepted — one screen, plain words, no scroll trap.
export function TermsGate({ login }: { login: string }) {
  const RULES = [
    { t: "Everything here is open source", d: "Anything you publish carries an open-source license and stays readable by anyone." },
    { t: "Nothing gets sold here", d: "You agree not to sell or paywall what you publish here, and to ask the same of anyone who forks it. Donations and sponsor links are fine. It\u2019s a condition of being listed, not a claim on your licence." },
    { t: "Forks stay open", d: "When someone forks your work — or you fork theirs — that fork stays open too. That's the whole point." },
    { t: "No malware, ever", d: "Malicious or deceptive code means instant removal and a ban. This one has no second chance." },
    { t: "Credit is permanent", d: "Fork lineage and attribution are public and stay visible, even if a project is later delisted." },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#141a16]">
      <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-center px-5 py-12">
        <div className="mb-7 flex items-center gap-3">
          <BrandMark size={40} />
          <div>
            <p className="font-mono text-[17px] font-bold tracking-[0.16em] text-white">
              PROJECT<span className="text-emerald-400">_</span>OS
            </p>
            <p className="font-mono text-[8.5px] uppercase tracking-[0.42em] text-neutral-400">open source</p>
          </div>
        </div>

        <h1 className="font-mono text-2xl font-bold tracking-tight text-white">
          Welcome, @{login}. Five rules.
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-neutral-400">
          You only see this once. Read it — it&apos;s short, and it&apos;s the whole deal.
        </p>

        <ul className="mt-7 space-y-3">
          {RULES.map((r) => (
            <li key={r.t} className="flex items-start gap-3 rounded-xl border border-neutral-700/70 bg-neutral-900/50 p-4">
              <Check size={16} className="mt-0.5 shrink-0 text-emerald-400" aria-hidden />
              <div>
                <p className="font-mono text-sm font-bold text-white">{r.t}</p>
                <p className="mt-1 text-sm leading-relaxed text-neutral-400">{r.d}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-neutral-400">
          <ShieldCheck size={14} className="mt-0.5 shrink-0" aria-hidden />
          Your code lives on GitHub under GitHub&apos;s terms — we only list it here. Projects are community-submitted:
          read before you run anything. Full text in the{" "}
          <Link href="/terms" target="_blank" className="text-emerald-400 hover:underline">
            terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" target="_blank" className="text-emerald-400 hover:underline">
            privacy
          </Link>
          .
        </p>

        <form action="/api/auth/accept-terms" method="post" className="mt-7 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="min-h-[46px] cursor-pointer rounded-lg bg-emerald-400 px-6 font-mono text-sm font-bold text-black transition hover:bg-emerald-300"
          >
            I agree — let me in
          </button>
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="min-h-[46px] cursor-pointer rounded-lg px-4 font-mono text-sm text-neutral-400 transition hover:text-neutral-300"
            >
              No thanks, sign me out
            </button>
          </form>
        </form>
      </div>
    </div>
  );
}
