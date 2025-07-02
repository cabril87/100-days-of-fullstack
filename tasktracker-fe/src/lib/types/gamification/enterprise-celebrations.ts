/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Enterprise Celebration System Types
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md rules
 * All celebration interfaces, types, and props organized in lib/types/
 */

import type { ReactNode } from 'react';

// ================================
// ENTERPRISE CELEBRATION INTERFACES
// ================================

/**
 * Enterprise celebration notification interface
 * Following explicit type requirements from implementation checklist
 */
export interface EnterpriseCelebrationNotification {
  id: string;
  type: 'task_completion' | 'achievement_unlocked' | 'level_up' | 'streak_updated' | 'badge_earned' | 'family_milestone' | 'points_earned';
  title: string;
  message: string;
  icon: ReactNode;
  color: string;
  duration: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  familyContext?: EnterpriseFamilyContext;
  celebrationLevel: 1 | 2 | 3 | 4 | 5; // 1=subtle, 5=explosive
  soundEffect?: EnterpriseSoundEffect;
  timestamp: Date;
}

/**
 * Enterprise family context for celebrations
 */
export interface EnterpriseFamilyContext {
  familyId: number;
  familyName?: string;
  memberCount?: number;
  isSharedCelebration: boolean;
}

/**
 * Enterprise sound effects for celebrations
 */
export type EnterpriseSoundEffect = 'chime' | 'fanfare' | 'applause' | 'achievement' | 'level_up';

/**
 * Enterprise celebration configuration
 * Age-appropriate and family-context aware settings
 */
export interface EnterpriseCelebrationConfig {
  confettiSettings: EnterpriseConfettiSettings;
  toastDuration: number;
  cardDuration: number;
  soundVolume: number;
  maxConcurrentCelebrations: number;
  familyBroadcastEnabled: boolean;
}

/**
 * Enterprise confetti settings
 */
export interface EnterpriseConfettiSettings {
  particleCount: number;
  spread: number;
  startVelocity: number;
  decay: number;
  gravity: number;
  colors: string[];
}

/**
 * Enterprise celebration intensity levels
 */
export type EnterpriseCelebrationIntensity = 'minimal' | 'moderate' | 'full' | 'maximum';

/**
 * Family member age groups for age-appropriate celebrations
 */
export type FamilyMemberAgeGroup = 'Child' | 'Teen' | 'Adult';

/**
 * Enterprise celebration event types
 */
export type EnterpriseCelebrationType = 
  | 'task_completion' 
  | 'achievement_unlocked' 
  | 'level_up' 
  | 'streak_updated' 
  | 'badge_earned' 
  | 'family_milestone' 
  | 'points_earned';

/**
 * Enterprise celebration priority levels
 */
export type EnterpriseCelebrationPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Enterprise celebration level (1-5 scale)
 */
export type EnterpriseCelebrationLevel = 1 | 2 | 3 | 4 | 5;

// ================================
// CELEBRATION CREATION HELPERS
// ================================

/**
 * Parameters for creating enterprise celebrations
 */
export interface CreateEnterpriseCelebrationParams {
  type: EnterpriseCelebrationType;
  title: string;
  message: string;
  icon: ReactNode;
  color: string;
  celebrationLevel: EnterpriseCelebrationLevel;
  familyContext?: EnterpriseFamilyContext;
  soundEffect?: EnterpriseSoundEffect;
}

/**
 * Enterprise celebration creation result
 */
export interface EnterpriseCelebrationResult {
  celebration: EnterpriseCelebrationNotification;
  shouldTriggerConfetti: boolean;
  shouldShowToast: boolean;
  shouldPlaySound: boolean;
}

// ================================
// AGE-APPROPRIATE CONFIGURATIONS
// ================================

/**
 * Age-appropriate celebration configuration mapping
 */
export interface AgeAppropriateConfig {
  Child: EnterpriseCelebrationConfig;
  Teen: EnterpriseCelebrationConfig;
  Adult: EnterpriseCelebrationConfig;
}

/**
 * Intensity-based configuration adjustments
 */
export interface IntensityConfigAdjustments {
  minimal: Partial<EnterpriseCelebrationConfig>;
  moderate: Partial<EnterpriseCelebrationConfig>;
  full: Partial<EnterpriseCelebrationConfig>;
  maximum: Partial<EnterpriseCelebrationConfig>;
} 