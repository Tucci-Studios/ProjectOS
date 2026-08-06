/**
 * Project OS is open source on itself — eventually.
 *
 * The repo now exists and this points at it, but it's private, so every "get
 * the code" link on the site 404s for anyone who isn't Jacob. REPO_IS_PUBLIC
 * gates that: while it's false the site says the code isn't out yet rather than
 * sending people to a page they can't see.
 *
 * Flip it the moment the repo goes public. Nothing else needs changing.
 */
export const SOURCE_REPO = "jacobt72401/ProjectOS";
export const SOURCE_URL = `https://github.com/${SOURCE_REPO}`;
export const REPO_IS_PUBLIC = false;

/**
 * Where the site lives, absolutely.
 *
 * Sitemaps and link previews need a full URL, and a wrong one is worse than
 * none — it points crawlers and previews at a host that doesn't serve the page.
 * Set SITE_URL once the domain exists; localhost is only right in development.
 */
export function siteUrl(): string {
  const raw = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://project-open-source.com";
  return raw.replace(/\/+$/, "");
}

/**
 * Where a takedown request lands.
 *
 * Section 3 of the terms promises anyone can ask to be removed without an
 * account and without explaining themselves. That promise needs a route that
 * works for someone who has never signed in and can't see a private repo —
 * otherwise the most important paragraph in the document is decorative.
 *
 * Now that the domain exists this is a role address rather than a personal
 * one, which is the right thing to put on a public page. It needs to actually
 * receive mail before launch — Cloudflare Email Routing forwards it to a real
 * inbox for free, and until that's set up this address bounces.
 */
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "hello@project-open-source.com";
