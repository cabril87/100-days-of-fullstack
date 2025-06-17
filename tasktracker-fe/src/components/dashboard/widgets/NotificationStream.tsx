'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Notification Stream Widget
 * Displays real-time notifications with priority badges and action buttons.
 * Connects to the main SignalR hub for live notification updates.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Users,
  Trophy,
  Calendar,
  Clock
} from 'lucide-react';
import { useMainHubConnection } from '@/lib/hooks/useSignalRConnection';
import { NotificationItem } from '@/lib/types/celebrations';

interface NotificationStreamProps {
  className?: string;
  maxDisplay?: number;
}

export function NotificationStream({ 
  className = '', 
  maxDisplay = 5 
}: NotificationStreamProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Connect to SignalR for real-time notifications
  const { isConnected } = useMainHubConnection({
    onTaskCompleted: (event) => {
      addNotification({
        type: 'success',
        title: 'Task Completed! 🎉',
        message: `You earned ${event.pointsEarned} points! Keep up the great work!`,
        priority: 'medium',
        timestamp: new Date(event.timestamp)
      });
    },

    onAchievementUnlocked: (event) => {
      addNotification({
        type: 'achievement',
        title: 'Achievement Unlocked! 🏆',
        message: `"${event.achievementName}" - You earned ${event.points} points!`,
        priority: 'high',
        timestamp: new Date(event.timestamp),
        actionUrl: '/gamification',
        actionText: 'View Achievement'
      });
    },

    onLevelUp: (event) => {
      addNotification({
        type: 'achievement',
        title: 'Level Up! ⭐',
        message: `Congratulations! You've reached Level ${event.newLevel}!`,
        priority: 'high',
        timestamp: new Date(event.timestamp),
        actionUrl: '/gamification',
        actionText: 'View Progress'
      });
    }
  });

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Add new notification
  const addNotification = useCallback((newNotification: Omit<NotificationItem, 'id' | 'isRead'>) => {
    const notification: NotificationItem = {
      ...newNotification,
      id: `notification-${Date.now()}-${Math.random()}`,
      isRead: false
    };

    setNotifications(prev => [notification, ...prev.slice(0, maxDisplay - 1)]);
    setUnreadCount(prev => prev + 1);

    // Auto-mark as read after 10 seconds for non-high priority
    if (notification.priority !== 'high') {
      setTimeout(() => {
        markAsRead(notification.id);
      }, 10000);
    }
  }, [maxDisplay, markAsRead]);

  // Remove notification
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  // Get notification icon
  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'achievement':
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'task':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'family':
        return <Users className="h-4 w-4 text-purple-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: NotificationItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20';
      case 'medium':
        return 'border-yellow-300 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-900/20';
      default:
        return 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-900/20';
    }
  };

  // Format timestamp
  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - timestamp.getTime());
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.ceil(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return timestamp.toLocaleDateString();
  };

  // Load initial notifications (mock data for demo)
  useEffect(() => {
    const loadInitialNotifications = () => {
      const sampleNotifications: NotificationItem[] = [
        {
          id: 'sample-1',
          type: 'achievement',
          title: 'Welcome Achievement!',
          message: 'You&apos;ve unlocked the &quot;Getting Started&quot; achievement!',
          timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
          isRead: false,
          priority: 'medium',
          actionUrl: '/gamification',
          actionText: 'View Achievement'
        }
      ];
      
      setNotifications(sampleNotifications);
      setUnreadCount(sampleNotifications.filter(n => !n.isRead).length);
    };

    // Only load sample data if no real notifications
    if (notifications.length === 0) {
      loadInitialNotifications();
    }
  }, [notifications.length]);

  return (
    <Card className={`${className} transition-all duration-300 hover:shadow-lg`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Bell className="h-4 w-4 text-blue-500" />
          Notifications
          {/* Real-time connection indicator */}
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
        </CardTitle>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllNotifications}
              className="text-xs h-6 px-2"
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* No Notifications State */}
          {notifications.length === 0 && (
            <div className="text-center py-8 space-y-3">
              <div className="text-4xl opacity-50">🔔</div>
              <div className="text-sm text-muted-foreground">
                No notifications yet
              </div>
              <div className="text-xs text-muted-foreground">
                You&apos;ll receive live updates when you complete tasks and reach milestones!
              </div>
            </div>
          )}

          {/* Notification List */}
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`
                relative p-3 rounded-lg border transition-all duration-300 hover:shadow-sm
                ${getPriorityColor(notification.priority)}
                ${!notification.isRead ? 'ring-2 ring-blue-200 dark:ring-blue-700' : ''}
              `}
            >
              {/* Unread indicator */}
              {!notification.isRead && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              )}

              <div className="flex items-start gap-3">
                {/* Notification Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Notification Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">
                      {notification.title}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        notification.priority === 'high' ? 'border-red-400 text-red-600 dark:text-red-400' :
                        notification.priority === 'medium' ? 'border-yellow-400 text-yellow-600 dark:text-yellow-400' :
                        'border-gray-400 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {notification.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(notification.timestamp)}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {notification.actionUrl && notification.actionText && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-6 px-2"
                          onClick={() => {
                            window.location.href = notification.actionUrl!;
                            markAsRead(notification.id);
                          }}
                        >
                          {notification.actionText}
                        </Button>
                      )}
                      
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs h-6 px-2"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeNotification(notification.id)}
                        className="text-xs h-6 px-2 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Mark All Read Button */}
          {unreadCount > 1 && (
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center gap-2"
              onClick={markAllAsRead}
            >
              <CheckCircle className="h-3 w-3" />
              Mark All as Read ({unreadCount})
            </Button>
          )}

          {/* Connection Status */}
          {!isConnected && (
            <div className="text-xs text-amber-600 dark:text-amber-400 text-center py-2">
              ⚠️ Offline - New notifications will appear when reconnected
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 