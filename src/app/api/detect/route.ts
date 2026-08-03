import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getRepo } from "@/lib/github";
import { checkRate } from "@/lib/rate-limit";

const REPO_RE = /^[\w.-]+\/[\w.-]+$/;

export type Detection =
  | { kind: "unknown"; message: string }
  | { kind: "duplicate"; message: string; projectId: string }
  | { kind: "original" }
  | { kind: "fork"; parentId: string; parentDisplay: string; parentRepo: string; baseName: string }
  | { kind: "orphan-fork"; parentRepo: string };

/**
 * What IS this repo? Asks GitHub, then answers in the site's own terms.
 *
 * The user never declares a parent — GitHub already wrote it down when they
 * clicked Fork. This endpoint just reads that note back so the publish form can
 * show them what it found before they commit.
 */
export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ kind: "unknown", message: "Sign in first." } satisfies Detection);

  const raw = new URL(request.url).searchParams.get("repo") ?? "";
  const repo = raw.trim().replace(/^https:\/\/github\.com\//, "").replace(/\/+$/, "");
  if (!REPO_RE.test(repo))
    return NextResponse.json({ kind: "unknown", message: 'Enter a repo like "owner/repo".' } satisfies Detection);

  // Every miss here costs a GitHub request from an hourly budget the whole site
  // shares, and this fires while someone types. Leash it.
  const rate = await checkRate(user.id, "detect");
  if (!rate.ok) return NextResponse.json({ kind: "unknown", message: rate.message } satisfies Detection);

  const { env } = getCloudflareContext();

  const dupe = await env.DB.prepare("SELECT id FROM projects WHERE github_repo = ?1").bind(repo).first<{ id: string }>();
  if (dupe)
    return NextResponse.json({
      kind: "duplicate",
      message: "That repo is already published here.",
      projectId: dupe.id,
    } satisfies Detection);

  const info = await getRepo(repo);
  if (!info)
    return NextResponse.json({
      kind: "unknown",
      message: `Couldn't find github.com/${repo} — is it public?`,
    } satisfies Detection);

  // Not a fork at all: it's an original.
  if (!info.fork || !info.parent?.full_name) return NextResponse.json({ kind: "original" } satisfies Detection);

  const parent = await env.DB.prepare(
    `SELECT id, base_name, variant_name FROM projects WHERE github_repo = ?1 AND status = 'live'`,
  )
    .bind(info.parent.full_name)
    .first<{ id: string; base_name: string; variant_name: string | null }>();

  // A fork of something that isn't on Project OS — so, an original here.
  if (!parent) return NextResponse.json({ kind: "orphan-fork", parentRepo: info.parent.full_name } satisfies Detection);

  return NextResponse.json({
    kind: "fork",
    parentId: parent.id,
    parentRepo: info.parent.full_name,
    parentDisplay: parent.variant_name ? `${parent.base_name} // ${parent.variant_name}` : parent.base_name,
    baseName: parent.base_name,
  } satisfies Detection);
}
