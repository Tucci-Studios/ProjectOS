import type { Metadata } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { LabClient } from "@/components/lab/lab-client";

export const metadata: Metadata = {
  title: "Lab — Project OS",
  description: "Test area: experiments that aren't part of the site yet.",
};

export const dynamic = "force-dynamic";

export default async function LabPage() {
  const { env } = getCloudflareContext();

  // Deliberately a spread, not the top three. A proposal that only works
  // against a 90k-star project isn't a proposal, it's a screenshot.
  const { results } = await env.DB.prepare(
    `SELECT id, base_name, github_repo FROM projects WHERE status='live' AND stars > 20000
     ORDER BY stars DESC LIMIT 1`,
  ).all<{ id: string; base_name: string; github_repo: string }>();

  const { results: small } = await env.DB.prepare(
    `SELECT id, base_name, github_repo FROM projects WHERE status='live' AND stars BETWEEN 20 AND 400
     ORDER BY pushed_at DESC LIMIT 2`,
  ).all<{ id: string; base_name: string; github_repo: string }>();

  return <LabClient samples={[...results, ...small]} />;
}
