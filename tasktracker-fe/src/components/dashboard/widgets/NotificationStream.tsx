'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Notification Stream Widget
 * Displays real-time notifications with priority badges and action buttons.
 * Enhanced with enterprise-quality gamification styles and animations.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  CheckCircle, 
  X, 
  Clock, 
  Info,
  AlertTriangle,
  Trophy,
  Users,
  Star,
  Crown,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useSignalRConnectionManager } from '@/lib/hooks/useSignalRConnectionManager';
import { useSignalRConnectionManagerStub } from '@/lib/hooks/useSignalRConnectionManagerStub';
import { NotificationStreamProps } from '@/lib/props/widgets/main.props';
import type { 
  BackendGamificationEventDTO,
  BackendTaskCompletionEventDTO
} from '@/lib/types/signalr';
import { 
  parseGamificationEvent,
  parseTaskCompletionEvent
} from '@/lib/types/signalr';
import type { NotificationItem } from '@/lib/types/system';

// Using NotificationItem from activity types

export function NotificationStream({ 
  maxDisplay = 5, 
  className = '',
  isConnected: sharedIsConnected
}: NotificationStreamProps) {
  // ✨ Use stub when shared connection is provided to prevent duplicate connections
  const shouldUseLocalConnection = sharedIsConnected === undefined;
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [celebratingNotifications, setCelebratingNotifications] = useState<Set<string>>(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // ✅ FIXED: Always call hooks unconditionally (React Rules of Hooks)
  
  // Always call both hooks, but only use the appropriate one
  const realConnection = useSignalRConnectionManager('notification-stream', {
    // Backend gamification events - matches ReceiveGamificationEvent
    onReceiveGamificationEvent: (event: BackendGamificationEventDTO) => {
      const parsedEvents = parseGamificationEvent(event);
      
      if (parsedEvents.achievementUnlocked) {
        addNotification({
          id: `achievement-${parsedEvents.achievementUnlocked.achievementId}-${Date.now()}`,
          type: 'achievement',
          title: '🏆 Achievement Unlocked!',
          message: `You've earned "${parsedEvents.achievementUnlocked.achievementName}" (+${parsedEvents.achievementUnlocked.points} points)`,
          timestamp: parsedEvents.achievementUnlocked.timestamp,
          isRead: false,
          priority: 'high',
          points: parsedEvents.achievementUnlocked.points,
          celebrationLevel: parsedEvents.achievementUnlocked.points >= 100 ? 'legendary' : 
                           parsedEvents.achievementUnlocked.points >= 50 ? 'epic' : 
                           parsedEvents.achievementUnlocked.points >= 25 ? 'rare' : 'common',
          autoHide: false,
          requiresAction: false
        });
      }
      
      if (parsedEvents.streakUpdated && parsedEvents.streakUpdated.currentStreak > parsedEvents.streakUpdated.previousStreak) {
        addNotification({
          id: `streak-${parsedEvents.streakUpdated.currentStreak}-${Date.now()}`,
          type: 'milestone',
          title: '🔥 Streak Updated!',
          message: `Amazing! You're on a ${parsedEvents.streakUpdated.currentStreak}-day productivity streak`,
          timestamp: parsedEvents.streakUpdated.timestamp,
          isRead: false,
          priority: parsedEvents.streakUpdated.currentStreak % 7 === 0 ? 'high' : 'medium',
          celebrationLevel: parsedEvents.streakUpdated.currentStreak >= 30 ? 'legendary' : 
                           parsedEvents.streakUpdated.currentStreak >= 14 ? 'epic' : 'rare',
          autoHide: false,
          requiresAction: false
        });
      }
    },
    
    // Backend task completion events - matches ReceiveTaskCompletionEvent
    onReceiveTaskCompletionEvent: (event: BackendTaskCompletionEventDTO) => {
      const taskEvent = parseTaskCompletionEvent(event);
      addNotification({
        id: `task-${taskEvent.taskId}-${Date.now()}`,
        type: 'success',
        title: '✅ Task Completed!',
        message: `Great job! You earned ${taskEvent.pointsEarned} points`,
        timestamp: taskEvent.completionTime,
        isRead: false,
        priority: 'medium',
        points: taskEvent.pointsEarned,
        autoHide: true,
        requiresAction: false
      });
    }
  });
  
  const stubConnection = useSignalRConnectionManagerStub();
  
  // Choose which connection to use
  const localConnection = shouldUseLocalConnection ? realConnection : stubConnection;
  
  const isConnected = sharedIsConnected !== undefined ? sharedIsConnected : localConnection.isConnected;

  // Remove notification
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setCelebratingNotifications(prev => {
      const newSet = new Set(prev);
      newSet.delete(notificationId);
      return newSet;
    });
  }, []);

  // Add notification with celebration effects
  const addNotification = useCallback((notification: NotificationItem) => {
    setNotifications(prev => {
      const newNotifications = [notification, ...prev.slice(0, maxDisplay - 1)];
      return newNotifications;
    });

    // Update unread count
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }

    // Trigger celebration for special notifications
    if (notification.type === 'achievement' || notification.type === 'milestone') {
      setCelebratingNotifications(prev => new Set([...prev, notification.id]));
      
      // Remove celebration after duration
      setTimeout(() => {
        setCelebratingNotifications(prev => {
          const newSet = new Set(prev);
          newSet.delete(notification.id);
          return newSet;
        });
      }, 4000);
    }

    // Auto-hide notifications
    if (notification.autoHide) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);
    }
  }, [maxDisplay, removeNotification]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  // Load initial notifications
  useEffect(() => {
    const loadInitialNotifications = async () => {
      try {
        // Generate some sample notifications for demo
        const sampleNotifications: NotificationItem[] = [
          {
            id: 'welcome-1',
            type: 'info',
            title: '👋 Welcome to TaskTracker!',
            message: 'Start completing tasks to earn points and unlock achievements',
            timestamp: new Date(Date.now() - 1000 * 60 * 5),
            isRead: false,
            priority: 'medium',
            autoHide: false,
            requiresAction: false
          },
          {
            id: 'achievement-demo',
            type: 'achievement',
            title: '🏆 First Steps',
            message: 'Welcome to your productivity journey! (+10 points)',
            timestamp: new Date(Date.now() - 1000 * 60 * 2),
            isRead: false,
            priority: 'high',
            points: 10,
            celebrationLevel: 'common',
            autoHide: false,
            requiresAction: false
          }
        ];

        setNotifications(sampleNotifications);
        setUnreadCount(sampleNotifications.filter(n => !n.isRead).length);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialNotifications();
  }, []);

  // Get notification styling based on type and priority
  const getNotificationStyle = (notification: NotificationItem) => {
    const isCelebrating = celebratingNotifications.has(notification.id);
    
    const baseStyles = "transition-all duration-500 hover:shadow-md";
    const celebrationStyles = isCelebrating ? "scale-105 shadow-lg animate-pulse" : "";
    
    const typeStyles = {
      success: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/10 dark:to-emerald-900/10 dark:border-green-700",
      warning: "bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 dark:from-orange-900/10 dark:to-yellow-900/10 dark:border-orange-700",
      achievement: "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 dark:from-yellow-900/10 dark:to-orange-900/10 dark:border-yellow-600",
      task: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-900/10 dark:to-indigo-900/10 dark:border-blue-700",
      family: "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 dark:from-purple-900/10 dark:to-pink-900/10 dark:border-purple-700",
      info: "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 dark:from-gray-900/10 dark:to-slate-900/10 dark:border-gray-700",
      celebration: "bg-gradient-to-r from-pink-50 to-rose-50 border-pink-300 dark:from-pink-900/10 dark:to-rose-900/10 dark:border-pink-600",
      milestone: "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300 dark:from-indigo-900/10 dark:to-purple-900/10 dark:border-indigo-600"
    };

    const priorityStyles = {
      low: "",
      medium: "",
      high: "ring-1 ring-orange-200 dark:ring-orange-800",
      urgent: "ring-2 ring-red-300 dark:ring-red-700 shadow-lg"
    };

    return `${baseStyles} ${celebrationStyles} ${typeStyles[notification.type]} ${priorityStyles[notification.priority]}`;
  };

  // Get notification icon
  const getNotificationIcon = (notification: NotificationItem) => {
    const iconProps = { className: "h-4 w-4" };
    
    switch (notification.type) {
      case 'success':
        return <CheckCircle {...iconProps} className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle {...iconProps} className="h-4 w-4 text-orange-600" />;
      case 'achievement':
        return <Trophy {...iconProps} className="h-4 w-4 text-yellow-600" />;
      case 'task':
        return <CheckCircle {...iconProps} className="h-4 w-4 text-blue-600" />;
      case 'family':
        return <Users {...iconProps} className="h-4 w-4 text-purple-600" />;
      case 'celebration':
        return <Sparkles {...iconProps} className="h-4 w-4 text-pink-600" />;
      case 'milestone':
        return <Crown {...iconProps} className="h-4 w-4 text-indigo-600" />;
      default:
        return <Info {...iconProps} className="h-4 w-4 text-gray-600" />;
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: NotificationItem['priority']) => {
    const styles = {
      low: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
      high: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300",
      urgent: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 animate-pulse"
    };

    if (priority === 'low') return null;

    return (
      <Badge variant="secondary" className={`text-xs ${styles[priority]}`}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString();
  };

  const displayNotifications = notifications.slice(0, maxDisplay);

  return (
    <Card className={`${className} transition-all duration-300 hover:shadow-lg border-2 border-blue-200 dark:border-blue-700 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/10 dark:via-indigo-900/10 dark:to-purple-900/10`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <div className="relative p-1 bg-blue-100 dark:bg-blue-900/20 rounded-full">
            <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </div>
            )}
          </div>
          Notifications
          {/* Real-time connection indicator */}
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-400 animate-pulse'}`} />
        </CardTitle>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-6 px-2"
            >
              Mark all read
            </Button>
          )}
          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 border-blue-300 dark:border-blue-600">
            {displayNotifications.length}/{maxDisplay}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : displayNotifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bell className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-sm text-muted-foreground">No notifications yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Complete tasks to start receiving updates!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayNotifications.map((notification) => {
              const isCelebrating = celebratingNotifications.has(notification.id);
              
              return (
                <div
                  key={notification.id}
                  ref={(el) => {
                    if (el) {
                      notificationRefs.current[notification.id] = el;
                    }
                  }}
                  className={`
                    relative p-3 rounded-lg border-2 cursor-pointer
                    ${getNotificationStyle(notification)}
                    ${!notification.isRead ? 'border-l-4 border-l-blue-500' : ''}
                  `}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  {/* Celebration Sparkles */}
                  {isCelebrating && (
                    <div className="absolute -top-1 -right-1">
                      <Sparkles className="h-5 w-5 text-yellow-500 animate-spin" />
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    {/* Notification Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification)}
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {notification.title}
                        </h4>
                        {getPriorityBadge(notification.priority)}
                        {notification.points && (
                          <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                            <Star className="h-3 w-3 mr-1" />
                            +{notification.points}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimestamp(notification.timestamp)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {notification.actionUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(notification.actionUrl, '_blank');
                              }}
                            >
                              {notification.actionText || 'View'}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Celebration Level Indicator */}
                  {notification.celebrationLevel && isCelebrating && (
                    <div className="absolute bottom-1 left-1">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${
                          notification.celebrationLevel === 'legendary' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' :
                          notification.celebrationLevel === 'epic' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' :
                          notification.celebrationLevel === 'rare' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                          'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        }`}
                      >
                        {notification.celebrationLevel}
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })}

            {/* View All Button */}
            {notifications.length > maxDisplay && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => console.log('View all notifications')}
                >
                  View All Notifications ({notifications.length})
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
