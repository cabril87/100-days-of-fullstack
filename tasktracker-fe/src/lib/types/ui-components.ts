/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * UI Component Types
 * Centralized interfaces and types for all UI components
 */

import { ReactNode } from 'react';

// ================================
// BASE UI COMPONENT TYPES
// ================================

export interface BaseUIProps {
  className?: string;
  children?: ReactNode;
}

// ================================
// DECORATIVE & VISUAL COMPONENTS
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
// FORM & INPUT COMPONENTS
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
// CARD & DISPLAY COMPONENTS
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
// MODAL & DIALOG COMPONENTS
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
// TOAST & NOTIFICATION COMPONENTS
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
// SKELETON & LOADING COMPONENTS
// ================================

export interface LoadingSkeletonProps {
  className?: string;
  rows?: number;
  showAvatar?: boolean;
}

export interface BaseSkeletonProps {
  className?: string;
  isLoading?: boolean;
  children?: ReactNode;
}

export interface AccessibleSkeletonProps {
  ariaLabel?: string;
  ariaDescription?: string;
}

export interface ThemedSkeletonProps {
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'button';
  animation?: 'pulse' | 'wave' | 'none';
}

export interface SkeletonWrapperProps extends BaseSkeletonProps, Partial<AccessibleSkeletonProps>, Partial<ThemedSkeletonProps> {
  fallback?: ReactNode;
  delay?: number;
}

export interface WithSkeletonProps {
  loading?: boolean;
  skeleton?: ReactNode;
  children: ReactNode;
}

export interface SkeletonContainerProps extends BaseSkeletonProps {
  rows?: number;
  showAvatar?: boolean;
  showButton?: boolean;
}

// ================================
// GAMIFICATION SKELETON COMPONENTS
// ================================

export interface GameStatsGridSkeletonProps extends BaseSkeletonProps {
  columns?: number;
  showIcons?: boolean;
}

export interface AchievementGridSkeletonProps extends BaseSkeletonProps {
  itemCount?: number;
  showProgress?: boolean;
}

// ================================
// MFA SKELETON COMPONENTS
// ================================

export interface MFASetupStepsSkeletonProps {
  currentStep?: number;
  totalSteps?: number;
  className?: string;
}

// ================================
// FAMILY INVITATION SKELETON COMPONENTS
// ================================

export interface InvitationAcceptanceFlowSkeletonProps {
  showAvatar?: boolean;
  showProgress?: boolean;
  className?: string;
}

// ================================
// THEME COMPONENTS
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
// CHART COMPONENT TYPES
// ================================

export type ChartContextProps = {
  config: Record<string, {
    label?: string;
    color?: string;
    icon?: ReactNode;
  }>;
};

// ================================
// DASHBOARD MODE TYPES
// ================================

export type DashboardMode = 'simple' | 'advanced'; 