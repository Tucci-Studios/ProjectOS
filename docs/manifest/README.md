# The Manifest

Every project published on Project OS ships two files in its repo root:

1. **`project.json`** — machine-readable metadata, validated against
   [`project.schema.json`](./project.schema.json) at submit time.
2. **`AGENTS.md`** — AI continuation instructions, following
   [`AGENTS.template.md`](./AGENTS.template.md).

Missing or invalid manifest = can't publish. The submit flow includes a wizard
that generates both files (copy-paste or open-a-PR) so compliance takes ~2 minutes.

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

Displayed as **Subwolf // Cyber** — "Cyber Subwolf by @user." The base `name`
is immutable down the lineage; only `variant` belongs to the fork author.
