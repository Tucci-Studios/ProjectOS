import type { Metadata } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { LabClient } from "@/components/lab/lab-client";
import type { ForkNode, TreeRoot } from "@/components/lab/fork-trees";

export const metadata: Metadata = {
  title: "Lab — Project OS",
  description: "Test area: experiments that aren't part of the site yet.",
};

export const dynamic = "force-dynamic";

/**
 * The lab runs on real rows, not fixtures.
 *
 * A layout that looks fine against three tidy strings falls apart against the
 * actual catalogue — descriptions full of pipe-lists, repo names longer than
 * the column, fork counts in the thousands. If it survives here it survives.
 */
export default async function LabPage() {
  const { env } = getCloudflareContext();

  const root = await env.DB.prepare(
    `SELECT p.id, p.base_name, p.github_repo, p.stars, p.github_forks, u.github_login
     FROM projects p JOIN users u ON u.id = p.owner_id
     WHERE p.status = 'live' AND p.github_forks > 50
     ORDER BY (SELECT COUNT(*) FROM github_forks gf WHERE gf.project_id = p.id) DESC
     LIMIT 1`,
  ).first<{
    id: string;
    base_name: string;
    github_repo: string;
    stars: number;
    github_forks: number;
    github_login: string;
  }>();

  const [forkRows, messy, sample] = await Promise.all([
    root
      ? env.DB.prepare(
          `SELECT gf.full_name, gf.owner_login, gf.stars,
                  EXISTS(SELECT 1 FROM projects x WHERE lower(x.github_repo) = lower(gf.full_name)
                         AND x.status='live') AS published
           FROM github_forks gf WHERE gf.project_id = ?1
           ORDER BY gf.stars DESC LIMIT 14`,
        )
          .bind(root.id)
          .all<{ full_name: string; owner_login: string; stars: number; published: number }>()
      : Promise.resolve({ results: [] }),
    // The ones the cleaner has to earn its keep on.
    env.DB.prepare(
      `SELECT base_name AS name, description FROM projects
       WHERE status='live' AND description IS NOT NULL
         AND (description LIKE '%|%' OR length(description) > 150
              OR description LIKE '%http%' OR description LIKE '%[!%')
       ORDER BY length(description) DESC LIMIT 10`,
    ).all<{ name: string; description: string }>(),
    env.DB.prepare(
      `SELECT id, base_name, description, category, stars, github_forks, language
       FROM projects WHERE status='live' ORDER BY stars DESC LIMIT 6`,
    ).all<{
      id: string;
      base_name: string;
      description: string;
      category: string;
      stars: number;
      github_forks: number;
      language: string | null;
    }>(),
  ]);

  const treeRoot: TreeRoot | null = root
    ? { name: root.base_name, owner: root.github_login, stars: root.stars, totalForks: root.github_forks }
    : null;

  const forks: ForkNode[] = (forkRows.results ?? []).map((f) => ({
    full_name: f.full_name,
    owner_login: f.owner_login,
    stars: f.stars,
    published: !!f.published,
  }));

  return <LabClient treeRoot={treeRoot} forks={forks} messy={messy.results} sample={sample.results} />;
}
