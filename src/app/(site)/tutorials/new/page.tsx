import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { siteUrl } from "@/lib/site";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { TutorialIntake } from "./intake";

export const metadata: Metadata = { title: "Post a tutorial — Project Open Source" };
export const dynamic = "force-dynamic";

export default async function NewTutorialPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/tutorials/new");

  const { env } = getCloudflareContext();
  const { results: projects } = await env.DB.prepare(
    "SELECT id, base_name AS name FROM projects WHERE status='live' ORDER BY stars DESC LIMIT 500",
  ).all<{ id: string; name: string }>();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        crumbs={[{ label: "Tutorials", href: "/tutorials" }, { label: "Post one" }]}
        title="Post a tutorial"
        purpose="Your AI writes it. You check it and press the button."
        Icon={GraduationCap}
      />
      <TutorialIntake specUrl={`${siteUrl()}/tutorial-template.md`} projects={projects} />
    </div>
  );
}
