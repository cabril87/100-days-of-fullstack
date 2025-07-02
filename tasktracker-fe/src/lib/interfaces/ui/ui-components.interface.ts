/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * UI Component Interfaces - Moved from lib/types/ui-components.ts for .cursorrules compliance
 * lib/interfaces/ui/ui-components.interface.ts
 */

import { ReactNode } from 'react';

// ================================
// BASE UI COMPONENT INTERFACES
// ================================

export interface BaseUIProps {
  className?: string;
  children?: ReactNode;
}

// ================================
// DECORATIVE & VISUAL COMPONENT INTERFACES
// ================================

export interface DecorativeLinesProps {
  position?: 'top' | 'bottom' | 'both';
  variant?: 'primary' | 'secondary' | 'gamification' | 'theme-adaptive';
  animate?: boolean;
  className?: string;
  thickness?: 'thin' | 'normal' | 'thick';
}

export interface NetworkStatusProps {
  className?: string;
  showText?: boolean;
}

export interface TimeProgressBarProps {
  startTime: Date;
  endTime: Date;
  className?: string;
}

export interface SpinnerProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
}

export interface AnimatedStateProps {
  state: 'loading' | 'success' | 'error' | 'warning';
  title: string;
  message?: string;
  onRetry?: () => void;
  autoHide?: boolean;
  duration?: number;
  className?: string;
}

// ================================
// FORM & INPUT COMPONENT INTERFACES
// ================================

export interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
}

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  colors?: string[];
  className?: string;
  disabled?: boolean;
}

export interface Assignee {
  id: number;
  name: string;
  avatar?: string;
  role?: string;
}

export interface AssigneeListProps {
  assignees: Assignee[];
  maxDisplay?: number;
  showNames?: boolean;
  className?: string;
}

// ================================
// CARD & DISPLAY COMPONENT INTERFACES
// ================================

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  className?: string;
}

export interface ProgressCardProps {
  title: string;
  progress: number;
  total: number;
  icon?: ReactNode;
  color?: string;
  className?: string;
}

export interface GamificationCardProps {
  title: string;
  points: number;
  level: number;
  streak: number;
  className?: string;
}

// ================================
// MODAL & DIALOG COMPONENT INTERFACES
// ================================

export interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  achievements?: Array<{
    id: number;
    name: string;
    icon: string;
    points: number;
  }>;
}

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  isLoading?: boolean;
}

// ================================
// TOAST & NOTIFICATION COMPONENT INTERFACES
// ================================

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
  onClose?: () => void;
}

export interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
  defaultDuration?: number;
}

// ================================
// SKELETON & LOADING COMPONENT INTERFACES (.cursorrules compliant)
// ================================

export interface LoadingSkeletonProps {
  className?: string;
  rows?: number;
  showAvatar?: boolean;
}

/**
 * Unified SkeletonWrapperProps interface
 * Combines ALL variant types and properties used across the application
 * Following .cursorrules requirement: single source of truth for each interface
 * PRESERVING ALL EXISTING FUNCTIONALITY - no features removed
 */
export interface SkeletonWrapperProps {
  // Core Properties (PRESERVED)
  className?: string;
  isLoading?: boolean;
  children?: ReactNode;
  fallback?: ReactNode;
  delay?: number;
  
  // Combined Variant Types (ALL VARIANTS PRESERVED)
  // From ui-components: 'default' | 'card' | 'text' | 'avatar' | 'button'
  // From skeleton types: 'pulse' | 'wave' | 'gamified' | 'child' | 'teen' | 'adult'
  // Additional variants found in components: 'child-friendly'
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
    | 'adult'
    | 'child-friendly';
  
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

export interface WithSkeletonProps {
  loading?: boolean;
  skeleton?: ReactNode;
  children: ReactNode;
}

export interface SkeletonContainerProps {
  className?: string;
  isLoading?: boolean;
  children?: ReactNode;
  rows?: number;
  showAvatar?: boolean;
  showButton?: boolean;
}

export interface GameStatsGridSkeletonProps {
  className?: string;
  isLoading?: boolean;
  children?: ReactNode;
  columns?: number;
  showIcons?: boolean;
}

export interface AchievementGridSkeletonProps {
  className?: string;
  isLoading?: boolean;
  children?: ReactNode;
  itemCount?: number;
  showProgress?: boolean;
}

// ================================
// MFA & SECURITY COMPONENT INTERFACES
// ================================

export interface MFASetupStepsSkeletonProps {
  currentStep?: number;
  totalSteps?: number;
  className?: string;
}

// ================================
// INVITATION & FAMILY COMPONENT INTERFACES
// ================================

export interface InvitationAcceptanceFlowSkeletonProps {
  showAvatar?: boolean;
  showProgress?: boolean;
  className?: string;
}

// ================================
// THEME COMPONENT INTERFACES
// ================================

export interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ThemePreviewCardProps {
  theme: {
    id: string;
    name: string;
    preview: string;
    colors: Record<string, string>;
  };
  isSelected: boolean;
  onSelect: () => void;
}

export interface ThemeCardProps {
  theme: {
    id: string;
    name: string;
    description: string;
    preview: string;
    price: number;
    isPremium: boolean;
  };
  onInstall: (themeId: string) => void;
  isInstalled: boolean;
} 