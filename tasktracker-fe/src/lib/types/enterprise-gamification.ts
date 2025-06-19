/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Enterprise Gamification Types
 * Comprehensive family-friendly gamification system with enterprise-level features
 */



// ================================
// FAMILY GAMIFICATION CORE
// ================================

export interface FamilyGamificationProfile {
  familyId: number;
  familyName: string;
  totalFamilyPoints: number;
  familyLevel: number;
  familyStreak: number;
  familyRank: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  familyBadges: FamilyBadge[];
  familyAchievements: FamilyAchievement[];
  weeklyGoals: FamilyGoal[];
  monthlyChallenge?: FamilyChallenge;
  settings: FamilyGamificationSettings;
  statistics: FamilyGamificationStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface FamilyMemberGamification {
  userId: number;
  familyId: number;
  memberName: string;
  memberRole: 'parent' | 'child' | 'teen' | 'guardian';
  ageGroup: 'child' | 'teen' | 'adult';
  currentPoints: number;
  currentLevel: number;
  currentStreak: number;
  weeklyContribution: number;
  monthlyContribution: number;
  personalBadges: PersonalBadge[];
  personalAchievements: PersonalAchievement[];
  preferences: MemberGamificationPreferences;
  restrictions?: ParentalRestrictions;
}

// ================================
// ACHIEVEMENTS SYSTEM
// ================================

export interface FamilyAchievement {
  id: string;
  type: 'family' | 'collaborative' | 'milestone';
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: AchievementCategory;
  pointsReward: number;
  requirements: AchievementRequirement[];
  unlockedAt?: Date;
  unlockedBy: 'family' | number; // family or specific user ID
  celebrationStyle: CelebrationStyle;
  shareableMessage: string;
  familyBonus?: number; // Extra points for family achievements
}

export interface PersonalAchievement {
  id: string;
  userId: number;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  pointsReward: number;
  unlockedAt: Date;
  isSharedWithFamily: boolean;
  parentApprovalRequired?: boolean;
  approvedBy?: number; // parent user ID
}

export type AchievementCategory = 
  | 'task_completion'
  | 'consistency' 
  | 'teamwork'
  | 'leadership'
  | 'creativity'
  | 'responsibility'
  | 'helpfulness'
  | 'learning'
  | 'family_time'
  | 'chores'
  | 'homework'
  | 'kindness';

export interface AchievementRequirement {
  type: 'task_count' | 'streak_days' | 'points_earned' | 'family_participation' | 'time_period';
  target: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  category?: string;
  description: string;
}

// ================================
// BADGES SYSTEM
// ================================

export interface FamilyBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  type: 'family' | 'seasonal' | 'special_event';
  earnedAt: Date;
  earnedBy: 'family' | number[];
  displayPriority: number;
  isLimited?: boolean;
  expiresAt?: Date;
}

export interface PersonalBadge {
  id: string;
  userId: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: BadgeCategory;
  earnedAt: Date;
  level: 1 | 2 | 3 | 4 | 5; // Badge progression levels
  nextLevelRequirement?: string;
  isShowcased: boolean; // Display on profile
}

export type BadgeCategory = 
  | 'completion'
  | 'consistency'
  | 'quality'
  | 'speed'
  | 'collaboration'
  | 'leadership'
  | 'creativity'
  | 'responsibility';

// ================================
// CHALLENGES & GOALS
// ================================

export interface FamilyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'weekly' | 'monthly' | 'seasonal' | 'custom';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  icon: string;
  startDate: Date;
  endDate: Date;
  targetPoints: number;
  currentProgress: number;
  participants: number[];
  rewards: ChallengeReward[];
  milestones: ChallengeMilestone[];
  status: 'upcoming' | 'active' | 'completed' | 'failed';
  isOptional: boolean;
  ageRestrictions?: string[];
}

export interface FamilyGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string; // 'tasks', 'points', 'days', etc.
  type: 'individual' | 'collaborative' | 'family';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  assignedTo?: number[]; // user IDs
  rewards: GoalReward[];
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  createdBy: number;
  createdAt: Date;
}

export interface ChallengeReward {
  type: 'points' | 'badge' | 'privilege' | 'family_activity' | 'custom';
  value: number | string;
  description: string;
  icon: string;
  isForFamily: boolean;
  requiresParentApproval?: boolean;
}

export interface GoalReward {
  type: 'points' | 'badge' | 'privilege' | 'allowance' | 'screen_time' | 'custom';
  value: number | string;
  description: string;
  icon: string;
  eligibleMembers: number[];
}

export interface ChallengeMilestone {
  percentage: number;
  title: string;
  reward: ChallengeReward;
  isReached: boolean;
  reachedAt?: Date;
}

// ================================
// CELEBRATION & FEEDBACK
// ================================

export interface CelebrationStyle {
  animation: 'confetti' | 'fireworks' | 'sparkles' | 'bounce' | 'glow';
  sound: 'cheer' | 'bell' | 'fanfare' | 'pop' | 'none';
  colors: string[];
  duration: number; // milliseconds
  intensity: 'subtle' | 'normal' | 'intense';
  familyNotification: boolean;
}

export interface GamificationFeedback {
  id: string;
  userId: number;
  type: 'encouragement' | 'milestone' | 'reminder' | 'celebration' | 'tip';
  message: string;
  icon: string;
  priority: 'low' | 'medium' | 'high';
  isPersonalized: boolean;
  triggerEvent: string;
  displayDuration: number;
  createdAt: Date;
  isRead: boolean;
}

// ================================
// LEADERBOARDS & RANKINGS
// ================================

export interface FamilyLeaderboard {
  type: 'weekly' | 'monthly' | 'all_time';
  category: 'points' | 'tasks' | 'streak' | 'achievements';
  members: LeaderboardEntry[];
  lastUpdated: Date;
  isPublic: boolean; // Visible to other families (opt-in)
}

export interface LeaderboardEntry {
  userId: number;
  memberName: string;
  ageGroup: 'child' | 'teen' | 'adult';
  score: number;
  rank: number;
  previousRank?: number;
  trend: 'up' | 'down' | 'same';
  avatar?: string;
  badge?: string; // Current showcase badge
}

export interface FamilyRanking {
  currentRank: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  pointsToNextRank: number;
  rankProgress: number; // percentage
  rankBenefits: RankBenefit[];
  rankHistory: RankHistoryEntry[];
}

export interface RankBenefit {
  type: 'feature_unlock' | 'bonus_multiplier' | 'exclusive_challenges' | 'custom_rewards';
  description: string;
  icon: string;
  isActive: boolean;
}

export interface RankHistoryEntry {
  rank: string;
  achievedAt: Date;
  pointsAtTime: number;
}

// ================================
// SETTINGS & PREFERENCES
// ================================

export interface FamilyGamificationSettings {
  isEnabled: boolean;
  difficultyLevel: 'easy' | 'normal' | 'hard';
  celebrationLevel: 'minimal' | 'normal' | 'festive';
  soundEnabled: boolean;
  animationsEnabled: boolean;
  weeklyGoalsEnabled: boolean;
  monthlyChallengesEnabled: boolean;
  leaderboardEnabled: boolean;
  publicRankingOptIn: boolean;
  parentalOversight: ParentalOversightSettings;
  notifications: GamificationNotificationSettings;
  rewards: RewardSettings;
}

export interface MemberGamificationPreferences {
  celebrationStyle: 'minimal' | 'normal' | 'max';
  preferredCategories: AchievementCategory[];
  goalReminders: boolean;
  achievementSharing: boolean;
  leaderboardParticipation: boolean;
  motivationalMessages: boolean;
  difficultyPreference: 'challenge_me' | 'steady_progress' | 'fun_focus';
}

export interface ParentalOversightSettings {
  requireApprovalForRewards: boolean;
  maxPointsPerDay?: number;
  restrictedCategories: AchievementCategory[];
  allowPeerComparison: boolean;
  screenTimeRewards: boolean;
  allowanceIntegration: boolean;
  reportingFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface ParentalRestrictions {
  maxDailyPoints?: number;
  maxWeeklyPoints?: number;
  restrictedRewardTypes: string[];
  requiresApprovalFor: string[];
  blockedCategories: AchievementCategory[];
  timeRestrictions?: {
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
  };
}

export interface GamificationNotificationSettings {
  achievements: boolean;
  levelUp: boolean;
  streakReminders: boolean;
  goalDeadlines: boolean;
  familyChallenges: boolean;
  leaderboardUpdates: boolean;
  encouragementMessages: boolean;
  frequency: 'immediate' | 'daily_digest' | 'weekly_summary';
}

export interface RewardSettings {
  pointsToAllowanceRatio?: number; // points per dollar/currency unit
  screenTimeRewards: boolean;
  privilegeRewards: boolean;
  customRewards: CustomReward[];
  autoRedemption: boolean;
  parentApprovalRequired: boolean;
}

export interface CustomReward {
  id: string;
  name: string;
  description: string;
  cost: number; // in points
  type: 'privilege' | 'activity' | 'item' | 'experience';
  icon: string;
  isAvailable: boolean;
  requiresParentApproval: boolean;
  ageRestrictions?: string[];
  cooldownPeriod?: number; // days
}

// ================================
// STATISTICS & ANALYTICS
// ================================

export interface FamilyGamificationStats {
  totalPointsEarned: number;
  totalTasksCompleted: number;
  totalAchievementsUnlocked: number;
  averageFamilyStreak: number;
  mostActiveDay: string;
  mostProductiveHour: number;
  topCategory: AchievementCategory;
  weeklyProgress: WeeklyProgress[];
  monthlyProgress: MonthlyProgress[];
  memberContributions: MemberContribution[];
  engagementMetrics: EngagementMetrics;
}

export interface WeeklyProgress {
  weekStart: Date;
  weekEnd: Date;
  totalPoints: number;
  tasksCompleted: number;
  achievementsUnlocked: number;
  familyStreak: number;
  participationRate: number; // percentage of family members active
}

export interface MonthlyProgress {
  month: number;
  year: number;
  totalPoints: number;
  tasksCompleted: number;
  achievementsUnlocked: number;
  challengesCompleted: number;
  averageStreak: number;
  topPerformer: number; // user ID
}

export interface MemberContribution {
  userId: number;
  memberName: string;
  pointsContributed: number;
  tasksComplributed: number;
  achievementsEarned: number;
  leadershipMoments: number;
  helpfulActions: number;
  consistencyScore: number; // 0-100
}

export interface EngagementMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  averageSessionDuration: number; // minutes
  featureUsage: FeatureUsage[];
  retentionRate: number; // percentage
  satisfactionScore?: number; // 1-10 if available
}

export interface FeatureUsage {
  feature: string;
  usageCount: number;
  lastUsed: Date;
  popularityRank: number;
}

// ================================
// WIDGET & COMPONENT PROPS
// ================================

export interface EnterpriseGamificationWidgetProps {
  familyId?: number;
  userId?: number;
  className?: string;
  isCompact?: boolean;
  showFamilyData?: boolean;
  showPersonalData?: boolean;
  theme?: 'light' | 'dark' | 'colorful' | 'minimal';
  animationsEnabled?: boolean;
  realTimeUpdates?: boolean;
}

export interface FamilyDashboardProps extends EnterpriseGamificationWidgetProps {
  layout: 'grid' | 'list' | 'cards';
  widgetConfiguration: WidgetConfiguration[];
  customization: DashboardCustomization;
}

export interface WidgetConfiguration {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isVisible: boolean;
  settings: Record<string, unknown>;
  permissions: WidgetPermissions;
}

export interface WidgetPermissions {
  canView: number[]; // user IDs
  canEdit: number[]; // user IDs
  canHide: number[]; // user IDs
  requiresParentApproval: boolean;
}

export interface DashboardCustomization {
  theme: string;
  colorScheme: string[];
  backgroundPattern?: string;
  familyMotto?: string;
  showcaseAchievements: string[];
  widgetOrder: string[];
  isPublic: boolean;
}

// ================================
// API INTERFACES
// ================================

export interface GamificationApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  timestamp: Date;
  familyContext?: {
    familyId: number;
    familyName: string;
    memberCount: number;
  };
}

export interface GamificationEventPayload {
  eventType: 'achievement_unlocked' | 'level_up' | 'streak_updated' | 'challenge_completed' | 'goal_achieved';
  userId: number;
  familyId: number;
  data: Record<string, unknown>;
  timestamp: Date;
  shouldNotifyFamily: boolean;
  celebrationLevel: 'minimal' | 'normal' | 'festive';
}

// ================================
// HOOKS & UTILITIES
// ================================

export interface UseEnterpriseGamificationReturn {
  // Family data
  familyProfile: FamilyGamificationProfile | null;
  familyMembers: FamilyMemberGamification[];
  familyLeaderboard: FamilyLeaderboard | null;
  familyRanking: FamilyRanking | null;
  
  // Personal data
  personalStats: FamilyMemberGamification | null;
  personalAchievements: PersonalAchievement[];
  personalBadges: PersonalBadge[];
  
  // Goals & challenges
  activeGoals: FamilyGoal[];
  activeChallenges: FamilyChallenge[];
  weeklyProgress: WeeklyProgress | null;
  
  // State
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  
  // Actions
  completeGoal: (goalId: string) => Promise<void>;
  joinChallenge: (challengeId: string) => Promise<void>;
  redeemReward: (rewardId: string) => Promise<void>;
  updatePreferences: (preferences: Partial<MemberGamificationPreferences>) => Promise<void>;
  refreshData: () => Promise<void>;
}

export interface GamificationContextValue extends UseEnterpriseGamificationReturn {
  // Additional context methods
  celebrateAchievement: (achievementId: string) => void;
  dismissCelebration: (celebrationId: string) => void;
  shareAchievement: (achievementId: string, platform: string) => Promise<void>;
  reportProgress: (type: string, value: number) => Promise<void>;
} 