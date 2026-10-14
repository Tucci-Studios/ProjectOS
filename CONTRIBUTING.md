# Contributing

This site is open source so that anyone can fix what's wrong with it. You don't need to be a developer. The two most useful contributions need no code at all.

## Fix or add a "Replace" card (no code)

Every card on the Replace page is one file in [`content/replace/`](content/replace/). Open one, and you'll see it's a short, plain JSON file: what the subscription does, whether a beginner can honestly rebuild it, which free tool, how long, what breaks later.

To change one:

1. Open the file on GitHub and click the pencil icon ("Edit this file").
2. Make your change. Be honest. A card that says "partly" or "no" is more valuable than one that oversells.
3. Click "Propose changes." GitHub will walk you through opening a pull request.

To add one, copy an existing file, rename it, and fill it in. Every claim about time or difficulty needs a source link or the words "from my own experience."

## Fix a story on "What's happening" (no code)

Same thing: one file per story in [`content/now/`](content/now/). Markdown. Link every factual claim.

## Fix a tutorial

Tutorials are written through the site itself, not the repo. Open the tutorial, and use "Something's wrong with it" to tell the author, or write a better one.

## Change the site itself (code)

```bash
git clone https://github.com/Tucci-Studios/ProjectOS
cd ProjectOS
npm install
cp .dev.vars.example .dev.vars    # fill in what you need; most pages work with nothing set
npm run dev
```

Open http://localhost:3000. The app is Next.js on Cloudflare Workers with a D1 (SQLite) database; `migrations/` has the schema.

Keep pull requests small and say what you changed and why in a sentence. If it changes what the site collects about visitors, update `src/app/(site)/privacy/page.tsx` in the same pull request.

## What we won't merge

- Anything that hosts or links to cracked software, DRM circumvention, game dumps, or ports of copyrighted games. News about them is fine. Downloads are not.
- A product's name, logo, or screenshots used as if we were that product.
- Claims about saving money that aren't sourced.

## License

By contributing you agree your work is released under the AGPL-3.0, the same license as the rest of the site. The short version: anyone can run, change, and share it, and anyone who changes it and runs it as a service has to share their changes too.
