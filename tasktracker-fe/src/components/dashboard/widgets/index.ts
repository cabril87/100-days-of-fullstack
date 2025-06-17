/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Dashboard Widgets Export Index
 * Centralized exports for all real-time dashboard widgets
 */

export { LivePointsWidget } from './LivePointsWidget';
export { RecentAchievements } from './RecentAchievements';
export { FamilyActivityStream } from './FamilyActivityStream';
export { StreakCounter } from './StreakCounter';
export { NotificationStream } from './NotificationStream';

// Enterprise Gamification Widgets
export { FamilyLeaderboardWidget } from './FamilyLeaderboardWidget';
export { FamilyGoalsWidget } from './FamilyGoalsWidget';

// Widget type definitions for reuse
export type { CelebrationEvent } from '@/lib/types/gamification'; 