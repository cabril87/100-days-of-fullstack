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
  X,
  Filter,
  Search,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle2,
  Plus,
  MoreVertical,
  Archive,
  Bookmark,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/lib/hooks/useToast';
import { notificationService } from '@/lib/services/notificationService';
import { Notification } from '@/lib/types/notification';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Using imported Notification type from @/lib/types/notification

interface NotificationStats {
  total: number;
  unread: number;
  high_priority: number;
  today: number;
}

export default function NotificationCenterPage(): React.ReactElement {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    high_priority: 0,
    today: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const { showToast } = useToast();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch real notifications from API
      const response = await notificationService.getNotifications();
      
      if (response.data) {
        setNotifications(response.data);
        
        // Calculate stats from real data
        const unread = response.data.filter(n => !n.isRead).length;
        const highPriority = response.data.filter(n => n.priority === 'high' || n.priority === 'urgent').length;
        const today = response.data.filter(n => {
          const notifDate = new Date(n.createdAt);
          const todayDate = new Date();
          return notifDate.toDateString() === todayDate.toDateString();
        }).length;
        
        setStats({
          total: response.data.length,
          unread,
          high_priority: highPriority,
          today
        });
      } else {
        // Handle empty response
        setNotifications([]);
        setStats({
          total: 0,
          unread: 0,
          high_priority: 0,
          today: 0
        });
        
        if (response.error) {
          console.warn('Notification API error:', response.error);
          showToast('Unable to load notifications. Please try again later.', 'warning');
        }
      }
      
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      showToast('Failed to load notifications', 'error');
      
      // Set empty state on error
      setNotifications([]);
      setStats({
        total: 0,
        unread: 0,
        high_priority: 0,
        today: 0
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
    setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setStats(prev => ({ ...prev, unread: 0 }));
    showToast('All notifications marked as read', 'success');
  };

  const deleteNotification = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setStats(prev => ({
      ...prev,
      total: prev.total - 1,
      unread: notification && !notification.isRead ? prev.unread - 1 : prev.unread
    }));
    showToast('Notification deleted', 'success');
  };

  const bulkMarkAsRead = () => {
    const selectedNotifs = notifications.filter(n => selectedNotifications.includes(n.id));
    const unreadSelected = selectedNotifs.filter(n => !n.isRead).length;
    
    setNotifications(prev => prev.map(n => 
      selectedNotifications.includes(n.id) ? { ...n, isRead: true } : n
    ));
    setStats(prev => ({ ...prev, unread: prev.unread - unreadSelected }));
    setSelectedNotifications([]);
    showToast(`${selectedNotifications.length} notifications marked as read`, 'success');
  };

  const bulkDelete = () => {
    const selectedNotifs = notifications.filter(n => selectedNotifications.includes(n.id));
    const unreadSelected = selectedNotifs.filter(n => !n.isRead).length;
    
    setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
    setStats(prev => ({
      ...prev,
      total: prev.total - selectedNotifications.length,
      unread: prev.unread - unreadSelected
    }));
    setSelectedNotifications([]);
    showToast(`${selectedNotifications.length} notifications deleted`, 'success');
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
      case 'invitation': return <Users className="h-5 w-5" />;
      case 'role_change': return <Settings className="h-5 w-5" />;
      case 'task_assignment': return <Calendar className="h-5 w-5" />;
      case 'task_completion': return <CheckCircle className="h-5 w-5" />;
      case 'family_update': return <Users className="h-5 w-5" />;
      case 'reminder': return <Bell className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    const priorityColors = {
      urgent: 'from-red-400 to-red-600',
      high: 'from-orange-400 to-orange-600',
      medium: 'from-blue-400 to-blue-600',
      low: 'from-gray-400 to-gray-600'
    };

    const typeColors = {
      achievement: 'from-yellow-400 to-orange-500',
      reward: 'from-green-400 to-emerald-500',
      challenge: 'from-purple-400 to-purple-600',
      streak: 'from-orange-400 to-red-500',
      level_up: 'from-blue-400 to-indigo-500',
      badge: 'from-pink-400 to-rose-500',
      family: 'from-teal-400 to-cyan-500',
      daily_login: 'from-gray-400 to-gray-600',
      invitation: 'from-indigo-400 to-indigo-600',
      role_change: 'from-purple-400 to-purple-600',
      task_assignment: 'from-amber-400 to-amber-600',
      task_completion: 'from-green-400 to-green-600',
      family_update: 'from-teal-400 to-teal-600',
      reminder: 'from-blue-400 to-blue-600'
    };
    
    return priority === 'urgent' || priority === 'high' 
      ? priorityColors[priority as keyof typeof priorityColors] 
      : typeColors[type as keyof typeof typeColors] || 'from-gray-400 to-gray-600';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const filteredNotifications = notifications.filter(notification => {
    // Filter by read status
    if (activeFilter === 'unread' && notification.isRead) return false;
    if (activeFilter === 'read' && !notification.isRead) return false;
    
    // Filter by type
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    
    // Filter by priority
    if (priorityFilter !== 'all' && notification.priority !== priorityFilter) return false;
    
    // Filter by search query
    if (searchQuery && !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !notification.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  });

  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAllVisible = () => {
    const visibleIds = filteredNotifications.map(n => n.id);
    setSelectedNotifications(visibleIds);
  };

  const clearSelection = () => {
    setSelectedNotifications([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 max-w-8xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/dashboard"
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Notification Center
              </h1>
              <p className="text-gray-600 mt-1">
                Manage all your notifications and reminders in one place
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/notifications/preferences">
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Preferences
                </Button>
              </Link>
              <Link href="/reminders/create">
                <Button size="sm" className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Plus className="h-4 w-4" />
                  New Reminder
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-white/20">
                  <Bell className="h-5 w-5" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stats.total}</div>
              <div className="text-blue-100 text-sm">Total Notifications</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-white/20">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stats.unread}</div>
              <div className="text-orange-100 text-sm">Unread</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-white/20">
                  <Star className="h-5 w-5" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stats.high_priority}</div>
              <div className="text-purple-100 text-sm">High Priority</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-white/20">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stats.today}</div>
              <div className="text-green-100 text-sm">Today</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute -top-36 -right-36 w-96 h-96 bg-purple-600 opacity-[0.03] rounded-full blur-3xl"></div>
          <div className="absolute -bottom-36 -left-36 w-96 h-96 bg-blue-600 opacity-[0.05] rounded-full blur-3xl"></div>
          
          {/* Gradient accent */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-xl"></div>
          
          <div className="pt-6 relative z-10">
            <Tabs defaultValue="notifications" className="w-full">
              <div className="px-6 pb-4 border-b border-gray-100">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="reminders">Reminders</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="notifications" className="mt-0">
                {/* Filters and Search */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search notifications..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Select value={activeFilter} onValueChange={(value: any) => setActiveFilter(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="unread">Unread</SelectItem>
                          <SelectItem value="read">Read</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="achievement">Achievements</SelectItem>
                          <SelectItem value="reminder">Reminders</SelectItem>
                          <SelectItem value="invitation">Invitations</SelectItem>
                          <SelectItem value="task_completion">Tasks</SelectItem>
                          <SelectItem value="family_update">Family</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Bulk Actions */}
                  {selectedNotifications.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700 font-medium">
                          {selectedNotifications.length} notification{selectedNotifications.length !== 1 ? 's' : ''} selected
                        </span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={bulkMarkAsRead}>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Mark Read
                          </Button>
                          <Button size="sm" variant="outline" onClick={bulkDelete}>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                          <Button size="sm" variant="ghost" onClick={clearSelection}>
                            <X className="h-4 w-4 mr-1" />
                            Clear
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notifications List */}
                <div className="p-6">
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-24"></div>
                      ))}
                    </div>
                  ) : filteredNotifications.length > 0 ? (
                    <div className="space-y-4">
                      {/* Quick Actions */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={selectAllVisible}>
                            Select All Visible
                          </Button>
                          <Button size="sm" variant="outline" onClick={markAllAsRead}>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Mark All Read
                          </Button>
                        </div>
                        <Button size="sm" variant="ghost" onClick={fetchNotifications}>
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Refresh
                        </Button>
                      </div>
                      
                      {filteredNotifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`group relative rounded-xl border transition-all duration-300 hover:shadow-lg ${
                            notification.isRead 
                              ? 'bg-white border-gray-200' 
                              : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-sm'
                          }`}
                        >
                          <div className="p-4">
                            <div className="flex items-start gap-4">
                              {/* Selection Checkbox */}
                              <div className="flex items-center pt-1">
                                <input
                                  type="checkbox"
                                  checked={selectedNotifications.includes(notification.id)}
                                  onChange={() => toggleNotificationSelection(notification.id)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                              </div>
                              
                              {/* Icon */}
                              <div className={`p-3 rounded-lg bg-gradient-to-r ${getNotificationColor(notification.type, String(notification.priority))} text-white flex-shrink-0`}>
                                {getNotificationIcon(notification.type)}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                                    {!notification.isRead && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    )}
                                    {notification.priority === 'urgent' && (
                                      <Badge variant="destructive" className="text-xs">Urgent</Badge>
                                    )}
                                    {notification.priority === 'high' && (
                                      <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">High</Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 ml-4">
                                    <span className="text-sm text-gray-500">{formatTimeAgo(notification.createdAt)}</span>
                                  </div>
                                </div>
                                
                                <p className="text-gray-600 text-sm mb-3">{notification.message}</p>
                                
                                {/* Additional data display */}
                                {notification.data && (
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {notification.data.pointsEarned && (
                                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                        +{notification.data.pointsEarned} points
                                      </Badge>
                                    )}
                                    {notification.data.newLevel && (
                                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                        Level {notification.data.newLevel}
                                      </Badge>
                                    )}
                                    {notification.data.familyName && (
                                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                        {notification.data.familyName}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                                
                                {/* Action buttons */}
                                <div className="flex items-center gap-2">
                                  {!notification.isRead && (
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      onClick={() => markAsRead(notification.id)}
                                      className="text-xs"
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      Mark Read
                                    </Button>
                                  )}
                                  
                                  {notification.type === 'invitation' && (
                                    <div className="flex gap-2">
                                      <Button size="sm" className="text-xs">Accept</Button>
                                      <Button size="sm" variant="outline" className="text-xs">Decline</Button>
                                    </div>
                                  )}
                                  
                                  {notification.type === 'reminder' && notification.data?.taskId && (
                                    <Link href={`/tasks/${notification.data.taskId}`}>
                                      <Button size="sm" variant="outline" className="text-xs">
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                        View Task
                                      </Button>
                                    </Link>
                                  )}
                                  
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => deleteNotification(notification.id)}>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Archive className="h-4 w-4 mr-2" />
                                        Archive
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Bookmark className="h-4 w-4 mr-2" />
                                        Save
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                      <p className="text-gray-500 mb-4">
                        {searchQuery || typeFilter !== 'all' || priorityFilter !== 'all' || activeFilter !== 'all'
                          ? 'Try adjusting your filters to see more notifications.'
                          : 'You\'re all caught up! New notifications will appear here.'}
                      </p>
                      {(searchQuery || typeFilter !== 'all' || priorityFilter !== 'all' || activeFilter !== 'all') && (
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSearchQuery('');
                            setTypeFilter('all');
                            setPriorityFilter('all');
                            setActiveFilter('all');
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reminders" className="mt-0">
                <div className="p-6 text-center">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Reminder Management</h3>
                  <p className="text-gray-500 mb-4">
                    Create and manage your task reminders and notifications.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Link href="/reminders">
                      <Button>
                        <Calendar className="h-4 w-4 mr-2" />
                        View All Reminders
                      </Button>
                    </Link>
                    <Link href="/reminders/create">
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Reminder
                      </Button>
                    </Link>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
} 