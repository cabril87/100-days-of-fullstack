import type { NextConfig } from "next";

// ================================
// ENTERPRISE SERVICE WORKER CONFIG
// ================================

const isDev = process.env.NODE_ENV === 'development';
const isDocker = process.env.DOCKER_ENVIRONMENT === 'true';
const buildId = process.env.BUILD_ID || Date.now().toString();

// Enterprise cache versioning strategy
const CACHE_VERSION = `v${buildId}`;
const CACHE_PREFIX = 'tasktracker-enterprise';

// Configure PWA with enterprise cache management
const withPWA = require('next-pwa')({
  dest: 'public',
  
  // ✅ CRITICAL FIX: Completely disable service worker in development
  disable: isDev, // Simplified - always disable in dev
  
  register: !isDev, // Only register in production
  skipWaiting: !isDev, // Only skip waiting in production
  
  // ✅ ENTERPRISE CACHE SCOPE: Proper scope management
  scope: '/',
  sw: 'sw.js',
  
  // ✅ ENHANCED BUILD EXCLUSIONS: Prevent cache conflicts
  buildExcludes: [
    /middleware-manifest\.json$/,
    /app-build-manifest\.json$/,
    /_buildManifest\.js$/,
    /_ssgManifest\.js$/,
    /BUILD_ID$/,
    /prerender-manifest\.json$/,
    /react-loadable-manifest\.json$/,
    /server-manifest\.json$/,
    // Enhanced development exclusions
    ...(isDev ? [
      /hot-update/,
      /webpack-hmr/,
      /_next\/static\/development/,
      /_next\/static\/css/,  // ✅ CRITICAL: Exclude all CSS in dev
      /\.map$/,
      /\.css$/,              // ✅ CRITICAL: Exclude all CSS files in dev
    ] : [])
  ],
  
  // ✅ ENTERPRISE CACHE VERSIONING: Dynamic cache names with versioning
  cacheId: `${CACHE_PREFIX}-${CACHE_VERSION}`,
  cleanupOutdatedCaches: true, // Automatic cleanup of old caches
  
  // ✅ DEVELOPMENT VS PRODUCTION STRATEGIES
  ...(isDev ? {
    // Development: NO CACHING AT ALL
    clientsClaim: false,
    mode: 'development',
    runtimeCaching: []  // ✅ CRITICAL: No runtime caching in dev
  } : {
    // Production: Aggressive caching, optimal performance
    clientsClaim: true,
    mode: 'production'
  }),
  
  // ✅ PRODUCTION-ONLY RUNTIME CACHING: Completely disabled in dev
  runtimeCaching: isDev ? [] : [
    // ✅ CRITICAL ASSETS: CacheFirst for stability (PRODUCTION ONLY)
    {
      urlPattern: /^https?.*\.(?:png|jpg|jpeg|svg|gif|webp|ico|avif)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: `${CACHE_PREFIX}-images-${CACHE_VERSION}`,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [
          {
            cacheKeyWillBeUsed: async ({ request }: { request: Request }) => {
              const url = new URL(request.url);
              url.searchParams.set('v', CACHE_VERSION);
              return url.toString();
            }
          }
        ]
      },
    },
    
    // ✅ STATIC RESOURCES: StaleWhileRevalidate for balance (PRODUCTION ONLY)
    {
      urlPattern: /^https?.*\.(?:js|woff|woff2|ttf|eot)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: `${CACHE_PREFIX}-static-${CACHE_VERSION}`,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    
    // ✅ CSS FILES: NetworkFirst to always get fresh styles (PRODUCTION ONLY)
    {
      urlPattern: /^https?.*\.css$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: `${CACHE_PREFIX}-styles-${CACHE_VERSION}`,
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60, // 1 hour only
        },
        networkTimeoutSeconds: 1, // Very fast timeout
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [
          {
            cacheKeyWillBeUsed: async ({ request }: { request: Request }) => {
              // Force fresh CSS by adding timestamp
              const url = new URL(request.url);
              url.searchParams.set('css-v', Date.now().toString());
              return url.toString();
            }
          }
        ]
      },
    },
    
    // ✅ NEXT.JS SPECIFIC ASSETS: Optimized for Next.js 15 (PRODUCTION ONLY)
    {
      urlPattern: /\/_next\/static\/.+\.js$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: `${CACHE_PREFIX}-nextjs-${CACHE_VERSION}`,
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    
    // ✅ API ROUTES: NetworkFirst with intelligent caching (PRODUCTION ONLY)
    {
      urlPattern: /\/api\/.*$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: `${CACHE_PREFIX}-api-${CACHE_VERSION}`,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
        networkTimeoutSeconds: 10,
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    
    // ✅ PAGES: NetworkFirst for dynamic content (PRODUCTION ONLY)
    {
      urlPattern: /^https?:\/\/[^\/]*\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: `${CACHE_PREFIX}-pages-${CACHE_VERSION}`,
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24, // 1 day
        },
        networkTimeoutSeconds: 5,
      },
    },
    
    // ✅ EXTERNAL RESOURCES: CacheFirst for CDN assets (PRODUCTION ONLY)
    {
      urlPattern: /^https?:\/\/(cdn|fonts)\..*$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: `${CACHE_PREFIX}-external-${CACHE_VERSION}`,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  // ✅ DOCKER DEPLOYMENT: Standalone output for containers
  output: 'standalone',
  
  // ✅ BUILD CONFIGURATION: Enhanced for PWA
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ✅ PERFORMANCE OPTIMIZATIONS: Mobile-first
  trailingSlash: false,
  compress: true,
  poweredByHeader: false,
  generateEtags: !isDev, // Disable ETags in development
  reactStrictMode: true,
  
  // ✅ EXPERIMENTAL FEATURES: Next.js 15 optimizations
  experimental: {
    optimizePackageImports: ['@microsoft/signalr', 'lucide-react'],
  },
  
  // ✅ ENTERPRISE IMAGE OPTIMIZATION: Multi-device support
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: isDev ? 0 : 31536000, // No caching in dev
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
  
  // ✅ CRITICAL CSS HEADERS: Proper MIME types and caching (FIXED!)
  async headers() {
    const headers = [
      // ✅ CSS FILES: CRITICAL FIX for MIME type issues
      {
        source: '/_next/static/css/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/css; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: isDev 
              ? 'no-cache, no-store, must-revalidate, max-age=0'  // ✅ CRITICAL: Force no cache in dev
              : 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
        ],
      },
      
      // ✅ CSS CHUNKS: Next.js CSS chunks fix (THE REAL FIX!)
      {
        source: '/_next/static/chunks/:path*.css',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/css; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: isDev 
              ? 'no-cache, no-store, must-revalidate, max-age=0'
              : 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      
      // ✅ GLOBAL CSS FILES
      {
        source: '/styles/:path*.css',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/css; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: isDev 
              ? 'no-cache, no-store, must-revalidate, max-age=0'
              : 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      
      // ✅ SERVICE WORKER HEADERS: Proper cache control
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0', // Always no-cache
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      
      // ✅ WORKBOX FILES: Versioned cache headers
      {
        source: '/workbox-:hash.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: isDev 
              ? 'no-cache, no-store, must-revalidate'
              : 'public, max-age=31536000, immutable',
          },
        ],
      },
      
      // ✅ JAVASCRIPT FILES: Enhanced caching (exclude CSS)
      {
        source: '/_next/static/chunks/:path*.(js|mjs)',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: isDev 
              ? 'no-cache, no-store, must-revalidate'
              : 'public, max-age=31536000, immutable',
          },
        ],
      },
      
      // ✅ API ROUTES: Development-aware caching
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: isDev 
              ? 'no-cache, no-store, must-revalidate'
              : 'public, max-age=300, s-maxage=300',
          },
        ],
      },
    ];

    // ✅ PRODUCTION SECURITY HEADERS: Only in production
    if (!isDev) {
      headers.push({
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' data:",
              "style-src 'self' 'unsafe-inline' data: https:",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https:",
              `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"} ws: wss:`,
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
              "media-src 'self' data: blob:",
            ].join('; '),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      });
    }

    return headers;
  },
  
  // ✅ REDIRECTS: Enterprise routing
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: false,
      },
      {
        source: '/settings',
        destination: '/settings/profile',
        permanent: false,
      },
    ];
  },
  
  // ✅ REWRITES: API proxy for development
  async rewrites() {
    if (isDev) {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/:path*`,
        },
      ];
    }
    return [];
  },
};

export default withPWA(nextConfig);

