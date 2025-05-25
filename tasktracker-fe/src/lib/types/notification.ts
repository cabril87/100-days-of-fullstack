/**
 * Notification system related types
 */

export interface Notification {
  id: string;
  type: 'invitation' | 'role_change' | 'task_assignment' | 'task_completion' | 'family_update';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: {
    invitationId?: string;
    familyId?: string;
    familyName?: string;
    memberId?: string;
    taskId?: string;
    token?: string;
    invitedBy?: string;
  };
}

export interface NotificationPreferenceSummary {
  enableGlobalNotifications: boolean;
  enableTaskNotifications: boolean;
  enableFamilyNotifications: boolean;
  enableSystemNotifications: boolean;
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
}

export interface NotificationPreference {
  id: number;
  notificationType: string;
  enabled: boolean;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  familyId?: number;
  familyName?: string;
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
} 