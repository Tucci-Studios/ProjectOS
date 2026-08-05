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
  const raw = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}
