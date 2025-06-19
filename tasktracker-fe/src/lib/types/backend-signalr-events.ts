/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Backend SignalR Event Types
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md rules
 * Exact matches to what TaskTrackerAPI sends via SignalR
 */

// ================================
// BACKEND GAMIFICATION EVENTS
// ================================

/**
 * Backend gamification event DTO - matches what comes from ReceiveGamificationEvent
 * MATCHES: TaskTrackerAPI.Hubs.UnifiedMainHub.ReceiveGamificationEvent
 */
export interface BackendGamificationEventDTO {
  eventType: 'PointsEarned' | 'AchievementUnlocked' | 'LevelUp' | 'StreakUpdated' | 'BadgeEarned';
  userId: number;
  familyId?: number;
  data: BackendGamificationEventData;
  timestamp: string; // ISO string from backend
  shouldNotifyFamily: boolean;
  celebrationLevel: number;
}

/**
 * Backend gamification event data - varies by event type
 */
export interface BackendGamificationEventData {
  // Points Earned
  points?: number;
  reason?: string;
  taskId?: number;
  
  // Achievement Unlocked
  achievementId?: number;
  achievementName?: string;
  category?: string;
  difficulty?: 'VeryEasy' | 'Easy' | 'Medium' | 'Hard' | 'VeryHard';
  
  // Level Up
  newLevel?: number;
  previousLevel?: number;
  bonusPoints?: number;
  
  // Streak Updated
  currentStreak?: number;
  previousStreak?: number;
  streakType?: string;
  
  // Badge Earned
  badgeId?: number;
  badgeName?: string;
  rarity?: string;
}

// ================================
// BACKEND TASK COMPLETION EVENTS
// ================================

/**
 * Backend task completion event DTO - matches ReceiveTaskCompletionEvent
 * MATCHES: TaskTrackerAPI.DTOs.Tasks.TaskCompletionEventDTO
 */
export interface BackendTaskCompletionEventDTO {
  taskId: number;
  taskTitle: string;
  completedBy: string;
  completedByUserId: number;
  pointsEarned: number;
  completionTime: string; // ISO string from backend
  familyId?: number;
  category: string;
  priority: string;
  achievementUnlocked?: string;
  triggeredLevelUp?: boolean;
  newLevel?: number;
}

// ================================
// BACKEND FAMILY EVENTS
// ================================

/**
 * Backend family activity event DTO - matches ReceiveFamilyActivity
 * MATCHES: TaskTrackerAPI.DTOs.Family.FamilyActivityEventDTO
 */
export interface BackendFamilyActivityEventDTO {
  familyId: number;
  userId: number;
  activityType: string;
  description: string;
  pointsEarned?: number;
  timestamp: string; // ISO string from backend
  relatedEntityId?: number;
  relatedEntityType?: string;
  priority?: string;
  category?: string;
  userDisplayName?: string;
  activityIcon?: string;
}

/**
 * Backend family milestone event DTO - matches ReceiveFamilyMilestone
 * MATCHES: TaskTrackerAPI.DTOs.Family.FamilyMilestoneEventDTO
 */
export interface BackendFamilyMilestoneEventDTO {
  familyId: number;
  milestoneType: string;
  title: string;
  description: string;
  pointsEarned?: number;
  achievedByUserId?: number;
  timestamp: string; // ISO string from backend
  celebrationLevel?: number;
  milestoneIcon?: string;
  colorTheme?: string;
  triggerConfetti?: boolean;
  soundEffect?: string;
}

// ================================
// BACKEND SIGNALR EVENT HANDLERS
// ================================

/**
 * Backend SignalR event handlers - matches actual hub method names
 */
export interface BackendSignalREventHandlers {
  // Connection events
  onConnected?: () => void;
  onDisconnected?: (error?: Error) => void;
  onReconnecting?: () => void;
  onReconnected?: () => void;
  onError?: (error: Error) => void;

  // Backend gamification events
  onReceiveGamificationEvent?: (event: BackendGamificationEventDTO) => void;
  
  // Backend task events
  onReceiveTaskCompletionEvent?: (event: BackendTaskCompletionEventDTO) => void;
  onReceiveFamilyTaskCompletion?: (event: BackendTaskCompletionEventDTO) => void;
  
  // Backend family events
  onReceiveFamilyActivity?: (event: BackendFamilyActivityEventDTO) => void;
  onReceiveFamilyMilestone?: (event: BackendFamilyMilestoneEventDTO) => void;
  
  // Backend notification events
  onReceiveNotification?: (event: BackendNotificationEventDTO) => void;
  onNotificationStatusUpdated?: (event: BackendNotificationStatusDTO) => void;
  onUnreadCountUpdated?: (event: BackendUnreadCountDTO) => void;
}

// ================================
// BACKEND NOTIFICATION EVENTS
// ================================

/**
 * Backend notification event DTO
 */
export interface BackendNotificationEventDTO {
  id: number;
  userId: number;
  familyId?: number;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string; // ISO string from backend
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
}

/**
 * Backend notification status update DTO
 */
export interface BackendNotificationStatusDTO {
  notificationId: number;
  userId: number;
  isRead: boolean;
  readAt?: string; // ISO string from backend
}

/**
 * Backend unread count update DTO
 */
export interface BackendUnreadCountDTO {
  userId: number;
  unreadCount: number;
  familyUnreadCount?: number;
}

// ================================
// EVENT PARSING UTILITIES
// ================================

/**
 * Parsed gamification events for frontend consumption
 */
export interface ParsedGamificationEvents {
  pointsEarned?: {
    userId: number;
    points: number;
    reason: string;
    timestamp: Date;
    taskId?: number;
  };
  achievementUnlocked?: {
    userId: number;
    achievementId: number;
    achievementName: string;
    points: number;
    category: string;
    difficulty: 'VeryEasy' | 'Easy' | 'Medium' | 'Hard' | 'VeryHard';
    timestamp: Date;
  };
  levelUp?: {
    userId: number;
    newLevel: number;
    previousLevel: number;
    bonusPoints?: number;
    timestamp: Date;
  };
  streakUpdated?: {
    userId: number;
    currentStreak: number;
    previousStreak: number;
    streakType: string;
    timestamp: Date;
  };
  badgeEarned?: {
    userId: number;
    badgeId: number;
    badgeName: string;
    rarity: string;
    points?: number;
    timestamp: Date;
  };
}

/**
 * Parse backend gamification event into typed frontend events
 */
export function parseGamificationEvent(backendEvent: BackendGamificationEventDTO): ParsedGamificationEvents {
  const timestamp = new Date(backendEvent.timestamp);
  const result: ParsedGamificationEvents = {};
  
  switch (backendEvent.eventType) {
    case 'PointsEarned':
      if (backendEvent.data.points && backendEvent.data.reason) {
        result.pointsEarned = {
          userId: backendEvent.userId,
          points: backendEvent.data.points,
          reason: backendEvent.data.reason,
          timestamp,
          taskId: backendEvent.data.taskId
        };
      }
      break;
      
    case 'AchievementUnlocked':
      if (backendEvent.data.achievementId && backendEvent.data.achievementName) {
        result.achievementUnlocked = {
          userId: backendEvent.userId,
          achievementId: backendEvent.data.achievementId,
          achievementName: backendEvent.data.achievementName,
          points: backendEvent.data.points || 0,
          category: backendEvent.data.category || 'General',
          difficulty: backendEvent.data.difficulty || 'Medium',
          timestamp
        };
      }
      break;
      
    case 'LevelUp':
      if (backendEvent.data.newLevel && backendEvent.data.previousLevel) {
        result.levelUp = {
          userId: backendEvent.userId,
          newLevel: backendEvent.data.newLevel,
          previousLevel: backendEvent.data.previousLevel,
          bonusPoints: backendEvent.data.bonusPoints,
          timestamp
        };
      }
      break;
      
    case 'StreakUpdated':
      if (backendEvent.data.currentStreak !== undefined && backendEvent.data.previousStreak !== undefined) {
        result.streakUpdated = {
          userId: backendEvent.userId,
          currentStreak: backendEvent.data.currentStreak,
          previousStreak: backendEvent.data.previousStreak,
          streakType: backendEvent.data.streakType || 'daily',
          timestamp
        };
      }
      break;
      
    case 'BadgeEarned':
      if (backendEvent.data.badgeId && backendEvent.data.badgeName) {
        result.badgeEarned = {
          userId: backendEvent.userId,
          badgeId: backendEvent.data.badgeId,
          badgeName: backendEvent.data.badgeName,
          rarity: backendEvent.data.rarity || 'Common',
          points: backendEvent.data.points,
          timestamp
        };
      }
      break;
  }
  
  return result;
}

/**
 * Convert backend task completion event to frontend format
 */
export function parseTaskCompletionEvent(backendEvent: BackendTaskCompletionEventDTO): TaskCompletionEventDTO {
  return {
    taskId: backendEvent.taskId,
    taskTitle: backendEvent.taskTitle,
    completedBy: backendEvent.completedBy,
    completedByUserId: backendEvent.completedByUserId,
    pointsEarned: backendEvent.pointsEarned,
    completionTime: new Date(backendEvent.completionTime),
    familyId: backendEvent.familyId,
    category: backendEvent.category,
    priority: backendEvent.priority,
    achievementUnlocked: backendEvent.achievementUnlocked,
    triggeredLevelUp: backendEvent.triggeredLevelUp,
    newLevel: backendEvent.newLevel
  };
}

/**
 * Convert backend family activity event to frontend format
 */
export function parseFamilyActivityEvent(backendEvent: BackendFamilyActivityEventDTO): FamilyActivityEventDTO {
  return {
    familyId: backendEvent.familyId,
    userId: backendEvent.userId,
    activityType: backendEvent.activityType,
    description: backendEvent.description,
    pointsEarned: backendEvent.pointsEarned,
    timestamp: new Date(backendEvent.timestamp),
    relatedEntityId: backendEvent.relatedEntityId,
    relatedEntityType: backendEvent.relatedEntityType,
    priority: backendEvent.priority,
    category: backendEvent.category,
    userDisplayName: backendEvent.userDisplayName,
    activityIcon: backendEvent.activityIcon
  };
}

/**
 * Convert backend family milestone event to frontend format
 */
export function parseFamilyMilestoneEvent(backendEvent: BackendFamilyMilestoneEventDTO): FamilyMilestoneEventDTO {
  return {
    familyId: backendEvent.familyId,
    milestoneType: backendEvent.milestoneType,
    title: backendEvent.title,
    description: backendEvent.description,
    pointsEarned: backendEvent.pointsEarned,
    achievedByUserId: backendEvent.achievedByUserId,
    timestamp: new Date(backendEvent.timestamp),
    celebrationLevel: backendEvent.celebrationLevel,
    milestoneIcon: backendEvent.milestoneIcon,
    colorTheme: backendEvent.colorTheme,
    triggerConfetti: backendEvent.triggerConfetti,
    soundEffect: backendEvent.soundEffect
  };
}

// Import frontend types for parsing functions
import type {
  TaskCompletionEventDTO,
  FamilyActivityEventDTO,
  FamilyMilestoneEventDTO
} from './family-events';

// Re-export frontend types for convenience
export type {
  TaskCompletionEventDTO,
  FamilyActivityEventDTO,
  FamilyMilestoneEventDTO
} from './family-events'; 