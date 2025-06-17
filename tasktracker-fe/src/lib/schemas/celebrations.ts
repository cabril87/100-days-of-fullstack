import { z } from 'zod';

// Task completion schemas
export const TaskCompletionEventSchema = z.object({
  taskId: z.number(),
  userId: z.number(),
  familyId: z.number().optional(),
  taskTitle: z.string(),
  pointsEarned: z.number(),
  completedAt: z.string(),
  achievementsUnlocked: z.array(z.object({
    id: z.number().optional(),
    name: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    points: z.number().optional(),
    rarity: z.enum(['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']).optional(),
    unlockedAt: z.string().optional()
  })).optional(),
  levelUp: z.object({
    oldLevel: z.number(),
    newLevel: z.number()
  }).optional()
});

export const TaskCompletionResultSchema = z.object({
  success: z.boolean(),
  task: z.object({
    id: z.number(),
    title: z.string(),
    description: z.string().optional(),
    priority: z.string().optional(),
    dueDate: z.string().optional(),
    familyId: z.number().optional(),
    isCompleted: z.boolean(),
    status: z.string()
  }).optional(),
  pointsEarned: z.number().optional(),
  achievementsUnlocked: z.array(z.object({
    id: z.number().optional(),
    name: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    points: z.number().optional(),
    rarity: z.enum(['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']).optional(),
    unlockedAt: z.string().optional()
  })).optional(),
  levelUp: z.object({
    oldLevel: z.number(),
    newLevel: z.number()
  }).optional(),
  celebration: z.object({
    confetti: z.boolean(),
    sound: z.boolean(),
    message: z.string()
  }).optional(),
  error: z.string().optional()
});

// Toast notification schemas
export const ToastSchema = z.object({
  id: z.string(),
  type: z.enum(['success', 'error', 'warning', 'info', 'achievement', 'celebration']),
  title: z.string(),
  message: z.string(),
  duration: z.number().optional(),
  persistent: z.boolean().optional(),
  achievementsUnlocked: z.array(z.object({
    id: z.number().optional(),
    name: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    points: z.number().optional(),
    rarity: z.enum(['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']).optional(),
    unlockedAt: z.string().optional()
  })).optional(),
  actionUrl: z.string().optional(),
  actionText: z.string().optional(),
  confetti: z.boolean().optional(),
  sound: z.boolean().optional()
});

// Family activity schemas
export const FamilyActivityItemSchema = z.object({
  id: z.string(),
  type: z.enum(['task_completed', 'achievement_unlocked', 'member_joined', 'streak_updated', 'points_earned']),
  userId: z.number(),
  userName: z.string(),
  userAvatar: z.string().optional(),
  title: z.string(),
  description: z.string(),
  points: z.number().optional(),
  timestamp: z.date(),
  familyId: z.number().optional()
});

// Notification schemas
export const NotificationItemSchema = z.object({
  id: z.string(),
  type: z.enum(['info', 'warning', 'success', 'achievement', 'task', 'family']),
  title: z.string(),
  message: z.string(),
  timestamp: z.date(),
  isRead: z.boolean(),
  priority: z.enum(['low', 'medium', 'high']),
  actionUrl: z.string().optional(),
  actionText: z.string().optional(),
  userId: z.number().optional(),
  familyId: z.number().optional()
});

// Celebration event schemas
export const CelebrationEventSchema = z.object({
  type: z.enum(['confetti', 'sound']),
  soundType: z.enum(['high-achievement', 'medium-achievement', 'task-complete']).optional()
});

export const TaskCompletionCelebrationParamsSchema = z.object({
  taskTitle: z.string(),
  pointsEarned: z.number(),
  achievementsUnlocked: z.array(z.object({
    id: z.number().optional(),
    name: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    points: z.number().optional(),
    rarity: z.enum(['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']).optional(),
    unlockedAt: z.string().optional()
  })).optional(),
  levelUp: z.object({
    oldLevel: z.number(),
    newLevel: z.number()
  }).optional()
});

// Type exports for runtime use
export type TaskCompletionEvent = z.infer<typeof TaskCompletionEventSchema>;
export type TaskCompletionResult = z.infer<typeof TaskCompletionResultSchema>;
export type Toast = z.infer<typeof ToastSchema>;
export type FamilyActivityItem = z.infer<typeof FamilyActivityItemSchema>;
export type NotificationItem = z.infer<typeof NotificationItemSchema>;
export type CelebrationEvent = z.infer<typeof CelebrationEventSchema>;
export type TaskCompletionCelebrationParams = z.infer<typeof TaskCompletionCelebrationParamsSchema>; 