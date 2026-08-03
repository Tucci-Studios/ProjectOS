import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const { env } = getCloudflareContext();
  if (!env.SHOTS) return new Response("Image storage not configured", { status: 503 });
  const object = await env.SHOTS.get(key.join("/"));
  if (!object) return new Response("Not found", { status: 404 });

  return new Response(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}
