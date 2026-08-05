# Git handling for ProjectOS

Instructions for the AI agent working in this repo. Read this before touching git.

## Where things are

| | |
|---|---|
| **Project root** | `/Users/jacob/Documents/ProjectOS` — always work from here |
| **Branch** | `main` |
| **GitHub account** | `jacobt72401` |
| **Remote** | `origin` → `git@github.com:jacobt72401/ProjectOS.git` |

Never create a second copy of this project elsewhere. There is exactly one ProjectOS
and it lives at the path above. If a task seems to need a fresh checkout, use a git
worktree inside `/Users/jacob/Documents/` rather than cloning a duplicate.

## Auth — already set up, don't re-do it

Two working paths, both live:

- **SSH key** `~/.ssh/id_ed25519` is registered to the account. Push/pull just works.
- **`gh` CLI** is at `~/.local/bin/gh`, authenticated with `repo` + `workflow` scopes.

`gh` may not be on `PATH` in a non-interactive shell. Prefix commands when in doubt:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

Do **not** run `gh auth login`, `brew install gh`, or generate new SSH keys. There is no
Homebrew on this Mac and installing it needs an admin password you cannot enter.

## Committing automatically

Commit whenever a unit of work is finished and the app builds. Don't batch a whole
session into one commit, and don't commit broken intermediate states.

```bash
cd /Users/jacob/Documents/ProjectOS
git add -A
git commit -m "Short statement of what changed and why"
git push
```

If `git push` is rejected because the remote moved ahead:

```bash
git pull --rebase && git push
```

### Commit messages

Match the existing history — plain sentences describing the effect, not conventional-commit
prefixes. Real examples from this repo:

- `Findable pages, a homepage for strangers, and repos you own`
- `The polish button was unreachable, which is why nothing ever changed`

Say what changed and why it mattered. No `feat:` / `chore:` prefixes, no trailing metadata.

## Never commit

`.gitignore` already covers the big ones — `/.next/`, `/node_modules`, `.env*`,
`.dev.vars`, `.wrangler/`, `*.tsbuildinfo`. Leave those rules in place.

`.next` alone is **8.6 GB** and `node_modules` is **811 MB**, while the tracked repo is
only ~11 MB. If a push is suddenly huge or slow, something ignored got staged — stop and
check `git status` rather than forcing it through.

**Secrets:** `.dev.vars` holds local secrets and is ignored. Never move credentials into a
tracked file, and never commit a token, key, or `tokens.json`-style file. If one does get
committed, say so immediately — it has to be rotated, not just deleted in a later commit.

## Before you finish a session

Leave the tree clean. Either commit and push the work, or state plainly what you left
uncommitted and why. Never leave staged-but-uncommitted changes behind without saying so.

```bash
git status --short   # should be empty
git log --oneline -3 # confirm your work is in
```
