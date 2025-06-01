// Badge and Progress Components
export { PointsBadge, LevelBadge, StreakBadge } from './PointsBadge';
export { ProgressBar, LevelProgressBar } from './ProgressBar';

// User Interface Components
export { UserProgress } from './UserProgress';
export { Achievements } from './Achievements';
export { Leaderboard } from './Leaderboard';
export { DailyLogin } from './DailyLogin';
export { GamificationWidget } from './GamificationWidget';

// Achievement Badge Components
export { 
  AchievementBadge, 
  AchievementShowcase, 
  AchievementCategory 
} from './AchievementBadge';

// Provider and Hook
export { GamificationProvider, useGamification } from '@/lib/providers/GamificationProvider';

// Types
export type * from '@/lib/types/gamification';

// Service
export { gamificationService } from '@/lib/services/gamificationService';

// New components
export { AchievementModal } from './AchievementModal';
export { CharacterSystem } from './CharacterSystem';
export { GamificationNotifications } from './GamificationNotifications'; 