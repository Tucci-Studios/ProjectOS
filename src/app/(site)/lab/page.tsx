import type { Metadata } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { LabClient } from "@/components/lab/lab-client";
import type { MapDot } from "@/components/lab/catalogue-map";

export const metadata: Metadata = {
  title: "Lab — Project OS",
  description: "Test area: experiments that aren't part of the site yet.",
};

export const dynamic = "force-dynamic";

export default async function LabPage() {
  const { env } = getCloudflareContext();
  const { results } = await env.DB.prepare(
    `SELECT p.id, p.base_name AS name, u.github_login AS owner, p.category, p.stars,
            p.github_forks AS forks, p.pushed_at AS pushedAt
     FROM projects p JOIN users u ON u.id = p.owner_id
     WHERE p.status = 'live'`,
  ).all<MapDot>();

  return <LabClient dots={results} />;
}
