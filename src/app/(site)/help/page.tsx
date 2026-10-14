import { getCloudflareContext } from "@opennextjs/cloudflare";
import { HeartHandshake } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { HelpBoard } from "./help-board";

export const dynamic = "force-dynamic";

/**
 * Help wanted.
 *
 * Public on purpose. The moderation queue is admin-only, but the call for
 * people to work on this can't be — a help-wanted page nobody but the admin can
 * read is a note to self.
 */
export default async function HelpPage() {
  const user = await getSessionUser();

  let applied: string[] = [];
  if (user) {
    const { env } = getCloudflareContext();
    const { results } = await env.DB.prepare(
      "SELECT role FROM help_applications WHERE user_id = ?1 AND status = 'open'",
    )
      .bind(user.id)
      .all<{ role: string }>();
    applied = results.map((r) => r.role);
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader
        crumbs={[{ label: "Help wanted" }]}
        title="Help wanted"
        Icon={HeartHandshake}
      />

      <p className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-4 text-[13.5px] leading-relaxed text-neutral-400">
        No pay, no interviews, no timeline. This is open source — you&apos;d be working on something anyone can
        fork, with your name on the commits. Pick whichever one you&apos;d actually enjoy.
      </p>

      <HelpBoard signedIn={!!user} applied={applied} />
    </div>
  );
}
