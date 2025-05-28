'use client';

import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, X, Wifi, WifiOff, Zap, Shield, Activity } from 'lucide-react';
import { 
  initializeRealTimeNotifications, 
  onNewNotification, 
  onNotificationRead,
  onUnreadCountUpdated
} from '@/lib/services/notificationService';
import { notificationSignalRService } from '@/lib/services/notificationSignalRService';
import { Notification } from '@/lib/types/notification';
import { motion, AnimatePresence } from 'framer-motion';

interface RealTimeNotificationWidgetProps {
  className?: string;
}

export default function RealTimeNotificationWidget({ className = '' }: RealTimeNotificationWidgetProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [lastConnectionTime, setLastConnectionTime] = useState<Date | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (typeof window === 'undefined') {
      return;
    }

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      return;
    }

    let isMounted = true;
    let connectionCheckInterval: NodeJS.Timeout;

    // Initialize SignalR connection
    const initializeConnection = async () => {
      try {
        if (!isMounted) return;
        
        setConnectionAttempts(prev => prev + 1);
        await initializeRealTimeNotifications();
        
        if (!isMounted) return;
        
        const connected = notificationSignalRService.isConnected();
        setIsConnected(connected);
        if (connected) {
          setLastConnectionTime(new Date());
        }
      } catch (error) {
        console.error('Failed to initialize real-time notifications:', error);
        if (isMounted) {
        setIsConnected(false);
        }
      }
    };

    initializeConnection();

    // Subscribe to real-time events
    const newNotificationUnsubscribe = onNewNotification((notification) => {
      if (!isMounted) return;
      console.log('RealTimeWidget: New notification received:', notification);
      setRecentNotifications(prev => [notification, ...prev.slice(0, 4)]);
      setShowNotifications(true);
      
      // Auto-hide after 8 seconds
      setTimeout(() => {
        if (isMounted) {
        setShowNotifications(false);
        }
      }, 8000);
    });

    const notificationReadUnsubscribe = onNotificationRead((notificationId) => {
      if (!isMounted) return;
      console.log('RealTimeWidget: Notification read:', notificationId);
      setRecentNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
    });

    const unreadCountUnsubscribe = onUnreadCountUpdated((count) => {
      if (!isMounted) return;
      console.log('RealTimeWidget: Unread count updated:', count);
      setUnreadCount(count);
    });

    // Monitor connection status
    connectionCheckInterval = setInterval(() => {
      if (!isMounted) return;
      const connected = notificationSignalRService.isConnected();
      setIsConnected(connected);
    }, 3000);

    // Cleanup
    return () => {
      isMounted = false;
      newNotificationUnsubscribe();
      notificationReadUnsubscribe();
      unreadCountUnsubscribe();
      if (connectionCheckInterval) {
      clearInterval(connectionCheckInterval);
      }
    };
  }, []); // Remove lastConnectionTime dependency to prevent infinite loop

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'security':
        return <Shield className="w-5 h-5 text-purple-500" />;
      case 'achievement':
        return <Zap className="w-5 h-5 text-amber-500" />;
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

  const getConnectionStatusColor = () => {
    if (isConnected) return 'from-green-500 to-emerald-600';
    return 'from-red-500 to-rose-600';
  };

  const getConnectionStatusText = () => {
    if (isConnected) return 'Real-time Active';
    return 'Offline Mode';
  };

  const getConnectionIcon = () => {
    if (isConnected) return <Wifi className="w-4 h-4" />;
    return <WifiOff className="w-4 h-4" />;
  };

  return (
    <div className={`fixed bottom-4 right-4 z-[9999] ${className}`}>
      <AnimatePresence mode="wait">
        {/* Show notifications when available, otherwise show connection status */}
        {showNotifications && recentNotifications.length > 0 ? (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden max-w-sm backdrop-blur-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Gamification Header */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 px-4 py-3 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 animate-pulse"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Bell className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm">Live Updates</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {recentNotifications.slice(0, 3).map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-all duration-200 ${
                    !notification.isRead 
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-l-4 border-l-blue-500' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm line-clamp-2">
                        {notification.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm">
                            NEW
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer with Stats */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 px-4 py-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  {unreadCount} unread • {recentNotifications.length} recent
                </span>
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <Activity className="w-3 h-3" />
                  <span className="font-bold">LIVE</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Connection Status Widget */
          <motion.div
            key="connection"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative"
          >
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border transition-all duration-500 backdrop-blur-xl ${
              isConnected 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-200 dark:border-green-700' 
                : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 border-red-200 dark:border-red-700'
            }`}>
              {/* Animated Connection Icon */}
              <div className={`p-2 rounded-xl bg-gradient-to-r ${getConnectionStatusColor()} text-white shadow-lg`}>
                <motion.div
                  animate={isConnected ? { rotate: [0, 10, -10, 0] } : { opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {getConnectionIcon()}
                </motion.div>
              </div>

              {/* Status Text */}
              <div className="flex-1">
                <div className={`text-sm font-bold ${
                  isConnected ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                }`}>
                  {getConnectionStatusText()}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {isConnected 
                    ? `Connected ${lastConnectionTime ? formatTimeAgo(lastConnectionTime.toISOString()) : ''}`
                    : `Attempts: ${connectionAttempts}`
                  }
                </div>
              </div>

              {/* Pulse Animation for Connected State */}
              {isConnected && (
                <motion.div
                  className="w-3 h-3 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>

            {/* Gamification Enhancement - XP Bar for Connection Quality */}
            {isConnected && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: 0.5 }}
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-b-2xl"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 