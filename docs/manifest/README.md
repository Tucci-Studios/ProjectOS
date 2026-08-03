# The Manifest

Every project published on Project OS ships two files in its repo root:

1. **`project.json`** — machine-readable metadata, validated against
   [`project.schema.json`](./project.schema.json) at submit time.
2. **`AGENTS.md`** — AI continuation instructions, following
   [`AGENTS.template.md`](./AGENTS.template.md).

Missing or invalid manifest = can't publish. The submit flow includes a wizard
that generates both files (copy-paste or open-a-PR) so compliance takes ~2 minutes.

**Screenshots are not part of the manifest anymore.** Images are uploaded on the
publish form and stored by Project OS, so authors don't have to commit images or
keep external links alive. The `screenshots` field still validates if present and
is used as a fallback when nothing was uploaded.

## Example project.json (lineage root)

```json
{
  "name": "Subwolf",
  "category": "games",
  "description": "A neon stealth game about a wolf that hacks security systems.",
  "license": "GPL-3.0-or-later",
  "howToRun": "```\nnpm install\nnpm run dev\n```\nOpen http://localhost:3000.",
  "screenshots": ["docs/screens/main.png"],
  "tags": ["game", "stealth", "neon"]
}
```

**You don't declare lineage anymore.** When you publish, Project OS asks GitHub
what your repo is. If GitHub says it's a fork of something already published
here, you're added to that tree automatically — no `lineage` block, no parent
repo to type in, no way to get it wrong. If you copied a project instead of
forking it, GitHub has no record, so you can claim a parent on the publish form
and it shows as a *claimed fork* until that project's owner confirms.

## Example project.json (fork)

```json
{
  "name": "Subwolf",
  "variant": "Cyber",
  "category": "games",
  "description": "Subwolf with a full cyberspace layer: hack INTO the systems you sneak past.",
  "license": "GPL-3.0-or-later",
  "howToRun": "Same as parent: npm install && npm run dev.",
  "lineage": {
    "parentRepo": "jacob/subwolf",
    "changeSummary": "Added a playable cyberspace layer with 6 hackable systems."
  }
}
```

The `lineage` block above is **legacy** — it still validates, but it's ignored
in favour of GitHub's fork record. Write the one-line "what changed" summary on
the publish form instead.

Displayed as **Subwolf // Cyber** — "Cyber Subwolf by @user." The base `name`
is immutable down the lineage; only `variant` belongs to the fork author.
