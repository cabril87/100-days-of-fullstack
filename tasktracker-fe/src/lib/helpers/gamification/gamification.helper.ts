/*
 * Gamification Helper Functions
 * Extracted utility functions from Gamification component  
 * Following .cursorrules compliance standards
 */

import { GamificationCardCategory } from '@/lib/interfaces/components/gamification.interface';

// ================================
// GAMIFICATION CARD CATEGORIES
// ================================

/**
 * Enhanced gamification card categories for swipe navigation
 */
export const GAMIFICATION_CARD_CATEGORIES: GamificationCardCategory[] = [
  {
    id: 'overview',
    name: 'Overview',
    cards: ['achievements', 'points', 'streak', 'badges']
  },
  {
    id: 'progress',
    name: 'Progress', 
    cards: ['level', 'experience', 'goals', 'milestones']
  },
  {
    id: 'social',
    name: 'Social',
    cards: ['leaderboard', 'friends', 'challenges', 'teams']
  }
];

// ================================
// LEVEL & XP CALCULATIONS
// ================================

/**
 * Calculates user level based on total points
 * Using standard 100 points per level progression
 */
export const calculateUserLevel = (points: number): number => {
  return Math.floor((points || 0) / 100) + 1;
};

/**
 * Calculates progress percentage towards next level
 */
export const calculateLevelProgress = (points: number): number => {
  return ((points || 0) % 100);
};

/**
 * Gets XP required for next level
 */
export const getXPToNextLevel = (points: number): number => {
  const currentLevel = calculateUserLevel(points);
  return (currentLevel * 100) - points;
};

/**
 * Gets total XP required for a specific level
 */
export const getXPForLevel = (level: number): number => {
  return (level - 1) * 100;
};

// ================================
// ACHIEVEMENT CALCULATIONS
// ================================

/**
 * Calculates achievement progress based on current stats
 */
export const calculateAchievementProgress = (
  achievement: {
    type: string;
    requirement: number;
    metric: string;
  },
  userStats: {
    tasksCompleted?: number;
    streakDays?: number;
    pointsEarned?: number;
    badgesEarned?: number;
    focusTime?: number;
  }
): { current: number; total: number; percentage: number; isCompleted: boolean } => {
  let current = 0;
  
  switch (achievement.metric) {
    case 'tasks_completed':
      current = userStats.tasksCompleted || 0;
      break;
    case 'streak_days':
      current = userStats.streakDays || 0;
      break;
    case 'points_earned':
      current = userStats.pointsEarned || 0;
      break;
    case 'badges_earned':
      current = userStats.badgesEarned || 0;
      break;
    case 'focus_time':
      current = userStats.focusTime || 0;
      break;
    default:
      current = 0;
  }

  const total = achievement.requirement;
  const percentage = Math.min((current / total) * 100, 100);
  const isCompleted = current >= total;

  return { current, total, percentage, isCompleted };
};

// ================================
// BADGE SYSTEM HELPERS
// ================================

/**
 * Determines badge rarity based on achievement difficulty
 */
export const getBadgeRarity = (
  requirement: number,
  metric: string
): 'common' | 'rare' | 'epic' | 'legendary' => {
  const rarityThresholds: Record<string, { rare: number; epic: number; legendary: number }> = {
    'tasks_completed': { rare: 50, epic: 100, legendary: 500 },
    'streak_days': { rare: 7, epic: 30, legendary: 100 },
    'points_earned': { rare: 1000, epic: 5000, legendary: 25000 },
    'focus_time': { rare: 600, epic: 3000, legendary: 15000 }, // in minutes
    'default': { rare: 10, epic: 50, legendary: 200 }
  };

  const thresholds = rarityThresholds[metric] || rarityThresholds.default;

  if (requirement >= thresholds.legendary) return 'legendary';
  if (requirement >= thresholds.epic) return 'epic';
  if (requirement >= thresholds.rare) return 'rare';
  return 'common';
};

/**
 * Gets badge color based on rarity
 */
export const getBadgeColor = (rarity: 'common' | 'rare' | 'epic' | 'legendary'): string => {
  switch (rarity) {
    case 'common': return 'bg-gray-100 text-gray-700 border-gray-300';
    case 'rare': return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'epic': return 'bg-purple-100 text-purple-700 border-purple-300';
    case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-gold-300';
    default: return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

// ================================
// STREAK CALCULATIONS
// ================================

/**
 * Calculates streak multiplier for points
 */
export const getStreakMultiplier = (streakDays: number): number => {
  if (streakDays >= 30) return 2.0;
  if (streakDays >= 14) return 1.75;
  if (streakDays >= 7) return 1.5;
  if (streakDays >= 3) return 1.25;
  return 1.0;
};

/**
 * Gets streak status and encouragement message
 */
export const getStreakStatus = (streakDays: number): {
  status: 'starting' | 'building' | 'strong' | 'legendary';
  message: string;
  emoji: string;
} => {
  if (streakDays >= 100) {
    return {
      status: 'legendary',
      message: `${streakDays} day legendary streak! You're unstoppable! 🏆`,
      emoji: '🏆'
    };
  } else if (streakDays >= 30) {
    return {
      status: 'strong',
      message: `${streakDays} day streak! You're on fire! 🔥`,
      emoji: '🔥'
    };
  } else if (streakDays >= 7) {
    return {
      status: 'building',
      message: `${streakDays} day streak! Keep it up! ⚡`,
      emoji: '⚡'
    };
  } else if (streakDays >= 1) {
    return {
      status: 'starting',
      message: `${streakDays} day streak! Great start! 🌟`,
      emoji: '🌟'
    };
  } else {
    return {
      status: 'starting',
      message: 'Start your streak today! ✨',
      emoji: '✨'
    };
  }
};

// ================================
// GAMIFICATION THEME HELPERS
// ================================

/**
 * Gets theme colors based on gamification level
 */
export const getGamificationTheme = (level: number): {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  name: string;
} => {
  if (level >= 50) {
    return {
      primary: 'from-purple-600 to-pink-600',
      secondary: 'from-purple-100 to-pink-100',
      accent: 'purple-500',
      background: 'bg-gradient-to-br from-purple-50 to-pink-50',
      name: 'Legendary'
    };
  } else if (level >= 25) {
    return {
      primary: 'from-gold-500 to-yellow-500',
      secondary: 'from-gold-100 to-yellow-100',
      accent: 'gold-500',
      background: 'bg-gradient-to-br from-gold-50 to-yellow-50',
      name: 'Epic'
    };
  } else if (level >= 10) {
    return {
      primary: 'from-blue-500 to-cyan-500',
      secondary: 'from-blue-100 to-cyan-100',
      accent: 'blue-500',
      background: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      name: 'Advanced'
    };
  } else {
    return {
      primary: 'from-green-500 to-emerald-500',
      secondary: 'from-green-100 to-emerald-100',
      accent: 'green-500',
      background: 'bg-gradient-to-br from-green-50 to-emerald-50',
      name: 'Beginner'
    };
  }
};

// ================================
// CELEBRATION HELPERS
// ================================

/**
 * Determines celebration intensity based on achievement importance
 */
export const getCelebrationIntensity = (
  achievementType: string,
  value: number
): 'minimal' | 'moderate' | 'full' | 'maximum' => {
  // Level up celebrations
  if (achievementType === 'level_up') {
    if (value >= 50) return 'maximum';
    if (value >= 25) return 'full';
    if (value >= 10) return 'moderate';
    return 'minimal';
  }

  // Streak celebrations
  if (achievementType === 'streak') {
    if (value >= 100) return 'maximum';
    if (value >= 30) return 'full';
    if (value >= 7) return 'moderate';
    return 'minimal';
  }

  // Points celebrations
  if (achievementType === 'points') {
    if (value >= 10000) return 'maximum';
    if (value >= 1000) return 'full';
    if (value >= 100) return 'moderate';
    return 'minimal';
  }

  return 'moderate';
};

/**
 * Gets celebration duration based on intensity
 */
export const getCelebrationDuration = (
  intensity: 'minimal' | 'moderate' | 'full' | 'maximum'
): number => {
  switch (intensity) {
    case 'minimal': return 2000;
    case 'moderate': return 3000;
    case 'full': return 5000;
    case 'maximum': return 8000;
    default: return 3000;
  }
};

// ================================
// FORMATTING HELPERS
// ================================

/**
 * Formats large numbers with appropriate units
 */
export const formatGamificationNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
};

/**
 * Formats time duration for display
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}; 