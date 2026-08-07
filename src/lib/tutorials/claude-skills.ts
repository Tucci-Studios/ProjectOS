import type { Guide } from "@/lib/tutorial-guide";

/**
 * The first tutorial, and the reference for every one after it.
 *
 * Written from the official documentation rather than memory, because the
 * frontmatter fields and paths change and a guide that's confidently wrong is
 * worse than no guide. Everything version-specific points at the docs instead
 * of being restated here, so this doesn't rot the first time a field is added.
 */
export const CLAUDE_SKILLS: Guide = {
  slug: "write-your-first-claude-skill",
  title: "Write your first Claude Code skill",
  summary: "Turn a set of instructions you keep repeating into a skill Claude loads by itself.",
  minutes: 10,
  level: "first time",
  category: "claude-skills",
  outcome:
    "A skill Claude loads on its own when it's relevant, and that you can run with a slash.",
  prerequisites: [
    "Claude Code installed.",
    "A terminal and a text editor.",
    "Something you've pasted into a chat more than twice.",
  ],
  steps: [
    {
      title: "Pick the thing you keep re-explaining",
      body:
        "Use something real — the format is trivial, the content is the hard part. Commit message style, release steps, your pre-PR checklist.",
    },
    {
      title: "Make the folder",
      body:
        "A skill is a folder with a SKILL.md inside it. The folder name becomes the command you type, so name it the way you'd ask for it.",
      code: {
        lang: "bash",
        text: "mkdir -p ~/.claude/skills/commit-style",
      },
      figure: {
        kind: "tree",
        caption: "Two places a skill can live. Pick one.",
        lines: [
          { text: "~/.claude/skills/", note: "personal — every project" },
          { text: "  commit-style/", note: "the folder name is the command" },
          { text: "    SKILL.md", note: "required" },
          { text: "" },
          { text: "your-project/.claude/skills/", note: "project — this repo only", dim: true },
          { text: "  commit-style/", dim: true },
          { text: "    SKILL.md", dim: true },
        ],
      },
      check: "The folder exists.",
    },
    {
      title: "Write SKILL.md",
      body:
        "Frontmatter between --- markers, then instructions. Every field is optional, but write a description: it's the only thing Claude sees when deciding to use the skill. The body only loads when the skill runs, so length costs nothing.",
      code: {
        lang: "markdown",
        filename: "~/.claude/skills/commit-style/SKILL.md",
        text: `---
name: commit-style
description: Writes commit messages in this project's house style. Use when the user asks for a commit message, or is about to commit.
---

Write commit messages as:

- A subject line under 60 characters, imperative mood, no trailing full stop.
- A blank line.
- A body explaining WHY the change was made, not what changed — the diff
  already says what changed.

Never mention the tools used to make the change. Never pad with filler like
"this commit". If the change is trivial, the subject line alone is enough.`,
      },
      check: "Saved, with --- above and below the frontmatter.",
    },
    {
      title: "Use it",
      body:
        "New files are picked up during the session — no restart. Either ask in plain language and let the description match, or invoke it by name.",
      code: { lang: "text", text: "/commit-style" },
      check:
        "Claude follows your instructions instead of its defaults.",
    },
    {
      title: "Tighten the description",
      body:
        "The step people skip, and the one that decides whether it ever fires on its own. Claude sees only the description, never the body — so put the trigger words in it. \"Use when the user asks for a commit message\" works; \"commit helper\" doesn't.",
      check:
        "In a new chat, ask in your own words without naming it — see if it loads.",
    },
    {
      title: "Grow it when it earns it",
      body:
        "Add templates, examples or scripts next to SKILL.md and mention them in the body. Only when the skill needs it — one clear file beats a folder nobody reads.",
      figure: {
        kind: "tree",
        caption: "Only SKILL.md is required. The rest is there when you need it.",
        lines: [
          { text: "commit-style/" },
          { text: "  SKILL.md", note: "required" },
          { text: "  template.md", note: "optional — for Claude to fill in", dim: true },
          { text: "  examples/", note: "optional — what good output looks like", dim: true },
          { text: "  check.sh", note: "optional — a script it can run", dim: true },
        ],
      },
    },
  ],
  troubleshooting: [
    {
      symptom: "Typing /my-skill does nothing, or the name isn't recognised.",
      fix: "The command comes from the directory name, not the name field in the frontmatter. Rename the folder to match what you're typing.",
    },
    {
      symptom: "The skill never loads on its own — only when invoked by name.",
      fix: "The description doesn't match how you ask. Rewrite it to include what the skill does and the situations it applies to, in the words you'd naturally use.",
    },
    {
      symptom: "Claude Code doesn't see a newly created top-level skills folder.",
      fix: "Edits to existing skill directories are picked up live, but a skills directory that didn't exist when the session started isn't being watched. Restart Claude Code once.",
    },
    {
      symptom: "The skill works locally but not in a cloud or scheduled session.",
      fix: "Those sessions don't read your machine's ~/.claude/skills/. Commit it to the repo's .claude/skills/ instead, or enable it for your account.",
    },
    {
      symptom: "Uploading or packaging the skill fails with an unexpected-key error.",
      fix: "Outside Claude Code, only the Agent Skills spec fields are allowed — name, description, license, compatibility, metadata and allowed-tools. Remove Claude Code-only fields before packaging.",
    },
  ],
  sources: [
    { label: "Claude Code — Skills documentation", url: "https://code.claude.com/docs/en/skills" },
    { label: "Agent Skills open standard", url: "https://agentskills.io" },
  ],
};
