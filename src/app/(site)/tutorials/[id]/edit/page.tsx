import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { GraduationCap } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { siteUrl } from "@/lib/site";
import { TutorialIntake } from "../../new/intake";

export const metadata: Metadata = { title: "Edit tutorial — Project Open Source" };
export const dynamic = "force-dynamic";

export default async function EditTutorialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=/tutorials/${id}/edit`);

  const { env } = getCloudflareContext();
  const post = await env.DB.prepare(
    "SELECT id, author_id, body_md FROM posts WHERE id = ?1 AND kind='tutorial' AND status='live'",
  )
    .bind(id)
    .first<{ id: string; author_id: string; body_md: string }>();
  if (!post) notFound();

  // Same rule as the API — the page just shouldn't offer what the API refuses.
  const isMod = user.role === "admin" || user.role === "mod";
  if (post.author_id !== user.id && !isMod) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        crumbs={[{ label: "Tutorials", href: "/tutorials" }, { label: "Edit" }]}
        title="Edit this tutorial"
        purpose="Change it with your AI, paste the new version, and check the preview before saving."
        Icon={GraduationCap}
      />
      <TutorialIntake specUrl={`${siteUrl()}/tutorial-template.md`} editing={{ id: post.id, current: post.body_md }} />
    </div>
  );
}
