# Project Open Source

**Build your own software instead of renting it.** A site for people who've never written code: which subscriptions a beginner can honestly rebuild with free AI tools, how to start, and why it matters this month.

Live at [project-open-source.com](https://project-open-source.com).

## The three doors

- **Replace** — one card per kind of subscription, with an honest verdict (yes / partly / no), the free way to build it, and what breaks later. Each card is a file in [`content/replace/`](content/replace/).
- **Learn** — a beginner path that ends with you having made a real thing, plus guides written in a fixed format so they're all the same shape.
- **What's happening** — plain, sourced explanations of what's going on (the PS5 jailbreak, AI game mash-ups, "licensed, not sold"). Each story is a file in [`content/now/`](content/now/). We link to news and official project pages. We never host downloads.

## Fix something

You don't need to be a developer. Every card and story has a "Fix this page" link that opens GitHub's editor. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Run it locally

```bash
npm install
cp .dev.vars.example .dev.vars
npm run dev
```

Next.js on Cloudflare Workers, D1 for the database, content as files. `migrations/` has the schema.

## License

[AGPL-3.0](LICENSE). Use it, change it, run it. If you run a changed version as a service, share your changes.
