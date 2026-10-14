import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Check, ShieldCheck, Eye, AlertTriangle } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { BrandMark } from "@/components/brand";

export const metadata: Metadata = {
  title: "Sign in — Project OS",
  description: "Sign in with GitHub to publish, follow projects and claim work of yours we've indexed.",
};

export const dynamic = "force-dynamic";

/** What the OAuth callback sends back when something goes wrong. Until this
 *  page existed those redirects landed on the homepage with a query string
 *  nobody read, so a failed sign-in looked like a click that did nothing. */
const ERRORS: Record<string, string> = {
  state: "That sign-in link expired or didn't match. It's a security check — start again and it'll be fine.",
  token: "GitHub didn't complete the handshake. Usually temporary; try once more.",
  user: "GitHub signed you in but wouldn't tell us who you are. Try again, or check github.com is up.",
  denied: "You cancelled at GitHub. Nothing happened, and nothing was shared.",
  rate: "That's a lot of sign-in attempts from your network in a short time. Wait a few minutes and try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const user = await getSessionUser();
  if (user) redirect("/me");

  const { error, next } = await searchParams;
  const message = error ? (ERRORS[error] ?? "That didn't work. Try again.") : null;

  // How many projects are sitting here unclaimed — the reason to sign in that
  // nobody would guess on their own.
  const { env } = getCloudflareContext();
  const shadow = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM projects WHERE status='live' AND owner_id IN (SELECT id FROM users WHERE is_shadow = 1)",
  ).first<{ n: number }>();

  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "";

  return (
    <div className="mx-auto w-full max-w-md py-6">
      <div className="flex flex-col items-center text-center">
        <BrandMark size={44} />
        <h1 className="mt-5 font-mono text-2xl font-bold tracking-tight text-white">Sign in to Project OS</h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-neutral-400">
          GitHub is the only way in. No password to make, no email to confirm.
        </p>
      </div>

      {message && (
        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-amber-400/30 bg-amber-400/[0.06] px-4 py-3">
          <AlertTriangle size={15} className="mt-[2px] shrink-0 text-amber-400" aria-hidden />
          <p className="text-[13px] leading-relaxed text-amber-100/90">{message}</p>
        </div>
      )}

      <a
        href={`/api/auth/login${target ? `?next=${encodeURIComponent(target)}` : ""}`}
        className="mt-7 flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl bg-emerald-400 px-5 font-mono text-[14px] font-bold text-black outline-none transition hover:bg-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400"
      >
        {/* Drawn rather than imported: lucide no longer ships brand glyphs. */}
        <svg width="17" height="17" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
        </svg>{" "}
        Continue with GitHub
      </a>

      <div className="mt-7 space-y-3.5">
        <Row Icon={Eye} title="We only ever read">
          The permission asked for is <code className="font-mono text-neutral-200">read:user</code> — your username,
          avatar and account age. We can&apos;t see your private repos, can&apos;t push to anything, and can&apos;t
          act as you. Account age is checked because a profile made this morning shouldn&apos;t get a vote.
        </Row>

        {!!shadow?.n && (
          <Row Icon={Check} title="Your work may already be here">
            {shadow.n.toLocaleString()}{" "}listed projects were found on public GitHub and belong to people who
            haven&apos;t signed in. If any of them are yours, they become yours the moment you do — nothing to fill
            in, nothing to prove.
          </Row>
        )}

        <Row Icon={ShieldCheck} title="Signing in isn't publishing">
          You can look around, follow things and save them without agreeing to anything. The{" "}
          <Link href="/terms" className="text-emerald-400 hover:underline">
            terms
          </Link>{" "}
          only come up when you publish a project, and you&apos;ll see them before you do. What we store about you
          is in{" "}
          <Link href="/privacy" className="text-emerald-400 hover:underline">
            privacy
          </Link>
          — it&apos;s short.
        </Row>
      </div>

      <p className="mt-7 text-center text-[12.5px] leading-relaxed text-neutral-400">
        Changed your mind?{" "}
        <Link href="/explore" className="text-neutral-300 hover:text-emerald-300 hover:underline">
          Look around without an account
        </Link>{" "}
        — almost everything here is readable signed out.
      </p>
    </div>
  );
}

function Row({
  Icon,
  title,
  children,
}: {
  Icon: typeof Eye;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-3.5">
      <Icon size={15} className="mt-[3px] shrink-0 text-emerald-400" aria-hidden />
      <div>
        <p className="font-mono text-[13.5px] font-bold text-white">{title}</p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-neutral-400">{children}</p>
      </div>
    </div>
  );
}
