// Celebration and Toast System Types

export interface TaskCompletionResult {
  success: boolean;
  task?: TaskDetails;
  pointsEarned?: number;
  achievementsUnlocked?: Achievement[];
  levelUp?: LevelUpData;
  celebration?: CelebrationConfig;
  error?: string;
}

export interface TaskCompletionEvent {
  taskId: number;
  userId: number;
  familyId?: number;
  taskTitle: string;
  pointsEarned: number;
  completedAt: string;
  achievementsUnlocked?: Achievement[];
  levelUp?: LevelUpData;
}

export interface TaskDetails {
  id: number;
  title: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  familyId?: number;
  isCompleted: boolean;
  status: string;
}

export interface Achievement {
  id?: number;
  name: string;
  title?: string;
  description?: string;
  points?: number;
  rarity?: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  unlockedAt?: string;
}

export interface LevelUpData {
  oldLevel: number;
  newLevel: number;
}

export interface CelebrationConfig {
  confetti: boolean;
  sound: boolean;
  message: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'achievement' | 'celebration';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  achievementsUnlocked?: Achievement[];
  actionUrl?: string;
  actionText?: string;
  confetti?: boolean;
  sound?: boolean;
}

export interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

export interface TaskCompletionCelebrationParams {
  taskTitle: string;
  pointsEarned: number;
  achievementsUnlocked?: Achievement[];
  levelUp?: LevelUpData;
}

export interface CelebrationEvent {
  type: 'confetti' | 'sound';
  soundType?: 'high-achievement' | 'medium-achievement' | 'task-complete';
}

export interface ToastEvent {
  type: 'success' | 'error' | 'warning' | 'info' | 'achievement' | 'celebration';
  title: string;
  message: string;
  duration?: number;
  achievementsUnlocked?: Achievement[];
  actionUrl?: string;
  actionText?: string;
}

export interface CompletionStats {
  tasksCompleted: number;
  pointsEarned: number;
  achievementsUnlocked: number;
  currentStreak: number;
}

export type CelebrationPeriod = 'day' | 'week' | 'month';

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

export interface NotificationItem {
  id: string;
  type: 'info' | 'warning' | 'success' | 'achievement' | 'task' | 'family';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionText?: string;
  userId?: number;
  familyId?: number;
} 