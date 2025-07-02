/*
 * Skeleton Component Interfaces
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * Unified skeleton component interfaces following .cursorrules enterprise standards
 * ALL skeleton interfaces properly organized in lib/interfaces/ui/ subdirectory
 * PRESERVING ALL EXISTING FUNCTIONALITY - no features removed
 */

import { ReactNode } from 'react';

// ================================
// UNIFIED SKELETON WRAPPER INTERFACE (.cursorrules compliant)
// ================================

/**
 * Master SkeletonWrapperProps interface
 * Combines ALL variant types and properties used across the application
 * Following .cursorrules requirement: single source of truth for each interface
 */
export interface SkeletonWrapperProps {
  // Core Properties (PRESERVED)
  className?: string;
  isLoading: boolean;
  children?: ReactNode;
  fallback?: ReactNode;
  delay?: number;
  
  // Combined Variant Types (ALL VARIANTS PRESERVED)
  // From ui-components: 'default' | 'card' | 'text' | 'avatar' | 'button'
  // From skeleton.ts: 'default' | 'pulse' | 'wave' | 'gamified' | 'child' | 'teen' | 'adult'
  variant?: 
    | 'default' 
    | 'card' 
    | 'text' 
    | 'avatar' 
    | 'button'
    | 'pulse' 
    | 'wave' 
    | 'gamified' 
    | 'child' 
    | 'teen' 
    | 'adult';
  
  // Animation Properties (PRESERVED)
  animation?: 'pulse' | 'wave' | 'none';
  speed?: 'slow' | 'normal' | 'fast';
  
  // Theme Properties (PRESERVED)
  theme?: 'light' | 'dark' | 'auto';
  colorScheme?: 'primary' | 'secondary' | 'neutral';
  
  // Accessibility Properties (PRESERVED)
  'aria-label'?: string;
  'aria-busy'?: boolean;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  ariaLabel?: string; // Alternative naming for backward compatibility
  ariaDescription?: string;
  title?: string;
}

// ================================
// BASE SKELETON INTERFACES (PRESERVED)
// ================================

export interface BaseSkeletonProps {
  className?: string;
  variant?: SkeletonWrapperProps['variant']; // Use unified variant types
  speed?: 'slow' | 'normal' | 'fast';
}

export interface AccessibleSkeletonProps {
  'aria-label'?: string;
  'aria-busy'?: boolean;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  title?: string;
}

export interface ThemedSkeletonProps {
  theme?: 'light' | 'dark' | 'auto';
  colorScheme?: 'primary' | 'secondary' | 'neutral';
  rounded?: boolean;
}

// ================================
// CONTAINER & WRAPPER INTERFACES (PRESERVED)
// ================================

export interface WithSkeletonProps {
  loading: boolean;
  children: ReactNode;
  skeleton?: ReactNode;
  isLoading?: boolean;
}

export interface SkeletonContainerProps extends BaseSkeletonProps {
  children?: ReactNode;
  isLoading?: boolean;
  rows?: number;
  columns?: number;
  gap?: 'sm' | 'md' | 'lg';
  showAvatar?: boolean;
  showButton?: boolean;
}

// ================================
// SPECIFIC SKELETON INTERFACES (ALL PRESERVED)
// ================================

export interface LoadingSkeletonProps {
  className?: string;
  rows?: number;
  showAvatar?: boolean;
}

export interface GameStatsGridSkeletonProps extends BaseSkeletonProps {
  className?: string;
  isLoading?: boolean;
  children?: ReactNode;
  columns?: number;
  rows?: number;
  itemCount?: number;
  showTrends?: boolean;
  showIcons?: boolean;
  showHeaders?: boolean;
}

export interface AchievementGridSkeletonProps extends BaseSkeletonProps {
  className?: string;
  isLoading?: boolean;
  children?: ReactNode;
  items?: number;
  itemCount?: number;
  showBadges?: boolean;
  showProgress?: boolean;
  columns?: number;
  showFilters?: boolean;
  showCategories?: boolean;
}

export interface InvitationAcceptanceFlowSkeletonProps extends BaseSkeletonProps {
  showAvatar?: boolean;
  showBadges?: boolean;
  showDescription?: boolean;
  className?: string;
  steps?: number;
  showProgress?: boolean;
  showWelcome?: boolean;
  showRoleSelection?: boolean;
  showPermissionReview?: boolean;
  showFinalConfirmation?: boolean;
  compact?: boolean;
}

export interface MFASetupStepsSkeletonProps extends BaseSkeletonProps {
  stepCount?: number;
  currentStep?: number;
  totalSteps?: number;
  showIcons?: boolean;
  showProgress?: boolean;
  className?: string;
  steps?: number;
  compact?: boolean;
  orientation?: 'horizontal' | 'vertical';
} 