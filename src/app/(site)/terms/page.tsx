import Link from "next/link";
import { ScrollText } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { REPO_IS_PUBLIC, SOURCE_REPO, SOURCE_URL } from "@/lib/site";

export const metadata = { title: "Terms — Project OS" };

/**
 * The terms.
 *
 * Written to be read, because a rule nobody reads isn't a rule. The v0 draft
 * covered publishing and nothing else, which was fine when the only projects
 * here were ones people had chosen to submit. It isn't fine now: most of what's
 * listed was indexed from public GitHub by us, and the authors have never heard
 * of this site. Sections 2 and 3 exist because of that, and section 3 is the
 * one that matters — if someone wants their work off here, that has to be a
 * real path with a real answer, not a promise.
 *
 * Still a draft written by the person who built the site rather than a lawyer.
 * The gaps that need professional review are listed in docs/legal/REVIEW.md.
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

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        crumbs={[{ label: "Terms" }]}
        title="Terms"
        purpose="What you agree to, what we do with your work, and how to get it taken down."
        Icon={ScrollText}
      />

      <p className="mb-6 rounded-xl border border-amber-400/25 bg-amber-400/[0.04] px-4 py-3 font-mono text-[12.5px] leading-relaxed text-amber-100/80">
        Draft. Written by the people who built Project OS, not by lawyers. It says what we actually intend to
        do — but it hasn&apos;t been through legal review, so don&apos;t treat it as watertight.
      </p>

      <Section n="1" title="Publishing a project">
        <p>When you publish something here, you&apos;re telling us all of this is true:</p>
        <ul className="space-y-2.5 pl-1">
          {[
            [
              "It's open source.",
              "The repo carries a valid open-source licence, and your project.json says the same one the repo does.",
            ],
            [
              "You have the rights.",
              "You wrote it, or you're licensed to publish it. A fork respects its parent's licence.",
            ],
            [
              "It isn't malware.",
              "Nothing malicious, deceptive, or quietly hoovering up data. This one ends in a ban, not a warning.",
            ],
            [
              "It stays free.",
              "Publish here and you agree not to sell it, paywall it, or lock it behind a payment, and to ask the same of anything forked from it. Donation and sponsor links are fine; required payment isn't. This is a condition of being listed on Project OS, not a claim on your copyright — most open-source licences permit selling, and we can't and don't override yours. What we can do is delist. It's the rule the site is built on, and it's kept by the people who agree to it.",
            ],
            [
              "Lineage is public and permanent.",
              "Who forked what, and from whom, stays visible even after a project is delisted. Attribution isn't something you can take back.",
            ],
          ].map(([t, d]) => (
            <li key={t} className="flex gap-3">
              <span aria-hidden className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
              <span>
                <B>{t}</B> {d}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section n="2" title="Projects we indexed">
        <p>
          Most of what&apos;s listed on Project OS wasn&apos;t submitted by anyone. We found it on public GitHub and
          listed it, and those pages say so. If that&apos;s your project, you have <B>agreed to nothing</B> — the
          terms above bind people who publish here, and being indexed isn&apos;t publishing.
        </p>
        <p>
          What we store is the public metadata GitHub already serves to anyone: name, owner, description, licence,
          star and fork counts, language, and a cached copy of the README. <B>No code is hosted here.</B> Every
          link goes to GitHub, and delisting a project on Project OS never touches the repo.
        </p>
        <p>
          Sign in with the GitHub account that owns an indexed project and it becomes yours automatically — at
          which point section 1 applies, because you&apos;ve chosen to be here.
        </p>
      </Section>

      <Section n="3" title="Getting your project removed">
        <p>
          If your work is listed and you&apos;d rather it weren&apos;t, that&apos;s enough of a reason. You
          don&apos;t have to explain, and you don&apos;t need an account:
        </p>
        <ul className="space-y-2 pl-1">
          {REPO_IS_PUBLIC && (
            <li className="flex gap-3">
              <span aria-hidden className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
              <span>
                Open an issue on{" "}
                <a
                  href={`${SOURCE_URL}/issues`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline"
                >
                  the Project OS repo
                </a>{" "}
                with the link. It&apos;s public, so you can see it was actioned.
              </span>
            </li>
          )}
          <li className="flex gap-3">
            <span aria-hidden className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
            <span>
              Use the report button on the project page. It goes straight to the moderation queue.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
            <span>
              Or write to{" "}
              <Link href="/contact" className="text-emerald-400 hover:underline">
                the contact form
              </Link>
              . No account needed, and you don&apos;t have to explain why.
            </span>
          </li>
        </ul>
        <p>
          Removal takes the page down and stops us re-indexing the repo. What survives is the bare fact of a fork
          relationship where another listed project descends from yours, because erasing that would misattribute
          someone else&apos;s work.
        </p>
        <p>
          Valid DMCA complaints are actioned the same way. Note that a licence complaint about the code itself
          belongs with GitHub — we don&apos;t host it.
        </p>
      </Section>

      <Section n="4" title="Your account and what you post">
        <p>
          Signing in stores your GitHub id, username, avatar URL, and account age. The account age is used to
          gate voting, because an account made this morning shouldn&apos;t get a vote. We don&apos;t ask GitHub
          for write access to anything, and we can&apos;t push to your repos.
        </p>
        <p>
          Posts, comments and ideas stay yours. Putting them here grants us the right to display them on the
          site and nothing else. Don&apos;t post other people&apos;s private information, and don&apos;t use the
          site to harass anyone.
        </p>
      </Section>

      <Section n="5" title="Moderation">
        <p>
          We can delist a project or remove a post when it breaks these rules. Bans are for malware and for
          harassment. Everything else gets a removal and an explanation first.
        </p>
        <p>
          Moderators are people, and people get it wrong. If a decision looks wrong to you, say so on the repo
          and it gets looked at again.
        </p>
      </Section>

      <Section n="6" title="The same rules apply to us">
        <p>
          Everything above asks you to be open source, to keep it that way, and not to sell it. It would be a poor
          rule if the site asking didn&apos;t follow it.
        </p>
        <p>
          So: <B>Project OS will be open source under AGPL-3.0</B>, published under the same terms it asks of
          everyone here — free, forkable, and never sold. AGPL specifically, because it&apos;s the licence that
          makes the no-sell rule real rather than a house rule: anyone running a modified copy as a website has to
          publish their changes too.
        </p>
        <p>
          {REPO_IS_PUBLIC ? (
            <>
              The source is at{" "}
              <a
                href={SOURCE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline"
              >
                {SOURCE_REPO}
              </a>
              . Fork it, change it, and put your version up for a vote.
            </>
          ) : (
            <>
              It isn&apos;t published yet, because the site isn&apos;t live yet — there&apos;s no point open-sourcing
              a thing nobody can use. It goes public at launch. Until then this is a promise rather than a fact, and
              you should hold us to it.
            </>
          )}
        </p>
      </Section>

      <Section n="7" title="Read before you run">
        <p>
          Every project here is code written by a stranger, and running it is your decision. We index and link;
          we don&apos;t audit. Scan results and badges are signals, not guarantees, and their absence
          isn&apos;t evidence of anything either.
        </p>
        <p className="text-neutral-400">
          Project OS is provided as-is, with no warranty. We&apos;re not liable for what third-party code does
          to your machine. That&apos;s not us dodging — it&apos;s that we genuinely cannot vouch for 600-odd
          repositories, and pretending otherwise would be the dangerous thing to say.
        </p>
      </Section>

      <Section n="8" title="Changes">
        <p>
          These terms will change as the site does. Material changes get posted to{" "}
          <Link href="/updates" className="text-emerald-400 hover:underline">
            Updates
          </Link>{" "}
          rather than quietly swapped in, and continuing to use the site after that means you accept them.
        </p>
      </Section>
    </div>
  );
}
