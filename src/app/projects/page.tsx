import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";

// L1: deliberately unstyled (shapes-first — see KICKOFF.md). Styling lands at L7.

export const dynamic = "force-dynamic";

type ProjectRow = {
  id: string;
  base_name: string;
  variant_name: string | null;
  category: string;
  description: string;
  github_login: string;
  like_count: number;
  parent_id: string | null;
};

export default async function ProjectsPage() {
  const { env } = getCloudflareContext();
  const { results } = await env.DB.prepare(
    `SELECT p.id, p.base_name, p.variant_name, p.category, p.description, p.parent_id,
            u.github_login,
            (SELECT COUNT(*) FROM likes l WHERE l.project_id = p.id) AS like_count
     FROM projects p JOIN users u ON u.id = p.owner_id
     WHERE p.status = 'live'
     ORDER BY p.created_at DESC`,
  ).all<ProjectRow>();

  return (
    <main style={{ padding: 24, fontFamily: "monospace" }}>
      <h1>Projects ({results.length})</h1>
      <ul>
        {results.map((p) => (
          <li key={p.id} style={{ margin: "16px 0" }}>
            <Link href={`/p/${p.id}`}>
              <strong>
                {p.base_name}
                {p.variant_name ? ` // ${p.variant_name}` : ""}
              </strong>
            </Link>{" "}
            by @{p.github_login} — [{p.category}] — ♥ {p.like_count}
            {p.parent_id ? " — (fork)" : " — (root)"}
            <br />
            {p.description}
          </li>
        ))}
      </ul>
    </main>
  );
}
