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

// Due Date Notification Settings
export interface DueDateNotificationSettings {
  enabled: boolean;
  reminderTimes: number[]; // Hours before due date
  overdueNotifications: boolean;
  channels: ('email' | 'push' | 'in-app')[];
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;   // HH:mm format
  };
  boardSpecific?: Record<number, Partial<DueDateNotificationSettings>>;
}

// Task-specific notifications
export interface TaskNotification {
  id: string;
  taskId: number;
  type: 'reminder' | 'overdue' | 'approaching' | 'completion' | 'assignment' | 'comment' | 'update';
  scheduledAt: string;
  sentAt?: string;
  acknowledged: boolean;
  snoozedUntil?: string;
  task: {
    id: number;
    title: string;
    dueDate?: string;
    priority: string;
    status: string;
    assignedTo?: string;
  };
  metadata?: {
    reminderHours?: number;
    previousStatus?: string;
    newStatus?: string;
    assignedBy?: string;
    comment?: string;
  };
}

// Notification delivery channels
export interface NotificationChannel {
  type: 'email' | 'push' | 'in-app' | 'slack' | 'teams' | 'webhook';
  enabled: boolean;
  config?: {
    webhookUrl?: string;
    slackChannel?: string;
    teamsWebhook?: string;
    emailTemplate?: string;
  };
}

// Notification delivery status
export interface NotificationDelivery {
  id: string;
  notificationId: string;
  channel: NotificationChannel['type'];
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  sentAt?: string;
  deliveredAt?: string;
  error?: string;
  retryCount: number;
}

// Bulk notification operations
export interface BulkNotificationOperation {
  operation: 'mark_read' | 'mark_unread' | 'delete' | 'archive' | 'snooze';
  notificationIds: string[];
  snoozeUntil?: string;
}

// Notification analytics
export interface NotificationAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  deliveryRate: number;
  readRate: number;
  channelBreakdown: Record<NotificationChannel['type'], {
    sent: number;
    delivered: number;
    failed: number;
  }>;
  popularNotificationTypes: Array<{
    type: string;
    count: number;
    readRate: number;
  }>;
}

// Component props
export interface DueDateNotificationPanelProps {
  board: import('./board').Board;
  tasks: import('./task').Task[];
  settings: DueDateNotificationSettings;
  notifications: TaskNotification[];
  onUpdateSettings: (settings: DueDateNotificationSettings) => Promise<void>;
  onAcknowledgeNotification: (notificationId: string) => Promise<void>;
  onSnoozeNotification: (notificationId: string, snoozeUntil: string) => Promise<void>;
  onBulkOperation?: (operation: BulkNotificationOperation) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
} 