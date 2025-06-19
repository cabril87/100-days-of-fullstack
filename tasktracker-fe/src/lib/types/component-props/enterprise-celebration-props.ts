/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Enterprise Celebration System Props
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md rules
 * All component props organized in lib/types/component-props/
 */

import type { 
  EnterpriseCelebrationIntensity,
  FamilyMemberAgeGroup,
  EnterpriseCelebrationNotification
} from '../enterprise-celebrations';

// ================================
// ENHANCED CELEBRATION SYSTEM PROPS
// ================================

/**
 * Enterprise celebration system props
 * Explicit typing following implementation checklist
 */
export interface EnhancedCelebrationSystemProps {
  userId?: number;
  familyId?: number;
  enableToasts?: boolean;
  enableConfetti?: boolean;
  enableCelebrationCards?: boolean;
  enableSoundEffects?: boolean;
  celebrationIntensity?: EnterpriseCelebrationIntensity;
  familyMemberAgeGroup?: FamilyMemberAgeGroup;
  className?: string;
}

/**
 * Celebration card props
 */
export interface CelebrationCardProps {
  celebration: EnterpriseCelebrationNotification;
  onDismiss: (celebrationId: string) => void;
  className?: string;
}

/**
 * Confetti trigger props
 */
export interface ConfettiTriggerProps {
  celebrationLevel: number;
  familyContext?: EnterpriseCelebrationNotification['familyContext'];
  enabled?: boolean;
}

/**
 * Toast notification props for celebrations
 */
export interface CelebrationToastProps {
  title: string;
  description: string;
  duration?: number;
  className?: string;
  enabled?: boolean;
}

// ================================
// CELEBRATION EVENT HANDLER PROPS
// ================================

/**
 * Props for celebration event handlers
 */
export interface CelebrationEventHandlerProps {
  userId?: number;
  familyId?: number;
  enableToasts: boolean;
  enableConfetti: boolean;
  enableCelebrationCards: boolean;
  intensityConfig: Record<string, unknown>;
} 