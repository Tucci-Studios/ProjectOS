import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { validateManifest, type Manifest } from "@/lib/manifest";
import { getRepo, getFileText } from "@/lib/github";

const REPO_RE = /^[\w.-]+\/[\w.-]+$/;

function bad(errors: string[], status = 400) {
  return NextResponse.json({ errors }, { status });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return bad(["You must be signed in to publish."], 401);

  let body: { repo?: unknown; acceptTos?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return bad(["Bad request body."]);
  }

  const repo = typeof body.repo === "string" ? body.repo.trim().replace(/^https:\/\/github\.com\//, "").replace(/\/+$/, "") : "";
  if (!REPO_RE.test(repo)) return bad(['Repo must look like "owner/repo" or a github.com URL.']);

  const { env } = getCloudflareContext();
  const now = Math.floor(Date.now() / 1000);

  // ToS gate: first publish requires acceptance.
  if (!user.tos_accepted_at) {
    if (body.acceptTos !== true) return bad(["TOS_REQUIRED"], 403);
    await env.DB.prepare("UPDATE users SET tos_accepted_at = ?1 WHERE id = ?2").bind(now, user.id).run();
  }

  const existing = await env.DB.prepare("SELECT id FROM projects WHERE github_repo = ?1").bind(repo).first();
  if (existing) return bad(["That repo is already published on Project OS."]);

  const info = await getRepo(repo);
  if (!info) return bad([`Couldn't find github.com/${repo} — is it public?`]);
  if (info.private) return bad(["Repo must be public."]);

  const [manifestText, agentsText] = await Promise.all([
    getFileText(repo, "project.json"),
    getFileText(repo, "AGENTS.md"),
  ]);
  if (!manifestText) return bad(["No project.json in the repo root. Use the wizard at /submit/wizard to generate one."]);
  if (!agentsText || agentsText.trim().length < 100)
    return bad(["No AGENTS.md in the repo root (or it's under 100 characters). Every project ships AI continuation instructions — the wizard generates a template."]);

  let manifest: Manifest;
  try {
    manifest = JSON.parse(manifestText) as Manifest;
  } catch {
    return bad(["project.json is not valid JSON."]);
  }
  const errors = validateManifest(manifest);
  if (errors.length) return bad(errors);

  // Lineage: forks register against a parent already on Project OS (verified via GitHub fork graph).
  let parentId: string | null = null;
  let rootId: string | null = null;
  if (manifest.lineage) {
    const parent = await env.DB.prepare(
      "SELECT id, root_id, base_name FROM projects WHERE github_repo = ?1 AND status = 'live'",
    )
      .bind(manifest.lineage.parentRepo)
      .first<{ id: string; root_id: string; base_name: string }>();
    if (!parent) return bad([`Parent ${manifest.lineage.parentRepo} isn't published on Project OS.`]);
    if (!info.fork || info.parent?.full_name !== manifest.lineage.parentRepo)
      return bad([`GitHub says ${repo} is not a fork of ${manifest.lineage.parentRepo}. Fork it on GitHub first, then register the fork.`]);
    if (manifest.name !== parent.base_name)
      return bad([`Base name must stay "${parent.base_name}" down the lineage — only "variant" is yours to name.`]);
    if (!manifest.variant) return bad(['Forks need a "variant" name (e.g. "Cyber" for Subwolf // Cyber).']);
    parentId = parent.id;
    rootId = parent.root_id;
  }

  const id = `p_${crypto.randomUUID().slice(0, 8)}`;
  await env.DB.prepare(
    `INSERT INTO projects (id, owner_id, base_name, variant_name, category, description, license, github_repo,
       manifest_json, parent_id, root_id, change_summary, fork_verified_at, status, created_at, updated_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, 'live', ?14, ?14)`,
  )
    .bind(
      id,
      user.id,
      manifest.name,
      manifest.variant ?? null,
      manifest.category,
      manifest.description,
      manifest.license,
      repo,
      manifestText,
      parentId,
      rootId ?? id,
      manifest.lineage?.changeSummary ?? null,
      parentId ? now : null,
      now,
    )
    .run();

  return NextResponse.json({ ok: true, id });
}
