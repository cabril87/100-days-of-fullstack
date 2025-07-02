/*
 * Main UI Component Props
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * All UI component prop interfaces following .cursorrules standards
 * Extracted from lib/types/ and properly organized in lib/props/
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

// Card props moved to Card.props.ts to avoid duplicates

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
  required?: boolean;
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

// ToastProps moved to Toast.props.ts to avoid duplicates

export interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export interface ToastNotificationProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: Array<{ label: string; onClick: () => void }>;
  onDismiss?: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  animationType?: 'slide' | 'fade' | 'bounce';
}

export interface NotificationProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: Array<{ label: string; onClick: () => void }>;
  onDismiss?: () => void;
}

// ================================
// MODAL COMPONENTS
// ================================

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
  actionText?: string;
  onAction?: () => void;
  variant?: 'success' | 'info' | 'warning';
}

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName?: string;
  isLoading?: boolean;
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

// Skeleton props moved to skeleton.props.ts to avoid duplicates

// ================================
// LOADING & ERROR STATES
// ================================

export interface LoadingStateProps {
  isLoading: boolean;
  loadingText?: string;
  showSpinner?: boolean;
  showProgress?: boolean;
  progress?: number;
}

export interface ErrorStateProps {
  error: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  showRetryButton?: boolean;
  errorType?: 'validation' | 'network' | 'permission' | 'unknown';
}

export interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
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
// LIST & ASSIGNMENT COMPONENTS
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
// THEME COMPONENTS
// ================================

// Theme props moved to ThemeModal.props.ts to avoid duplicates

// ================================
// UTILITY COMPONENTS
// ================================

export interface DecorativeLinesProps {
  variant?: 'horizontal' | 'vertical' | 'diagonal';
  count?: number;
  className?: string;
}

export interface NetworkStatusProps {
  className?: string;
}

export interface AnimatedStateProps {
  state: 'idle' | 'loading' | 'success' | 'error';
  children: ReactNode;
  loadingComponent?: ReactNode;
  successComponent?: ReactNode;
  errorComponent?: ReactNode;
  className?: string;
}

// ================================
// GAMIFICATION SPECIFIC
// ================================

export interface GamificationBadgesProps {
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    earned: boolean;
  }>;
  className?: string;
}

// ================================
// PROTECTED ROUTE
// ================================

export interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireMFA?: boolean;
  requiredRole?: string;
  redirectTo?: string;
}

export interface ProgressiveFormProps {
  steps: Array<{
    id: string;
    title: string;
    description?: string;
    component: React.ComponentType<{ data: Record<string, unknown>; onDataChange: (data: Record<string, unknown>) => void }>;
    validation?: (data: Record<string, unknown>) => boolean;
    optional?: boolean;
  }>;
  onComplete: (data: Record<string, unknown>) => void;
  onStepChange?: (stepIndex: number, stepData: Record<string, unknown>) => void;
  initialData?: Record<string, unknown>;
  allowSkip?: boolean;
  showProgress?: boolean;
  className?: string;
} 