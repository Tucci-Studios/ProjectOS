import Link from "next/link";
import { Lock } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Privacy — Project OS" };

/**
 * What we collect, which is deliberately close to nothing.
 *
 * Written against what the code actually does rather than against a template,
 * so every claim here is checkable in the repo. If a future change starts
 * collecting something this page doesn't mention, this page is wrong and has to
 * change in the same commit.
 */

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-neutral-800 py-6 first:border-t-0 first:pt-0">
      <h2 className="mb-3 flex items-baseline gap-3 font-mono text-[15px] font-bold text-white">
        <span className="text-neutral-400">{n}</span> {title}
      </h2>
      <div className="space-y-3 text-[14px] leading-relaxed text-neutral-300">{children}</div>
    </section>
  );
}

const B = ({ children }: { children: React.ReactNode }) => (
  <strong className="font-bold text-white">{children}</strong>
);

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        crumbs={[{ label: "Privacy" }]}
        title="Privacy"
        purpose="Everything we store about you, why, and how to make it stop."
        Icon={Lock}
      />

      <p className="mb-6 rounded-xl border border-amber-400/25 bg-amber-400/[0.04] px-4 py-3 font-mono text-[12.5px] leading-relaxed text-amber-100/80">
        Draft. Written by the people who built Project OS, not by lawyers. It describes what the code actually
        does today — but it hasn&apos;t been through legal review.
      </p>

      <Section n="1" title="The short version">
        <p>
          We don&apos;t run ads, we don&apos;t sell anything, and there is no advertising or analytics company
          receiving your data. There are <B>no tracking cookies</B> — the only cookie we set is the one that keeps
          you signed in. We don&apos;t build a profile of you, and we can&apos;t tell you apart from anyone else in
          our usage numbers, because those numbers are counts with nothing attached to them.
        </p>
      </Section>

      <Section n="2" title="What we store when you sign in">
        <p>
          Signing in goes through GitHub. We ask GitHub for the <B>read:user</B> scope, which is read-only and
          gives us no ability to touch your repositories. We never see your GitHub password. From your GitHub
          profile we keep:
        </p>
        <ul className="space-y-2 pl-1">
          {[
            ["Your GitHub username", "It's how you're credited on anything you publish here."],
            ["Your display name and avatar", "So your posts look like you."],
            ["Your GitHub numeric id", "The stable key we file everything under, since usernames can change."],
            ["When your GitHub account was created", "Used to spot accounts made minutes ago to spam or impersonate."],
          ].map(([t, d]) => (
            <li key={t} className="flex gap-2.5">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-neutral-600" />
              <span>
                <B>{t}</B> {d}
              </span>
            </li>
          ))}
        </ul>
        <p>
          We do not ask for or receive your email address from GitHub. If you joined the waitlist before signing
          up, we have whatever email you typed into that box, and nothing else.
        </p>
      </Section>

      <Section n="3" title="The sign-in cookie">
        <p>
          One cookie, named <code className="rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-[13px]">pos_session</code>.
          It holds your user id, an expiry, and a signature proving we issued it — no personal information. It is{" "}
          <B>httpOnly</B>, so no JavaScript on the page can read it, and it expires after 30 days. It exists purely
          to keep you signed in; it does not follow you anywhere and there is nothing to consent to.
        </p>
        <p>
          Signing out invalidates the cookie <B>on our side</B> too, not just in your browser — so a copy of it
          taken beforehand stops working immediately.
        </p>
      </Section>

      <Section n="4" title="IP addresses">
        <p>
          When you do something that costs us — signing in, joining the waitlist, refreshing a project — we count
          the request against your IP address so that one person can&apos;t flood it. What&apos;s stored is the
          address, which action it was, and when.
        </p>
        <p>
          These rows are <B>deleted automatically</B> once they age out of the limit window, which is at most one
          hour. We never link them to your account, and we don&apos;t use them for anything but rate limiting.
        </p>
      </Section>

      <Section n="5" title="Usage counts">
        <p>
          We count how many times each page was opened, per day. That&apos;s the whole record: <B>a path, a date,
          and a number.</B> No id, no IP, no session, no device or browser details, nothing joining one view to the
          next.
        </p>
        <p>
          It can tell us that a tutorial was opened forty times on a Tuesday. It can never tell us, or anyone else,
          that it was you — the information required to work that out is not collected in the first place. This
          runs on our own servers. No third-party analytics product is involved.
        </p>
      </Section>

      <Section n="6" title="Projects we indexed from GitHub">
        <p>
          Most of what&apos;s listed here was indexed from public GitHub repositories, and their authors have never
          heard of this site. That data — repository name, description, stars, forks, licence, README — is public
          information republished from GitHub.
        </p>
        <p>
          If one of them is yours and you want it gone, that&apos;s a real path with a real answer, and it&apos;s
          set out in <Link href="/terms" className="text-emerald-400 underline-offset-4 hover:underline">the terms</Link>.
        </p>
      </Section>

      <Section n="7" title="Deleting your account">
        <p>
          You can delete your account yourself from{" "}
          <Link href="/settings" className="text-emerald-400 underline-offset-4 hover:underline">settings</Link>. When
          you do, we <B>permanently erase</B> your username, display name, avatar, and every private signal attached
          to you — your saves, follows, blocks, notifications, votes, and any reports you filed. This cannot be
          undone.
        </p>
        <p>
          What we <B>keep</B>, and you should understand this before you click it: anything you published publicly —
          projects, tutorials, comments — stays up, reattributed to a deleted account with your name stripped off it.
        </p>
        <p>
          That&apos;s a deliberate choice, not a loophole. This site&apos;s whole purpose is lineage: other people
          fork what&apos;s published here, and their work hangs off yours. Erasing a project would silently break
          the history of every fork descended from it, including work by people who have nothing to do with your
          decision. If you want a specific thing you posted taken down as well, delete it before deleting your
          account, or email us and we&apos;ll do it.
        </p>
      </Section>

      <Section n="8" title="Who else gets your data">
        <p>Nobody. There is no analytics vendor, no ad network, no data broker, and nothing is sold. The only companies involved at all are:</p>
        <ul className="space-y-2 pl-1">
          {[
            ["GitHub", "Handles the sign-in itself and is the source of the public repository data."],
            ["Cloudflare", "Runs the servers and the database. They process traffic on our behalf."],
          ].map(([t, d]) => (
            <li key={t} className="flex gap-2.5">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-neutral-600" />
              <span>
                <B>{t}</B> — {d}
              </span>
            </li>
          ))}
        </ul>
        <p>
          We would hand something over if we were legally required to. Given what we hold, that would amount to a
          username and some public posts.
        </p>
      </Section>

      <Section n="9" title="Your rights">
        <p>
          Depending on where you live — the UK, EU, and California all cover this — you have the right to see what
          we hold about you, correct it, take it elsewhere, or have it erased. The delete button in settings does
          the erasure part immediately and without asking you to justify it.
        </p>
        <p>
          For anything else, use the{" "}
          <Link href="/contact" className="text-emerald-400 underline-offset-4 hover:underline">
            contact form
          </Link>
          . It goes straight to the person who runs the site, and we&apos;ll answer within 30 days.
        </p>
      </Section>

      <Section n="10" title="Children">
        <p>This site isn&apos;t intended for under-13s, and we don&apos;t knowingly keep data belonging to one.</p>
      </Section>

      <Section n="11" title="Changes">
        <p>
          If we start collecting something this page doesn&apos;t mention, this page changes in the same commit —
          the whole site is open source, so you can check that we did.
        </p>
      </Section>
    </div>
  );
}
