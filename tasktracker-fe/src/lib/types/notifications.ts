/*
 * Notification Types - TypeScript interfaces for notification system
 * Copyright (c) 2025 Carlos Abril Jr
 */

// Core notification interfaces matching backend DTOs exactly
export interface NotificationDTO {
  id: number;
  userId: number;
  title: string;
  message: string;
  notificationType: string;
  createdAt: string;
  isRead: boolean;
  relatedEntityId?: number;
  relatedEntityType: string;
}

export interface NotificationCountDTO {
  totalCount: number;
  unreadCount: number;
  importantCount: number;
  countsByType: Record<string, number>;
}

export interface NotificationPreferenceDTO {
  id: number;
  notificationType: string;
  enabled: boolean;
  priority: 'Low' | 'Normal' | 'High' | 'Critical';
  familyId?: number;
  familyName?: string;
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
}

export interface UpdateNotificationPreferenceDTO {
  notificationType: string;
  enabled: boolean;
  priority: 'Low' | 'Normal' | 'High' | 'Critical';
  familyId?: number;
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
}

export interface NotificationPreferenceSummaryDTO {
  enableGlobalNotifications: boolean;
  enableTaskNotifications: boolean;
  enableFamilyNotifications: boolean;
  enableSystemNotifications: boolean;
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
}

export interface NotificationFilterDTO {
  isRead?: boolean;
  isImportant?: boolean;
  type?: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  fromDate?: string;
  toDate?: string;
  searchTerm?: string;
}

export interface CreateNotificationDTO {
  title: string;
  message: string;
  notificationType: string;
  isImportant?: boolean;
  relatedEntityId?: number;
  relatedEntityType?: string;
}

// Statistics interface
export interface NotificationStats {
  totalSent: number;
  unreadCount: number;
  thisWeek: number;
  deliveryRate: number;
}

// Settings interfaces
export interface NotificationSettingsDTO {
  emailNotifications: EmailNotificationSettings;
  pushNotifications: PushNotificationSettings;
  notificationSchedule: NotificationSchedule;
  familyNotifications: FamilyNotificationSettings;
}

export interface EmailNotificationSettings {
  taskReminders: boolean;
  achievementAlerts: boolean;
  familyActivity: boolean;
  securityAlerts: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
  systemUpdates: boolean;
}

export interface PushNotificationSettings {
  taskReminders: boolean;
  achievementAlerts: boolean;
  familyActivity: boolean;
  securityAlerts: boolean;
  immediateAlerts: boolean;
  quietHours: boolean;
}

export interface NotificationSchedule {
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  timezone: string;
  weekendsOnly: boolean;
  customDays: number[]; // 0-6 (Sunday-Saturday)
}

export interface FamilyNotificationSettings {
  childTaskUpdates: boolean;
  permissionRequests: boolean;
  achievementSharing: boolean;
  emergencyAlerts: boolean;
  parentalControlChanges: boolean;
}

// Form data types
export interface NotificationSettingsFormData {
  emailNotifications: EmailNotificationSettings;
  pushNotifications: PushNotificationSettings;
  notificationSchedule: NotificationSchedule;
  familyNotifications: FamilyNotificationSettings;
}

// Enums
export enum NotificationType {
  TASK_REMINDER = 'task_reminder',
  ACHIEVEMENT_ALERT = 'achievement_alert',
  FAMILY_ACTIVITY = 'family_activity',
  SECURITY_ALERT = 'security_alert',
  SYSTEM_UPDATE = 'system_update',
  MARKETING = 'marketing',
  TEST = 'test'
}

export enum NotificationPriority {
  LOW = 'Low',
  NORMAL = 'Normal',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

// Extended interfaces for UI
export interface NotificationWithActions extends NotificationDTO {
  canMarkAsRead: boolean;
  canDelete: boolean;
  timeAgo: string;
  isExpired: boolean;
}

export interface NotificationPreferenceWithFamily extends NotificationPreferenceDTO {
  familyMemberCount?: number;
  isGlobalPreference: boolean;
} 