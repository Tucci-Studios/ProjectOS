# Runbook

What to do when something is wrong in production. Written before it was needed,
which is the only time this is worth writing.

Site: https://project-open-source.com · Worker: `project-os` · DB: `project-os` (D1)

---

## Something looks broken — where do I look first?

Logs are on (`observability.enabled` in `wrangler.jsonc`). Live tail:

```bash
npx wrangler tail
```

Recent errors only:

```bash
npx wrangler tail --status error
```

If `wrangler tail` shows nothing at all, the Worker isn't receiving traffic —
that's DNS or the custom domain, not the app.

---

## The last deploy broke the site

Roll back to the previous version. This does **not** touch the database.

```bash
npx wrangler deployments list
```

Take the version id of the last known-good deployment, then:

```bash
npx wrangler rollback <version-id>
```

Rolling back does not undo a database migration. If the bad deploy also
migrated, roll back the code first (fast, stops the bleeding), then decide about
the data separately.

---

## I need the database back

Two independent paths. Prefer time travel — it's exact.

### 1. Cloudflare time travel (last 30 days)

Find the current bookmark:

```bash
npx wrangler d1 time-travel info project-os
```

Restore to a moment before the damage:

```bash
npx wrangler d1 time-travel restore project-os --timestamp=2026-08-08T04:00:00Z
```

This overwrites the live database. Take a backup first (below) so you can get
back to *now* if the restore turns out to be the wrong call.

### 2. Our own JSON backup (no time limit)

`wrangler d1 export` **does not work on this database** — it refuses on the FTS5
virtual tables. So backups go through our own script:

```bash
node scripts/backup.mjs           # production
node scripts/backup.mjs --local
```

Writes `backups/<date>/<table>.json` plus a `manifest.json` with row counts.
`backups/` is gitignored — it contains the users table and must never be
committed.

The FTS search tables are deliberately not backed up: they're rebuilt from the
content tables by triggers, so they restore themselves.

**Run this before any migration that drops or rewrites a column.**

---

## A migration went wrong

Migrations are applied by hand, local first:

```bash
npx wrangler d1 execute project-os --local  --file=migrations/00NN_name.sql
npx wrangler d1 execute project-os --remote --file=migrations/00NN_name.sql
```

If the remote one half-applied: restore via time travel to just before it, fix
the SQL, run it again. Do not write a "fix-up" migration against a database in
an unknown state.

---

## The cron isn't running

Three scheduled jobs (`wrangler.jsonc` → `triggers.crons`), all UTC:

| When | Job |
|---|---|
| `17 3 * * *` | discover — find new projects on GitHub |
| `37 4 * * *` | refresh — stars, forks, descriptions, **daily star snapshot** |
| `*/20 * * * *` | forks — rolling fork lists, oldest first |

Check the snapshot actually ran today:

```bash
npx wrangler d1 execute project-os --remote \
  --command="SELECT MAX(day) AS last, CAST(strftime('%s','now')/86400 AS INT) AS today FROM star_history"
```

If `last` is behind `today`, the refresh job didn't run or failed. Look at
`wrangler tail` around 04:37 UTC. Crons are registered by `npm run deploy`; a
deploy that fails partway can leave them unregistered.

Note: "Gaining fastest" on Explore stays hidden until `star_history` holds two
distinct days. That's intentional — one snapshot can't show a change.

---

## Someone needs their data deleted

Users can do it themselves at `/settings` → Delete account. It erases identity
and private signals, and keeps public contributions under a tombstone. The
reasoning is on `/privacy` §7.

For a request that goes further than the button (a specific published project),
that's the takedown path in the terms, done by hand.

---

## Before every deploy

```bash
npm run build          # must pass with no type errors
node scripts/backup.mjs    # if the deploy includes a migration
npm run deploy
```

Then confirm the site actually came back:

```bash
curl -sI https://project-open-source.com/explore | head -1
```
