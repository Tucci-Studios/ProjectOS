import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Makes Cloudflare bindings (D1 etc.) available in `next dev`.
initOpenNextCloudflareForDev();

/**
 * Sent on every response.
 *
 * frame-ancestors is the one that matters most here: every destructive control
 * on the site is a signed-in POST button, so without it another site can put us
 * in an invisible iframe and get a logged-in user to click one.
 *
 * The CSP allows inline styles because Tailwind and Next both emit them, and
 * inline scripts because Next's hydration bootstrap is inline. It still blocks
 * the thing that actually matters — pulling executable code in from a host
 * that isn't us.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // 'unsafe-eval' is dev only — React's development build uses eval to
      // rebuild callstacks. The production bundle never does, and it must not
      // be allowed there.
      `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      // Avatars and project shots come from GitHub and our own R2 bucket.
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      // Demo embeds are sandboxed iframes over https, nothing else.
      "frame-src https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
