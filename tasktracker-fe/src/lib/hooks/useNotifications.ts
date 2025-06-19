import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '@/lib/services/notificationService';
import { useSignalRConnectionManager } from '@/lib/hooks/useSignalRConnectionManager';
import { useAuth } from '@/lib/providers/AuthProvider';

export interface UseNotificationsReturn {
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  refreshCount: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isReady } = useAuth();
  
  // Create stable SignalR event handlers that check authentication internally
  const signalREventHandlers = {
    onReceiveNotification: () => {
      // Only increment count when authenticated
      if (isAuthenticated && isReady) {
        setUnreadCount(prev => prev + 1);
      }
    },
    onUnreadCountUpdated: (event: { userId: number; unreadCount: number }) => {
      // Only update count when authenticated
      if (isAuthenticated && isReady) {
        setUnreadCount(event.unreadCount);
      }
    }
  };

  // Use the unified connection manager with stable component ID
  const signalRConnection = useSignalRConnectionManager(
    'notifications', 
    signalREventHandlers
  );

  // Fetch unread count from API
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch unread notification count:', err);
      setError('Failed to load notification count');
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Refresh count function for manual refresh
  const refreshCount = useCallback(async () => {
    await fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Initial fetch on mount
  useEffect(() => {
    if (isAuthenticated && isReady) {
      fetchUnreadCount();
    } else {
      setUnreadCount(0);
      setError(null);
    }
  }, [isAuthenticated, isReady, fetchUnreadCount]);

  // Fetch count when SignalR connects (only when authenticated)
  useEffect(() => {
    if (signalRConnection.isConnected && isAuthenticated && isReady) {
      fetchUnreadCount();
    }
  }, [signalRConnection.isConnected, isAuthenticated, isReady, fetchUnreadCount]);

  return {
    unreadCount,
    isLoading,
    error,
    refreshCount
  };
}; 