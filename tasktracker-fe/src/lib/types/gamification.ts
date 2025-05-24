// Gamification Type Definitions

export interface UserProgress {
  id: number;
  userId: number;
  totalPoints: number;
  currentLevel: number;
  pointsToNextLevel: number;
  tasksCompleted: number;
  badgesEarned: number;
  currentStreak: number;
  highestStreak: number;
  lastActivityDate: string;
  lastUpdated: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  category: string;
  pointValue: number;
  iconUrl: string;
  difficulty: string;
  targetValue: number;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
  currentProgress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  unlockCriteria: string;
  isHidden: boolean;
  isSecret: boolean;
  relatedAchievementIds: number[];
  unlockMessage: string;
}

export interface UserAchievement {
  id: number;
  userId: number;
  achievementId: number;
  achievement: Achievement;
  isCompleted: boolean;
  completedAt?: string;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  category: string;
  iconUrl: string;
  criteria: string;
  rarity: string;
  colorScheme: string;
  pointValue: number;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  tier?: string;
  pointsRequired?: number;
  isSpecial?: boolean;
}

export interface UserBadge {
  id: number;
  badgeId: number;
  userId: number;
  awardedAt: string;
  isDisplayed: boolean;
  isFeatured?: boolean;
  badge: Badge;
}

export interface Reward {
  id: number;
  name: string;
  description: string;
  pointCost: number;
  category: string;
  iconUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UserReward {
  id: number;
  reward: Reward;
  redeemedAt: string;
  usedAt?: string;
  isUsed: boolean;
}

export interface Challenge {
  id: number;
  name: string;
  description: string;
  category: string;
  targetValue: number;
  pointReward: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface UserChallenge {
  id: number;
  challenge: Challenge;
  enrolledAt: string;
  completedAt?: string;
  isCompleted: boolean;
  currentProgress: number;
}

export interface PointTransaction {
  id: number;
  userId: number;
  points: number;
  transactionType: string;
  description: string;
  relatedEntityId?: number;
  createdAt: string;
}

export interface LeaderboardEntry {
  userId: number;
  username: string;
  rank: number;
  value: number;
  avatarUrl?: string;
}

export interface GamificationStats {
  progress: UserProgress;
  completedTasks: number;
  achievementsUnlocked: number;
  badgesEarned: number;
  rewardsRedeemed: number;
  consistencyScore: number;
}

export interface GamificationSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  pointValue: number;
  actionUrl?: string;
  priority: number;
}

export interface DailyLoginStatus {
  hasClaimedToday: boolean;
  currentStreak: number;
  longestStreak: number;
  totalLogins: number;
  todayReward: number;
  nextReward: number;
  streakBonus: boolean;
  streakMultiplier: number;
  lastLoginDate?: string;
}

// Family Gamification Types
export interface FamilyAchievement {
  id: number;
  familyId: number;
  name: string;
  description: string;
  targetValue: number;
  currentProgress: number;
  isCompleted: boolean;
  completedAt?: string;
  pointReward: number;
  category: string;
  iconUrl: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FamilyLeaderboard {
  familyId: number;
  familyName: string;
  totalPoints: number;
  rank: number;
  memberCount: number;
  achievements: number;
}

// DTOs for API calls
export interface AddPointsDTO {
  points: number;
  transactionType: string;
  description: string;
  relatedEntityId?: number;
}

export interface BadgeToggleDTO {
  badgeId: number;
  isDisplayed: boolean;
}

export interface UseRewardDTO {
  userRewardId: number;
}

export interface CharacterProgress {
  userId: number;
  currentCharacterClass: string;
  characterLevel: number;
  characterXP: number;
  unlockedCharacters: string[];
  currentTier: string;
  totalPoints: number;
}

export interface FocusCompletionReward {
  pointsAwarded: number;
  characterXPAwarded: number;
  achievementsUnlocked: string[];
  badgesAwarded: string[];
  leveledUp: boolean;
  tierAdvanced: boolean;
  message: string;
}

export interface TierProgress {
  currentTier: string;
  tierLevel: number;
  currentPoints: number;
  pointsForNextTier: number;
  progressPercentage: number;
  allTiers: TierInfo[];
}

export interface TierInfo {
  name: string;
  level: number;
  pointsRequired: number;
  color: string;
  bgColor: string;
  isUnlocked: boolean;
  isCurrent: boolean;
}

export interface UserActiveChallenge {
  id: number;
  challengeId: number;
  challengeName: string;
  challengeDescription: string;
  currentProgress: number;
  targetProgress: number;
  progressPercentage: number;
  pointReward: number;
  endDate?: string;
  enrolledAt: string;
  daysRemaining?: number;
  activityType: string;
  difficulty: number;
} 