/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["sx2vwk-3000.csb.app"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'https://uyaytzpsgmdiqenetryz.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],

  },
};

export default nextConfig;
