'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/lib/hooks/useToast';

interface PWAContextType {
  isInstalled: boolean;
  canInstall: boolean;
  isOnline: boolean;
  swRegistration: ServiceWorkerRegistration | null;
  installApp: () => Promise<boolean>;
  shareContent: (data: ShareData) => Promise<boolean>;
  requestNotifications: () => Promise<NotificationPermission>;
  showNotification: (title: string, options?: NotificationOptions) => Promise<void>;
  updateApp: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const { showToast } = useToast();

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // TEMPORARILY DISABLE ALL SERVICE WORKER FUNCTIONALITY
    console.log('PWA: Service worker functionality disabled to fix MIME type issue');

    // Initialize basic PWA features (no service worker)
    initializePWA();
    setupInstallPrompt();
    setupConnectionMonitoring();

    return () => {
      // Cleanup event listeners
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const initializePWA = () => {
    // Check if app is already installed
    setIsInstalled(isAppInstalled());
  };

  const isAppInstalled = (): boolean => {
    // Check if running in standalone mode (installed as PWA)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }

    // Check if running as PWA on iOS
    if ((window.navigator as any).standalone === true) {
      return true;
    }

    // Check for related applications (Chrome)
    if ('getInstalledRelatedApps' in navigator) {
      (navigator as any).getInstalledRelatedApps().then((relatedApps: any[]) => {
        if (relatedApps.length > 0) {
          setIsInstalled(true);
        }
      });
    }

    return false;
  };

  const setupInstallPrompt = () => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
      console.log('PWA: Install prompt available');
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
      showToast('App installed successfully! 🎉', 'success');
      console.log('PWA: App installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
  };

  const setupConnectionMonitoring = () => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Back online! 🌐', 'success');
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast('You\'re offline. Limited functionality available.', 'warning');
    };

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  };

  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      console.log('PWA: Service workers not supported');
      return;
    }

    try {
      // next-pwa handles registration automatically, but we can listen for updates
      const registration = await navigator.serviceWorker.ready;
      setSwRegistration(registration);
      
      console.log('PWA: Service worker ready', registration);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('PWA: New service worker available');
              showUpdateAvailable();
            }
          });
        }
      });

    } catch (error) {
      console.error('PWA: Service worker registration failed', error);
    }
  };

  const showUpdateAvailable = () => {
    showToast(
      'App update available! Refresh to get the latest version.',
      'info',
      {
        action: {
          label: 'Update',
          onClick: updateApp,
        },
      }
    );
  };

  const updateApp = async (): Promise<void> => {
    if (!swRegistration?.waiting) return;

    try {
      // Tell the waiting service worker to skip waiting
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page to activate the new service worker
      window.location.reload();
    } catch (error) {
      console.error('PWA: App update failed', error);
      showToast('Failed to update app', 'error');
    }
  };

  const installApp = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.log('PWA: No install prompt available');
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA: User accepted install prompt');
        setDeferredPrompt(null);
        setCanInstall(false);
        showToast('Installing app...', 'info');
        return true;
      } else {
        console.log('PWA: User dismissed install prompt');
        return false;
      }
    } catch (error) {
      console.error('PWA: Install prompt failed', error);
      showToast('Failed to install app', 'error');
      return false;
    }
  };

  const shareContent = async (data: ShareData): Promise<boolean> => {
    if ('share' in navigator) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.log('PWA: Share cancelled or failed', error);
        return false;
      }
    }

    // Fallback to clipboard
    if ('clipboard' in navigator && data.url) {
      try {
        await navigator.clipboard.writeText(data.url);
        showToast('Link copied to clipboard!', 'success');
        return true;
      } catch (error) {
        console.error('PWA: Clipboard write failed', error);
        return false;
      }
    }

    return false;
  };

  const requestNotifications = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      console.log('PWA: Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      showToast('Notifications are blocked. Enable them in browser settings.', 'warning');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        showToast('Notifications enabled! 🔔', 'success');
      } else if (permission === 'denied') {
        showToast('Notifications blocked. You can enable them in browser settings.', 'warning');
      }
      
      return permission;
    } catch (error) {
      console.error('PWA: Failed to request notifications', error);
      return 'denied';
    }
  };

  const showNotification = async (title: string, options?: NotificationOptions): Promise<void> => {
    const permission = await requestNotifications();
    if (permission !== 'granted') {
      console.log('PWA: Notification permission not granted');
      return;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'tasktracker',
      requireInteraction: false,
      ...options
    };

    try {
      if (swRegistration) {
        await swRegistration.showNotification(title, defaultOptions);
      } else {
        new Notification(title, defaultOptions);
      }
    } catch (error) {
      console.error('PWA: Failed to show notification', error);
    }
  };

  const handleBeforeInstallPrompt = () => {}; // Placeholder for cleanup
  const handleAppInstalled = () => {}; // Placeholder for cleanup
  const handleOnline = () => {}; // Placeholder for cleanup
  const handleOffline = () => {}; // Placeholder for cleanup

  const value: PWAContextType = {
    isInstalled,
    canInstall,
    isOnline,
    swRegistration,
    installApp,
    shareContent,
    requestNotifications,
    showNotification,
    updateApp,
  };

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA(): PWAContextType {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
} 