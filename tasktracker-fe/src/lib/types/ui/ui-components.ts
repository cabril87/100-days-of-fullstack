/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * UI Component Data Types & Configurations
 * 
 * IMPORTANT: All component props interfaces have been moved to 
 * @/lib/props/components/ui.props.ts for .cursorrules compliance.
 * 
 * This file contains only:
 * - Data types (DTOs, entities)
 * - Enums and unions
 * - Configuration objects
 * - Non-component interfaces
 */

import { ReactNode } from 'react';

// ================================
// DATA ENTITIES
// ================================

export interface Assignee {
  id: number;
  name: string;
  avatar?: string;
  role?: string;
}

// ================================
// FORM CONTEXT TYPES
// ================================

export type FormFieldContextValue<
  TName extends string = string
> = {
  name: TName;
};

export type FormItemContextValue = {
  id: string;
};

// ================================
// CHART CONFIGURATION TYPES
// ================================

export type ChartContextProps = {
  config: Record<string, {
    label?: string;
    color?: string;
    icon?: ReactNode;
  }>;
};

// ================================
// DASHBOARD CONFIGURATION TYPES
// ================================

export type DashboardMode = 'simple' | 'advanced';

// ================================
// BASE UI COMPONENT TYPES
// ================================

/* 
 * ⚠️  ALL COMPONENT PROPS MOVED TO: @/lib/props/components/ui.props.ts
 * .cursorrules ZERO TOLERANCE: ALL component props MUST be in lib/props/
 * 
 * Moved interfaces include:
 * - BaseUIProps, DecorativeLinesProps, NetworkStatusProps, TimeProgressBarProps
 * - SpinnerProps, AnimatedStateProps, DateTimePickerProps, ColorPickerProps
 * - AssigneeListProps, StatsCardProps, ProgressCardProps, GamificationCardProps
 * - CompletionModalProps, DeleteConfirmationModalProps
 */

/* 
 * ⚠️  ALL REMAINING COMPONENT PROPS MOVED TO: @/lib/props/components/ui.props.ts
 * .cursorrules ZERO TOLERANCE: ALL component props MUST be in lib/props/
 * 
 * Additional moved interfaces include:
 * - ToastProps, ToastProviderProps, LoadingSkeletonProps, BaseSkeletonProps
 * - AccessibleSkeletonProps, ThemedSkeletonProps, SkeletonWrapperProps, WithSkeletonProps
 * - SkeletonContainerProps, GameStatsGridSkeletonProps, AchievementGridSkeletonProps
 * - MFASetupStepsSkeletonProps, InvitationAcceptanceFlowSkeletonProps
 * - ThemeModalProps, ThemePreviewCardProps, ThemeCardProps
 */

// ================================
// UI CONFIGURATION ENUMS & TYPES
// ================================

export type ToastVariant = 'default' | 'destructive' | 'success' | 'warning';
export type SkeletonVariant = 'default' | 'card' | 'text' | 'avatar' | 'button';
export type SkeletonAnimation = 'pulse' | 'wave' | 'none';
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ComponentColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error';

// ================================
// THEME CONFIGURATION TYPES
// ================================

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  preview: string;
  colors: Record<string, string>;
  price?: number;
  isPremium?: boolean;
}

export interface ThemeSelection {
  selectedTheme: string;
  availableThemes: ThemeConfig[];
  customizations: Record<string, unknown>;
}

// ================================
// TOAST CONFIGURATION TYPES
// ================================

export interface ToastConfig {
  maxToasts: number;
  defaultDuration: number;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

// ================================
// SKELETON CONFIGURATION TYPES
// ================================

export interface SkeletonConfig {
  variant: SkeletonVariant;
  animation: SkeletonAnimation;
  rows?: number;
  showAvatar?: boolean;
  delay?: number;
} 