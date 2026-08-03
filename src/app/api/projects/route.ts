import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { checkRate } from "@/lib/rate-limit";
import { validateManifest, type Manifest } from "@/lib/manifest";
import { CATEGORY_SLUGS } from "@/lib/categories";
import { getRepo, getFileText } from "@/lib/github";

const REPO_RE = /^[\w.-]+\/[\w.-]+$/;

function bad(errors: string[], status = 400) {
  return NextResponse.json({ errors }, { status });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return bad(["You must be signed in to publish."], 401);

  const rate = await checkRate(user.id, "publish");
  if (!rate.ok) return bad([rate.message], 429);


  let body: {
    repo?: unknown;
    acceptTos?: unknown;
    description?: unknown;
    images?: unknown;
    changeSummary?: unknown;
    category?: unknown;
    claimedParentId?: unknown;
  };
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
  // Anything typed in the form wins over the manifest — the form is the human's
  // last word, and most people fill it in there rather than editing JSON.
  const typedDescription = typeof body.description === "string" ? body.description.trim() : "";
  if (typedDescription.length >= 20) manifest.description = typedDescription.slice(0, 500);

  const typedSummary = typeof body.changeSummary === "string" ? body.changeSummary.trim().slice(0, 280) : "";

  const typedImages = Array.isArray(body.images)
    ? body.images
        .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
        .map((u) => u.trim())
        .filter((u) => {
          try {
            return new URL(u).protocol === "https:";
          } catch {
            return false;
          }
        })
        .slice(0, 6)
    : [];

  // The section picked in the form wins — people choose it there, not in JSON.
  const typedCategory = typeof body.category === "string" ? body.category : "";
  if (typedCategory && CATEGORY_SLUGS.includes(typedCategory)) manifest.category = typedCategory;

  const errors = validateManifest(manifest);
  if (errors.length) return bad(errors);

  // Lineage is DETECTED, never declared. GitHub wrote down the parent the
  // moment someone clicked Fork, so we read that note rather than asking the
  // publisher to retype a fact we can already look up.
  let parentId: string | null = null;
  let rootId: string | null = null;
  let lineageSource: "verified" | "declared" | null = null;

  const forkParent = info.fork ? info.parent?.full_name : undefined;
  if (forkParent) {
    const parent = await env.DB.prepare(
      "SELECT id, root_id, base_name FROM projects WHERE github_repo = ?1 AND status = 'live'",
    )
      .bind(forkParent)
      .first<{ id: string; root_id: string; base_name: string }>();

    // A fork of something that isn't published here is simply an original here.
    if (parent) {
      parentId = parent.id;
      rootId = parent.root_id;
      lineageSource = "verified";
      // The base name is immutable down a lineage, so we set it rather than
      // making the publisher match it by hand. Whatever they called their
      // project becomes the variant.
      const theirName = manifest.variant ?? manifest.name;
      manifest.variant = theirName === parent.base_name ? repo.split("/")[1] : theirName;
      manifest.name = parent.base_name;
    }
  }

  // No fork edge on GitHub — they downloaded a zip instead of forking. They can
  // claim a parent, but it stays unverified until that parent's owner confirms.
  if (!parentId) {
    const claimed = typeof body.claimedParentId === "string" ? body.claimedParentId.trim() : "";
    if (claimed) {
      const parent = await env.DB.prepare(
        "SELECT id, root_id, base_name, owner_id FROM projects WHERE id = ?1 AND status = 'live'",
      )
        .bind(claimed)
        .first<{ id: string; root_id: string; base_name: string; owner_id: string }>();
      if (!parent) return bad(["That project isn't on Project OS."]);
      parentId = parent.id;
      rootId = parent.root_id;
      lineageSource = "declared";
      const theirName = manifest.variant ?? manifest.name;
      manifest.variant = theirName === parent.base_name ? repo.split("/")[1] : theirName;
      manifest.name = parent.base_name;
    }
  }

  const id = `p_${crypto.randomUUID().slice(0, 8)}`;
  await env.DB.prepare(
    `INSERT INTO projects (id, owner_id, base_name, variant_name, category, description, license, github_repo,
       manifest_json, parent_id, root_id, change_summary, fork_verified_at, status, created_at, updated_at
     , image_url, lineage_source, parent_confirmed_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, 'live', ?14, ?14, ?15, ?16, ?17)`,
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
      typedSummary || manifest.lineage?.changeSummary || null,
      lineageSource === "verified" ? now : null,
      now,
      // First screenshot doubles as the card image; repo-relative paths resolve on GitHub.
      (() => {
        if (typedImages[0]) return typedImages[0];
        const shot = manifest.screenshots?.[0];
        if (!shot) return null;
        return /^https?:\/\//.test(shot)
          ? shot
          : `https://raw.githubusercontent.com/${repo}/HEAD/${shot.replace(/^\.?\//, "")}`;
      })(),
      lineageSource,
      lineageSource === "verified" ? now : null,
    )
    .run();

  const gallery = typedImages.length > 0
    ? typedImages
    : (manifest.screenshots ?? []).map((shot) =>
        /^https?:\/\//.test(shot) ? shot : `https://raw.githubusercontent.com/${repo}/HEAD/${shot.replace(/^\.?\//, "")}`,
      );
  for (const [i, url] of gallery.entries()) {
    await env.DB.prepare("INSERT OR REPLACE INTO project_images (project_id, url, position) VALUES (?1, ?2, ?3)")
      .bind(id, url, i)
      .run();
  }

  // Tell the people who asked to hear about this lineage.
  if (parentId) {
    const forkName = manifest.variant ? `${manifest.name} // ${manifest.variant}` : manifest.name;
    const { results: watchers } = await env.DB.prepare(
      `SELECT DISTINCT f.user_id FROM follows f
       WHERE f.project_id IN (?1, COALESCE(?2, ?1))
       UNION
       SELECT owner_id AS user_id FROM projects WHERE id = ?1`,
    )
      .bind(parentId, rootId)
      .all<{ user_id: string }>();

    for (const w of watchers) {
      if (w.user_id === user.id) continue;
      await env.DB.prepare(
        "INSERT INTO notifications (id, user_id, kind, body, href, created_at) VALUES (?1, ?2, 'fork', ?3, ?4, ?5)",
      )
        .bind(
          `n_${crypto.randomUUID().slice(0, 8)}`,
          w.user_id,
          lineageSource === "declared"
            ? `@${user.github_login} says ${forkName} came from something you follow — confirm it?`
            : `@${user.github_login} forked something you follow — ${forkName}`,
          `/p/${id}`,
          now,
        )
        .run();
    }
  }

  return NextResponse.json({ ok: true, id });
}
