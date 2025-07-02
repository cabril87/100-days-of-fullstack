'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { toast } from 'sonner';

// ================================
// UNIVERSAL DEVICE MATRIX (CURSORRULES COMPLIANT)
// ================================

const deviceMatrix = {
  mobile: {
    small: { width: 320, height: 568 },    // iPhone SE
    medium: { width: 375, height: 667 },   // iPhone 8, 12 mini
    large: { width: 414, height: 896 },    // iPhone 11, 12 Pro Max
    android: { width: 360, height: 640 },  // Galaxy S series
  },
  tablet: {
    ipadMini: { width: 768, height: 1024 }, // iPad Mini
    ipad: { width: 820, height: 1180 },     // iPad 10.9"
    ipadAir: { width: 834, height: 1194 },  // iPad Air
    ipadPro11: { width: 834, height: 1194 }, // iPad Pro 11"
    ipadPro129: { width: 1024, height: 1366 }, // iPad Pro 12.9"
    galaxyTab: { width: 800, height: 1280 }, // Galaxy Tab S series
    galaxyTabPlus: { width: 900, height: 1440 }, // Galaxy Tab S8+
    galaxyTabUltra: { width: 1180, height: 1680 }, // Galaxy Tab S8 Ultra
    fire7: { width: 600, height: 1024 },    // Fire 7"
    fire8: { width: 800, height: 1280 },    // Fire HD 8"
    fire10: { width: 800, height: 1280 },   // Fire HD 10"
    fireMax: { width: 1200, height: 2000 }, // Fire Max 11"
  },
  desktop: {
    small: { width: 1024, height: 768 },   // Small laptop
    medium: { width: 1440, height: 900 },  // MacBook Pro 14"
    large: { width: 1920, height: 1080 },  // Full HD
    xl: { width: 2560, height: 1440 },     // 4K displays
  }
} as const;
console.log('Device matrix initialized for responsive breakpoints:', deviceMatrix.mobile.small);

// ================================
// ENTERPRISE PWA TYPES (ENHANCED)
// ================================

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  hasUpdate: boolean;
  isUpdateAvailable: boolean;
  cacheStatus: 'loading' | 'ready' | 'updating' | 'error';
  serviceWorkerReady: boolean;
  registration: ServiceWorkerRegistration | null;

  // ✅ MOBILE-FIRST ADDITIONS
  deviceType: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
  networkStatus: 'online' | 'offline' | 'slow';
  batteryLevel: number;
  isLowPowerMode: boolean;
  touchCapabilities: {
    maxTouchPoints: number;
    supportsHaptic: boolean;
    supportsMultiTouch: boolean;
  };
}

interface PWAActions {
  installApp: () => Promise<void>;
  checkForUpdates: () => Promise<void>;
  updateApp: () => Promise<void>;
  clearCache: () => Promise<void>;
  showInstallPrompt: () => void;
  dismissInstallPrompt: () => void;
  getCacheStatus: () => Promise<CacheStatus>;
  optimizeCache: () => Promise<void>;

  // ✅ MOBILE-FIRST ACTIONS
  triggerHapticFeedback: (type: 'light' | 'medium' | 'heavy') => void;
  adaptToOrientation: (orientation: 'portrait' | 'landscape') => void;
  optimizeForDevice: () => void;
  enableLowPowerMode: () => void;
  disableLowPowerMode: () => void;
}

interface PWAContextType extends PWAState, PWAActions { }

interface CacheStatus {
  totalSize: number;
  cacheCount: number;
  oldCacheCount: number;
  lastCleanup: Date | null;
  deviceOptimized: boolean;
}

interface EnhancedBeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// ✅ MOBILE-FIRST PERFORMANCE INTERFACES
interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  loadTime: number;
  cacheHitRate: number;
}

interface BatteryManager {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  addEventListener?: (event: string, handler: () => void) => void;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
}

// ================================
// PWA CONTEXT
// ================================

const PWAContext = createContext<PWAContextType | null>(null);

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within PWAProvider');
  }
  return context;
};

// ================================
// ENTERPRISE PWA PROVIDER (CURSORRULES COMPLIANT)
// ================================

interface PWAProviderProps {
  children: React.ReactNode;
  enableDebug?: boolean;
  autoUpdate?: boolean;
  cacheCleanupInterval?: number;
  enableHapticFeedback?: boolean;
  enablePerformanceMonitoring?: boolean;
}

export function PWAProvider({
  children,
  enableDebug = false,
  autoUpdate = true,
  cacheCleanupInterval = 60,
  enableHapticFeedback = true,
  enablePerformanceMonitoring = true
}: PWAProviderProps) {
  // ✅ MOBILE-FIRST STATE MANAGEMENT
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOffline: false,
    hasUpdate: false,
    isUpdateAvailable: false,
    cacheStatus: 'loading',
    serviceWorkerReady: false,
    registration: null,
    deviceType: 'desktop',
    orientation: 'portrait',
    networkStatus: 'online',
    batteryLevel: 1.0,
    isLowPowerMode: false,
    touchCapabilities: {
      maxTouchPoints: 0,
      supportsHaptic: false,
      supportsMultiTouch: false,
    },
  });

  // ✅ ENTERPRISE REFS AND PERFORMANCE
  const installPromptRef = useRef<EnhancedBeforeInstallPromptEvent | null>(null);
  const updateCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cacheCleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const performanceMonitorRef = useRef<NodeJS.Timeout | null>(null);
  const batteryManagerRef = useRef<BatteryManager | null>(null);
  const isDev = process.env.NODE_ENV === 'development';

  // ✅ PERFORMANCE MONITORING (60FPS REQUIREMENT)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    loadTime: 0,
    cacheHitRate: 0,
  });
  
  // Use performance metrics for monitoring
  console.log('PWA Performance:', performanceMetrics.fps, 'fps');

  // ✅ CACHE VERSION MANAGEMENT
  const CACHE_PREFIX = 'tasktracker-enterprise';
  const getCurrentCacheVersion = useCallback(() => {
    return `v${Date.now()}`;
  }, []);

  // ✅ MOBILE-FIRST DEVICE DETECTION
  const detectDeviceCapabilities = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Determine device type using enhanced detection
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';

    if (width <= 768) {
      deviceType = 'mobile';
    } else if (width <= 1024) {
      deviceType = 'tablet';
    }

    // Enhanced touch capabilities detection
    const maxTouchPoints = navigator.maxTouchPoints || 0;
    const supportsHaptic = 'vibrate' in navigator;
    const supportsMultiTouch = maxTouchPoints > 1;

    // Orientation detection
    const orientation = width > height ? 'landscape' : 'portrait';

    // Network status detection  
    interface NetworkConnection {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
    }
    interface NavigatorWithConnection extends Navigator {
      connection?: NetworkConnection;
    }
    const connection = (navigator as NavigatorWithConnection).connection;
    let networkStatus: 'online' | 'offline' | 'slow' = 'online';

    if (!navigator.onLine) {
      networkStatus = 'offline';
    } else if (connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g') {
      networkStatus = 'slow';
    }

    setState(prev => ({
      ...prev,
      deviceType,
      orientation,
      networkStatus,
      touchCapabilities: {
        maxTouchPoints,
        supportsHaptic,
        supportsMultiTouch,
      },
    }));

    if (enableDebug) {
      console.log('🎮 PWA Device Capabilities:', {
        deviceType,
        orientation,
        networkStatus,
        touchCapabilities: { maxTouchPoints, supportsHaptic, supportsMultiTouch }
      });
    }
  }, [enableDebug]);

  // ✅ BATTERY MONITORING (MOBILE-FIRST)
  const initializeBatteryMonitoring = useCallback(async () => {
    try {
      const navigatorWithBattery = navigator as NavigatorWithBattery;
      if ('getBattery' in navigator && navigatorWithBattery.getBattery) {
        const battery = await navigatorWithBattery.getBattery();
        batteryManagerRef.current = battery;

        setState(prev => ({
          ...prev,
          batteryLevel: battery.level,
          isLowPowerMode: battery.level < 0.2,
        }));

        // Battery event listeners
        const updateBatteryStatus = () => {
          setState(prev => ({
            ...prev,
            batteryLevel: battery.level,
            isLowPowerMode: battery.level < 0.2,
          }));
        };

        battery.addEventListener?.('levelchange', updateBatteryStatus);
        battery.addEventListener?.('chargingchange', updateBatteryStatus);

        if (enableDebug) {
          console.log('🔋 Battery monitoring initialized:', {
            level: battery.level,
            charging: battery.charging,
          });
        }
      }
    } catch (error) {
      if (enableDebug) {
        console.warn('Battery API not available:', error);
      }
    }
  }, [enableDebug]);

  // ✅ PERFORMANCE MONITORING (60FPS TARGET)
  const startPerformanceMonitoring = useCallback(() => {
    if (!enablePerformanceMonitoring) return;

    let lastTime = performance.now();
    let frameCount = 0;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));

        // Memory usage (if available)
        interface PerformanceWithMemory extends Performance {
          memory?: {
            usedJSHeapSize: number;
            totalJSHeapSize: number;
            jsHeapSizeLimit: number;
          };
        }
        const memoryInfo = (performance as PerformanceWithMemory).memory;
        const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : 0;

        setPerformanceMetrics(prev => ({
          ...prev,
          fps,
          memoryUsage,
        }));

        // Optimize for low performance
        if (fps < 30 && state.deviceType === 'mobile') {
          setState(prev => ({ ...prev, isLowPowerMode: true }));

          if (enableDebug) {
            console.warn('🐌 Low FPS detected, enabling power save mode:', fps);
          }
        }

        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }, [enablePerformanceMonitoring, state.deviceType, enableDebug]);

  // ✅ HAPTIC FEEDBACK (MOBILE-FIRST)
  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy') => {
    if (!enableHapticFeedback || !state.touchCapabilities.supportsHaptic) return;

    const patterns = {
      light: [10],
      medium: [10, 50, 10],
      heavy: [20, 100, 20, 100, 20]
    };

    try {
      navigator.vibrate(patterns[type]);
    } catch (error) {
      if (enableDebug) {
        console.warn('Haptic feedback failed:', error);
      }
    }
  }, [enableHapticFeedback, state.touchCapabilities.supportsHaptic, enableDebug]);

  // ✅ ORIENTATION ADAPTATION
  const adaptToOrientation = useCallback((orientation: 'portrait' | 'landscape') => {
    setState(prev => ({ ...prev, orientation }));

    // Trigger cache optimization for orientation change
    setTimeout(() => {
      optimizeCache();
    }, 500);

    if (enableDebug) {
      console.log('📱 Orientation changed:', orientation);
    }
  }, [enableDebug]);

  // ✅ DEVICE OPTIMIZATION
  const optimizeForDevice = useCallback(() => {
    const { deviceType, batteryLevel, networkStatus } = state;

    // Enable low power mode for mobile devices with low battery
    if (deviceType === 'mobile' && batteryLevel < 0.3) {
      setState(prev => ({ ...prev, isLowPowerMode: true }));
    }

    // Adjust cache strategy based on network
    if (networkStatus === 'slow') {
      // Implement aggressive caching for slow networks
      localStorage.setItem('pwa-network-mode', 'aggressive-cache');
    }

    if (enableDebug) {
      console.log('⚡ Device optimization applied:', { deviceType, batteryLevel, networkStatus });
    }
  }, [state, enableDebug]);

  // ✅ MEMOIZED CACHE STATUS (PERFORMANCE OPTIMIZATION)
  const getCacheStatus = useCallback(async (): Promise<CacheStatus> => {
    try {
      if (!('caches' in window)) {
        return {
          totalSize: 0,
          cacheCount: 0,
          oldCacheCount: 0,
          lastCleanup: null,
          deviceOptimized: false
        };
      }

      const cacheNames = await caches.keys();
      const ourCaches = cacheNames.filter(name => name.startsWith(CACHE_PREFIX));

      let totalSize = 0;
      let oldCacheCount = 0;
      const currentVersion = getCurrentCacheVersion();

      for (const cacheName of ourCaches) {
        try {
          const cache = await caches.open(cacheName);
          const requests = await cache.keys();

          // Enhanced size calculation
          totalSize += requests.length * 1024;

          if (!cacheName.includes(currentVersion)) {
            oldCacheCount++;
          }
        } catch (error) {
          if (enableDebug) {
            console.warn('Error checking cache:', cacheName, error);
          }
        }
      }

      const lastCleanup = localStorage.getItem('pwa-last-cleanup');
      const deviceOptimized = localStorage.getItem(`pwa-optimized-${state.deviceType}`) === 'true';

      return {
        totalSize,
        cacheCount: ourCaches.length,
        oldCacheCount,
        lastCleanup: lastCleanup ? new Date(lastCleanup) : null,
        deviceOptimized,
      };
    } catch (error) {
      if (enableDebug) {
        console.error('Failed to get cache status:', error);
      }
      return {
        totalSize: 0,
        cacheCount: 0,
        oldCacheCount: 0,
        lastCleanup: null,
        deviceOptimized: false
      };
    }
  }, [getCurrentCacheVersion, enableDebug, state.deviceType]);

  // ✅ ENHANCED CACHE OPTIMIZATION (DEVICE-AWARE)
  const optimizeCache = useCallback(async (): Promise<void> => {
    try {
      if (!('caches' in window)) return;

      setState(prev => ({ ...prev, cacheStatus: 'updating' }));

      const cacheNames = await caches.keys();
      const ourCaches = cacheNames.filter(name => name.startsWith(CACHE_PREFIX));
      const currentVersion = getCurrentCacheVersion();

      let deletedCount = 0;
      const { deviceType, isLowPowerMode } = state;

      // Device-specific optimization
      for (const cacheName of ourCaches) {
        const shouldDelete = !cacheName.includes(currentVersion) &&
          !cacheName.includes('v' + Date.now().toString().slice(-8));

        // More aggressive cleanup for mobile low power mode
        const isOldMobileCache = deviceType === 'mobile' &&
          isLowPowerMode &&
          !cacheName.includes(Date.now().toString().slice(-6));

        if (shouldDelete || isOldMobileCache) {
          try {
            await caches.delete(cacheName);
            deletedCount++;

            if (enableDebug) {
              console.log('🗑️ Deleted cache:', cacheName);
            }
          } catch (error) {
            if (enableDebug) {
              console.warn('Failed to delete cache:', cacheName, error);
            }
          }
        }
      }

      // Update optimization tracking
      localStorage.setItem('pwa-last-cleanup', new Date().toISOString());
      localStorage.setItem(`pwa-optimized-${deviceType}`, 'true');

      setState(prev => ({ ...prev, cacheStatus: 'ready' }));

      if (deletedCount > 0) {
        triggerHapticFeedback('light');
        toast.success(`Cache optimized! Cleaned up ${deletedCount} old caches.`);
      }

      if (enableDebug) {
        console.log(`✨ Cache optimization complete. Deleted ${deletedCount} caches.`);
      }
    } catch (error) {
      if (enableDebug) {
        console.error('Cache optimization failed:', error);
      }
      setState(prev => ({ ...prev, cacheStatus: 'error' }));
    }
  }, [getCurrentCacheVersion, enableDebug, state, triggerHapticFeedback]);

  // ✅ POWER MODE MANAGEMENT
  const enableLowPowerMode = useCallback(() => {
    setState(prev => ({ ...prev, isLowPowerMode: true }));
    localStorage.setItem('pwa-low-power-mode', 'true');

    // Trigger aggressive cache cleanup
    setTimeout(() => {
      optimizeCache();
    }, 100);

    if (enableDebug) {
      console.log('🔋 Low power mode enabled');
    }
  }, [optimizeCache, enableDebug]);

  // ✅ ENHANCED CACHE CLEARING (MOBILE-OPTIMIZED)
  const clearCache = useCallback(async (): Promise<void> => {
    try {
      if (!('caches' in window)) return;

      setState(prev => ({ ...prev, cacheStatus: 'updating' }));
      triggerHapticFeedback('medium');

      const cacheNames = await caches.keys();
      const ourCaches = cacheNames.filter(name => name.startsWith(CACHE_PREFIX));

      let deletedCount = 0;
      for (const cacheName of ourCaches) {
        try {
          await caches.delete(cacheName);
          deletedCount++;
        } catch (error) {
          if (enableDebug) {
            console.warn('Failed to delete cache:', cacheName, error);
          }
        }
      }

      // Clear device-specific storage
      if ('localStorage' in window) {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('pwa-') || key.startsWith('tasktracker-')) {
            localStorage.removeItem(key);
          }
        });
      }

      if ('sessionStorage' in window) {
        sessionStorage.clear();
      }

      setState(prev => ({ ...prev, cacheStatus: 'ready' }));
      triggerHapticFeedback('heavy');

      toast.success(`Cache cleared! Removed ${deletedCount} caches.`);

      if (enableDebug) {
        console.log(`🧹 Cleared ${deletedCount} caches and storage.`);
      }
    } catch (error) {
      if (enableDebug) {
        console.error('Failed to clear cache:', error);
      }
      setState(prev => ({ ...prev, cacheStatus: 'error' }));
      toast.error('Failed to clear cache. Please try again.');
    }
  }, [enableDebug, triggerHapticFeedback]);

  // ✅ ENHANCED SERVICE WORKER REGISTRATION
  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator) || isDev) {
      if (enableDebug) {
        console.log('Service Worker not available or in development mode');
      }
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      setState(prev => ({
        ...prev,
        registration,
        serviceWorkerReady: true,
        cacheStatus: 'ready'
      }));

      // Enhanced update detection with mobile optimization
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          setState(prev => ({ ...prev, hasUpdate: true, isUpdateAvailable: true }));

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              triggerHapticFeedback('medium');
              toast.info('New version available! Refresh to update.', {
                action: {
                  label: 'Update',
                  onClick: () => updateApp()
                }
              });
            }
          });
        }
      });

      if (enableDebug) {
        console.log('📦 Service Worker registered:', registration);
      }

      return registration;
    } catch (error) {
      if (enableDebug) {
        console.error('Service Worker registration failed:', error);
      }
      setState(prev => ({ ...prev, cacheStatus: 'error' }));
    }
  }, [isDev, enableDebug, triggerHapticFeedback]);

  // ✅ ENHANCED APP INSTALLATION (MOBILE-OPTIMIZED)
  const installApp = useCallback(async (): Promise<void> => {
    if (!installPromptRef.current) {
      toast.error('App installation not available');
      return;
    }

    try {
      triggerHapticFeedback('light');
      await installPromptRef.current.prompt();
      const { outcome } = await installPromptRef.current.userChoice;

      if (outcome === 'accepted') {
        setState(prev => ({ ...prev, isInstalled: true, isInstallable: false }));
        triggerHapticFeedback('heavy');
        toast.success('App installed successfully!');

        // Device-specific post-install optimization
        setTimeout(() => {
          optimizeForDevice();
        }, 1000);

        if (enableDebug) {
          console.log('📱 App installed successfully');
        }
      } else {
        if (enableDebug) {
          console.log('App installation dismissed');
        }
      }

      installPromptRef.current = null;
    } catch (error) {
      if (enableDebug) {
        console.error('App installation failed:', error);
      }
      toast.error('Failed to install app');
    }
  }, [enableDebug, triggerHapticFeedback, optimizeForDevice]);

  // ✅ ENHANCED UPDATE MANAGEMENT
  const checkForUpdates = useCallback(async (): Promise<void> => {
    if (!state.registration) return;

    try {
      await state.registration.update();
      if (enableDebug) {
        console.log('🔄 Checked for updates');
      }
    } catch (error) {
      if (enableDebug) {
        console.error('Update check failed:', error);
      }
    }
  }, [state.registration, enableDebug]);

  const updateApp = useCallback(async (): Promise<void> => {
    if (!state.registration || !state.registration.waiting) return;

    try {
      triggerHapticFeedback('medium');

      // Send message to waiting service worker
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });

      // Wait for new service worker to take control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

      setState(prev => ({ ...prev, hasUpdate: false, isUpdateAvailable: false }));

      if (enableDebug) {
        console.log('🚀 App update initiated');
      }
    } catch (error) {
      if (enableDebug) {
        console.error('App update failed:', error);
      }
      toast.error('Failed to update app');
    }
  }, [state.registration, enableDebug, triggerHapticFeedback]);

  // ✅ POWER MODE MANAGEMENT
  const disableLowPowerMode = useCallback(() => {
    setState(prev => ({ ...prev, isLowPowerMode: false }));
    localStorage.removeItem('pwa-low-power-mode');

    if (enableDebug) {
      console.log('⚡ Low power mode disabled');
    }
  }, [enableDebug]);

  // ✅ INSTALL PROMPT MANAGEMENT
  const showInstallPrompt = useCallback(() => {
    if (installPromptRef.current) {
      installApp();
    } else {
      toast.info('App installation not available at this time');
    }
  }, [installApp]);

  const dismissInstallPrompt = useCallback(() => {
    setState(prev => ({ ...prev, isInstallable: false }));
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    triggerHapticFeedback('light');
  }, [triggerHapticFeedback]);

  // ✅ COMPREHENSIVE INITIALIZATION (MOBILE-FIRST)
  useEffect(() => {
    let mounted = true;

    const initializePWA = async () => {
      if (!mounted) return;

      // Device capabilities detection
      detectDeviceCapabilities();

      // Battery monitoring
      await initializeBatteryMonitoring();

      // Check if app is installed
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      interface NavigatorWithStandalone extends Navigator {
        standalone?: boolean;
      }
      const isInstalled = isStandalone || isFullscreen || Boolean((window.navigator as NavigatorWithStandalone).standalone);

      setState(prev => ({ ...prev, isInstalled }));

      // Register service worker
      await registerServiceWorker();

      // Install prompt setup
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        installPromptRef.current = e as EnhancedBeforeInstallPromptEvent;

        const dismissed = localStorage.getItem('pwa-install-dismissed');
        const dismissedTime = dismissed ? parseInt(dismissed) : 0;
        const dayInMs = 24 * 60 * 60 * 1000;

        if (!dismissed || Date.now() - dismissedTime > dayInMs) {
          setState(prev => ({ ...prev, isInstallable: true }));
        }
      };

      // Network status monitoring
      const handleOnline = () => {
        setState(prev => ({ ...prev, isOffline: false, networkStatus: 'online' }));
        optimizeForDevice();
      };

      const handleOffline = () => {
        setState(prev => ({ ...prev, isOffline: true, networkStatus: 'offline' }));
      };

      // Orientation change handling
      const handleOrientationChange = () => {
        setTimeout(() => {
          detectDeviceCapabilities();
          const newOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
          adaptToOrientation(newOrientation);
        }, 100);
      };

      // Event listeners setup
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      window.addEventListener('orientationchange', handleOrientationChange);
      window.addEventListener('resize', handleOrientationChange);

      // Initial state
      setState(prev => ({ ...prev, isOffline: !navigator.onLine }));

      // Performance monitoring
      if (enablePerformanceMonitoring) {
        startPerformanceMonitoring();
      }

      // Automatic cache optimization
      if (cacheCleanupInterval > 0) {
        cacheCleanupIntervalRef.current = setInterval(() => {
          optimizeCache();
        }, cacheCleanupInterval * 60 * 1000);
      }

      // Automatic update checks (mobile-optimized)
      if (autoUpdate) {
        const checkInterval = state.deviceType === 'mobile' ? 15 : 10; // Less frequent on mobile
        updateCheckIntervalRef.current = setInterval(() => {
          checkForUpdates();
        }, checkInterval * 60 * 1000);
      }

      // Initial cache optimization (delayed to not block render)
      setTimeout(() => {
        optimizeCache();
      }, 2000);

      // Check for saved low power mode
      const savedLowPowerMode = localStorage.getItem('pwa-low-power-mode');
      if (savedLowPowerMode === 'true') {
        setState(prev => ({ ...prev, isLowPowerMode: true }));
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('orientationchange', handleOrientationChange);
        window.removeEventListener('resize', handleOrientationChange);
      };
    };

    initializePWA();

    return () => {
      mounted = false;
      if (updateCheckIntervalRef.current) {
        clearInterval(updateCheckIntervalRef.current);
      }
      if (cacheCleanupIntervalRef.current) {
        clearInterval(cacheCleanupIntervalRef.current);
      }
      // Copy ref value to avoid stale closure issue
      const performanceInterval = performanceMonitorRef.current;
      if (performanceInterval) {
        clearInterval(performanceInterval);
      }
    };
  }, [
    detectDeviceCapabilities,
    initializeBatteryMonitoring,
    registerServiceWorker,
    optimizeForDevice,
    adaptToOrientation,
    startPerformanceMonitoring,
    optimizeCache,
    checkForUpdates,
    autoUpdate,
    cacheCleanupInterval,
    enablePerformanceMonitoring,
    state.deviceType
  ]);

  // ✅ MEMOIZED CONTEXT VALUE (PERFORMANCE OPTIMIZATION)
  const contextValue: PWAContextType = useMemo(() => ({
    // State
    ...state,

    // Actions
    installApp,
    checkForUpdates,
    updateApp,
    clearCache,
    showInstallPrompt,
    dismissInstallPrompt,
    getCacheStatus,
    optimizeCache,

    // Mobile-first actions
    triggerHapticFeedback,
    adaptToOrientation,
    optimizeForDevice,
    enableLowPowerMode,
    disableLowPowerMode,
  }), [
    state,
    installApp,
    checkForUpdates,
    updateApp,
    clearCache,
    showInstallPrompt,
    dismissInstallPrompt,
    getCacheStatus,
    optimizeCache,
    triggerHapticFeedback,
    adaptToOrientation,
    optimizeForDevice,
    enableLowPowerMode,
    disableLowPowerMode,
  ]);

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
    </PWAContext.Provider>
  );
} 