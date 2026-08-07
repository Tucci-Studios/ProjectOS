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
    "A working skill in ~/.claude/skills/ that Claude picks up automatically when it's relevant, and that you can also run by typing its name with a slash.",
  prerequisites: [
    "Claude Code installed and working — you can start it and get a prompt.",
    "A terminal, and any text editor.",
    "Something you repeat. A checklist, a review procedure, house style rules — anything you've pasted into a chat more than twice.",
  ],
  steps: [
    {
      title: "Pick the thing you keep re-explaining",
      body:
        "A skill earns its place when you're tired of typing the same instructions. Don't invent one to learn the format — reach for something real, because the format is trivial and the content is the hard part. Good first candidates: how your team writes commit messages, the steps to cut a release, the checklist you run before opening a PR.",
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
      check: "The folder exists and is empty. Nothing else has happened yet.",
    },
    {
      title: "Write SKILL.md",
      body:
        "Two parts: YAML frontmatter between --- markers, then the instructions in markdown. Every frontmatter field is optional, but write a description — it's the only thing Claude sees when deciding whether your skill is relevant, so it should say what the skill does AND when to use it. The body is only loaded once the skill is actually invoked, so it costs you nothing to be thorough there.",
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
      check: "The file is saved and the frontmatter has --- above and below it.",
    },
    {
      title: "Use it",
      body:
        "Claude Code watches the skills directories and picks up new files during the session, so you shouldn't need to restart. There are two ways in: ask for the thing in normal language and let Claude load the skill because your description matched, or invoke it directly by name.",
      code: { lang: "text", text: "/commit-style" },
      check:
        "Claude follows your instructions rather than its defaults. If you invoked it by name and nothing happened, the folder name and the command don't match.",
    },
    {
      title: "Tighten the description",
      body:
        "This is the step people skip, and it's the one that decides whether the skill ever fires on its own. Claude only sees your description when choosing — not the body. So put the trigger in it: the words someone would actually say. \"Use when the user asks for a commit message\" works; \"commit helper\" does not. There's also a when_to_use field if you want to list trigger phrases separately.",
      check:
        "Start a fresh conversation, ask for the thing in your own words without naming the skill, and see whether it loads.",
    },
    {
      title: "Grow it when it earns it",
      body:
        "Put templates, example outputs or scripts alongside SKILL.md and mention them in the body, so Claude knows what they are and when to open them. Do this when the skill needs it — one clear file beats a directory nobody reads.",
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
