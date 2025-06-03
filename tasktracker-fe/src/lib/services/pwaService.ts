import { BeforeInstallPromptEvent, PWAInstallPrompt } from '@/lib/types/pwa';

class PWAService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    if (typeof window === 'undefined') return;

    // Check if app is already installed
    this.checkInstallStatus();

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      console.log('PWA: Install prompt available');
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA: App installed');
      this.isInstalled = true;
      this.deferredPrompt = null;
    });

    // Register service worker (now handled by next-pwa)
    await this.registerServiceWorker();
  }

  private checkInstallStatus() {
    // Check if running in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      return;
    }

    // Check if running as PWA on iOS
    if ((window.navigator as any).standalone === true) {
      this.isInstalled = true;
      return;
    }

    // Check for related applications
    if ('getInstalledRelatedApps' in navigator) {
      (navigator as any).getInstalledRelatedApps().then((relatedApps: any[]) => {
        if (relatedApps.length > 0) {
          this.isInstalled = true;
        }
      });
    }
  }

  async registerServiceWorker(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.log('PWA: Service workers not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('PWA: Service worker registered', this.registration);

      // Listen for updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('PWA: New service worker available');
              this.showUpdateAvailable();
            }
          });
        }
      });

      return true;
    } catch (error) {
      console.error('PWA: Service worker registration failed', error);
      return false;
    }
  }

  private showUpdateAvailable() {
    // You could show a toast or modal here
    console.log('PWA: Update available - reload to get the latest version');
    
    // Auto-update after a delay (optional)
    setTimeout(() => {
      if (this.registration?.waiting) {
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }, 5000);
  }

  getInstallPrompt(): PWAInstallPrompt {
    return {
      canInstall: !!this.deferredPrompt && !this.isInstalled,
      install: async () => {
        if (!this.deferredPrompt) return false;

        try {
          await this.deferredPrompt.prompt();
          const choiceResult = await this.deferredPrompt.userChoice;
          
          if (choiceResult.outcome === 'accepted') {
            console.log('PWA: User accepted install prompt');
            this.deferredPrompt = null;
            return true;
          } else {
            console.log('PWA: User dismissed install prompt');
            return false;
          }
        } catch (error) {
          console.error('PWA: Install prompt failed', error);
          return false;
        }
      },
      dismiss: () => {
        this.deferredPrompt = null;
      }
    };
  }

  isAppInstalled(): boolean {
    return this.isInstalled;
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.log('PWA: Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    console.log('PWA: Notification permission:', permission);
    return permission;
  }

  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.log('PWA: No service worker registration');
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        )
      });

      console.log('PWA: Push subscription created', subscription);
      return subscription;
    } catch (error) {
      console.error('PWA: Push subscription failed', error);
      return null;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async showNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    if (!this.registration) {
      console.log('PWA: No service worker registration for notifications');
      return;
    }

    const permission = await this.requestNotificationPermission();
    if (permission !== 'granted') {
      console.log('PWA: Notification permission not granted');
      return;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      tag: 'tasktracker',
      requireInteraction: false,
      ...options
    };

    await this.registration.showNotification(title, defaultOptions);
  }

  async addToHomeScreen(): Promise<boolean> {
    const prompt = this.getInstallPrompt();
    if (prompt.canInstall) {
      return await prompt.install();
    }

    // For iOS Safari, show instructions
    if (this.isIOSSafari()) {
      this.showIOSInstallInstructions();
      return false;
    }

    console.log('PWA: Install not available');
    return false;
  }

  private isIOSSafari(): boolean {
    const userAgent = window.navigator.userAgent;
    return /iPad|iPhone|iPod/.test(userAgent) && /Safari/.test(userAgent) && !/CriOS|FxiOS|OPiOS|mercury/.test(userAgent);
  }

  private showIOSInstallInstructions() {
    // You could show a modal with iOS install instructions
    console.log('PWA: Show iOS install instructions');
    alert('To install this app on your iOS device, tap the Share button and then "Add to Home Screen".');
  }

  async shareContent(data: ShareData): Promise<boolean> {
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
        await (navigator as any).clipboard.writeText(data.url);
        console.log('PWA: URL copied to clipboard');
        return true;
      } catch (error) {
        console.error('PWA: Clipboard write failed', error);
        return false;
      }
    }

    return false;
  }

  getConnectionStatus(): { online: boolean; effectiveType?: string } {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    return {
      online: navigator.onLine,
      effectiveType: connection?.effectiveType
    };
  }

  onConnectionChange(callback: (online: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  async clearCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('PWA: Cache cleared');
    }
  }

  async getCacheSize(): Promise<number> {
    if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
      return 0;
    }

    try {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    } catch (error) {
      console.error('PWA: Failed to get cache size', error);
      return 0;
    }
  }

  async unregisterServiceWorker(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.log('PWA: Service workers not supported');
      return false;
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      let unregistered = false;

      for (const registration of registrations) {
        await registration.unregister();
        console.log('PWA: Service worker unregistered', registration);
        unregistered = true;
      }

      // Clear all caches
      await this.clearCache();
      
      this.registration = null;
      console.log('PWA: All service workers unregistered and cache cleared');
      return unregistered;
    } catch (error) {
      console.error('PWA: Service worker unregistration failed', error);
      return false;
    }
  }
}

// Create singleton instance
export const pwaService = new PWAService();
export default pwaService; 