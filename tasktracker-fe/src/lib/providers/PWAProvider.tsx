'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { pwaService } from '@/lib/services/pwaService';
import { useToast } from '@/lib/hooks/useToast';

interface PWAContextType {
  isInstalled: boolean;
  canInstall: boolean;
  isOnline: boolean;
  installApp: () => Promise<boolean>;
  shareContent: (data: ShareData) => Promise<boolean>;
  requestNotifications: () => Promise<NotificationPermission>;
  showNotification: (title: string, options?: NotificationOptions) => Promise<void>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    // Initialize PWA status
    setIsInstalled(pwaService.isAppInstalled());
    
    // Check install prompt availability
    const checkInstallPrompt = () => {
      const prompt = pwaService.getInstallPrompt();
      setCanInstall(prompt.canInstall);
    };

    // Check initial install prompt
    checkInstallPrompt();

    // Listen for install prompt changes
    const handleBeforeInstallPrompt = () => {
      checkInstallPrompt();
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      showToast('App installed successfully! 🎉', 'success');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Monitor connection status
    const connectionStatus = pwaService.getConnectionStatus();
    setIsOnline(connectionStatus.online);

    const unsubscribeConnection = pwaService.onConnectionChange((online) => {
      setIsOnline(online);
      if (online) {
        showToast('Back online! 🌐', 'success');
      } else {
        showToast('You\'re offline. Limited functionality available.', 'warning');
      }
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      unsubscribeConnection();
    };
  }, [showToast]);

  const installApp = async (): Promise<boolean> => {
    try {
      const success = await pwaService.addToHomeScreen();
      if (success) {
        showToast('Installing app...', 'info');
      }
      return success;
    } catch (error) {
      console.error('Failed to install app:', error);
      showToast('Failed to install app', 'error');
      return false;
    }
  };

  const shareContent = async (data: ShareData): Promise<boolean> => {
    try {
      const success = await pwaService.shareContent(data);
      if (success) {
        showToast('Content shared successfully!', 'success');
      }
      return success;
    } catch (error) {
      console.error('Failed to share content:', error);
      showToast('Failed to share content', 'error');
      return false;
    }
  };

  const requestNotifications = async (): Promise<NotificationPermission> => {
    try {
      const permission = await pwaService.requestNotificationPermission();
      if (permission === 'granted') {
        showToast('Notifications enabled! 🔔', 'success');
        
        // Subscribe to push notifications
        await pwaService.subscribeToPushNotifications();
      } else if (permission === 'denied') {
        showToast('Notifications blocked. You can enable them in browser settings.', 'warning');
      }
      return permission;
    } catch (error) {
      console.error('Failed to request notifications:', error);
      showToast('Failed to enable notifications', 'error');
      return 'denied';
    }
  };

  const showNotification = async (title: string, options?: NotificationOptions): Promise<void> => {
    try {
      await pwaService.showNotification(title, options);
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  };

  const value: PWAContextType = {
    isInstalled,
    canInstall,
    isOnline,
    installApp,
    shareContent,
    requestNotifications,
    showNotification
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