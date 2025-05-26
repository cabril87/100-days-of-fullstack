'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  Star, 
  Trophy, 
  ArrowLeft,
  CheckCircle,
  Clock,
  Settings,
  Trash2,
  Eye,
  Crown,
  Gift,
  Target,
  Users,
  Zap,
  Award,
  RefreshCw,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/lib/hooks/useToast';

interface GamificationNotification {
  id: number;
  type: 'achievement' | 'reward' | 'challenge' | 'streak' | 'level_up' | 'badge' | 'family' | 'daily_login';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: {
    achievementId?: number;
    challengeId?: number;
    rewardId?: number;
    badgeId?: number;
    familyId?: number;
    pointsEarned?: number;
    pointsSpent?: number;
    newLevel?: number;
    streakLength?: number;
    bonusPoints?: number;
  }; // Additional data specific to notification type
  priority: 'low' | 'medium' | 'high';
}

interface NotificationPreferences {
  achievements: boolean;
  rewards: boolean;
  challenges: boolean;
  streaks: boolean;
  levelUps: boolean;
  badges: boolean;
  family: boolean;
  dailyLogin: boolean;
  sound: boolean;
  push: boolean;
}

export default function NotificationsPage(): React.ReactElement {
  const [notifications, setNotifications] = useState<GamificationNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    achievements: true,
    rewards: true,
    challenges: true,
    streaks: true,
    levelUps: true,
    badges: true,
    family: true,
    dailyLogin: true,
    sound: true,
    push: false
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showPreferences, setShowPreferences] = useState(false);
  const { showToast } = useToast();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch gamification notifications from the general notification service
      // Filter for gamification-related types
      const response = await fetch('/api/v1/notifications');
      
      if (response.ok) {
        const allNotifications = await response.json();
        
        // Filter for gamification-related notifications
        const gamificationTypes = ['achievement', 'level_up', 'daily_login', 'challenge', 'reward', 'badge', 'family'];
        const gamificationNotifications = allNotifications
          .filter((notif: any) => gamificationTypes.includes(notif.type))
          .map((notif: any) => ({
            id: parseInt(notif.id) || Date.now(),
            type: notif.type,
            title: notif.title,
            message: notif.message,
            isRead: notif.isRead,
            createdAt: notif.createdAt,
            data: notif.data || {},
            priority: notif.priority || 'medium'
          }));
        
        setNotifications(gamificationNotifications);
      } else {
        // If API fails, show empty state
        setNotifications([]);
        console.warn('Gamification notifications API not available');
      }
    } catch (error) {
      console.error('Failed to fetch gamification notifications:', error);
      setNotifications([]);
      showToast('Unable to load notifications. Please check your connection.', 'warning');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchNotifications();
    loadPreferences();
  }, [fetchNotifications]);

  const loadPreferences = () => {
    const saved = localStorage.getItem('gamificationNotificationPreferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  };

  const savePreferences = (newPreferences: NotificationPreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('gamificationNotificationPreferences', JSON.stringify(newPreferences));
    showToast('Notification preferences saved', 'success');
  };

  const markAsRead = (notificationId: number) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast('All notifications marked as read', 'success');
  };

  const deleteNotification = (notificationId: number) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    showToast('Notification deleted', 'success');
  };

  const clearAllRead = () => {
    setNotifications(prev => prev.filter(n => !n.isRead));
    showToast('Read notifications cleared', 'success');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Trophy className="h-5 w-5" />;
      case 'reward': return <Gift className="h-5 w-5" />;
      case 'challenge': return <Target className="h-5 w-5" />;
      case 'streak': return <Zap className="h-5 w-5" />;
      case 'level_up': return <Crown className="h-5 w-5" />;
      case 'badge': return <Award className="h-5 w-5" />;
      case 'family': return <Users className="h-5 w-5" />;
      case 'daily_login': return <Clock className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    const baseColors = {
      achievement: 'from-yellow-400 to-orange-500',
      reward: 'from-green-400 to-emerald-500',
      challenge: 'from-purple-400 to-purple-600',
      streak: 'from-orange-400 to-red-500',
      level_up: 'from-blue-400 to-indigo-500',
      badge: 'from-pink-400 to-rose-500',
      family: 'from-teal-400 to-cyan-500',
      daily_login: 'from-gray-400 to-gray-600'
    };
    
    return baseColors[type as keyof typeof baseColors] || 'from-gray-400 to-gray-600';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return 'Just now';
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesReadFilter = activeFilter === 'all' || 
      (activeFilter === 'read' && notification.isRead) ||
      (activeFilter === 'unread' && !notification.isRead);
    
    const matchesTypeFilter = typeFilter === 'all' || notification.type === typeFilter;
    
    return matchesReadFilter && matchesTypeFilter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto p-4 max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-gray-300 rounded"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-gray-300 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/gamification"
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Notifications
              </h1>
              <p className="text-gray-600 mt-1">
                Stay updated with your gamification progress
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPreferences(!showPreferences)}
                className={`p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                  showPreferences ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'
                }`}
                title="Notification preferences"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={fetchNotifications}
                className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                title="Refresh notifications"
              >
                <RefreshCw className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Notification Preferences */}
          {showPreferences && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(preferences).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => {
                        const newPreferences = { ...preferences, [key]: e.target.checked };
                        savePreferences(newPreferences);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex gap-2">
              {(['all', 'unread', 'read'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeFilter === filter
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  {filter === 'unread' && unreadCount > 0 && (
                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="achievement">Achievements</option>
              <option value="reward">Rewards</option>
              <option value="challenge">Challenges</option>
              <option value="level_up">Level Ups</option>
              <option value="badge">Badges</option>
              <option value="family">Family</option>
              <option value="daily_login">Daily Login</option>
            </select>

            <div className="flex gap-2 ml-auto">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark All Read
                </button>
              )}
              <button
                onClick={clearAllRead}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear Read
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Notifications</h3>
              <p className="text-gray-600">
                {activeFilter === 'unread' && 'All caught up! No unread notifications.'}
                {activeFilter === 'read' && 'No read notifications found.'}
                {activeFilter === 'all' && 'Complete tasks and challenges to get notifications!'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div 
                key={notification.id}
                className={`bg-white rounded-xl p-4 shadow-sm border transition-all duration-300 hover:shadow-md ${
                  notification.isRead ? 'border-gray-200' : 'border-blue-300 bg-blue-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${getNotificationColor(notification.type, notification.priority)} text-white flex-shrink-0`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-sm text-gray-500">{formatTimeAgo(notification.createdAt)}</span>
                        {notification.priority === 'high' && (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{notification.message}</p>
                    
                    {/* Additional data */}
                    {notification.data && (
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {notification.data.pointsEarned && (
                          <div className="flex items-center gap-1 text-green-600">
                            <Star className="h-3 w-3" />
                            +{notification.data.pointsEarned} points
                          </div>
                        )}
                        {notification.data.pointsSpent && (
                          <div className="flex items-center gap-1 text-red-600">
                            <Star className="h-3 w-3" />
                            -{notification.data.pointsSpent} points
                          </div>
                        )}
                        {notification.data.newLevel && (
                          <div className="flex items-center gap-1 text-purple-600">
                            <Crown className="h-3 w-3" />
                            Level {notification.data.newLevel}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Mark as read"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete notification"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 