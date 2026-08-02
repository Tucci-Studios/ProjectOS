<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project OS

The operating system for open source: publish projects, fork each other's work,
watch every lineage grow as a public family tree. See `KICKOFF.md` for the build
ladder and `docs/manifest/` for the manifest spec.

## Ground rules (the NeonHunter lesson)

**Shapes first.** Every rung of the ladder ships with ugly, unstyled UI —
gray boxes, default fonts, zero neon. The cyberpunk theme is its own rung (L7)
and is applied ONCE, at the end, to working systems. Never polish a rung that
hasn't passed its verification gate. Never start rung N+1 while rung N is red.

**Verify against the real thing.** "It compiles" is not a gate. Each rung's gate
is an end-to-end action on the running app (and, once deployed, on the preview
URL — not localhost).

## Stack facts

- Next.js App Router + TypeScript + Tailwind v4, deployed to Cloudflare Workers
  via OpenNext (`npm run preview` / `npm run deploy`).
- DB: Cloudflare D1, binding `DB`. Migrations in `migrations/`,
  applied with `npm run db:migrate:local` / `db:migrate:remote`.
- Images: R2 (NOT Cloudflare Images — that's a paid product).
- GitHub API: only ever from the stats-cache cron or auth flows. Project pages
  read from D1 (`repo_stats`), never from GitHub per-pageview.
- Auth: GitHub OAuth, read-only scopes. No write scopes until the MCP phase.

## Conventions

- Timestamps: unix epoch seconds, INTEGER columns.
- IDs: GitHub ids for users; nanoid for everything else.
- All user markdown/HTML is sanitized server-side before render; embeds are
  sandboxed iframes with no parent access. No exceptions, including admin posts.
- Category slugs are the enum in `docs/manifest/project.schema.json` — single
  source of truth; don't invent parallel lists.
- Fork naming: `BaseName // VariantName`. `base_name` is immutable down a lineage.
