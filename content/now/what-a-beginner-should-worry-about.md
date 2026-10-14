---
title: Before you build anything, two rules
date: 2026-10-13
summary: Scans of AI-built apps found thousands of serious security holes. Both rules take a minute. Skip them and you can lose everything.
sources:
  - label: Escape, how we discovered vulnerabilities in vibe-coded apps
    url: https://escape.tech/blog/methodology-how-we-discovered-vulnerabilities-apps-built-with-vibe-coding/
  - label: Security Boulevard on RedAccess's findings
    url: https://securityboulevard.com/2026/05/thousands-of-vibe-coded-apps-exposing-corporate-personal-data-redaccess/
  - label: 20i survey of 600 non-developers
    url: https://www.20i.com/blog/?p=20260
---
A security firm scanned apps that people had publicly launched from AI building tools. It found more than 2,000 high-impact vulnerabilities and over 400 leaked secrets, meaning passwords and keys sitting in public. Another firm found about 5,000 apps exposing personal data. A survey of 600 non-developers found that 84% hit problems with AI-written code and a third couldn't tell whether to trust it.

None of this means don't build. It means two habits, from the first day.

**Rule one: save before you change.** Before you ask the AI to change anything, commit. That word just means "take a snapshot I can go back to." Then when the AI breaks something, and it will, you undo in one step instead of begging it to fix its fix. The guide on this site called *Your first Git commit* is twenty minutes and it's the single most useful thing a beginner can learn.

**Rule two: never paste a secret into a prompt.** A password, an API key, a token: never into the chat, never into the code. Put it in a file the app reads and the code never contains. If a key has ever been in a prompt or a public repository, treat it as stolen and replace it. Removing it afterwards doesn't undo the exposure.

Everything else can be learned as you go. These two can't be learned afterwards.
