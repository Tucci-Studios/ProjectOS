import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { notFound } from "next/navigation";

// L3: bare project page. Lineage tree lands at L5, styling at L7.

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  base_name: string;
  variant_name: string | null;
  category: string;
  description: string;
  license: string;
  github_repo: string;
  change_summary: string | null;
  parent_id: string | null;
  github_login: string;
  like_count: number;
};

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { env } = getCloudflareContext();
  const p = await env.DB.prepare(
    `SELECT p.id, p.base_name, p.variant_name, p.category, p.description, p.license,
            p.github_repo, p.change_summary, p.parent_id, u.github_login,
            (SELECT COUNT(*) FROM likes l WHERE l.project_id = p.id) AS like_count
     FROM projects p JOIN users u ON u.id = p.owner_id
     WHERE p.id = ?1 AND p.status = 'live'`,
  )
    .bind(id)
    .first<Row>();
  if (!p) notFound();

  const display = p.variant_name ? `${p.base_name} // ${p.variant_name}` : p.base_name;

  return (
    <main style={{ padding: 24, fontFamily: "monospace", maxWidth: 720 }}>
      <p><Link href="/projects">&larr; all projects</Link></p>
      <h1>{display}</h1>
      <p>
        by @{p.github_login} — [{p.category}] — {p.license} — ♥ {p.like_count}
      </p>
      <p>{p.description}</p>
      {p.change_summary && (
        <p>
          <strong>vs. parent:</strong> {p.change_summary}
        </p>
      )}
      <p>
        <a href={`https://github.com/${p.github_repo}`} target="_blank" rel="noopener noreferrer">
          github.com/{p.github_repo}
        </a>
      </p>
      <p>(lineage tree lands at L5)</p>
    </main>
  );
}
