import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationService } from '@/lib/services/notificationService';
import { useMainHubConnection } from '@/lib/hooks/useSignalRConnection';
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
  const { isAuthenticated } = useAuth();
  const shouldConnectRef = useRef<boolean>(false);
  
  // Update connection flag when authentication changes
  useEffect(() => {
    shouldConnectRef.current = isAuthenticated;
  }, [isAuthenticated]);

  // Create SignalR connection with conditional handlers
  const signalREventHandlers = isAuthenticated ? {
    onReceiveNotification: () => {
      // Increment count when new notification arrives
      setUnreadCount(prev => prev + 1);
    },
    onUnreadCountUpdated: (event: any) => {
      // Update count when server sends updated count
      setUnreadCount(event.unreadCount);
    }
  } : {};

  // Only use SignalR connection when authenticated
  const signalRConnection = useMainHubConnection(signalREventHandlers);

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
    if (isAuthenticated) {
      fetchUnreadCount();
    } else {
      setUnreadCount(0);
      setError(null);
    }
  }, [isAuthenticated, fetchUnreadCount]);

  // Listen for real-time notification count updates via SignalR
  useEffect(() => {
    if (!signalRConnection.isConnected || !isAuthenticated) return;

    // Refresh count periodically as a fallback
    const interval = setInterval(() => {
      if (isAuthenticated && shouldConnectRef.current) {
        fetchUnreadCount();
      }
    }, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, [signalRConnection.isConnected, isAuthenticated, fetchUnreadCount]);

  return {
    unreadCount,
    isLoading,
    error,
    refreshCount
  };
}; 