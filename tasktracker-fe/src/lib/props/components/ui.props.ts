/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * UI Component Props - Moved from lib/types/ui/ for .cursorrules compliance
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md enterprise standards
 */

import React, { ReactNode } from 'react';

// Import unified SkeletonWrapperProps from interfaces following .cursorrules
import type { SkeletonWrapperProps } from '../../interfaces/ui/ui-components.interface';

// ============================================================================
// BASIC UI COMPONENT PROPS
// ============================================================================

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export interface ProgressCardProps {
  title: string;
  progress: number;
  total: number;
  color?: string;
  className?: string;
}

export interface GamificationBadgesProps {
  badges: Array<{ name: string; icon: string; earned: boolean }>;
  className?: string;
}

export interface GamificationCardProps {
  points: number;
  level: number;
  progress: number;
  className?: string;
}

export interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export interface SidebarProps {
  className?: string;
  collapsed?: boolean;
}

export interface NavbarProps {
  className?: string;
  user?: Record<string, unknown>;
}

// ThemeModalProps and related interfaces are in ThemeModal.props.ts

export interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  onClose?: () => void;
}

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export interface DecorativeLinesProps {
  className?: string;
  variant?: 'default' | 'animated' | 'gradient';
}

export interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
}

// ProtectedRouteProps moved to lib/props/components/auth.props.ts
// export interface ProtectedRouteProps {
//   children: React.ReactNode;
//   requiredRole?: string;
//   fallback?: React.ReactNode;
// }

// ============================================================================
// ADVANCED UI COMPONENT PROPS
// ============================================================================

export interface BaseUIProps {
  className?: string;
  children?: ReactNode;
}

export interface InteractiveProps extends BaseUIProps {
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export interface FormFieldProps extends BaseUIProps {
  name?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

export interface NetworkStatusProps {
  className?: string;
  showDetails?: boolean;
}

export interface TimeProgressBarProps {
  totalTime: number;
  elapsedTime: number;
  className?: string;
}

export interface AnimatedStateProps {
  state: 'loading' | 'success' | 'error' | 'warning';
  title: string;
  message?: string;
  onRetry?: () => void;
  autoHide?: boolean;
  duration?: number;
  delay?: number;
  className?: string;
  children: React.ReactNode;
  onAnimationComplete?: () => void;
  exitAnimation?: boolean;
  keepMounted?: boolean;
}

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  presets?: string[];
  showInput?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
  placeholder?: string;
  format?: 'hex' | 'rgb' | 'hsl';
}

export interface AssigneeListProps {
  assignees: Array<{
    id: number;
    name: string;
    avatar?: string;
    role?: string;
    isOnline?: boolean;
  }>;
  maxVisible?: number;
  onAssigneeClick?: (assigneeId: number) => void;
  className?: string;
}

export interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  celebrationType?: 'task' | 'achievement' | 'level' | 'streak';
  points?: number;
  className?: string;
  onContinue?: () => void;
}

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  isDestructive?: boolean;
  loading?: boolean;
  className?: string;
}

export interface ToastProviderProps {
  children: React.ReactNode;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  maxToasts?: number;
}

// ============================================================================
// SKELETON COMPONENT PROPS
// ============================================================================

export interface LoadingSkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
}

// ============================================================================
// ADDITIONAL UI COMPONENT PROPS (FROM TYPES/UI/ - .CURSORRULES COMPLIANCE)
// ============================================================================

export interface BaseSkeletonProps {
  className?: string;
  variant?: 'default' | 'pulse' | 'wave' | 'gamified' | 'child' | 'teen' | 'adult';
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

export interface SkeletonContainerProps extends BaseSkeletonProps {
  count?: number;
  height?: string | number;
  width?: string | number;
  circle?: boolean;
  enableAnimation?: boolean;
}

export interface GameStatsGridSkeletonProps extends BaseSkeletonProps {
  columns?: number;
  rows?: number;
}

export interface AchievementGridSkeletonProps extends BaseSkeletonProps {
  items?: number;
  showCategories?: boolean;
}

export interface MFASetupStepsSkeletonProps {
  steps?: number;
  currentStep?: number;
  showProgress?: boolean;
  compact?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export interface InvitationAcceptanceFlowSkeletonProps {
  showWelcome?: boolean;
  showRoleSelection?: boolean;
  showPermissionReview?: boolean;
  showFinalConfirmation?: boolean;
  compact?: boolean;
}

export interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChange: (theme: string) => void;
}

export interface ThemePreviewCardProps {
  theme: string;
  name: string;
  description?: string;
  isSelected?: boolean;
  onClick?: () => void;
  preview?: React.ReactNode;
}

export interface ThemeCardProps {
  theme: {
    id: string;
    name: string;
    description?: string;
    preview?: React.ReactNode;
    colors: Record<string, string>;
  };
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

// ============================================================================
// COMPREHENSIVE SKELETON COMPONENT PROPS (FROM TYPES/UI/SKELETON.TS)
// ============================================================================

export interface ChildAccountCardSkeletonProps extends BaseSkeletonProps {
  showAvatar?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

export interface ScreenTimeChartSkeletonProps extends BaseSkeletonProps {
  chartType?: 'bar' | 'line' | 'pie';
  showLegend?: boolean;
}

export interface PermissionRequestListSkeletonProps extends BaseSkeletonProps {
  itemCount?: number;
  showStatus?: boolean;
}

export interface ActivityPanelSkeletonProps extends BaseSkeletonProps {
  showTimeline?: boolean;
  activityCount?: number;
}

export interface ActivityTimelineSkeletonProps extends BaseSkeletonProps {
  entries?: number;
  showAvatars?: boolean;
  showTimestamps?: boolean;
}

export interface QRCodeSkeletonProps extends BaseSkeletonProps {
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export interface MFACodeInputSkeletonProps extends BaseSkeletonProps {
  digits?: number;
  showLabel?: boolean;
}

export interface BackupCodesGridSkeletonProps extends BaseSkeletonProps {
  codeCount?: number;
  columns?: number;
}

export interface SecurityLevelBadgeSkeletonProps extends BaseSkeletonProps {
  showLevel?: boolean;
  showProgress?: boolean;
}

export interface InvitationFormSkeletonProps extends BaseSkeletonProps {
  fields?: number;
  showButtons?: boolean;
}

export interface FamilyMemberListSkeletonProps extends BaseSkeletonProps {
  memberCount?: number;
  showAvatars?: boolean;
  showRoles?: boolean;
}

export interface PendingInvitationCardSkeletonProps extends BaseSkeletonProps {
  showAvatar?: boolean;
  showStatus?: boolean;
  showActions?: boolean;
}

export interface DeviceListSkeletonProps extends BaseSkeletonProps {
  deviceCount?: number;
  showStatus?: boolean;
  showActions?: boolean;
}

export interface SessionTimelineSkeletonProps extends BaseSkeletonProps {
  sessionCount?: number;
  showDetails?: boolean;
}

export interface SecurityDashboardSkeletonProps extends BaseSkeletonProps {
  showMetrics?: boolean;
  showChart?: boolean;
  showAlerts?: boolean;
}

export interface ProfileHeaderSkeletonProps extends BaseSkeletonProps {
  showAvatar?: boolean;
  showBadges?: boolean;
  showStats?: boolean;
}

export interface ProfileFormSkeletonProps extends BaseSkeletonProps {
  fieldCount?: number;
  showAvatar?: boolean;
  showActions?: boolean;
}

export interface SettingsMenuSkeletonProps extends BaseSkeletonProps {
  itemCount?: number;
  showIcons?: boolean;
}

export interface SettingsSectionSkeletonProps extends BaseSkeletonProps {
  showHeader?: boolean;
  fieldCount?: number;
  showDescription?: boolean;
}

export interface FamilyManagementSkeletonProps extends BaseSkeletonProps {
  showMembers?: boolean;
  showInvitations?: boolean;
  showSettings?: boolean;
}

export interface AchievementBadgeSkeletonProps extends BaseSkeletonProps {
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
}

export interface ProgressBarSkeletonProps extends BaseSkeletonProps {
  showLabel?: boolean;
  showPercentage?: boolean;
}

export interface GameStatsCardSkeletonProps extends BaseSkeletonProps {
  showIcon?: boolean;
  showValue?: boolean;
  showTrend?: boolean;
}

export interface NotificationBadgeSkeletonProps extends BaseSkeletonProps {
  count?: number;
  showIcon?: boolean;
}

export interface NavigationSkeletonProps extends BaseSkeletonProps {
  itemCount?: number;
  showIcons?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export interface SidebarSkeletonProps extends BaseSkeletonProps {
  showHeader?: boolean;
  itemCount?: number;
  collapsed?: boolean;
}

export interface DashboardCardSkeletonProps extends BaseSkeletonProps {
  showHeader?: boolean;
  showChart?: boolean;
  showActions?: boolean;
}

export interface DataTableSkeletonProps extends BaseSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  showPagination?: boolean;
}

export interface FormSkeletonProps extends BaseSkeletonProps {
  fields?: number;
  showLabels?: boolean;
  showButtons?: boolean;
  layout?: 'vertical' | 'horizontal' | 'grid';
}

export interface ChildFriendlySkeletonProps extends BaseSkeletonProps {
  colorful?: boolean;
  rounded?: boolean;
  animated?: boolean;
}

export interface TeenSkeletonProps extends BaseSkeletonProps {
  modern?: boolean;
  gradient?: boolean;
}

export interface AdultSkeletonProps extends BaseSkeletonProps {
  professional?: boolean;
  minimal?: boolean;
}

// ============================================================================
// WIDGET COMPONENT PROPS
// ============================================================================

export interface FamilyGoalsWidgetProps {
  familyId: number;
  className?: string;
  showProgress?: boolean;
  maxGoals?: number;
  onGoalClick?: (goalId: number) => void;
  refreshInterval?: number;
  isCompact?: boolean;
  allowCreate?: boolean;
  allowEdit?: boolean;
  showCompleted?: boolean;
  sortBy?: 'priority' | 'dueDate' | 'progress' | 'created';
  filterBy?: {
    category?: string;
    assignee?: number;
    status?: 'active' | 'completed' | 'overdue';
  };
}

export interface FamilyLeaderboardWidgetProps {
  familyId: number;
  className?: string;
  timeRange?: 'week' | 'month' | 'quarter' | 'year' | 'all';
  maxMembers?: number;
  metric?: 'points' | 'tasks' | 'achievements' | 'streak';
  showAvatars?: boolean;
  isCompact?: boolean;
  refreshInterval?: number;
  onMemberClick?: (memberId: number) => void;
}

export interface DashboardWidgetProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
  headerActions?: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

// ============================================================================
// CHART CONTEXT PROPS
// ============================================================================

export type ChartContextProps = {
  theme: 'light' | 'dark';
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
  };
  fonts: {
    default: string;
    mono: string;
  };
};

// ================================
// SPECIALIZED UI COMPONENT PROPS
// ================================

export interface ButtonProps extends InteractiveProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends FormFieldProps {
  type?: 'text' | 'email' | 'password' | 'number';
  value?: string;
  onChange?: (value: string) => void;
}

export interface ModalProps extends BaseUIProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Re-export unified SkeletonWrapperProps for convenience
export type { SkeletonWrapperProps }; 