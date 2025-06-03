// Enhanced Service Worker for TaskTracker Application
// Prevents 404 errors during registration and provides better caching

const CACHE_NAME = 'tasktracker-v1.1';
const STATIC_CACHE_NAME = 'tasktracker-static-v1.1';
const API_CACHE_NAME = 'tasktracker-api-v1.1';

// Static resources to cache
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/favicon.ico',
];

// Install event - cache static resources
self.addEventListener('install', function(event) {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then(function(cache) {
        console.log('[SW] Caching static resources');
        return cache.addAll(urlsToCache).catch(function(error) {
          console.warn('[SW] Failed to cache some static resources:', error);
          // Don't fail the install if some resources can't be cached
        });
      }),
      self.skipWaiting() // Activate new service worker immediately
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    Promise.all([
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== API_CACHE_NAME && 
                cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim() // Take control of all pages immediately
    ])
  );
});

// Fetch event - handle requests with network-first strategy for API, cache-first for static
self.addEventListener('fetch', function(event) {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-HTTP requests (chrome-extension://, etc.)
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // API requests - network first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(function(response) {
          // Only cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(API_CACHE_NAME).then(function(cache) {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(function() {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }
  
  // Static resources - cache first with network fallback
  event.respondWith(
    caches.match(request)
      .then(function(response) {
        if (response) {
          return response;
        }
        
        return fetch(request)
          .then(function(response) {
            // Only cache successful responses
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE_NAME).then(function(cache) {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(function(error) {
            console.warn('[SW] Fetch failed for:', request.url, error);
            // Return a basic offline page or empty response
            return new Response('', { status: 200 });
          });
      })
  );
});

// Handle messages from the main thread
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 