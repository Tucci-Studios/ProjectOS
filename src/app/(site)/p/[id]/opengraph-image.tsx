import { ImageResponse } from "next/og";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const alt = "Project on Project OS";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Shared links show the project and how far its tree has grown. */
export default async function OgImage({ params }: { params: { id: string } }) {
  const { env } = getCloudflareContext();
  const p = await env.DB.prepare(
    `SELECT p.base_name, p.variant_name, p.description, u.github_login,
            (SELECT COUNT(*) FROM projects f WHERE f.root_id = p.root_id AND f.status='live') - 1 AS forks,
            (SELECT COALESCE(SUM(l.value),0) FROM likes l WHERE l.project_id = p.id) AS votes
     FROM projects p JOIN users u ON u.id = p.owner_id WHERE p.id = ?1`,
  )
    .bind(params.id)
    .first<{
      base_name: string;
      variant_name: string | null;
      description: string;
      github_login: string;
      forks: number;
      votes: number;
    }>();

  const name = p ? (p.variant_name ? `${p.base_name} // ${p.variant_name}` : p.base_name) : "Project OS";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#141a16",
          padding: 72,
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, color: "#a3a3a3", fontSize: 26 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              border: "2px solid #34d399",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#34d399",
            }}
          >
            ⑂
          </div>
          PROJECT_OS
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, color: "#ffffff", fontWeight: 700, lineHeight: 1.05 }}>{name}</div>
          {p && (
            <div style={{ fontSize: 30, color: "#a3a3a3", marginTop: 22, maxWidth: 980, lineHeight: 1.35 }}>
              {p.description.slice(0, 140)}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 44, fontSize: 28, color: "#a3a3a3" }}>
          {p && <div style={{ color: "#34d399" }}>⑂ {Math.max(0, p.forks)} forks</div>}
          {p && <div>▲ {p.votes} votes</div>}
          {p && <div>@{p.github_login}</div>}
        </div>
      </div>
    ),
    size,
  );
}
