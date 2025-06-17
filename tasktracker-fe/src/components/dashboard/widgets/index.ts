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

// Widget type definitions for reuse
export type { CelebrationEvent } from '@/lib/hooks/useGamificationEvents'; 