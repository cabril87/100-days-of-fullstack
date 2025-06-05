import type { NextConfig } from "next";

// Configure PWA based on environment
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // Disable in development to avoid conflicts with Turbopack
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  // Docker deployment configuration
  output: 'standalone',
  
  // Enhanced build configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Disable trailing slash for consistency
  trailingSlash: false,
  
  // Advanced performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  reactStrictMode: true,
  
  // Enhanced image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['localhost', '127.0.0.1'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; style-src 'unsafe-inline'; sandbox;",
  },
  
  // Turbopack configuration (replaces webpack config)
  turbopack: {
    resolveAlias: {
      // Common aliases for better module resolution
      '@': './src',
      '~': './src',
    },
    resolveExtensions: [
      '.tsx',
      '.ts', 
      '.jsx',
      '.js',
      '.mjs',
      '.json',
      '.css',
      '.scss',
      '.sass'
    ],
  },
  
  // Next.js 15 and Turbopack optimizations
  experimental: {
    // Package import optimizations for Turbopack
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@radix-ui/react-avatar',
      '@radix-ui/react-button',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      'chart.js',
      'framer-motion',
      'lodash',
      'date-fns',
      'clsx',
      'class-variance-authority',
      'tailwind-merge'
    ],
    
    // Enhanced web vitals tracking
    webVitalsAttribution: ['CLS', 'LCP', 'FCP', 'FID', 'TTFB', 'INP'],
    
    // Enable server actions (for future use)
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Server-side package exclusions
  serverExternalPackages: ['@microsoft/signalr', 'sharp'],

  // Optimized redirects for better SEO
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true,
          },
      {
        source: '/register',
        destination: '/auth/register',
        permanent: true,
          },
      {
        source: '/signin',
        destination: '/auth/login',
        permanent: true,
          },
      {
        source: '/signup',
        destination: '/auth/register',
        permanent: true,
      },
    ];
  },
};

export default withPWA(nextConfig);
