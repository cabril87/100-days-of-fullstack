/*
 * Gamification Component Interfaces
 * Centralized interface definitions for gamification-related components
 * Extracted from components/gamification/ for .cursorrules compliance
 */

import { UseGamificationEventsReturn } from '@/lib/types/gamification';

// ================================
// MAIN GAMIFICATION INTERFACES
// ================================

export interface GamificationProps {
  user: { 
    id: number; 
    username: string; 
    email: string; 
  };
  gamificationData: UseGamificationEventsReturn;
  isConnected: boolean;
}

// ================================
// GAMIFICATION CARD INTERFACES
// ================================

export interface GamificationCardCategory {
  id: string;
  name: string;
  cards: string[];
}

export interface GamificationBadgesProps {
  user: {
    points: number;
    [key: string]: unknown;
  };
  streakDays?: number;
  achievements?: number;
  className?: string;
}

export interface BadgeItem {
  icon: string;
  title: string;
  description?: string;
  earned?: boolean;
  progress?: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface BadgeCategory {
  id: string;
  name: string;
  badges: BadgeItem[];
  color: string;
}

// ================================
// CELEBRATION INTERFACES
// ================================

export interface CelebrationTestProps {
  onCelebrationTrigger?: (type: string, data?: unknown) => void;
  className?: string;
}

export interface EnhancedCelebrationSystemProps {
  isVisible: boolean;
  celebrationType: 'achievement' | 'levelup' | 'points' | 'streak' | 'badge';
  celebrationData?: {
    title?: string;
    message?: string;
    points?: number;
    level?: number;
    achievementName?: string;
    badgeName?: string;
    streakDays?: number;
  };
  onComplete?: () => void;
  intensity?: 'minimal' | 'moderate' | 'full' | 'maximum';
  duration?: number;
  enableParticles?: boolean;
  enableSound?: boolean;
  enableHaptic?: boolean;
  className?: string;
}

// ================================
// PROGRESS TRACKING INTERFACES
// ================================

export interface ProgressDisplayProps {
  currentValue: number;
  maxValue: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'purple' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export interface LevelProgressProps {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  showDetails?: boolean;
  animated?: boolean;
  className?: string;
}

export interface StreakDisplayProps {
  streakDays: number;
  maxStreak?: number;
  showFireAnimation?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// ================================
// LEADERBOARD INTERFACES
// ================================

export interface LeaderboardEntryProps {
  rank: number;
  user: {
    id: number;
    name: string;
    avatar?: string;
    points: number;
    level: number;
  };
  isCurrentUser?: boolean;
  showDetails?: boolean;
  className?: string;
}

export interface LeaderboardProps {
  entries: Array<{
    rank: number;
    user: {
      id: number;
      name: string;
      avatar?: string;
      points: number;
      level: number;
    };
    isCurrentUser?: boolean;
  }>;
  title?: string;
  maxEntries?: number;
  showRankings?: boolean;
  refreshInterval?: number;
  className?: string;
} 