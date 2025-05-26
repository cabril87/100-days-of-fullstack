'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellOff,
  Check,
  X,
  UserPlus,
  Loader2,
  CalendarClock,
  CheckCircle2,
  Home,
  User,
  Mail,
  Settings,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Notification } from '@/lib/types/notification';
import { notificationService } from '@/lib/services/notificationService';
import { familyService } from '@/lib/services/familyService';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/lib/hooks/useToast';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadNotifications();
    loadPendingInvitations();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getNotifications();
      if (response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      showToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingInvitations = async () => {
    try {
      console.log('Fetching pending invitations for NotificationCenter...');
      const response = await familyService.getUserPendingInvitations();
      
      if (response.data) {
        console.log(`NotificationCenter: Found ${response.data.length} pending invitations`);
        
        // Ensure we have valid data before setting state
        if (Array.isArray(response.data)) {
          // Log each invitation for debugging
          response.data.forEach((inv, index) => {
            console.log(`Invitation ${index + 1}:`, inv);
          });
          
          // Make sure all required fields are present
          const validInvitations = response.data.filter(inv => 
            inv && inv.token && 
            (inv.familyId || inv.family?.id) &&
            (inv.familyName || inv.family?.name)
          );
          
          console.log(`NotificationCenter: ${validInvitations.length} valid invitations after filtering`);
          setPendingInvitations(validInvitations);
        } else {
          console.error('Pending invitations is not an array:', response.data);
          setPendingInvitations([]);
        }
      } else if (response.error) {
        console.error('Error loading pending invitations:', response.error);
        // Set empty array to avoid UI issues but don't show an error toast to avoid overwhelming the user
        setPendingInvitations([]);
      } else {
        // No data but also no error - probably empty result
        console.log('No pending invitations found');
        setPendingInvitations([]);
      }
    } catch (error) {
      console.error('Error loading pending invitations in NotificationCenter:', error);
      // Set empty array to avoid UI issues
      setPendingInvitations([]);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      ));
      showToast(
        "Notification marked as read",
        "success"
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showToast(
        "Failed to mark notification as read",
        "error"
      );
    }
  };

  const acceptInvitation = async (notification: Notification) => {
    if (!notification.data?.token) {
      showToast('Invalid invitation', 'error');
      return;
    }

    setProcessingIds(prev => [...prev, notification.id]);
    try {
      const response = await notificationService.acceptInvitation(notification.data.token);
      
      if (response.error) {
        showToast(response.error, 'error');
      } else {
        showToast(`You've joined ${notification.data.familyName || 'the family'}!`, 'success');
        
        // Mark notification as read
        await markAsRead(notification.id);
        
        // Update notifications list
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        
        // Refresh family list
        await familyService.getAllFamilies({ retries: 1 });
        
        // Redirect to family dashboard
        if (notification.data.familyId) {
          router.push(`/family/${notification.data.familyId}`);
        } else {
          router.push('/family');
        }
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      showToast('Failed to accept invitation', 'error');
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== notification.id));
    }
  };

  const declineInvitation = async (notification: Notification) => {
    if (!notification.data?.token) {
      showToast('Invalid invitation', 'error');
      return;
    }

    setProcessingIds(prev => [...prev, notification.id]);
    try {
      const response = await notificationService.declineInvitation(notification.data.token);
      
      if (response.error) {
        showToast(response.error, 'error');
      } else {
        showToast('Invitation declined', 'success');
        
        // Mark notification as read
        await markAsRead(notification.id);
        
        // Update notifications list
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }
    } catch (error) {
      console.error('Error declining invitation:', error);
      showToast('Failed to decline invitation', 'error');
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== notification.id));
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'invitation':
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'task_assignment':
        return <CalendarClock className="h-4 w-4 text-purple-500" />;
      case 'task_completion':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'family_update':
        return <Home className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderNotificationContent = (notification: Notification) => {
    const isProcessing = processingIds.includes(notification.id);
    
    if (notification.type === 'invitation') {
      return (
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-1">
              <UserPlus className="h-4 w-4 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{notification.title}</p>
              <p className="text-xs text-gray-500">{notification.message}</p>
              {notification.data?.invitedBy && (
                <p className="text-xs text-gray-400">
                  From: {notification.data.invitedBy}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 px-2 text-xs"
              onClick={() => declineInvitation(notification)}
              disabled={isProcessing}
            >
              {isProcessing ? <Spinner size="xs" className="mr-1" /> : <X className="h-3 w-3 mr-1" />}
              Decline
            </Button>
            <Button 
              size="sm" 
              className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => acceptInvitation(notification)}
              disabled={isProcessing}
            >
              {isProcessing ? <Spinner size="xs" className="mr-1" /> : <Check className="h-3 w-3 mr-1" />}
              Accept
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{notification.title}</p>
          <p className="text-xs text-gray-500">{notification.message}</p>
          <p className="text-xs text-gray-400">
            {new Date(notification.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    );
  };

  // Combine notifications and invitations for display
  const combinedItems = [
    ...notifications,
    ...pendingInvitations.map(inv => ({
      id: `inv-${inv.id}`,
      type: 'invitation' as Notification['type'],
      title: `Family Invitation`,
      message: `You've been invited to join ${inv.familyName || inv.family?.name || 'a family'}.`,
      isRead: false,
      createdAt: inv.createdAt || new Date().toISOString(),
      data: {
        token: inv.token,
        familyId: inv.familyId || inv.family?.id,
        familyName: inv.familyName || inv.family?.name,
        invitedBy: inv.invitedBy || inv.createdBy?.username || 'someone'
      }
    }))
  ];

  const unreadCount = combinedItems.filter(n => !n.isRead).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="no-auto-focus-trap">
        <Button variant="ghost" size="sm" className="relative">
          {unreadCount > 0 ? (
            <>
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-blue-600">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            </>
          ) : (
            <BellOff className="h-5 w-5 text-gray-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-2xl rounded-2xl relative overflow-hidden z-[9999]" align="end" sideOffset={8}>
        {/* Enhanced decorative gradient bars */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 opacity-50"></div>
        
        <DropdownMenuLabel className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
          <span className="font-bold always-visible-text">🔔 Notifications</span>
          {loading && <Spinner size="sm" className="ml-2" />}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="border-gray-200/50 dark:border-gray-700/50" />
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          {combinedItems.length === 0 ? (
            <div className="py-4 px-2 text-center text-sm text-gray-500">
              {loading ? 'Loading notifications...' : 'Pending notifications'}
            </div>
          ) : (
            <DropdownMenuGroup>
              {combinedItems.map((notification) => (
                <DropdownMenuItem key={notification.id} className={`px-3 py-2 rounded-lg mx-2 mb-1 transition-all duration-200 ${!notification.isRead ? 'bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/30 dark:border-blue-700/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                  {renderNotificationContent(notification)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          )}
        </div>
        <DropdownMenuSeparator className="border-gray-200/50 dark:border-gray-700/50" />
        <div className="p-2 space-y-1">
          <DropdownMenuItem asChild className="justify-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-200/30 dark:border-blue-700/30 rounded-lg transition-all duration-200"
              onClick={() => {
                loadNotifications();
                loadPendingInvitations();
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="xs" className="mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                '🔄 Refresh Notifications'
              )}
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <a href="/notifications" className="flex justify-center items-center py-2 text-xs bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 border border-purple-200/30 dark:border-purple-700/30 rounded-lg transition-all duration-200">
              📋 View all notifications
            </a>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 