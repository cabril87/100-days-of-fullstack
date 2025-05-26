'use client';

import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, X, Wifi, WifiOff } from 'lucide-react';
import { 
  initializeRealTimeNotifications, 
  onNewNotification, 
  onNotificationRead,
  onUnreadCountUpdated
} from '@/lib/services/notificationService';
import { notificationSignalRService } from '@/lib/services/notificationSignalRService';
import { Notification } from '@/lib/types/notification';

interface RealTimeNotificationWidgetProps {
  className?: string;
}

export default function RealTimeNotificationWidget({ className = '' }: RealTimeNotificationWidgetProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showWidget, setShowWidget] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (typeof window === 'undefined') {
      return;
    }

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      return;
    }

    // Initialize SignalR connection
    const initializeConnection = async () => {
      try {
        await initializeRealTimeNotifications();
        setIsConnected(notificationSignalRService.isConnected());
      } catch (error) {
        console.error('Failed to initialize real-time notifications:', error);
        setIsConnected(false);
      }
    };

    initializeConnection();

    // Subscribe to real-time events
    const newNotificationUnsubscribe = onNewNotification((notification) => {
      console.log('RealTimeWidget: New notification received:', notification);
      setRecentNotifications(prev => [notification, ...prev.slice(0, 4)]);
      setShowWidget(true);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowWidget(false);
      }, 5000);
    });

    const notificationReadUnsubscribe = onNotificationRead((notificationId) => {
      console.log('RealTimeWidget: Notification read:', notificationId);
      setRecentNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
    });

    const unreadCountUnsubscribe = onUnreadCountUpdated((count) => {
      console.log('RealTimeWidget: Unread count updated:', count);
      setUnreadCount(count);
    });

    // Monitor connection status
    const connectionCheckInterval = setInterval(() => {
      setIsConnected(notificationSignalRService.isConnected());
    }, 5000);

    // Cleanup
    return () => {
      newNotificationUnsubscribe();
      notificationReadUnsubscribe();
      unreadCountUnsubscribe();
      clearInterval(connectionCheckInterval);
    };
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-[9999] ${className}`}>
      {/* Connection Status Indicator */}
      <div className="mb-2 flex justify-end">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
          isConnected 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {isConnected ? (
            <>
              <Wifi className="w-3 h-3" />
              <span>Real-time Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              <span>Offline Mode</span>
            </>
          )}
        </div>
      </div>

      {/* Notification Widget */}
      {showWidget && recentNotifications.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden max-w-sm animate-in slide-in-from-right-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 px-4 py-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <span className="font-semibold">Live Updates</span>
              </div>
              <button
                onClick={() => setShowWidget(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {recentNotifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-all duration-200 ${
                  !notification.isRead 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm line-clamp-2">
                      {notification.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                      {!notification.isRead && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          {unreadCount > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-2 text-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Floating Action Button for Manual Toggle */}
      {!showWidget && recentNotifications.length > 0 && (
        <button
          onClick={() => setShowWidget(true)}
          className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
} 