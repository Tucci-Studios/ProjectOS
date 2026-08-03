import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { checkRate } from "@/lib/rate-limit";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to upload." }, { status: 401 });

  const rate = await checkRate(user.id, "comment"); // generous shared bucket
  if (!rate.ok) return NextResponse.json({ error: rate.message }, { status: 429 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file." }, { status: 400 });

  if (!ALLOWED.has(file.type))
    return NextResponse.json({ error: "PNG, JPEG, WebP or GIF only." }, { status: 400 });
  if (file.size > MAX_BYTES)
    return NextResponse.json({ error: "Images must be under 5 MB." }, { status: 400 });

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const key = `u/${user.id}/${crypto.randomUUID()}.${ext}`;

  const { env } = getCloudflareContext();
  if (!env.SHOTS)
    return NextResponse.json({ error: "Image storage isn't set up yet." }, { status: 503 });
  await env.SHOTS.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" },
  });

  return NextResponse.json({ url: `/api/images/${key}` });
}
