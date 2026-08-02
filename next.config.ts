import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Makes Cloudflare bindings (D1 etc.) available in `next dev`.
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {};

export default nextConfig;
