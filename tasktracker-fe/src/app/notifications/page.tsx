'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { notificationService } from '@/lib/services/notificationService';
import { NotificationDTO, NotificationFilterDTO } from '@/lib/types/notifications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Search, 
  Filter, 
  CheckCircle2, 
  Trash2, 
  RefreshCw,
  Star,
  Trophy,
  Users,
  AlertTriangle,
  Info,
  Calendar,
  Clock,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationsPage = () => {
  const { unreadCount, refreshCount } = useNotifications();
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await notificationService.getAllNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Filter notifications
  useEffect(() => {
    // Ensure notifications is an array to prevent undefined errors
    let filtered = notifications || [];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(notification => notification.notificationType === selectedType);
    }

    // Filter by status
    if (selectedStatus === 'unread') {
      filtered = filtered.filter(notification => !notification.isRead);
    } else if (selectedStatus === 'read') {
      filtered = filtered.filter(notification => notification.isRead);
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, selectedType, selectedStatus]);

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'task':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'family':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'system':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'reminder':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get notification type badge color
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-300';
      case 'task':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300';
      case 'family':
        return 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border-purple-300';
      case 'system':
        return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-300';
      case 'reminder':
        return 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-300';
      case 'alert':
        return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-300';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-300';
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        (prev || []).map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      refreshCount();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      setIsRefreshing(true);
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        (prev || []).map(notification => ({ ...notification, isRead: true }))
      );
      refreshCount();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: number) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev =>
        (prev || []).filter(notification => notification.id !== notificationId)
      );
      refreshCount();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Refresh notifications
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    await refreshCount();
    setIsRefreshing(false);
  };

  // Get notification counts by type
  const notificationCounts = useMemo(() => {
    // Ensure notifications is an array to prevent undefined errors
    const notificationsArray = notifications || [];
    
    const counts = {
      all: notificationsArray.length,
      unread: notificationsArray.filter(n => !n.isRead).length,
      achievement: notificationsArray.filter(n => n.notificationType === 'achievement').length,
      task: notificationsArray.filter(n => n.notificationType === 'task').length,
      family: notificationsArray.filter(n => n.notificationType === 'family').length,
      system: notificationsArray.filter(n => n.notificationType === 'system').length,
    };
    return counts;
  }, [notifications]);

  if (isLoading) {
    return (
      <div className="min-h-screen  p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-700 rounded-lg"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Bell className="h-8 w-8 text-blue-400" />
              Notifications
            </h1>
            <p className="text-gray-300 mt-1">
              Stay updated with your tasks, achievements, and family activities
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {notificationCounts.unread > 0 && (
              <Button
                onClick={markAllAsRead}
                disabled={isRefreshing}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-400 text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold text-white">{notificationCounts.all}</p>
                </div>
                <Bell className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-400 text-sm font-medium">Unread</p>
                  <p className="text-2xl font-bold text-white">{notificationCounts.unread}</p>
                </div>
                <div className="relative">
                  <Bell className="h-8 w-8 text-red-400" />
                  {notificationCounts.unread > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-400 text-sm font-medium">Achievements</p>
                  <p className="text-2xl font-bold text-white">{notificationCounts.achievement}</p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-400 text-sm font-medium">Family</p>
                  <p className="text-2xl font-bold text-white">{notificationCounts.family}</p>
                </div>
                <Users className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="achievement">Achievement</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-12 text-center">
                <Bell className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No notifications found</h3>
                <p className="text-gray-400">
                  {searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
                    ? 'Try adjusting your filters to see more notifications.'
                    : 'You\'re all caught up! New notifications will appear here.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all duration-200 hover:shadow-lg ${
                  notification.isRead
                    ? 'bg-gray-800/30 border-gray-700/50'
                    : 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/30 shadow-md'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.notificationType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`font-semibold ${notification.isRead ? 'text-gray-300' : 'text-white'}`}>
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className={`text-sm mb-3 ${notification.isRead ? 'text-gray-400' : 'text-gray-300'}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3 text-xs">
                          <Badge className={getTypeBadgeColor(notification.notificationType)}>
                            {notification.notificationType}
                          </Badge>
                          <span className="text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <Button
                          onClick={() => markAsRead(notification.id)}
                          size="sm"
                          variant="outline"
                          className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        onClick={() => deleteNotification(notification.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage; 