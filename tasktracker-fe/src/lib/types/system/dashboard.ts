/*
 * Dashboard System Types
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * Dashboard-related types following .cursorrules standards
 * All types properly organized in lib/types/system/ subdirectory
 */

import { 
  UseGamificationEventsReturn,
  Achievement,
  Badge
} from '@/lib/types/gamification';

// Import FamilyActivityItem from proper location following .cursorrules
import type { FamilyActivityItem } from './activity';

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

// Component props moved to @/lib/props/components/system.props.ts for .cursorrules compliance

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

// DashboardConnectionsProps moved to @/lib/props/components/system.props.ts for .cursorrules compliance

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

// ================================
// DASHBOARD WIDGET TYPES
// ================================

export interface DashboardWidget {
  id: string;
  type: DashboardWidgetType;
  title: string;
  position: WidgetPosition;
  size: WidgetSize;
  isVisible: boolean;
  config: WidgetConfig;
  lastUpdated: Date;
}

export type DashboardWidgetType = 
  | 'tasks_overview'
  | 'family_activity'
  | 'achievements'
  | 'progress_chart'
  | 'quick_actions'
  | 'calendar_preview'
  | 'leaderboard'
  | 'notifications';

export interface WidgetPosition {
  row: number;
  column: number;
  width: number;
  height: number;
}

export type WidgetSize = 'small' | 'medium' | 'large' | 'full-width';

export interface WidgetConfig {
  refreshInterval?: number;
  showHeaders?: boolean;
  maxItems?: number;
  colorScheme?: 'light' | 'dark' | 'auto';
  customSettings?: Record<string, unknown>;
}

// ================================
// DASHBOARD STATE
// ================================

export interface DashboardState {
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  isEditing: boolean;
  lastSaved: Date;
  isDirty: boolean;
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  spacing: number;
  responsive: boolean;
}

// ================================
// DASHBOARD DATA
// ================================

export interface DashboardData {
  user: DashboardUserData;
  family: DashboardFamilyData;
  tasks: DashboardTaskData;
  activities: FamilyActivityItem[];
  notifications: DashboardNotificationData;
  achievements: DashboardAchievementData;
}

export interface DashboardUserData {
  totalPoints: number;
  currentLevel: number;
  streak: number;
  tasksCompleted: number;
  rank: number;
}

export interface DashboardFamilyData {
  memberCount: number;
  totalFamilyPoints: number;
  activeChallenges: number;
  upcomingEvents: number;
}

export interface DashboardTaskData {
  pending: number;
  completed: number;
  overdue: number;
  priority: TaskPriorityCount;
}

export interface TaskPriorityCount {
  urgent: number;
  high: number;
  medium: number;
  low: number;
}

export interface DashboardNotificationData {
  unread: number;
  recent: NotificationSummary[];
}

export interface NotificationSummary {
  id: string;
  type: string;
  title: string;
  timestamp: Date;
  isRead: boolean;
}

export interface DashboardAchievementData {
  recentlyUnlocked: number;
  totalAchievements: number;
  progress: AchievementProgress[];
}

export interface AchievementProgress {
  id: string;
  name: string;
  progress: number;
  total: number;
  category: string;
} 