/**
 * Notification system related types
 */

export interface Notification {
  id: string;
  type: 'invitation' | 'role_change' | 'task_assignment' | 'task_completion' | 'family_update' | 'achievement' | 'reward' | 'challenge' | 'streak' | 'level_up' | 'badge' | 'daily_login' | 'reminder';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  data?: {
    invitationId?: string;
    familyId?: string;
    familyName?: string;
    memberId?: string;
    taskId?: string;
    token?: string;
    invitedBy?: string;
    achievementId?: number;
    challengeId?: number;
    rewardId?: number;
    badgeId?: number;
    pointsEarned?: number;
    pointsSpent?: number;
    newLevel?: number;
    streakLength?: number;
    bonusPoints?: number;
    reminderId?: string;
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