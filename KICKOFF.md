# KICKOFF — Project OS Build Ladder

Shapes-first, one rung at a time. A rung is DONE when its gate passes on the
running app; only then does the next rung start. No styling before L7.

## L0 — Skeleton runs ✅ (scaffolded 2026-08-02)
Next.js + Tailwind + OpenNext/wrangler config + D1 schema committed.
**Gate:** `npm run dev` serves; `npm run build` passes.

## L1 — Database live
Create D1 database (`npx wrangler d1 create project-os`, paste id into
`wrangler.jsonc`), apply `migrations/0001_init.sql` locally, seed one fake user
+ 3 fake projects with lineage (root → fork → fork-of-fork) via a seed script.
**Gate:** a bare `/projects` page lists the 3 seeds from local D1.

## L2 — GitHub OAuth
Sign in / sign out with GitHub (read-only scopes). Store user row incl.
`github_created_at`. Session via signed httpOnly cookie.
**Gate:** full sign-in/out round-trip; user row appears in D1.

## L3 — Submit flow
Manifest wizard (generates project.json + AGENTS.md, copy-paste output),
submit form that fetches the repo, validates `project.json` against
`docs/manifest/project.schema.json`, enforces the ToS gate on first publish,
creates the project row.
**Gate:** publish a real test repo end-to-end; invalid manifest is rejected
with a readable error.

## L4 — Register-your-fork + lineage
"Fork this" page: instructions + link to GitHub's fork page, then a
"register your fork" form. Server verifies the fork relationship via GitHub
API (repo.parent), records `parent_id`/`root_id`, stores `change_summary`.
**Gate:** register a real GitHub fork of the L3 test repo; lineage row correct;
non-fork repo is rejected.

## L5 — Lineage tree UI (unstyled)
Tree component on every project page: boxes and lines, root at top, whole
lineage visible, current project highlighted. Data from one `root_id` query.
**Gate:** the 3-generation seed lineage renders correctly; clicking nodes
navigates.

## L6 — Likes + stats cache
Like button (requires GitHub account ≥ 30 days old). Cron worker refreshes
`repo_stats` from GitHub. Browse pages sort by likes.
**Gate:** like/unlike round-trip; project pages make ZERO GitHub API calls
per view (verify in network/logs).

## L7 — Cyberpunk skin
The one styling pass: near-black #0a0a0f base, one neon accent per category,
monospace metadata + clean sans body, restrained glitch/scanline touches.
Lineage tree becomes the glowing circuit-board diagram. OG image generation:
every project's link preview IS its lineage tree.
**Gate:** side-by-side screenshots of every page; OG image renders for a seed
project when link-pasted.

## L8 — Uplink core
Posts + comments (markdown + images via R2), server-side sanitization,
report button → mod queue page (admin-only).
**Gate:** adversarial post test — script tags, event handlers, data: URIs,
iframe escapes all render inert. Report → appears in queue → resolve.

## L9 — Launch hardening
Seed 15–20 real projects, Fork Wars starter project, deploy to production
domain, dry run: full publish→fork→like→post loop by 3 humans on prod.
**Gate:** dry run completes without Jacob touching a database console.

---
Post-launch ladder (separate kickoff when we get there): MCP server,
"Open in Claude Code", cross-referencing (@Project/#post), tutorial embeds,
leaderboards, trusted-reviewer tier.
