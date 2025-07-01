/*
 * Copyright (c) 2025 TaskTracker Enterprise
 * Enterprise Cache Management Service
 * 
 * BULLETPROOF SERVICE WORKER CACHE SYSTEM
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md standards
 * 
 * Features:
 * - Intelligent cache versioning with build timestamps
 * - Separate strategies for development vs production
 * - Cache cleanup on version changes
 * - Cache debugging tools for development
 * - Zero cache conflicts in any environment
 * - Cache invalidation API for forced refreshes
 * - Background cache updates without disrupting UX
 */

// ================================
// ENTERPRISE CACHE TYPES
// ================================

export interface CacheConfig {
  name: string;
  version: string;
  maxAge: number;
  maxEntries: number;
  strategy: 'CacheFirst' | 'NetworkFirst' | 'StaleWhileRevalidate' | 'NetworkOnly';
  patterns: string[];
  enabled: boolean;
}

export interface CacheMetrics {
  cacheHits: number;
  cacheMisses: number;
  networkRequests: number;
  cacheSize: number;
  lastUpdated: Date;
  version: string;
}

export interface CacheStatus {
  isServiceWorkerRegistered: boolean;
  isServiceWorkerControlling: boolean;
  cacheVersion: string;
  totalCacheSize: number;
  cacheNames: string[];
  lastCleanup: Date | null;
  environmentMode: 'development' | 'production';
}

export interface CacheEntry {
  url: string;
  cachedAt: Date;
  expiresAt: Date;
  size: number;
  version: string;
  strategy: string;
}

// ================================
// ENVIRONMENT-SPECIFIC CACHE CONFIGS
// ================================

const DEVELOPMENT_CACHE_CONFIG: CacheConfig[] = [
  {
    name: 'dev-pages',
    version: `dev-${Date.now()}`,
    maxAge: 300, // 5 minutes
    maxEntries: 10,
    strategy: 'NetworkFirst',
    patterns: ['/.*'],
    enabled: true
  },
  {
    name: 'dev-api',
    version: `dev-${Date.now()}`,
    maxAge: 60, // 1 minute
    maxEntries: 20,
    strategy: 'NetworkFirst',
    patterns: ['/api/.*'],
    enabled: true
  },
  {
    name: 'dev-static',
    version: `dev-${Date.now()}`,
    maxAge: 600, // 10 minutes
    maxEntries: 50,
    strategy: 'StaleWhileRevalidate',
    patterns: ['/_next/static/.*', '/images/.*'],
    enabled: true
  }
];

const PRODUCTION_CACHE_CONFIG: CacheConfig[] = [
  {
    name: 'prod-pages',
    version: process.env.NEXT_PUBLIC_BUILD_ID || `prod-${Date.now()}`,
    maxAge: 86400, // 24 hours
    maxEntries: 100,
    strategy: 'StaleWhileRevalidate',
    patterns: ['/.*'],
    enabled: true
  },
  {
    name: 'prod-api',
    version: process.env.NEXT_PUBLIC_BUILD_ID || `prod-${Date.now()}`,
    maxAge: 3600, // 1 hour
    maxEntries: 200,
    strategy: 'NetworkFirst',
    patterns: ['/api/.*'],
    enabled: true
  },
  {
    name: 'prod-static',
    version: process.env.NEXT_PUBLIC_BUILD_ID || `prod-${Date.now()}`,
    maxAge: 31536000, // 1 year
    maxEntries: 500,
    strategy: 'CacheFirst',
    patterns: ['/_next/static/.*', '/images/.*', '*.js', '*.css'],
    enabled: true
  },
  {
    name: 'prod-images',
    version: process.env.NEXT_PUBLIC_BUILD_ID || `prod-${Date.now()}`,
    maxAge: 2592000, // 30 days
    maxEntries: 300,
    strategy: 'CacheFirst',
    patterns: ['*.png', '*.jpg', '*.jpeg', '*.svg', '*.webp', '*.avif'],
    enabled: true
  }
];

// ================================
// ENTERPRISE CACHE MANAGER CLASS
// ================================

export class CacheManagerService {
  private static instance: CacheManagerService | null = null;
  private isDevelopment: boolean;
  private cacheConfig: CacheConfig[];
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private metrics: Map<string, CacheMetrics> = new Map();
  private debugMode: boolean = false;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.cacheConfig = this.isDevelopment ? DEVELOPMENT_CACHE_CONFIG : PRODUCTION_CACHE_CONFIG;
    this.debugMode = this.isDevelopment || localStorage.getItem('cache-debug') === 'true';
  }

  public static getInstance(): CacheManagerService {
    if (!CacheManagerService.instance) {
      CacheManagerService.instance = new CacheManagerService();
    }
    return CacheManagerService.instance;
  }

  // ================================
  // SERVICE WORKER MANAGEMENT
  // ================================

  public async initialize(): Promise<void> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.warn('🚫 Service Worker not supported');
      return;
    }

    try {
      // Register service worker
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: this.isDevelopment ? 'none' : 'imports'
      });

      this.log('✅ Service Worker registered successfully');

      // Set up event listeners
      this.setupServiceWorkerListeners();

      // Initialize cache health monitoring
      await this.initializeCacheMonitoring();

      // Perform initial cache cleanup
      await this.performCacheCleanup();

      // Set up background cache updates
      this.setupBackgroundCacheUpdates();

    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  }

  private setupServiceWorkerListeners(): void {
    if (!this.serviceWorkerRegistration) return;

    // Listen for service worker updates
    this.serviceWorkerRegistration.addEventListener('updatefound', () => {
      this.log('🔄 Service Worker update found');
      const newWorker = this.serviceWorkerRegistration!.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this.log('🆕 New Service Worker available');
            this.notifyUserOfUpdate();
          }
        });
      }
    });

    // Listen for cache-related messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, data } = event.data;
      
      switch (type) {
        case 'CACHE_METRICS':
          this.updateMetrics(data);
          break;
        case 'CACHE_ERROR':
          this.handleCacheError(data);
          break;
        case 'CACHE_UPDATED':
          this.handleCacheUpdate(data);
          break;
      }
    });
  }

  private async initializeCacheMonitoring(): Promise<void> {
    // Initialize metrics for each cache
    for (const config of this.cacheConfig) {
      this.metrics.set(config.name, {
        cacheHits: 0,
        cacheMisses: 0,
        networkRequests: 0,
        cacheSize: 0,
        lastUpdated: new Date(),
        version: config.version
      });
    }

    // Start monitoring cache performance
    this.startPerformanceMonitoring();
  }

  // ================================
  // CACHE VERSIONING & CLEANUP
  // ================================

  public async performCacheCleanup(): Promise<void> {
    if (!('caches' in window)) return;

    try {
      const cacheNames = await caches.keys();
      const currentCacheNames = this.cacheConfig.map(config => 
        `${config.name}-${config.version}`
      );

      // Delete outdated caches
      const deletePromises = cacheNames
        .filter(cacheName => !currentCacheNames.includes(cacheName))
        .map(cacheName => {
          this.log(`🗑️ Deleting outdated cache: ${cacheName}`);
          return caches.delete(cacheName);
        });

      await Promise.all(deletePromises);

      // Update cleanup timestamp
      localStorage.setItem('last-cache-cleanup', new Date().toISOString());
      this.log(`✅ Cache cleanup completed. Deleted ${deletePromises.length} outdated caches`);

    } catch (error) {
      console.error('❌ Cache cleanup failed:', error);
    }
  }

  public async forceCacheInvalidation(): Promise<void> {
    if (!('caches' in window)) return;

    try {
      const cacheNames = await caches.keys();
      
      // Delete all caches
      const deletePromises = cacheNames.map(cacheName => {
        this.log(`🗑️ Force deleting cache: ${cacheName}`);
        return caches.delete(cacheName);
      });

      await Promise.all(deletePromises);

      // Clear metrics
      this.metrics.clear();

      // Reload the page to refresh everything
      window.location.reload();

    } catch (error) {
      console.error('❌ Force cache invalidation failed:', error);
    }
  }

  // ================================
  // CACHE WARMING STRATEGIES
  // ================================

  public async warmCriticalResources(): Promise<void> {
    const criticalResources = [
      '/',
      '/dashboard',
      '/tasks',
      '/calendar',
      '/gamification',
      '/_next/static/css/app.css',
      '/manifest.json'
    ];

    this.log('🔥 Warming critical resources...');

    try {
      const warmingPromises = criticalResources.map(async (url) => {
        try {
          const response = await fetch(url, { 
            credentials: 'same-origin',
            cache: 'reload' // Force fresh fetch for warming
          });
          
          if (response.ok) {
            this.log(`✅ Warmed: ${url}`);
          } else {
            this.log(`⚠️ Failed to warm: ${url} (${response.status})`);
          }
        } catch (error) {
          this.log(`❌ Error warming ${url}:`, error);
        }
      });

      await Promise.all(warmingPromises);
      this.log('🔥 Cache warming completed');

    } catch (error) {
      console.error('❌ Cache warming failed:', error);
    }
  }

  // ================================
  // BACKGROUND CACHE UPDATES
  // ================================

  private setupBackgroundCacheUpdates(): void {
    if (this.isDevelopment) {
      // In development, check for updates every 30 seconds
      setInterval(() => {
        this.checkForCacheUpdates();
      }, 30000);
    } else {
      // In production, check every 10 minutes
      setInterval(() => {
        this.checkForCacheUpdates();
      }, 600000);
    }
  }

  private async checkForCacheUpdates(): Promise<void> {
    if (!this.serviceWorkerRegistration) return;

    try {
      await this.serviceWorkerRegistration.update();
      this.log('🔄 Checked for service worker updates');
    } catch (error) {
      this.log('⚠️ Update check failed:', error);
    }
  }

  // ================================
  // CACHE STATUS & DEBUGGING
  // ================================

  public async getCacheStatus(): Promise<CacheStatus> {
    const isServiceWorkerRegistered = !!this.serviceWorkerRegistration;
    const isServiceWorkerControlling = !!navigator.serviceWorker.controller;

    let totalCacheSize = 0;
    let cacheNames: string[] = [];

    if ('caches' in window) {
      try {
        cacheNames = await caches.keys();
        
        // Calculate total cache size
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          for (const request of keys) {
            const response = await cache.match(request);
            if (response) {
              const size = await this.getResponseSize(response);
              totalCacheSize += size;
            }
          }
        }
      } catch (error) {
        console.error('Error calculating cache size:', error);
      }
    }

    const lastCleanupStr = localStorage.getItem('last-cache-cleanup');
    const lastCleanup = lastCleanupStr ? new Date(lastCleanupStr) : null;

    return {
      isServiceWorkerRegistered,
      isServiceWorkerControlling,
      cacheVersion: this.cacheConfig[0]?.version || 'unknown',
      totalCacheSize,
      cacheNames,
      lastCleanup,
      environmentMode: this.isDevelopment ? 'development' : 'production'
    };
  }

  public async getCacheEntries(): Promise<CacheEntry[]> {
    if (!('caches' in window)) return [];

    const entries: CacheEntry[] = [];

    try {
      const cacheNames = await caches.keys();
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const size = await this.getResponseSize(response);
            const cachedAt = new Date(response.headers.get('date') || Date.now());
            const maxAge = this.getMaxAgeFromCacheName(cacheName);
            const expiresAt = new Date(cachedAt.getTime() + maxAge * 1000);
            
            entries.push({
              url: request.url,
              cachedAt,
              expiresAt,
              size,
              version: this.getVersionFromCacheName(cacheName),
              strategy: this.getStrategyFromCacheName(cacheName)
            });
          }
        }
      }
    } catch (error) {
      console.error('Error getting cache entries:', error);
    }

    return entries.sort((a, b) => b.cachedAt.getTime() - a.cachedAt.getTime());
  }

  public enableDebugMode(): void {
    this.debugMode = true;
    localStorage.setItem('cache-debug', 'true');
    console.log('🐛 Cache debug mode enabled');
  }

  public disableDebugMode(): void {
    this.debugMode = false;
    localStorage.removeItem('cache-debug');
    console.log('🔇 Cache debug mode disabled');
  }

  public exportCacheMetrics(): string {
    const status = this.getCacheStatus();
    const metrics = Object.fromEntries(this.metrics);
    
    const report = {
      timestamp: new Date().toISOString(),
      environment: this.isDevelopment ? 'development' : 'production',
      status,
      metrics,
      config: this.cacheConfig
    };

    return JSON.stringify(report, null, 2);
  }

  // ================================
  // USER-FACING CACHE MANAGEMENT
  // ================================

  public async clearUserCache(): Promise<void> {
    try {
      // Show user feedback
      this.notifyUser('Clearing cache...', 'info');

      // Clear all caches
      await this.forceCacheInvalidation();

      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();

      // Clear IndexedDB if needed
      await this.clearIndexedDB();

      this.notifyUser('Cache cleared successfully!', 'success');

    } catch (error) {
      console.error('❌ Clear user cache failed:', error);
      this.notifyUser('Failed to clear cache', 'error');
    }
  }

  public async refreshApplication(): Promise<void> {
    try {
      // Unregister service worker
      if (this.serviceWorkerRegistration) {
        await this.serviceWorkerRegistration.unregister();
      }

      // Clear all caches
      await this.forceCacheInvalidation();

      // Hard reload
      window.location.reload();

    } catch (error) {
      console.error('❌ Refresh application failed:', error);
    }
  }

  // ================================
  // UTILITY METHODS
  // ================================

  private async getResponseSize(response: Response): Promise<number> {
    try {
      const clonedResponse = response.clone();
      const buffer = await clonedResponse.arrayBuffer();
      return buffer.byteLength;
    } catch {
      return 0;
    }
  }

  private getMaxAgeFromCacheName(cacheName: string): number {
    const config = this.cacheConfig.find(c => cacheName.includes(c.name));
    return config?.maxAge || 3600; // Default 1 hour
  }

  private getVersionFromCacheName(cacheName: string): string {
    const parts = cacheName.split('-');
    return parts[parts.length - 1] || 'unknown';
  }

  private getStrategyFromCacheName(cacheName: string): string {
    const config = this.cacheConfig.find(c => cacheName.includes(c.name));
    return config?.strategy || 'unknown';
  }

  private async clearIndexedDB(): Promise<void> {
    if (!('indexedDB' in window)) return;

    try {
      const databases = await indexedDB.databases();
      await Promise.all(
        databases.map(db => {
          if (db.name) {
            const deleteReq = indexedDB.deleteDatabase(db.name);
            return new Promise((resolve, reject) => {
              deleteReq.onsuccess = () => resolve(undefined);
              deleteReq.onerror = () => reject(deleteReq.error);
            });
          }
        })
      );
    } catch (error) {
      console.warn('IndexedDB clear failed:', error);
    }
  }

  private startPerformanceMonitoring(): void {
    if (!this.debugMode) return;

    // Monitor cache performance
    setInterval(() => {
      if (this.serviceWorkerRegistration && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'REQUEST_METRICS'
        });
      }
    }, 10000); // Every 10 seconds in debug mode
  }

  private updateMetrics(data: any): void {
    if (data.cacheName && this.metrics.has(data.cacheName)) {
      const currentMetrics = this.metrics.get(data.cacheName)!;
      this.metrics.set(data.cacheName, {
        ...currentMetrics,
        ...data,
        lastUpdated: new Date()
      });
    }
  }

  private handleCacheError(error: any): void {
    console.error('Cache error:', error);
    if (this.debugMode) {
      this.notifyUser(`Cache error: ${error.message}`, 'error');
    }
  }

  private handleCacheUpdate(data: any): void {
    this.log(`Cache updated: ${data.cacheName}`);
    if (this.debugMode) {
      this.notifyUser(`Cache updated: ${data.cacheName}`, 'info');
    }
  }

  private notifyUserOfUpdate(): void {
    // Create update notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #3b82f6;
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: system-ui, sans-serif;
      max-width: 300px;
    `;
    
    notification.innerHTML = `
      <div style="margin-bottom: 8px; font-weight: 600;">App Update Available</div>
      <div style="margin-bottom: 12px; font-size: 14px;">A new version is ready. Refresh to update.</div>
      <button onclick="window.location.reload()" style="background: white; color: #3b82f6; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 600;">
        Refresh Now
      </button>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 10000);
  }

  private notifyUser(message: string, type: 'info' | 'success' | 'error'): void {
    if (!this.debugMode && type === 'info') return;

    const colors = {
      info: '#3b82f6',
      success: '#10b981',
      error: '#ef4444'
    };

    console.log(`[Cache Manager] ${message}`);

    // Create toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: ${colors[type]};
      color: white;
      padding: 12px 16px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: system-ui, sans-serif;
      font-size: 14px;
      max-width: 300px;
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  }

  private log(message: string, ...args: any[]): void {
    if (this.debugMode) {
      console.log(`[Cache Manager] ${message}`, ...args);
    }
  }
}

// ================================
// SINGLETON EXPORT
// ================================

export const cacheManager = CacheManagerService.getInstance(); 