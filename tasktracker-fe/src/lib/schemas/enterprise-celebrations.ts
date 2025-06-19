/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Enterprise Celebration System Schemas
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md rules
 * All Zod validation schemas organized in lib/schemas/
 */

import { z } from 'zod';

// ================================
// ENTERPRISE CELEBRATION SCHEMAS
// ================================

/**
 * Enterprise celebration notification schema
 */
export const enterpriseCelebrationNotificationSchema = z.object({
  id: z.string().min(1, 'Celebration ID is required'),
  type: z.enum([
    'task_completion',
    'achievement_unlocked', 
    'level_up',
    'streak_updated',
    'badge_earned',
    'family_milestone',
    'points_earned'
  ]),
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  message: z.string().min(1, 'Message is required').max(500, 'Message too long'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  duration: z.number().min(1000).max(30000),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  celebrationLevel: z.number().min(1).max(5),
  soundEffect: z.enum(['chime', 'fanfare', 'applause', 'achievement', 'level_up']).optional(),
  timestamp: z.date()
});

/**
 * Enterprise family context schema
 */
export const enterpriseFamilyContextSchema = z.object({
  familyId: z.number().positive('Family ID must be positive'),
  familyName: z.string().optional(),
  memberCount: z.number().min(1).optional(),
  isSharedCelebration: z.boolean()
});

/**
 * Enterprise confetti settings schema
 */
export const enterpriseConfettiSettingsSchema = z.object({
  particleCount: z.number().min(10).max(500),
  spread: z.number().min(10).max(180),
  startVelocity: z.number().min(10).max(100),
  decay: z.number().min(0.1).max(1),
  gravity: z.number().min(0.1).max(3),
  colors: z.array(z.string().regex(/^#[0-9A-F]{6}$/i)).min(1).max(20)
});

/**
 * Enterprise celebration configuration schema
 */
export const enterpriseCelebrationConfigSchema = z.object({
  confettiSettings: enterpriseConfettiSettingsSchema,
  toastDuration: z.number().min(1000).max(10000),
  cardDuration: z.number().min(2000).max(30000),
  soundVolume: z.number().min(0).max(1),
  maxConcurrentCelebrations: z.number().min(1).max(10),
  familyBroadcastEnabled: z.boolean()
});

/**
 * Enhanced celebration system props schema
 */
export const enhancedCelebrationSystemPropsSchema = z.object({
  userId: z.number().positive().optional(),
  familyId: z.number().positive().optional(),
  enableToasts: z.boolean().default(true),
  enableConfetti: z.boolean().default(true),
  enableCelebrationCards: z.boolean().default(true),
  enableSoundEffects: z.boolean().default(false),
  celebrationIntensity: z.enum(['minimal', 'moderate', 'full', 'maximum']).default('moderate'),
  familyMemberAgeGroup: z.enum(['Child', 'Teen', 'Adult']).default('Adult'),
  className: z.string().default('')
});

/**
 * Create enterprise celebration params schema
 */
export const createEnterpriseCelebrationParamsSchema = z.object({
  type: z.enum([
    'task_completion',
    'achievement_unlocked', 
    'level_up',
    'streak_updated',
    'badge_earned',
    'family_milestone',
    'points_earned'
  ]),
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  celebrationLevel: z.number().min(1).max(5),
  familyContext: enterpriseFamilyContextSchema.optional(),
  soundEffect: z.enum(['chime', 'fanfare', 'applause', 'achievement', 'level_up']).optional()
});

// ================================
// AGE-APPROPRIATE VALIDATION
// ================================

/**
 * Age-appropriate celebration intensity validation
 */
export const ageAppropriateIntensitySchema = z.object({
  ageGroup: z.enum(['Child', 'Teen', 'Adult']),
  maxIntensity: z.enum(['minimal', 'moderate', 'full', 'maximum']),
  allowedSoundEffects: z.array(z.enum(['chime', 'fanfare', 'applause', 'achievement', 'level_up'])),
  maxCelebrationLevel: z.number().min(1).max(5)
});

/**
 * Family celebration settings validation
 */
export const familyCelebrationSettingsSchema = z.object({
  familyId: z.number().positive(),
  globalSettings: enterpriseCelebrationConfigSchema,
  memberSettings: z.array(z.object({
    userId: z.number().positive(),
    ageGroup: z.enum(['Child', 'Teen', 'Adult']),
    customSettings: enterpriseCelebrationConfigSchema.partial().optional()
  }))
});

// ================================
// HELPER VALIDATION FUNCTIONS
// ================================

/**
 * Validate celebration level based on age group
 */
export const validateCelebrationLevelForAge = (level: number, ageGroup: string): boolean => {
  const maxLevels: Record<string, number> = {
    'Child': 5, // Children can have maximum celebration
    'Teen': 5,  // Teens can have maximum celebration
    'Adult': 5  // Adults can have maximum celebration
  };
  
  return level <= (maxLevels[ageGroup] || 3);
};

/**
 * Validate sound effects for age group
 */
export const validateSoundEffectForAge = (soundEffect: string, ageGroup: string): boolean => {
  const allowedSounds: Record<string, string[]> = {
    'Child': ['chime', 'fanfare', 'applause'],
    'Teen': ['chime', 'fanfare', 'applause', 'achievement'],
    'Adult': ['chime', 'fanfare', 'applause', 'achievement', 'level_up']
  };
  
  return allowedSounds[ageGroup]?.includes(soundEffect) || false;
}; 