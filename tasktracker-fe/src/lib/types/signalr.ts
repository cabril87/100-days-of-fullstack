/**
 * SignalR and real-time communication related types
 */

export interface GamificationEvent {
  type: 'points_earned' | 'achievement_unlocked' | 'level_up' | 'streak_updated' | 'challenge_progress' | 'badge_earned' | 'reward_redeemed';
  data: any;
  userId: number;
  timestamp: string;
}

export interface SignalRConnection {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  on: (methodName: string, callback: (...args: unknown[]) => void) => void;
  off: (methodName: string, callback?: (...args: unknown[]) => void) => void;
  invoke: (methodName: string, ...args: unknown[]) => Promise<unknown>;
  send: (methodName: string, ...args: unknown[]) => Promise<void>;
  state: string;
}

export interface SignalREvents {
  // Connection events
  onConnected: () => void;
  onDisconnected: () => void;
  onError: (error: Error) => void;
  onGamificationUpdate: (update: GamificationEvent) => void;
  
  // Notification events
  ReceiveNotification: (notification: unknown) => void;
  NotificationRead: (notificationId: string) => void;
  NotificationDeleted: (notificationId: string) => void;
  
  // Gamification events  
  PointsAwarded: (data: unknown) => void;
  AchievementUnlocked: (data: unknown) => void;
  BadgeEarned: (data: unknown) => void;
  LevelUp: (data: unknown) => void;
  StreakUpdated: (data: unknown) => void;
} 