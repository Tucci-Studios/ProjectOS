import type { MetadataRoute } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { CATEGORY_META, GROUP_ORDER } from "@/lib/categories";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * Every project, every section, every person.
 *
 * This is the whole reason the claim banner can ever work. 655 projects belong
 * to authors who have never heard of Project OS, and the only realistic way one
 * of them finds out is searching for their own repo and landing on our page for
 * it. Without a sitemap and per-page titles, none of those pages are findable
 * and the invitation sits there unread forever.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  const fixed: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily" as const, priority: 1 },
    { url: `${base}/explore`, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${base}/wire`, changeFrequency: "daily" as const, priority: 0.6 },
    { url: `${base}/tutorials`, changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${base}/updates`, changeFrequency: "weekly" as const, priority: 0.5 },
    { url: `${base}/terms`, changeFrequency: "yearly" as const, priority: 0.3 },
    ...GROUP_ORDER.map((g) => ({ url: `${base}/g/${g}`, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...CATEGORY_META.map((c) => ({ url: `${base}/s/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
  ].map((e) => ({ ...e, lastModified: now }));

  try {
    const { env } = getCloudflareContext();
    const [{ results: projects }, { results: people }] = await Promise.all([
      env.DB.prepare(
        "SELECT id, updated_at FROM projects WHERE status='live' ORDER BY stars DESC LIMIT 5000",
      ).all<{ id: string; updated_at: number }>(),
      env.DB.prepare(
        `SELECT DISTINCT u.github_login FROM users u JOIN projects p ON p.owner_id = u.id
         WHERE p.status='live' AND u.banned_at IS NULL LIMIT 2000`,
      ).all<{ github_login: string }>(),
    ]);

    return [
      ...fixed,
      ...projects.map((p) => ({
        url: `${base}/p/${p.id}`,
        lastModified: new Date((p.updated_at || Math.floor(Date.now() / 1000)) * 1000),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...people.map((u) => ({
        url: `${base}/u/${u.github_login}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
    ];
  } catch {
    // No database at build time — the fixed pages still get listed.
    return fixed;
  }
}
