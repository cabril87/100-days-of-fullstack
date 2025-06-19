/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Activity Types
 * Explicit types for family activity and SignalR events
 */

// ================================
// FAMILY ACTIVITY TYPES
// ================================

export interface FamilyActivityItem {
  id: string;
  type: 'task_completed' | 'achievement_unlocked' | 'member_joined' | 'streak_updated' | 'points_earned';
  userId: number;
  userName: string;
  userAvatar?: string;
  title: string;
  description: string;
  points?: number;
  timestamp: Date;
  familyId?: number;
}

// ================================
// NOTIFICATION TYPES (EXPLICIT - NO ANY)
// ================================

export interface NotificationEvent {
  notificationId: string;
  type: 'success' | 'warning' | 'achievement' | 'task' | 'family' | 'info' | 'celebration' | 'milestone';
  title: string;
  message: string;
  timestamp: string;
  userId: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface NotificationStatusEvent {
  notificationId: string;
  isRead: boolean;
  userId: number;
}

export interface UnreadCountEvent {
  unreadCount: number;
  userId: number;
}

export interface NotificationItem {
  id: string;
  type: 'success' | 'warning' | 'achievement' | 'task' | 'family' | 'info' | 'celebration' | 'milestone';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionText?: string;
  points?: number;
  celebrationLevel?: 'common' | 'rare' | 'epic' | 'legendary';
  autoHide?: boolean;
  requiresAction?: boolean;
}

// ================================
// SIGNALR CONNECTION HANDLERS
// ================================

export interface SignalRActivityHandlers {
  onReceiveNotification?: (event: NotificationEvent) => void;
  onNotificationStatusUpdated?: (event: NotificationStatusEvent) => void;
  onUnreadCountUpdated?: (event: UnreadCountEvent) => void;
}

// ================================
// API RESPONSE TYPES
// ================================

export interface FamilyActivityApiResponse {
  id?: string;
  activityType?: string;
  userId: number;
  userName?: string;
  userAvatar?: string;
  title?: string;
  description?: string;
  points?: number;
  timestamp?: string;
  familyId?: number;
}

// ================================
// COMPONENT PROPS
// ================================

export interface FamilyActivityStreamProps {
  userId?: number;
  familyId?: number;
  maxDisplay?: number;
  className?: string;
  isConnected?: boolean;
} 