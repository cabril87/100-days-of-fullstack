/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Enterprise Gamification Schemas
 * Zod validation schemas for family-friendly gamification system
 */

import { z } from 'zod';

// ================================
// CORE VALIDATION SCHEMAS
// ================================

export const AchievementCategorySchema = z.enum([
  'task_completion',
  'consistency',
  'teamwork',
  'leadership',
  'creativity',
  'responsibility',
  'helpfulness',
  'learning',
  'family_time',
  'chores',
  'homework',
  'kindness'
]);

export const BadgeCategorySchema = z.enum([
  'completion',
  'consistency',
  'quality',
  'speed',
  'collaboration',
  'leadership',
  'creativity',
  'responsibility'
]);

export const FamilyRankSchema = z.enum(['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']);

export const MemberRoleSchema = z.enum(['parent', 'child', 'teen', 'guardian']);

export const AgeGroupSchema = z.enum(['child', 'teen', 'adult']);

// ================================
// ACHIEVEMENT SCHEMAS
// ================================

export const AchievementRequirementSchema = z.object({
  type: z.enum(['task_count', 'streak_days', 'points_earned', 'family_participation', 'time_period']),
  target: z.number().min(1),
  timeframe: z.enum(['daily', 'weekly', 'monthly', 'all_time']).optional(),
  category: z.string().optional(),
  description: z.string().min(1)
});

export const CelebrationStyleSchema = z.object({
  animation: z.enum(['confetti', 'fireworks', 'sparkles', 'bounce', 'glow']),
  sound: z.enum(['cheer', 'bell', 'fanfare', 'pop', 'none']),
  colors: z.array(z.string().regex(/^#[0-9A-F]{6}$/i)),
  duration: z.number().min(100).max(10000),
  intensity: z.enum(['subtle', 'normal', 'intense']),
  familyNotification: z.boolean()
});

export const FamilyAchievementSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['family', 'collaborative', 'milestone']),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  icon: z.string().min(1),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary']),
  category: AchievementCategorySchema,
  pointsReward: z.number().min(1).max(10000),
  requirements: z.array(AchievementRequirementSchema).min(1),
  unlockedAt: z.date().optional(),
  unlockedBy: z.union([z.literal('family'), z.number().min(1)]),
  celebrationStyle: CelebrationStyleSchema,
  shareableMessage: z.string().min(1).max(280),
  familyBonus: z.number().min(0).optional()
});

export const PersonalAchievementSchema = z.object({
  id: z.string().min(1),
  userId: z.number().min(1),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  icon: z.string().min(1),
  category: AchievementCategorySchema,
  pointsReward: z.number().min(1).max(5000),
  unlockedAt: z.date(),
  isSharedWithFamily: z.boolean(),
  parentApprovalRequired: z.boolean().optional(),
  approvedBy: z.number().min(1).optional()
});

// ================================
// BADGE SCHEMAS
// ================================

export const FamilyBadgeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(50),
  description: z.string().min(1).max(200),
  icon: z.string().min(1),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  type: z.enum(['family', 'seasonal', 'special_event']),
  earnedAt: z.date(),
  earnedBy: z.union([z.literal('family'), z.array(z.number().min(1))]),
  displayPriority: z.number().min(1).max(100),
  isLimited: z.boolean().optional(),
  expiresAt: z.date().optional()
});

export const PersonalBadgeSchema = z.object({
  id: z.string().min(1),
  userId: z.number().min(1),
  name: z.string().min(1).max(50),
  description: z.string().min(1).max(200),
  icon: z.string().min(1),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  category: BadgeCategorySchema,
  earnedAt: z.date(),
  level: z.number().min(1).max(5),
  nextLevelRequirement: z.string().optional(),
  isShowcased: z.boolean()
});

// ================================
// CHALLENGE & GOAL SCHEMAS
// ================================

export const ChallengeRewardSchema = z.object({
  type: z.enum(['points', 'badge', 'privilege', 'family_activity', 'custom']),
  value: z.union([z.number(), z.string()]),
  description: z.string().min(1).max(200),
  icon: z.string().min(1),
  isForFamily: z.boolean(),
  requiresParentApproval: z.boolean().optional()
});

export const ChallengeMilestoneSchema = z.object({
  percentage: z.number().min(0).max(100),
  title: z.string().min(1).max(100),
  reward: ChallengeRewardSchema,
  isReached: z.boolean(),
  reachedAt: z.date().optional()
});

export const FamilyChallengeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  type: z.enum(['weekly', 'monthly', 'seasonal', 'custom']),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
  icon: z.string().min(1),
  startDate: z.date(),
  endDate: z.date(),
  targetPoints: z.number().min(1),
  currentProgress: z.number().min(0),
  participants: z.array(z.number().min(1)),
  rewards: z.array(ChallengeRewardSchema),
  milestones: z.array(ChallengeMilestoneSchema),
  status: z.enum(['upcoming', 'active', 'completed', 'failed']),
  isOptional: z.boolean(),
  ageRestrictions: z.array(z.string()).optional()
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date"
});

export const GoalRewardSchema = z.object({
  type: z.enum(['points', 'badge', 'privilege', 'allowance', 'screen_time', 'custom']),
  value: z.union([z.number(), z.string()]),
  description: z.string().min(1).max(200),
  icon: z.string().min(1),
  eligibleMembers: z.array(z.number().min(1))
});

export const FamilyGoalSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  targetValue: z.number().min(1),
  currentValue: z.number().min(0),
  unit: z.string().min(1).max(20),
  type: z.enum(['individual', 'collaborative', 'family']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.date().optional(),
  assignedTo: z.array(z.number().min(1)).optional(),
  rewards: z.array(GoalRewardSchema),
  status: z.enum(['active', 'completed', 'paused', 'cancelled']),
  createdBy: z.number().min(1),
  createdAt: z.date()
});

// ================================
// SETTINGS & PREFERENCES SCHEMAS
// ================================

export const ParentalOversightSettingsSchema = z.object({
  requireApprovalForRewards: z.boolean(),
  maxPointsPerDay: z.number().min(1).optional(),
  restrictedCategories: z.array(AchievementCategorySchema),
  allowPeerComparison: z.boolean(),
  screenTimeRewards: z.boolean(),
  allowanceIntegration: z.boolean(),
  reportingFrequency: z.enum(['daily', 'weekly', 'monthly'])
});

export const GamificationNotificationSettingsSchema = z.object({
  achievements: z.boolean(),
  levelUp: z.boolean(),
  streakReminders: z.boolean(),
  goalDeadlines: z.boolean(),
  familyChallenges: z.boolean(),
  leaderboardUpdates: z.boolean(),
  encouragementMessages: z.boolean(),
  frequency: z.enum(['immediate', 'daily_digest', 'weekly_summary'])
});

export const CustomRewardSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(300),
  cost: z.number().min(1),
  type: z.enum(['privilege', 'activity', 'item', 'experience']),
  icon: z.string().min(1),
  isAvailable: z.boolean(),
  requiresParentApproval: z.boolean(),
  ageRestrictions: z.array(z.string()).optional(),
  cooldownPeriod: z.number().min(0).optional()
});

export const RewardSettingsSchema = z.object({
  pointsToAllowanceRatio: z.number().min(0.01).optional(),
  screenTimeRewards: z.boolean(),
  privilegeRewards: z.boolean(),
  customRewards: z.array(CustomRewardSchema),
  autoRedemption: z.boolean(),
  parentApprovalRequired: z.boolean()
});

export const FamilyGamificationSettingsSchema = z.object({
  isEnabled: z.boolean(),
  difficultyLevel: z.enum(['easy', 'normal', 'hard']),
  celebrationLevel: z.enum(['minimal', 'normal', 'festive']),
  soundEnabled: z.boolean(),
  animationsEnabled: z.boolean(),
  weeklyGoalsEnabled: z.boolean(),
  monthlyChallengesEnabled: z.boolean(),
  leaderboardEnabled: z.boolean(),
  publicRankingOptIn: z.boolean(),
  parentalOversight: ParentalOversightSettingsSchema,
  notifications: GamificationNotificationSettingsSchema,
  rewards: RewardSettingsSchema
});

export const MemberGamificationPreferencesSchema = z.object({
  celebrationStyle: z.enum(['minimal', 'normal', 'max']),
  preferredCategories: z.array(AchievementCategorySchema),
  goalReminders: z.boolean(),
  achievementSharing: z.boolean(),
  leaderboardParticipation: z.boolean(),
  motivationalMessages: z.boolean(),
  difficultyPreference: z.enum(['challenge_me', 'steady_progress', 'fun_focus'])
});

export const ParentalRestrictionsSchema = z.object({
  maxDailyPoints: z.number().min(1).optional(),
  maxWeeklyPoints: z.number().min(1).optional(),
  restrictedRewardTypes: z.array(z.string()),
  requiresApprovalFor: z.array(z.string()),
  blockedCategories: z.array(AchievementCategorySchema),
  timeRestrictions: z.object({
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    daysOfWeek: z.array(z.number().min(0).max(6))
  }).optional()
});

// ================================
// MEMBER & FAMILY SCHEMAS
// ================================

export const FamilyMemberGamificationSchema = z.object({
  userId: z.number().min(1),
  familyId: z.number().min(1),
  memberName: z.string().min(1).max(100),
  memberRole: MemberRoleSchema,
  ageGroup: AgeGroupSchema,
  currentPoints: z.number().min(0),
  currentLevel: z.number().min(1),
  currentStreak: z.number().min(0),
  weeklyContribution: z.number().min(0),
  monthlyContribution: z.number().min(0),
  personalBadges: z.array(PersonalBadgeSchema),
  personalAchievements: z.array(PersonalAchievementSchema),
  preferences: MemberGamificationPreferencesSchema,
  restrictions: ParentalRestrictionsSchema.optional()
});

// ================================
// STATISTICS SCHEMAS
// ================================

export const WeeklyProgressSchema = z.object({
  weekStart: z.date(),
  weekEnd: z.date(),
  totalPoints: z.number().min(0),
  tasksCompleted: z.number().min(0),
  achievementsUnlocked: z.number().min(0),
  familyStreak: z.number().min(0),
  participationRate: z.number().min(0).max(100)
});

export const MonthlyProgressSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020),
  totalPoints: z.number().min(0),
  tasksCompleted: z.number().min(0),
  achievementsUnlocked: z.number().min(0),
  challengesCompleted: z.number().min(0),
  averageStreak: z.number().min(0),
  topPerformer: z.number().min(1)
});

export const MemberContributionSchema = z.object({
  userId: z.number().min(1),
  memberName: z.string().min(1),
  pointsContributed: z.number().min(0),
  tasksContributed: z.number().min(0),
  achievementsEarned: z.number().min(0),
  leadershipMoments: z.number().min(0),
  helpfulActions: z.number().min(0),
  consistencyScore: z.number().min(0).max(100)
});

export const FeatureUsageSchema = z.object({
  feature: z.string().min(1),
  usageCount: z.number().min(0),
  lastUsed: z.date(),
  popularityRank: z.number().min(1)
});

export const EngagementMetricsSchema = z.object({
  dailyActiveUsers: z.number().min(0),
  weeklyActiveUsers: z.number().min(0),
  averageSessionDuration: z.number().min(0),
  featureUsage: z.array(FeatureUsageSchema),
  retentionRate: z.number().min(0).max(100),
  satisfactionScore: z.number().min(1).max(10).optional()
});

export const FamilyGamificationStatsSchema = z.object({
  totalPointsEarned: z.number().min(0),
  totalTasksCompleted: z.number().min(0),
  totalAchievementsUnlocked: z.number().min(0),
  averageFamilyStreak: z.number().min(0),
  mostActiveDay: z.string(),
  mostProductiveHour: z.number().min(0).max(23),
  topCategory: AchievementCategorySchema,
  weeklyProgress: z.array(WeeklyProgressSchema),
  monthlyProgress: z.array(MonthlyProgressSchema),
  memberContributions: z.array(MemberContributionSchema),
  engagementMetrics: EngagementMetricsSchema
});

// ================================
// LEADERBOARD SCHEMAS
// ================================

export const LeaderboardEntrySchema = z.object({
  userId: z.number().min(1),
  memberName: z.string().min(1),
  ageGroup: AgeGroupSchema,
  score: z.number().min(0),
  rank: z.number().min(1),
  previousRank: z.number().min(1).optional(),
  trend: z.enum(['up', 'down', 'same']),
  avatar: z.string().optional(),
  badge: z.string().optional()
});

export const FamilyLeaderboardSchema = z.object({
  type: z.enum(['weekly', 'monthly', 'all_time']),
  category: z.enum(['points', 'tasks', 'streak', 'achievements']),
  members: z.array(LeaderboardEntrySchema),
  lastUpdated: z.date(),
  isPublic: z.boolean()
});

export const RankBenefitSchema = z.object({
  type: z.enum(['feature_unlock', 'bonus_multiplier', 'exclusive_challenges', 'custom_rewards']),
  description: z.string().min(1),
  icon: z.string().min(1),
  isActive: z.boolean()
});

export const RankHistoryEntrySchema = z.object({
  rank: z.string(),
  achievedAt: z.date(),
  pointsAtTime: z.number().min(0)
});

export const FamilyRankingSchema = z.object({
  currentRank: FamilyRankSchema,
  pointsToNextRank: z.number().min(0),
  rankProgress: z.number().min(0).max(100),
  rankBenefits: z.array(RankBenefitSchema),
  rankHistory: z.array(RankHistoryEntrySchema)
});

// ================================
// MAIN FAMILY PROFILE SCHEMA
// ================================

export const FamilyGamificationProfileSchema = z.object({
  familyId: z.number().min(1),
  familyName: z.string().min(1).max(100),
  totalFamilyPoints: z.number().min(0),
  familyLevel: z.number().min(1),
  familyStreak: z.number().min(0),
  familyRank: FamilyRankSchema,
  familyBadges: z.array(FamilyBadgeSchema),
  familyAchievements: z.array(FamilyAchievementSchema),
  weeklyGoals: z.array(FamilyGoalSchema),
  monthlyChallenge: FamilyChallengeSchema.optional(),
  settings: FamilyGamificationSettingsSchema,
  statistics: FamilyGamificationStatsSchema,
  createdAt: z.date(),
  updatedAt: z.date()
});

// ================================
// WIDGET & COMPONENT SCHEMAS
// ================================

export const WidgetPermissionsSchema = z.object({
  canView: z.array(z.number().min(1)),
  canEdit: z.array(z.number().min(1)),
  canHide: z.array(z.number().min(1)),
  requiresParentApproval: z.boolean()
});

export const WidgetConfigurationSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  position: z.object({
    x: z.number().min(0),
    y: z.number().min(0)
  }),
  size: z.object({
    width: z.number().min(1),
    height: z.number().min(1)
  }),
  isVisible: z.boolean(),
  settings: z.record(z.any()),
  permissions: WidgetPermissionsSchema
});

export const DashboardCustomizationSchema = z.object({
  theme: z.string().min(1),
  colorScheme: z.array(z.string().regex(/^#[0-9A-F]{6}$/i)),
  backgroundPattern: z.string().optional(),
  familyMotto: z.string().max(200).optional(),
  showcaseAchievements: z.array(z.string()),
  widgetOrder: z.array(z.string()),
  isPublic: z.boolean()
});

export const EnterpriseGamificationWidgetPropsSchema = z.object({
  familyId: z.number().min(1).optional(),
  userId: z.number().min(1).optional(),
  className: z.string().optional(),
  isCompact: z.boolean().optional(),
  showFamilyData: z.boolean().optional(),
  showPersonalData: z.boolean().optional(),
  theme: z.enum(['light', 'dark', 'colorful', 'minimal']).optional(),
  animationsEnabled: z.boolean().optional(),
  realTimeUpdates: z.boolean().optional()
});

// ================================
// API SCHEMAS
// ================================

export const GamificationEventPayloadSchema = z.object({
  eventType: z.enum(['achievement_unlocked', 'level_up', 'streak_updated', 'challenge_completed', 'goal_achieved']),
  userId: z.number().min(1),
  familyId: z.number().min(1),
  data: z.record(z.any()),
  timestamp: z.date(),
  shouldNotifyFamily: z.boolean(),
  celebrationLevel: z.enum(['minimal', 'normal', 'festive'])
});

export const GamificationFeedbackSchema = z.object({
  id: z.string().min(1),
  userId: z.number().min(1),
  type: z.enum(['encouragement', 'milestone', 'reminder', 'celebration', 'tip']),
  message: z.string().min(1).max(500),
  icon: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high']),
  isPersonalized: z.boolean(),
  triggerEvent: z.string().min(1),
  displayDuration: z.number().min(1000),
  createdAt: z.date(),
  isRead: z.boolean()
});

// ================================
// FORM VALIDATION SCHEMAS
// ================================

export const CreateGoalFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().min(1, "Description is required").max(500, "Description too long"),
  targetValue: z.number().min(1, "Target must be at least 1"),
  unit: z.string().min(1, "Unit is required").max(20, "Unit too long"),
  type: z.enum(['individual', 'collaborative', 'family']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.date().optional(),
  assignedTo: z.array(z.number().min(1)).optional()
});

export const UpdatePreferencesFormSchema = z.object({
  celebrationStyle: z.enum(['minimal', 'normal', 'max']),
  preferredCategories: z.array(AchievementCategorySchema).min(1, "Select at least one category"),
  goalReminders: z.boolean(),
  achievementSharing: z.boolean(),
  leaderboardParticipation: z.boolean(),
  motivationalMessages: z.boolean(),
  difficultyPreference: z.enum(['challenge_me', 'steady_progress', 'fun_focus'])
});

export const RedeemRewardFormSchema = z.object({
  rewardId: z.string().min(1, "Reward ID is required"),
  pointsCost: z.number().min(1, "Invalid points cost"),
  requiresApproval: z.boolean(),
  notes: z.string().max(200, "Notes too long").optional()
});

// ================================
// EXPORT ALL SCHEMAS
// ================================

export const EnterpriseGamificationSchemas = {
  // Core
  FamilyGamificationProfile: FamilyGamificationProfileSchema,
  FamilyMemberGamification: FamilyMemberGamificationSchema,
  
  // Achievements & Badges
  FamilyAchievement: FamilyAchievementSchema,
  PersonalAchievement: PersonalAchievementSchema,
  FamilyBadge: FamilyBadgeSchema,
  PersonalBadge: PersonalBadgeSchema,
  
  // Goals & Challenges
  FamilyGoal: FamilyGoalSchema,
  FamilyChallenge: FamilyChallengeSchema,
  
  // Settings
  FamilyGamificationSettings: FamilyGamificationSettingsSchema,
  MemberGamificationPreferences: MemberGamificationPreferencesSchema,
  
  // Statistics
  FamilyGamificationStats: FamilyGamificationStatsSchema,
  WeeklyProgress: WeeklyProgressSchema,
  MonthlyProgress: MonthlyProgressSchema,
  
  // Leaderboards
  FamilyLeaderboard: FamilyLeaderboardSchema,
  FamilyRanking: FamilyRankingSchema,
  
  // Forms
  CreateGoalForm: CreateGoalFormSchema,
  UpdatePreferencesForm: UpdatePreferencesFormSchema,
  RedeemRewardForm: RedeemRewardFormSchema,
  
  // API
  GamificationEventPayload: GamificationEventPayloadSchema,
  GamificationFeedback: GamificationFeedbackSchema
} as const; 