import type { MetadataRoute } from "next";
import { INDEXING_ALLOWED, siteUrl } from "@/lib/site";

/** Everything public is crawlable; the parts that only make sense signed in
 *  aren't, because a search result for someone else's empty feed helps nobody. */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();

  // Up, but not open for business. Keeping crawlers out entirely until the
  // site is worth finding — a bad first index is expensive to undo.
  if (!INDEXING_ALLOWED) return { rules: [{ userAgent: "*", disallow: "/" }] };

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/me", "/settings", "/notifications", "/mod", "/saves"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
