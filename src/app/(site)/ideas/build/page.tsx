import Link from "next/link";
import { Code2, GitFork, Rocket, Send, ExternalLink, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ButtonLink } from "@/components/ui";
import { CopyLine } from "@/components/copy-line";
import { SOURCE_REPO, SOURCE_URL, REPO_IS_PUBLIC } from "@/lib/site";

export const dynamic = "force-dynamic";

export default function BuildAChangePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        crumbs={[{ label: "Ideas", href: "/ideas" }, { label: "Get the code" }]}
        title="Get the code"
        purpose="Project OS runs on its own rules — the whole site is open source. Take a copy, change whatever you want, and put your version up for a vote."
        Icon={Code2}
      />

      {!REPO_IS_PUBLIC && (
        <p className="mb-6 flex items-start gap-2.5 rounded-xl border border-amber-400/30 bg-amber-400/[0.06] p-4 text-sm leading-relaxed text-amber-200/90">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden />
          The public repo isn&apos;t live yet — these commands will work the moment it is. Everything below is the real
          setup the site runs on.
        </p>
      )}

      <Step n={1} Icon={GitFork} title="Take a copy">
        <p className="mb-2.5 text-sm leading-relaxed text-neutral-400">
          Fork it on GitHub so your copy is yours, then pull it down.
        </p>
        <CopyLine code={`git clone https://github.com/YOUR-USERNAME/project-os.git`} />
        <p className="mt-2 text-xs text-neutral-400">
          Or grab it read-only:{" "}
          <code className="text-neutral-400">git clone {SOURCE_URL}.git</code>
        </p>
      </Step>

      <Step n={2} Icon={Code2} title="Run it on your machine">
        <p className="mb-2.5 text-sm leading-relaxed text-neutral-400">
          Installs everything, sets up a local database, and starts the site at localhost:3000.
        </p>
        <CopyLine code="npm install && npm run db:migrate:local && npm run dev" />
        <p className="mt-2 text-xs leading-relaxed text-neutral-400">
          It runs on Next.js and Tailwind, with a local SQLite database. The AGENTS.md in the repo tells Claude Code (or
          any coding AI) how everything is laid out — point your AI at it and describe the change you want.
        </p>
      </Step>

      <Step n={3} Icon={Rocket} title="Put your version online">
        <p className="mb-2.5 text-sm leading-relaxed text-neutral-400">
          People vote on what they can actually try, so your change needs a live link. Cloudflare Pages and Vercel both
          deploy a fork for free.
        </p>
        <CopyLine code="npm run deploy" />
        <p className="mt-2 text-xs text-neutral-400">
          Any host works — all that matters is a public https link people can open.
        </p>
      </Step>

      <Step n={4} Icon={Send} title="Put it up for a vote">
        <p className="mb-3.5 text-sm leading-relaxed text-neutral-400">
          Submit your live link and your code link. Everyone tries it, votes, and the winner of the round gets shipped
          into the real site.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <ButtonLink href="/ideas/new" variant="primary">
            Submit your change
          </ButtonLink>
          <ButtonLink href={SOURCE_URL} variant="ghost" external>
            View the repo <ExternalLink size={14} aria-hidden />
          </ButtonLink>
        </div>
      </Step>

      <p className="mt-8 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 text-xs leading-relaxed text-neutral-400">
        <span className="text-neutral-300">What happens after you win:</span> your diff is public for anyone to read
        before it goes anywhere. Nothing deploys itself — a human reviews the code, then it ships and shows up in{" "}
        <Link href="/updates" className="text-emerald-400 hover:underline">
          News
        </Link>
        . Votes decide what gets built; review decides that it&apos;s safe.
      </p>
    </div>
  );
}

function Step({
  n,
  Icon,
  title,
  children,
}: {
  n: number;
  Icon: typeof Code2;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-5 rounded-xl border border-neutral-700/70 bg-neutral-900/40 p-5">
      <h2 className="mb-3 flex items-center gap-2.5 font-mono text-[15px] font-bold text-white">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
          <Icon size={14} aria-hidden />
        </span>
        <span className="text-neutral-400">{n}.</span> {title}
      </h2>
      {children}
    </section>
  );
}
