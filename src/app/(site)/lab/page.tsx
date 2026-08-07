import type { Metadata } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { LabClient } from "@/components/lab/lab-client";
import { parseGuide } from "@/lib/tutorial-guide";
import { CLAUDE_SKILLS } from "@/lib/tutorials/claude-skills";

export const metadata: Metadata = { title: "Lab — Project Open Source" };
export const dynamic = "force-dynamic";

export default async function LabPage() {
  // A real published guide, so the states are shown against real content.
  const { env } = getCloudflareContext();
  const row = await env.DB.prepare(
    "SELECT body_md FROM posts WHERE kind='tutorial' AND status='live' ORDER BY created_at DESC LIMIT 1",
  ).first<{ body_md: string }>();

  return <LabClient guide={(row && parseGuide(row.body_md)) || CLAUDE_SKILLS} />;
}
