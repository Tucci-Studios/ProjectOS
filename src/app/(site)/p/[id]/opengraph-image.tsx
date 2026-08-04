import { ImageResponse } from "next/og";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const alt = "Project on Project OS";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Shared links show the project and how far its tree has grown. */
export default async function OgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { env } = getCloudflareContext();
  const p = await env.DB.prepare(
    `SELECT p.base_name, p.variant_name, p.description, u.github_login,
            p.github_forks AS forks,
            p.stars
     FROM projects p JOIN users u ON u.id = p.owner_id WHERE p.id = ?1`,
  )
    .bind(id)
    .first<{
      base_name: string;
      variant_name: string | null;
      description: string;
      github_login: string;
      forks: number;
      stars: number;
    }>();

  // Cutting at 140 landed mid-word ("...and inject"). Back up to a space.
  const clamp = (text: string | null, n: number) => {
    const t = (text ?? "").trim();
    if (t.length <= n) return t;
    const cut = t.slice(0, n);
    return `${cut.slice(0, cut.lastIndexOf(" ")) || cut}...`;
  };

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
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#a3a3a3", fontSize: 26 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              border: "2px solid #737373",
              background: "#0f1411",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
            }}
          >
            {/* The header mark, as two shapes: the prompt and the cursor. */}
            <div style={{ display: "flex", color: "#fafafa", fontSize: 20, marginTop: -2 }}>&gt;</div>
            <div style={{ display: "flex", width: 9, height: 3, background: "#4ade80" }} />
          </div>
          <div style={{ display: "flex" }}>PROJECT_OS</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, color: "#ffffff", fontWeight: 700, lineHeight: 1.05 }}>{name}</div>
          {p && (
            <div style={{ fontSize: 30, color: "#a3a3a3", marginTop: 22, maxWidth: 980, lineHeight: 1.35 }}>
              {clamp(p.description, 140)}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 44, fontSize: 28, color: "#a3a3a3" }}>
          {p && (
            <div style={{ display: "flex", color: "#34d399" }}>
              {(p.forks ?? 0).toLocaleString()} forks
            </div>
          )}
          {p && <div style={{ display: "flex" }}>{p.stars.toLocaleString()} stars</div>}
          {p && <div style={{ display: "flex" }}>@{p.github_login}</div>}
        </div>
      </div>
    ),
    size,
  );
}
