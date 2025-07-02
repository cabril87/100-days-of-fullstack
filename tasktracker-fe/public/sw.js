/*
 * Service Worker - Build Information
 * Generated: 2025-07-03T02:18:49.398Z
 * Build ID: 1751509129391
 * Cache Version: v1751509129391
 * Environment: production
 * API URL: http://localhost:5000
 */

/*
 * Copyright (c) 2025 TaskTracker Enterprise
 * Service Worker Template - Processed at Build Time
 * 
 * This template gets processed during build to create the final sw.js
 * Variables are replaced with actual values during compilation
 */

// ================================
// BUILD-TIME VARIABLES (Replaced during build)
// ================================

const CACHE_VERSION = 'v1751509129391';
const BUILD_ID = '1751509129391';
const ENV_MODE = 'production';
const IS_DEVELOPMENT = ENV_MODE === 'development';
const API_URL = 'http://localhost:5000';

// ================================
// ENTERPRISE CACHE CONFIGURATION
// ================================

const CACHE_NAMES = {
  PAGES: `tasktracker-pages-${BUILD_ID}`,
  API: `tasktracker-api-${BUILD_ID}`,
  STATIC: `tasktracker-static-${BUILD_ID}`,
  IMAGES: `tasktracker-images-${BUILD_ID}`,
  CSS: `tasktracker-css-${BUILD_ID}`,
  JS: `tasktracker-js-${BUILD_ID}`
};

// Environment-Specific Cache TTL (in seconds)
const CACHE_TTL = IS_DEVELOPMENT ? {
  PAGES: 300,    // 5 minutes
  API: 60,       // 1 minute  
  STATIC: 600,   // 10 minutes
  IMAGES: 1800,  // 30 minutes
  CSS: 300,      // 5 minutes
  JS: 600        // 10 minutes
} : {
  PAGES: 86400,    // 24 hours
  API: 3600,       // 1 hour
  STATIC: 2592000, // 30 days
  IMAGES: 2592000, // 30 days
  CSS: 2592000,    // 30 days
  JS: 2592000      // 30 days
};

// Cache Strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'CacheFirst',
  NETWORK_FIRST: 'NetworkFirst',
  STALE_WHILE_REVALIDATE: 'StaleWhileRevalidate',
  NETWORK_ONLY: 'NetworkOnly'
};

// Route Patterns and Strategies
const ROUTE_STRATEGIES = [
  // CSS Files - Critical for styling
  {
    pattern: /\.css$/i,
    strategy: IS_DEVELOPMENT ? CACHE_STRATEGIES.NETWORK_FIRST : CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    cacheName: CACHE_NAMES.CSS,
    ttl: CACHE_TTL.CSS,
    priority: 'high'
  },
  
  // JavaScript Files
  {
    pattern: /\.js$/i,
    strategy: IS_DEVELOPMENT ? CACHE_STRATEGIES.NETWORK_FIRST : CACHE_STRATEGIES.CACHE_FIRST,
    cacheName: CACHE_NAMES.JS,
    ttl: CACHE_TTL.JS,
    priority: 'high'
  },
  
  // Images
  {
    pattern: /\.(png|jpg|jpeg|gif|svg|webp|avif|ico)$/i,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cacheName: CACHE_NAMES.IMAGES,
    ttl: CACHE_TTL.IMAGES,
    priority: 'low'
  },
  
  // API Routes
  {
    pattern: new RegExp(`^${API_URL}/api/`),
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cacheName: CACHE_NAMES.API,
    ttl: CACHE_TTL.API,
    priority: 'high'
  },
  
  // Static Next.js Assets
  {
    pattern: /\/_next\/static\//,
    strategy: IS_DEVELOPMENT ? CACHE_STRATEGIES.NETWORK_FIRST : CACHE_STRATEGIES.CACHE_FIRST,
    cacheName: CACHE_NAMES.STATIC,
    ttl: CACHE_TTL.STATIC,
    priority: 'medium'
  },
  
  // Pages
  {
    pattern: /^https?:\/\/[^\/]*\/(?!api|_next)/,
    strategy: IS_DEVELOPMENT ? CACHE_STRATEGIES.NETWORK_FIRST : CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    cacheName: CACHE_NAMES.PAGES,
    ttl: CACHE_TTL.PAGES,
    priority: 'medium'
  }
];

// ================================
// PERFORMANCE METRICS
// ================================

let cacheMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  networkRequests: 0,
  errors: 0,
  lastUpdated: new Date().toISOString()
};

// ================================
// UTILITY FUNCTIONS
// ================================

function log(message, ...args) {
  if (IS_DEVELOPMENT) {
    console.log(`[SW ${CACHE_VERSION}] ${message}`, ...args);
  }
}

function getRouteStrategy(url) {
  for (const route of ROUTE_STRATEGIES) {
    if (route.pattern.test(url)) {
      return route;
    }
  }
  
  // Default strategy
  return {
    strategy: IS_DEVELOPMENT ? CACHE_STRATEGIES.NETWORK_FIRST : CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    cacheName: CACHE_NAMES.PAGES,
    ttl: CACHE_TTL.PAGES,
    priority: 'low'
  };
}

function isExpired(response, ttl) {
  if (!response || !response.headers) return true;
  
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return true;
  
  const cacheDate = new Date(dateHeader);
  const now = new Date();
  const age = (now.getTime() - cacheDate.getTime()) / 1000;
  
  return age > ttl;
}

async function cleanupExpiredCache(cacheName, ttl) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    let cleanedCount = 0;
    
    for (const request of keys) {
      const response = await cache.match(request);
      if (response && isExpired(response, ttl)) {
        await cache.delete(request);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      log(`Cleaned ${cleanedCount} expired entries from ${cacheName}`);
    }
  } catch (error) {
    log(`Error cleaning cache ${cacheName}:`, error);
  }
}

async function addResponseToCache(cacheName, request, response, ttl) {
  try {
    const cache = await caches.open(cacheName);
    
    // Clone response before caching
    const responseToCache = response.clone();
    
    // Add cache timestamp header
    const headers = new Headers(responseToCache.headers);
    headers.set('sw-cached-at', new Date().toISOString());
    headers.set('sw-ttl', ttl.toString());
    
    const modifiedResponse = new Response(responseToCache.body, {
      status: responseToCache.status,
      statusText: responseToCache.statusText,
      headers
    });
    
    await cache.put(request, modifiedResponse);
    log(`Cached: ${request.url} in ${cacheName}`);
    
  } catch (error) {
    log(`Error caching ${request.url}:`, error);
  }
}

function postMessage(type, data) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type, data });
    });
  });
}

// ================================
// CACHE STRATEGIES IMPLEMENTATION
// ================================

async function cacheFirstStrategy(request, routeConfig) {
  const { cacheName, ttl } = routeConfig;
  
  try {
    // Try cache first
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse && !isExpired(cachedResponse, ttl)) {
      cacheMetrics.cacheHits++;
      log(`Cache hit: ${request.url}`);
      return cachedResponse;
    }
    
    // If not in cache or expired, fetch from network
    const networkResponse = await fetch(request);
    cacheMetrics.networkRequests++;
    
    if (networkResponse.ok) {
      await addResponseToCache(cacheName, request, networkResponse, ttl);
    }
    
    return networkResponse;
    
  } catch (error) {
    cacheMetrics.errors++;
    log(`CacheFirst error for ${request.url}:`, error);
    
    // Return stale cache if network fails
    const cache = await caches.open(cacheName);
    const staleResponse = await cache.match(request);
    return staleResponse || new Response('Offline', { status: 503 });
  }
}

async function networkFirstStrategy(request, routeConfig) {
  const { cacheName, ttl } = routeConfig;
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    cacheMetrics.networkRequests++;
    
    if (networkResponse.ok) {
      await addResponseToCache(cacheName, request, networkResponse, ttl);
      return networkResponse;
    }
    
    throw new Error(`Network response not ok: ${networkResponse.status}`);
    
  } catch (error) {
    cacheMetrics.errors++;
    log(`Network error for ${request.url}, trying cache:`, error);
    
    // Fallback to cache
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      cacheMetrics.cacheHits++;
      log(`Cache fallback: ${request.url}`);
      return cachedResponse;
    }
    
    cacheMetrics.cacheMisses++;
    return new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidateStrategy(request, routeConfig) {
  const { cacheName, ttl } = routeConfig;
  
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    // Always try to fetch in background
    const networkPromise = fetch(request).then(async (response) => {
      cacheMetrics.networkRequests++;
      if (response.ok) {
        await addResponseToCache(cacheName, request, response, ttl);
        
        // Notify clients of updated content
        postMessage('CACHE_UPDATED', {
          url: request.url,
          cacheName
        });
      }
      return response;
    }).catch(error => {
      cacheMetrics.errors++;
      log(`Background fetch error for ${request.url}:`, error);
      return null;
    });
    
    // Return cached version immediately if available
    if (cachedResponse) {
      cacheMetrics.cacheHits++;
      log(`Stale cache served: ${request.url}`);
      
      // Don't await network promise - let it update in background
      networkPromise;
      
      return cachedResponse;
    }
    
    // If no cache, wait for network
    const networkResponse = await networkPromise;
    return networkResponse || new Response('Offline', { status: 503 });
    
  } catch (error) {
    cacheMetrics.errors++;
    log(`StaleWhileRevalidate error for ${request.url}:`, error);
    return new Response('Error', { status: 500 });
  }
}

async function networkOnlyStrategy(request) {
  try {
    const response = await fetch(request);
    cacheMetrics.networkRequests++;
    return response;
  } catch (error) {
    cacheMetrics.errors++;
    log(`NetworkOnly error for ${request.url}:`, error);
    return new Response('Offline', { status: 503 });
  }
}

// ================================
// SERVICE WORKER EVENT HANDLERS
// ================================

self.addEventListener('install', (event) => {
  log(`Installing Service Worker version ${CACHE_VERSION}`);
  
  if (IS_DEVELOPMENT) {
    // In development, take control immediately
    self.skipWaiting();
  }
  
  event.waitUntil(
    Promise.all([
      // Pre-cache critical resources
      caches.open(CACHE_NAMES.STATIC).then(cache => {
        const criticalUrls = [
          '/',
          '/manifest.json'
        ];
        
        return cache.addAll(criticalUrls.filter(url => url)).catch(error => {
          log('Pre-cache failed:', error);
        });
      }),
      
      // Initialize metrics
      Promise.resolve().then(() => {
        cacheMetrics.lastUpdated = new Date().toISOString();
        log('Service Worker installed successfully');
      })
    ])
  );
});

self.addEventListener('activate', (event) => {
  log(`Activating Service Worker version ${CACHE_VERSION}`);
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        const validCacheNames = Object.values(CACHE_NAMES);
        
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!validCacheNames.includes(cacheName)) {
              log(`Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests (unless explicitly allowed)
  if (!url.startsWith(self.location.origin) && !url.includes('/api/')) {
    return;
  }
  
  // Skip requests with cache-control: no-cache
  if (request.headers.get('cache-control') === 'no-cache') {
    log(`Skipping no-cache request: ${url}`);
    return;
  }
  
  const routeConfig = getRouteStrategy(url);
  
  log(`Handling ${routeConfig.strategy} for: ${url}`);
  
  event.respondWith(
    (async () => {
      try {
        switch (routeConfig.strategy) {
          case CACHE_STRATEGIES.CACHE_FIRST:
            return await cacheFirstStrategy(request, routeConfig);
            
          case CACHE_STRATEGIES.NETWORK_FIRST:
            return await networkFirstStrategy(request, routeConfig);
            
          case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
            return await staleWhileRevalidateStrategy(request, routeConfig);
            
          case CACHE_STRATEGIES.NETWORK_ONLY:
            return await networkOnlyStrategy(request);
            
          default:
            return await networkFirstStrategy(request, routeConfig);
        }
      } catch (error) {
        cacheMetrics.errors++;
        log(`Fetch handler error for ${url}:`, error);
        
        // Try to return any cached version as last resort
        const cache = await caches.open(routeConfig.cacheName);
        const cachedResponse = await cache.match(request);
        
        return cachedResponse || new Response('Service Worker Error', { 
          status: 500,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    })()
  );
});

self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'REQUEST_METRICS':
      cacheMetrics.lastUpdated = new Date().toISOString();
      event.ports[0]?.postMessage({
        type: 'CACHE_METRICS',
        data: cacheMetrics
      });
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.keys().then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        }).then(() => {
          event.ports[0]?.postMessage({
            type: 'CACHE_CLEARED',
            data: { success: true }
          });
        })
      );
      break;
      
    case 'CLEANUP_EXPIRED':
      event.waitUntil(
        Promise.all(
          ROUTE_STRATEGIES.map(route => 
            cleanupExpiredCache(route.cacheName, route.ttl)
          )
        ).then(() => {
          event.ports[0]?.postMessage({
            type: 'CLEANUP_COMPLETED',
            data: { success: true }
          });
        })
      );
      break;
      
    case 'WARM_CACHE':
      event.waitUntil(
        (async () => {
          const urls = data?.urls || [
            '/',
            '/dashboard',
            '/tasks',
            '/calendar',
            '/gamification'
          ];
          
          const cache = await caches.open(CACHE_NAMES.PAGES);
          
          for (const url of urls) {
            try {
              const response = await fetch(url);
              if (response.ok) {
                await cache.put(url, response);
                log(`Warmed cache for: ${url}`);
              }
            } catch (error) {
              log(`Failed to warm cache for ${url}:`, error);
            }
          }
          
          event.ports[0]?.postMessage({
            type: 'CACHE_WARMED',
            data: { success: true, urls }
          });
        })()
      );
      break;
  }
});

// ================================
// BACKGROUND SYNC & CLEANUP
// ================================

// Periodic cache cleanup (every 6 hours)
setInterval(() => {
  if (!IS_DEVELOPMENT) {
    Promise.all(
      ROUTE_STRATEGIES.map(route => 
        cleanupExpiredCache(route.cacheName, route.ttl)
      )
    ).then(() => {
      log('Periodic cache cleanup completed');
    });
  }
}, 6 * 60 * 60 * 1000);

// Send metrics update every 5 minutes
setInterval(() => {
  postMessage('CACHE_METRICS', cacheMetrics);
}, 5 * 60 * 1000);

log(`Service Worker ${CACHE_VERSION} loaded (${IS_DEVELOPMENT ? 'development' : 'production'} mode)`); 