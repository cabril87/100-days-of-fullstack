/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 */

import type { TaskCompletionEventDTO, FamilyActivityEventDTO, FamilyMilestoneEventDTO } from '@/lib/types/family-events';

/**
 * Props for Enhanced Celebration System component
 */
export interface EnhancedCelebrationSystemProps {
  userId?: number;
  enableToasts?: boolean;
  enableConfetti?: boolean;
  enableCelebrationCards?: boolean;
}

/**
 * Celebration notification data
 */
export interface CelebrationNotification {
  id: string;
  type: 'task_completion' | 'family_activity' | 'family_milestone';
  title: string;
  message: string;
  icon: React.ReactNode;
  color: string;
  data: TaskCompletionEventDTO | FamilyActivityEventDTO | FamilyMilestoneEventDTO;
  timestamp: Date;
  duration?: number;
}

/**
 * Celebration event types for confetti animations
 */
export type CelebrationConfettiType = 'task' | 'achievement' | 'milestone' | 'family'; 