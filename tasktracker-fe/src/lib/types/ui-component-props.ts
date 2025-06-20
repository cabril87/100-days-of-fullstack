/*
 * UI Component Props Type Definitions
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * All UI component prop interfaces following Family Auth Implementation Checklist
 * Centralized UI component interface definitions for consistent typing
 */

import { ReactNode } from 'react';

// ================================
// BASE UI COMPONENT PROPS
// ================================

export interface BaseUIProps {
  className?: string;
  children?: ReactNode;
}

// ================================
// CARD COMPONENTS
// ================================

export interface GamificationCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  value?: string | number;
  progress?: number;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'achievement' | 'progress' | 'stats';
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon?: ReactNode;
  description?: string;
  onClick?: () => void;
  className?: string;
}

export interface ProgressCardProps {
  title: string;
  current: number;
  total: number;
  description?: string;
  showPercentage?: boolean;
  color?: string;
  className?: string;
}

// ================================
// INPUT COMPONENTS
// ================================

export interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showTime?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  presetColors?: string[];
  allowCustom?: boolean;
  className?: string;
  disabled?: boolean;
}

export interface TimeProgressBarProps {
  startTime: Date;
  endTime: Date;
  currentTime?: Date;
  className?: string;
  showLabels?: boolean;
  color?: string;
}

// ================================
// FEEDBACK COMPONENTS
// ================================

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  celebrationType?: 'confetti' | 'fireworks' | 'none';
  rewards?: Array<{
    type: 'points' | 'badge' | 'achievement';
    value: string | number;
    description?: string;
  }>;
}

// ================================
// LOADING COMPONENTS
// ================================

export interface LoadingSkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | 'none';
}

export interface SkeletonWrapperProps {
  isLoading: boolean;
  children: ReactNode;
  fallback: ReactNode;
  className?: string;
  delay?: number;
}

export interface WithSkeletonProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
}

export interface SkeletonContainerProps {
  isLoading: boolean;
  children: ReactNode;
  rows?: number;
  className?: string;
}

// ================================
// ANIMATION COMPONENTS
// ================================

export interface SpriteAnimationContainerProps {
  spriteUrl: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  duration?: number;
  loop?: boolean;
  autoPlay?: boolean;
  className?: string;
}

export interface EnterpriseAnimationContainerProps {
  children: ReactNode;
  animationType?: 'fadeIn' | 'slideIn' | 'scaleIn' | 'none';
  duration?: number;
  delay?: number;
  className?: string;
}

// ================================
// LIST COMPONENTS
// ================================

export interface AssigneeListProps {
  assignees: Array<{
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  }>;
  maxVisible?: number;
  showAddButton?: boolean;
  onAddAssignee?: () => void;
  onRemoveAssignee?: (id: string) => void;
  className?: string;
}

// ================================
// SKELETON SPECIFIC PROPS
// ================================

export interface MFASetupStepsSkeletonProps {
  steps?: number;
  showProgress?: boolean;
  className?: string;
}

export interface GameStatsGridSkeletonProps {
  columns?: number;
  rows?: number;
  showHeaders?: boolean;
  className?: string;
}

export interface AchievementGridSkeletonProps {
  items?: number;
  columns?: number;
  showFilters?: boolean;
  className?: string;
}

export interface InvitationAcceptanceFlowSkeletonProps {
  steps?: number;
  showProgress?: boolean;
  className?: string;
}

// ================================
// THEME COMPONENTS
// ================================

export interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: string;
  onThemeChange?: (theme: string) => void;
}

export interface ThemePreviewCardProps {
  theme: {
    id: string;
    name: string;
    preview: string;
    colors: Record<string, string>;
  };
  isSelected?: boolean;
  onClick?: () => void;
}

export interface ThemeCardProps {
  theme: {
    id: string;
    name: string;
    description?: string;
    preview: string;
    price?: number;
    isPremium?: boolean;
  };
  isInstalled?: boolean;
  onInstall?: () => void;
  onPreview?: () => void;
} 