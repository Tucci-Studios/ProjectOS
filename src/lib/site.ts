// Project OS is open source on itself. Update this once the repo is public.
export const SOURCE_REPO = "project-os/project-os";
export const SOURCE_URL = `https://github.com/${SOURCE_REPO}`;
export const REPO_IS_PUBLIC = false; // flip when the GitHub org exists

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
