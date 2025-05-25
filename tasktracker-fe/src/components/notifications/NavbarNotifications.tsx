'use client';

import { Fragment, useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { 
  initializeRealTimeNotifications, 
  onNewNotification, 
  onNotificationRead 
} from '@/lib/services/notificationService';
import NotificationActions from './NotificationActions';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Notification } from '@/lib/types/notification';

export default function NavbarNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (typeof window === 'undefined') {
      return;
    }

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      return;
    }

    // Initialize SignalR connection for authenticated users
    const initializeConnection = async () => {
      try {
        await initializeRealTimeNotifications();
        setIsConnected(true);
      } catch (error) {
        // Silently handle connection failures since SignalR may not be enabled
        setIsConnected(false);
      }
    };

    initializeConnection();
    
    // Subscribe to real-time notifications
    const newNotificationUnsubscribe = onNewNotification((notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 9)]);
      setUnreadCount(prev => prev + 1);
    });
    
    // Subscribe to notification read events
    const notificationReadUnsubscribe = onNotificationRead((notificationId) => {
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    });
    
    // Load initial notifications
    fetch('/api/v1/notifications?take=5')
      .then(res => res.json())
      .then(data => {
        setNotifications(data);
        const unread = data.filter((n: Notification) => !n.isRead).length;
        setUnreadCount(unread);
      })
      .catch(err => console.error('Error loading notifications:', err));

    // Cleanup subscriptions on unmount
    return () => {
      newNotificationUnsubscribe();
      notificationReadUnsubscribe();
    };
  }, []);

  const handleActionComplete = () => {
    // Refresh notifications after an action
    fetch('/api/v1/notifications?take=5')
      .then(res => res.json())
      .then(data => {
        setNotifications(data);
        const unread = data.filter((n: Notification) => !n.isRead).length;
        setUnreadCount(unread);
      })
      .catch(err => console.error('Error refreshing notifications:', err));
  };

  const getNotificationTime = (createdAt: string): string => {
    const date = new Date(createdAt);
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

  const isImportantNotification = (notification: Notification): boolean => {
    return notification.type === 'invitation' || notification.type === 'role_change';
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative w-10 h-10 rounded-full inline-flex items-center justify-center transition-colors hover:bg-accent hover:text-accent-foreground">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] p-0">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Notifications</h4>
            <Link href="/notifications" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          
          {/* Connection status indicator */}
          {!isConnected && (
            <div className="mt-1 flex items-center">
              <span className="h-2 w-2 rounded-full bg-yellow-500 mr-1"></span>
              <span className="text-xs text-muted-foreground">Connecting to notifications...</span>
            </div>
          )}
        </div>
        
        <Separator />
        
        <ScrollArea className="h-[calc(80vh-8rem)] max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 rounded-md ${
                    notification.isRead 
                      ? 'bg-card hover:bg-muted/50' 
                      : 'bg-accent/20 border-l-2 border-primary'
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">
                      {getNotificationTime(notification.createdAt)}
                    </span>
                    {isImportantNotification(notification) && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                        Important
                      </Badge>
                    )}
                  </div>
                  <h5 className="font-medium text-sm mt-1">
                    {notification.title}
                  </h5>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  
                  <NotificationActions 
                    notificationId={parseInt(notification.id)}
                    isRead={notification.isRead}
                    relatedEntityType={notification.type}
                    relatedEntityId={notification.data?.taskId ? parseInt(notification.data.taskId) : 
                                   notification.data?.familyId ? parseInt(notification.data.familyId) : undefined}
                    onActionComplete={handleActionComplete}
                  />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
} 