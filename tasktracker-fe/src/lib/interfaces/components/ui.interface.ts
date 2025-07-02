/*
 * UI Component Interfaces
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * UI component interfaces following .cursorrules enterprise standards
 * All interfaces properly organized in lib/interfaces/components/ subdirectory
 */

import { ReactNode } from 'react';

// Import SkeletonWrapperProps from unified location following .cursorrules
import type { SkeletonWrapperProps } from '../ui/ui-components.interface';

// ================================
// MODAL & DIALOG INTERFACES
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

export interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  showContactSupport?: boolean;
  errorDetails?: string;
  onContactSupport?: () => void;
  onRetry?: () => void;
  className?: string;
}

// ================================
// PROVIDER INTERFACES
// ================================

export interface ToastProviderProps {
  children: ReactNode;
}

// ================================
// PROGRESS & STATUS INTERFACES
// ================================

export interface TimeProgressBarProps {
  startTime: Date;
  endTime: Date;
  currentTime?: Date;
  className?: string;
  showLabels?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

// ================================
// CARD INTERFACES
// ================================

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export interface ProgressCardProps {
  title: string;
  current: number;
  total: number;
  unit?: string;
  description?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  className?: string;
}

// ================================
// ANIMATION INTERFACES
// ================================

export interface SpriteAnimationContainerProps {
  spriteUrl: string;
  frameCount: number;
  frameRate: number;
  width: number;
  height: number;
  loop?: boolean;
  autoPlay?: boolean;
  onAnimationComplete?: () => void;
  className?: string;
}

// ================================
// INPUT INTERFACES
// ================================

export interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  showTime?: boolean;
  timeFormat?: '12h' | '24h';
}

export interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  presetColors?: string[];
  allowCustom?: boolean;
  className?: string;
  disabled?: boolean;
}

export interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: ReactNode;
}

export interface AssigneeListProps {
  assignees: Array<{
    id: number;
    name: string;
    avatar?: string;
    role?: string;
  }>;
  maxVisible?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// ================================
// SKELETON INTERFACES
// ================================

export interface LoadingSkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  count?: number;
}

export interface MFAStatusCardSkeletonProps {
  className?: string;
  showActions?: boolean;
}

export interface MFASetupWizardSkeletonProps {
  currentStep?: number;
  totalSteps?: number;
  className?: string;
}

export interface MFAVerificationFormSkeletonProps {
  method?: 'app' | 'sms' | 'email';
  className?: string;
}

export interface MFABackupCodesGridSkeletonProps {
  codeCount?: number;
  className?: string;
}

export interface MFASetupStepsSkeletonProps {
  stepCount?: number;
  className?: string;
}

export interface GameStatsGridSkeletonProps {
  itemCount?: number;
  showAnimations?: boolean;
  className?: string;
}

export interface AchievementGridSkeletonProps {
  itemCount?: number;
  showCategories?: boolean;
  className?: string;
}

export interface InvitationAcceptanceFlowSkeletonProps {
  currentStep?: number;
  className?: string;
}

export interface WithSkeletonProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
}

export interface SkeletonContainerProps {
  isLoading: boolean;
  children: ReactNode;
  className?: string;
}

// ================================
// UI COMPONENT INTERFACES (NO DUPLICATES)
// ================================

export interface UIComponentBase {
  className?: string;
  children?: ReactNode;
}

export interface InteractiveComponent extends UIComponentBase {
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export interface FormComponent extends UIComponentBase {
  name?: string;
  required?: boolean;
  error?: string;
}

// ================================
// COMPONENT STATE INTERFACES
// ================================

export interface ComponentState {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  errorMessage?: string;
}

export interface AsyncComponentState extends ComponentState {
  data?: unknown;
  retryCount: number;
  lastRetry?: Date;
} 