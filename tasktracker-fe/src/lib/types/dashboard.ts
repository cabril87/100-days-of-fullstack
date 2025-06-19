/*
 * Dashboard Types & Interfaces
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { User } from './auth';
import { FamilyDTO } from './family-invitation';
import { Task, TaskStats } from './task';
import { 
  UseGamificationEventsReturn,
  Achievement,
  Badge
} from './gamification';

export interface DashboardStats {
  tasksCompleted: number;
  activeGoals: number;
  focusTime: number;
  totalPoints: number;
  familyMembers: number;
  familyTasks: number;
  familyPoints: number;
  streakDays: number;
  totalFamilies: number;
}

export interface DashboardContentProps {
  user: User | null;
  initialData: {
    family: FamilyDTO | null;
    stats: DashboardStats;
    recentTasks: Task[];
    taskStats: TaskStats;
  };
}

export interface FamilyActivityItem {
  id: string;
  type: 'task_completed' | 'goal_achieved' | 'member_joined' | 'points_earned' | 'family_created' | 'invitation_sent';
  memberName: string;
  memberAvatarUrl?: string;
  description: string;
  timestamp: Date;
  points?: number;
  taskTitle?: string;
  goalTitle?: string;
}

export interface UserProgress {
  currentLevel: number;
  pointsToNextLevel: number;
  experiencePercentage: number;
  totalExperience: number;
  achievements: Achievement[];
}

// Backend API interfaces for activity service
export interface BackendActivityItem {
  id: number;
  actionType?: string;
  type?: string; // Alternative field name for actionType
  actorDisplayName?: string;
  actor?: { displayName: string };
  user?: { displayName: string }; // Alternative field name for actor
  actorId: number;
  description?: string;
  timestamp?: string;
  createdAt?: string; // Alternative field name for timestamp
  entityType?: string;
}

export interface BackendUserProgress {
  currentLevel: number;
  totalPoints: number;
  pointsToNextLevel: number;
}

export interface UserProgressApiResponse {
  totalPointsEarned?: number;
  currentPoints?: number;
  currentLevel?: number;
  currentStreak?: number;
  pointsToNextLevel?: number;
  longestStreak?: number;
  lastActivityDate?: string;
  joinedAt?: string;
  updatedAt?: string;
}

export interface AchievementApiResponse {
  id?: number;
  achievementId?: number;
  name?: string;
  achievementName?: string;
  description?: string;
  category?: string;
  pointValue?: number;
  points?: number;
  iconUrl?: string;
  difficulty?: string;
  unlockedAt?: string;
  createdAt?: string;
  isCompleted?: boolean;
}

export interface BadgeApiResponse {
  id?: number;
  badgeId?: number;
  name?: string;
  badgeName?: string;
  description?: string;
  iconUrl?: string;
  rarity?: string;
  pointValue?: number;
  points?: number;
  earnedAt?: string;
  createdAt?: string;
  isDisplayed?: boolean;
}

export interface RecentAchievementEvent {
  achievementId: number;
  achievementName: string;
  points: number;
  timestamp: Date;
  userId: number;
}

// ================================
// DASHBOARD CONNECTION TYPES
// ================================

export interface DashboardConnectionsProps {
  userId?: number;
  enableLogging?: boolean;
}

export interface ConnectionHealthMetrics {
  totalConnections: number;
  totalDisconnections: number;
  avgConnectionTime: number;
  uptime: number;
}

export interface ConnectionHealth {
  isHealthy: boolean;
  quality: 'excellent' | 'good' | 'fair' | 'degraded' | 'poor';
  consecutiveFailures: number;
  lastError: string | null;
  metrics: ConnectionHealthMetrics;
}

export interface DashboardConnectionsReturn {
  // Connection states
  isConnected: boolean;
  signalRStatus: string;
  
  // ✨ ENTERPRISE: Advanced connection analytics
  connectionHealth: ConnectionHealth;
  
  // Gamification data - now fully compatible with UseGamificationEventsReturn
  gamificationData: DashboardGamificationState;
  
  // Connection methods
  refreshGamificationData: () => Promise<void>;
  reconnect: () => Promise<void>;
}

// Updated to implement UseGamificationEventsReturn for full compatibility
export interface DashboardGamificationState extends UseGamificationEventsReturn {
  // Additional dashboard-specific properties
  unlockedAchievements: Achievement[]; // Now correctly typed as Achievement[]
  earnedBadges: Badge[]; // Now correctly typed as Badge[]
  
  // Dashboard-specific recent events (separate from inherited recentAchievements)
  dashboardRecentAchievements?: RecentAchievementEvent[];
  
  // API Response data (for internal use)
  rawAchievements?: AchievementApiResponse[];
  rawBadges?: BadgeApiResponse[];
}

// Utility type for transforming API responses to proper types
export interface ApiResponseTransformer {
  transformAchievement: (apiResponse: AchievementApiResponse) => Achievement;
  transformBadge: (apiResponse: BadgeApiResponse) => Badge;
} 