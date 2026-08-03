import { Settings, UserCircle, ShieldCheck, ExternalLink } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { ButtonLink } from "@/components/ui";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-lg">
        <PageHeader crumbs={[{ label: "Settings" }]} title="Settings" purpose="Your account and preferences." Icon={Settings} />
        <div className="rounded-xl border border-neutral-700 bg-neutral-900/50 p-8 text-center">
          <p className="text-sm text-neutral-400">Sign in to manage your account.</p>
          <div className="mt-4 flex justify-center">
            <ButtonLink href="/api/auth/login" variant="primary">
              Sign in with GitHub
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader crumbs={[{ label: "Settings" }]} title="Settings" purpose="Your account and how you use Project OS." Icon={Settings} />

      <Card title="Account" Icon={UserCircle}>
        <Row label="Signed in as" value={`@${user.github_login}`} />
        <Row label="Role" value={user.role === "admin" ? "Admin" : "Member"} />
        <Row
          label="Terms accepted"
          value={user.tos_accepted_at ? new Date(user.tos_accepted_at * 1000).toLocaleDateString() : "Not yet — you'll accept on your first publish"}
        />
        <p className="mt-3 text-xs leading-relaxed text-neutral-500">
          Your name and avatar come from GitHub. Change them there and they update here on your next sign-in.
        </p>
        <div className="mt-4">
          <ButtonLink href={`https://github.com/${user.github_login}`} variant="ghost" external className="!min-h-[38px]">
            View GitHub profile <ExternalLink size={14} aria-hidden />
          </ButtonLink>
        </div>
      </Card>

      <Card title="Publishing" Icon={ShieldCheck}>
        <p className="text-sm leading-relaxed text-neutral-400">
          Everything you publish here is open source and free — no selling, no paywalls, branches stay open. Read the
          full{" "}
          <Link href="/terms" className="text-emerald-400 transition hover:underline">
            terms
          </Link>
          .
        </p>
      </Card>

      <Card title="Sign out" Icon={Settings}>
        <p className="mb-4 text-sm text-neutral-400">Signing out ends this session on this device.</p>
        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="min-h-[42px] cursor-pointer rounded-lg border border-rose-400/40 px-4 font-mono text-sm text-rose-300 outline-none transition hover:bg-rose-500/10 focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            Sign out
          </button>
        </form>
      </Card>
    </div>
  );
}

function Card({ title, Icon, children }: { title: string; Icon: typeof Settings; children: React.ReactNode }) {
  return (
    <section className="mb-4 rounded-xl border border-neutral-700/70 bg-neutral-900/40 p-5">
      <h2 className="mb-3 flex items-center gap-2 font-mono text-sm font-bold text-neutral-200">
        <Icon size={15} className="text-neutral-500" aria-hidden />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-neutral-800 py-2 last:border-0">
      <span className="font-mono text-xs text-neutral-500">{label}</span>
      <span className="font-mono text-sm text-neutral-200">{value}</span>
    </div>
  );
}
