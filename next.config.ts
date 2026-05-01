import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "https://mgp9yj-3000.csb.app/",
    "https://sx2vwk-3000.csb.app/",
  ],
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
