/*
 * Skeleton Component Props
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * All skeleton component prop interfaces following .cursorrules standards
 * Extracted from lib/types/ and properly organized in lib/props/
 */

import { ReactNode } from 'react';

// Import unified SkeletonWrapperProps from interfaces following .cursorrules
import type { SkeletonWrapperProps } from '../../interfaces/ui/ui-components.interface';

// ================================
// BASE SKELETON PROPS
// ================================

export interface BaseSkeletonProps {
  className?: string;
}

export interface AccessibleSkeletonProps {
  'aria-label'?: string;
  'aria-busy'?: boolean;
}

export interface ThemedSkeletonProps {
  variant?: 'light' | 'dark' | 'auto';
}

// ================================
// SKELETON WRAPPER COMPONENTS (NO DUPLICATES)
// ================================

// SkeletonWrapperProps now imported from unified interface location
// Following .cursorrules principle: interfaces in lib/interfaces/, props extend from there

export interface WithSkeletonProps {
  loading: boolean;
  children: ReactNode;
  skeleton?: ReactNode;
  isLoading?: boolean;
}

export interface SkeletonContainerProps extends BaseSkeletonProps {
  children: ReactNode;
  rows?: number;
  columns?: number;
  gap?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

// ================================
// SPECIFIC SKELETON COMPONENTS
// ================================

export interface GameStatsGridSkeletonProps extends BaseSkeletonProps {
  itemCount?: number;
  showTrends?: boolean;
  showIcons?: boolean;
  columns?: number;
  rows?: number;
  showHeaders?: boolean;
}

export interface AchievementGridSkeletonProps extends BaseSkeletonProps {
  itemCount?: number;
  showBadges?: boolean;
  showProgress?: boolean;
  columns?: number;
  items?: number;
  showFilters?: boolean;
}

export interface InvitationAcceptanceFlowSkeletonProps {
  showAvatar?: boolean;
  showBadges?: boolean;
  showDescription?: boolean;
  className?: string;
  steps?: number;
  showProgress?: boolean;
}

export interface MFASetupStepsSkeletonProps {
  stepCount?: number;
  showIcons?: boolean;
  showProgress?: boolean;
  className?: string;
  steps?: number;
}

// ================================
// SPECIALIZED SKELETON PROPS
// ================================

export interface ChildAccountCardSkeletonProps extends BaseSkeletonProps {
  showAvatar?: boolean;
  showBadges?: boolean;
}

export interface ScreenTimeChartSkeletonProps extends BaseSkeletonProps {
  showLegend?: boolean;
  chartType?: 'line' | 'bar' | 'pie';
}

export interface PermissionRequestListSkeletonProps extends BaseSkeletonProps {
  itemCount?: number;
  showActions?: boolean;
}

export interface ActivityPanelSkeletonProps extends BaseSkeletonProps {
  showTimeline?: boolean;
  itemCount?: number;
}

export interface ActivityTimelineSkeletonProps extends BaseSkeletonProps {
  itemCount?: number;
  showAvatars?: boolean;
}

export interface QRCodeSkeletonProps extends BaseSkeletonProps {
  size?: 'sm' | 'md' | 'lg';
}

export interface MFACodeInputSkeletonProps extends BaseSkeletonProps {
  digitCount?: number;
}

export interface BackupCodesGridSkeletonProps extends BaseSkeletonProps {
  codeCount?: number;
  columns?: number;
}

export interface SecurityLevelBadgeSkeletonProps extends BaseSkeletonProps {
  showIcon?: boolean;
  showDescription?: boolean;
}

export interface InvitationFormSkeletonProps extends BaseSkeletonProps {
  showRoleSelector?: boolean;
  showPermissions?: boolean;
}

export interface FamilyMemberListSkeletonProps extends BaseSkeletonProps {
  memberCount?: number;
  showAvatars?: boolean;
}

export interface PendingInvitationCardSkeletonProps extends BaseSkeletonProps {
  showActions?: boolean;
  showExpiration?: boolean;
}

export interface DeviceListSkeletonProps extends BaseSkeletonProps {
  deviceCount?: number;
  showActions?: boolean;
}

export interface SessionTimelineSkeletonProps extends BaseSkeletonProps {
  sessionCount?: number;
  showDetails?: boolean;
}

export interface SecurityDashboardSkeletonProps extends BaseSkeletonProps {
  showCharts?: boolean;
  showMetrics?: boolean;
}

// Re-export unified SkeletonWrapperProps for convenience
export type { SkeletonWrapperProps }; 