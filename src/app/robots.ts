import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/** Everything public is crawlable; the parts that only make sense signed in
 *  aren't, because a search result for someone else's empty feed helps nobody. */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/me", "/settings", "/notifications", "/mod", "/saves"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
