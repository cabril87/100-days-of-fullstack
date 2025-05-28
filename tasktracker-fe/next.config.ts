import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    // Disable ESLint during builds for Docker
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during builds for Docker
    ignoreBuildErrors: true,
  },
  // Disable static optimization to avoid useSearchParams issues
  trailingSlash: false,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
