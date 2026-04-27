/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["sx2vwk-3000.csb.app"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
