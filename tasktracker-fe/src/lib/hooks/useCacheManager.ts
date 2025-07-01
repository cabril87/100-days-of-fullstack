'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { cacheManager, CacheStatus } from '@/lib/services/CacheManagerService';

// ================================
// CACHE MANAGER HOOK TYPES
// ================================

export interface UseCacheManagerReturn {
  isInitialized: boolean;
  cacheStatus: CacheStatus | null;
  isServiceWorkerSupported: boolean;
  clearCache: () => Promise<void>;
  warmCache: () => Promise<void>;
  refreshApplication: () => Promise<void>;
  exportMetrics: () => string;
  enableDebugMode: () => void;
  disableDebugMode: () => void;
  isDebugMode: boolean;
  lastUpdated: Date | null;
  error: string | null;
}

export interface UseCacheManagerOptions {
  autoInitialize?: boolean;
  autoRefreshInterval?: number; // in milliseconds
  enableDebugMode?: boolean;
  onCacheUpdate?: (status: CacheStatus) => void;
  onError?: (error: Error) => void;
}

// ================================
// CACHE MANAGER HOOK
// ================================

export function useCacheManager(options: UseCacheManagerOptions = {}): UseCacheManagerReturn {
  const {
    autoInitialize = true,
    autoRefreshInterval = 30000, // 30 seconds
    enableDebugMode = false,
    onCacheUpdate,
    onError
  } = options;

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDebugMode, setIsDebugMode] = useState(
    typeof window !== 'undefined' && localStorage.getItem('cache-debug') === 'true'
  );

  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initializingRef = useRef(false);

  // Check service worker support
  const isServiceWorkerSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator;

  // ================================
  // CACHE STATUS UPDATES
  // ================================

  const updateCacheStatus = useCallback(async () => {
    if (!isServiceWorkerSupported) return;

    try {
      const status = await cacheManager.getCacheStatus();
      setCacheStatus(status);
      setLastUpdated(new Date());
      setError(null);
      
      // Notify parent component of updates
      if (onCacheUpdate) {
        onCacheUpdate(status);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get cache status';
      setError(errorMessage);
      console.error('Cache status update failed:', err);
      
      if (onError && err instanceof Error) {
        onError(err);
      }
    }
  }, [isServiceWorkerSupported, onCacheUpdate, onError]);

  // ================================
  // INITIALIZATION
  // ================================

  const initializeCacheManager = useCallback(async () => {
    if (!isServiceWorkerSupported || initializingRef.current) {
      return;
    }

    initializingRef.current = true;
    
    try {
      console.log('🚀 Initializing Cache Manager...');
      
      // Initialize the cache manager
      await cacheManager.initialize();
      
      // Enable debug mode if requested
      if (enableDebugMode) {
        cacheManager.enableDebugMode();
        setIsDebugMode(true);
      }
      
      // Get initial cache status
      await updateCacheStatus();
      
      setIsInitialized(true);
      setError(null);
      
      console.log('✅ Cache Manager initialized successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize cache manager';
      setError(errorMessage);
      console.error('Cache Manager initialization failed:', err);
      
      if (onError && err instanceof Error) {
        onError(err);
      }
    } finally {
      initializingRef.current = false;
    }
  }, [isServiceWorkerSupported, enableDebugMode, updateCacheStatus, onError]);

  // ================================
  // CACHE OPERATIONS
  // ================================

  const clearCache = useCallback(async (): Promise<void> => {
    if (!isInitialized) {
      throw new Error('Cache manager not initialized');
    }

    try {
      await cacheManager.clearUserCache();
      await updateCacheStatus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear cache';
      setError(errorMessage);
      throw err;
    }
  }, [isInitialized, updateCacheStatus]);

  const warmCache = useCallback(async (): Promise<void> => {
    if (!isInitialized) {
      throw new Error('Cache manager not initialized');
    }

    try {
      await cacheManager.warmCriticalResources();
      await updateCacheStatus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to warm cache';
      setError(errorMessage);
      throw err;
    }
  }, [isInitialized, updateCacheStatus]);

  const refreshApplication = useCallback(async (): Promise<void> => {
    if (!isInitialized) {
      throw new Error('Cache manager not initialized');
    }

    try {
      await cacheManager.refreshApplication();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh application';
      setError(errorMessage);
      throw err;
    }
  }, [isInitialized]);

  const exportMetrics = useCallback((): string => {
    if (!isInitialized) {
      throw new Error('Cache manager not initialized');
    }

    return cacheManager.exportCacheMetrics();
  }, [isInitialized]);

  const handleEnableDebugMode = useCallback(() => {
    cacheManager.enableDebugMode();
    setIsDebugMode(true);
  }, []);

  const handleDisableDebugMode = useCallback(() => {
    cacheManager.disableDebugMode();
    setIsDebugMode(false);
  }, []);

  // ================================
  // LIFECYCLE EFFECTS
  // ================================

  // Initialize cache manager on mount
  useEffect(() => {
    if (autoInitialize && isServiceWorkerSupported) {
      initializeCacheManager();
    }
  }, [autoInitialize, isServiceWorkerSupported, initializeCacheManager]);

  // Set up auto-refresh interval
  useEffect(() => {
    if (isInitialized && autoRefreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        updateCacheStatus();
      }, autoRefreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
      };
    }
  }, [isInitialized, autoRefreshInterval, updateCacheStatus]);

  // Listen for storage changes (debug mode toggle from other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cache-debug') {
        setIsDebugMode(e.newValue === 'true');
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  // Listen for service worker messages
  useEffect(() => {
    if (!isServiceWorkerSupported) return;

    const handleMessage = (event: MessageEvent) => {
      const { type, data } = event.data;

      switch (type) {
        case 'CACHE_UPDATED':
          console.log('Cache updated:', data);
          updateCacheStatus();
          break;
          
        case 'CACHE_ERROR':
          console.error('Cache error:', data);
          setError(data.message || 'Cache error occurred');
          break;
          
        case 'SERVICE_WORKER_UPDATE':
          console.log('Service worker update available');
          // Could trigger a notification to the user
          break;
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [isServiceWorkerSupported, updateCacheStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // ================================
  // PAGE VISIBILITY HANDLING
  // ================================

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isInitialized) {
        // Refresh cache status when page becomes visible
        updateCacheStatus();
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [isInitialized, updateCacheStatus]);

  // ================================
  // NETWORK STATUS HANDLING
  // ================================

  useEffect(() => {
    const handleOnline = () => {
      if (isInitialized) {
        console.log('Network connection restored, updating cache status');
        updateCacheStatus();
      }
    };

    const handleOffline = () => {
      if (isInitialized) {
        console.log('Network connection lost');
        // You might want to update UI to show offline status
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [isInitialized, updateCacheStatus]);

  // ================================
  // RETURN INTERFACE
  // ================================

  return {
    isInitialized,
    cacheStatus,
    isServiceWorkerSupported,
    clearCache,
    warmCache,
    refreshApplication,
    exportMetrics,
    enableDebugMode: handleEnableDebugMode,
    disableDebugMode: handleDisableDebugMode,
    isDebugMode,
    lastUpdated,
    error
  };
}

// ================================
// UTILITY HOOKS
// ================================

/**
 * Simple hook to check if service worker is supported and available
 */
export function useServiceWorkerSupport(): boolean {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(typeof window !== 'undefined' && 'serviceWorker' in navigator);
  }, []);

  return isSupported;
}

/**
 * Hook to monitor cache size and provide warnings
 */
export function useCacheMonitor() {
  const { cacheStatus, isInitialized } = useCacheManager();
  
  const getCacheSizeWarning = (): 'none' | 'warning' | 'critical' => {
    if (!cacheStatus) return 'none';
    
    const sizeInMB = cacheStatus.totalCacheSize / (1024 * 1024);
    
    if (sizeInMB > 200) return 'critical'; // Over 200MB
    if (sizeInMB > 100) return 'warning';  // Over 100MB
    return 'none';
  };

  const shouldShowClearCacheNotification = (): boolean => {
    if (!cacheStatus || !cacheStatus.lastCleanup) return false;
    
    const daysSinceCleanup = Math.floor(
      (Date.now() - cacheStatus.lastCleanup.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return daysSinceCleanup > 7; // Suggest cleanup after 7 days
  };

  return {
    isInitialized,
    cacheStatus,
    cacheSizeWarning: getCacheSizeWarning(),
    shouldShowClearCacheNotification: shouldShowClearCacheNotification(),
    totalCacheSizeMB: cacheStatus ? Math.round(cacheStatus.totalCacheSize / (1024 * 1024)) : 0
  };
} 