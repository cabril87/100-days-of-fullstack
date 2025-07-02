// ============================================================================
// SKELETON PROPS - .cursorrules compliant
// ============================================================================
// All component props for skeleton components
// Moved from lib/types/ui/skeleton.ts to follow .cursorrules

import { SkeletonVariant } from '@/lib/types/ui/skeleton';

// Core Skeleton Props
export interface BaseSkeletonProps {
  className?: string;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export interface AccessibleSkeletonProps extends BaseSkeletonProps {
  'aria-label'?: string;
  'aria-busy'?: boolean;
  'aria-live'?: 'polite' | 'assertive' | 'off';
}

export interface ThemedSkeletonProps extends BaseSkeletonProps {
  theme?: 'child' | 'teen' | 'adult';
  colorScheme?: 'light' | 'dark';
  animation?: 'pulse' | 'wave' | 'shimmer';
  speed?: 'slow' | 'normal' | 'fast';
}

// Navigation & Layout Props
export interface NavigationSkeletonProps extends BaseSkeletonProps {
  itemCount?: number;
  showLogo?: boolean;
  showUserMenu?: boolean;
  variant?: SkeletonVariant;
}

export interface SidebarSkeletonProps extends BaseSkeletonProps {
  itemCount?: number;
  showHeader?: boolean;
  showFooter?: boolean;
  collapsed?: boolean;
}

export interface DashboardCardSkeletonProps extends BaseSkeletonProps {
  cardCount?: number;
  showHeader?: boolean;
  showContent?: boolean;
  showActions?: boolean;
  variant?: SkeletonVariant;
  columns?: number;
}

export interface DataTableSkeletonProps extends BaseSkeletonProps {
  rowCount?: number;
  columnCount?: number;
  showHeader?: boolean;
  showPagination?: boolean;
  showActions?: boolean;
}

export interface FormSkeletonProps extends BaseSkeletonProps {
  fieldCount?: number;
  showHeader?: boolean;
  showSubmitButton?: boolean;
  showValidation?: boolean;
  fieldTypes?: ('text' | 'select' | 'checkbox' | 'textarea')[];
}

// MFA Props
export interface MFASetupStepsSkeletonProps extends BaseSkeletonProps {
  stepCount?: number;
  currentStep?: number;
  showProgress?: boolean;
  showNavigation?: boolean;
}

export interface QRCodeSkeletonProps extends BaseSkeletonProps {
  size?: 'small' | 'medium' | 'large';
  showInstructions?: boolean;
}

export interface MFACodeInputSkeletonProps extends BaseSkeletonProps {
  inputCount?: number;
  showResendButton?: boolean;
}

export interface BackupCodesGridSkeletonProps extends BaseSkeletonProps {
  codeCount?: number;
  showHeader?: boolean;
  showActions?: boolean;
}

export interface SecurityLevelBadgeSkeletonProps extends BaseSkeletonProps {
  level?: 'low' | 'medium' | 'high';
  showIcon?: boolean;
  showDescription?: boolean;
}

// Family Invitation Props
export interface InvitationFormSkeletonProps extends BaseSkeletonProps {
  showEmailField?: boolean;
  showRoleSelector?: boolean;
  showSubmitButton?: boolean;
  variant?: SkeletonVariant;
}

export interface FamilyMemberListSkeletonProps extends BaseSkeletonProps {
  memberCount?: number;
  showActions?: boolean;
  showAvatars?: boolean;
  showRoles?: boolean;
  variant?: SkeletonVariant;
}

export interface PendingInvitationCardSkeletonProps extends BaseSkeletonProps {
  cardCount?: number;
  showTimer?: boolean;
  showActions?: boolean;
  showStatus?: boolean;
  variant?: SkeletonVariant;
}

export interface InvitationAcceptanceFlowSkeletonProps extends BaseSkeletonProps {
  stepCount?: number;
  currentStep?: number;
  showProgress?: boolean;
  showNavigation?: boolean;
  totalSteps?: number;
  variant?: SkeletonVariant;
}

// Session Management Props
export interface DeviceListSkeletonProps extends BaseSkeletonProps {
  deviceCount?: number;
  showActions?: boolean;
  showLastActive?: boolean;
}

export interface SessionTimelineSkeletonProps extends BaseSkeletonProps {
  entryCount?: number;
  showFilters?: boolean;
  showExport?: boolean;
}

export interface SecurityDashboardSkeletonProps extends BaseSkeletonProps {
  cardCount?: number;
  showAlerts?: boolean;
  showStats?: boolean;
  showActivity?: boolean;
}

// Parental Controls Props
export interface ChildAccountCardSkeletonProps extends BaseSkeletonProps {
  accountCount?: number;
  showStats?: boolean;
  showActions?: boolean;
}

export interface ScreenTimeChartSkeletonProps extends BaseSkeletonProps {
  showLegend?: boolean;
  showControls?: boolean;
}

export interface PermissionRequestListSkeletonProps extends BaseSkeletonProps {
  requestCount?: number;
  showActions?: boolean;
}

export interface ActivityPanelSkeletonProps extends BaseSkeletonProps {
  entryCount?: number;
  showFilters?: boolean;
}

export interface ActivityTimelineSkeletonProps extends BaseSkeletonProps {
  entryCount?: number;
  showDate?: boolean;
  showDetails?: boolean;
  timeRange?: 'day' | 'week' | 'month';
}

// Settings Profile Props
export interface ProfileHeaderSkeletonProps extends BaseSkeletonProps {
  showAvatar?: boolean;
  showBadges?: boolean;
  showStats?: boolean;
}

export interface ProfileFormSkeletonProps extends BaseSkeletonProps {
  fieldCount?: number;
  showAvatarUpload?: boolean;
  showActions?: boolean;
}

export interface SettingsMenuSkeletonProps extends BaseSkeletonProps {
  itemCount?: number;
  showIcons?: boolean;
}

export interface SettingsSectionSkeletonProps extends BaseSkeletonProps {
  itemCount?: number;
  showHeader?: boolean;
}

export interface FamilyManagementSkeletonProps extends BaseSkeletonProps {
  memberCount?: number;
  showInviteButton?: boolean;
  showRoles?: boolean;
  showActions?: boolean;
}

// Gamification Props
export interface GameStatsGridSkeletonProps extends BaseSkeletonProps {
  statCount?: number;
}

export interface AchievementGridSkeletonProps extends BaseSkeletonProps {
  achievementCount?: number;
  badgeSize?: 'small' | 'medium' | 'large';
}

export interface AchievementBadgeSkeletonProps extends BaseSkeletonProps {
  badgeSize?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  showLevel?: boolean;
  shimmerEffect?: boolean;
}

export interface ProgressBarSkeletonProps extends BaseSkeletonProps {
  progressType?: 'linear' | 'circular';
  theme?: 'child' | 'teen' | 'adult';
}

export interface GameStatsCardSkeletonProps extends BaseSkeletonProps {
  showIcon?: boolean;
  showProgress?: boolean;
  theme?: 'child' | 'teen' | 'adult';
}

export interface NotificationBadgeSkeletonProps extends BaseSkeletonProps {
  badgeCount?: number;
  showDot?: boolean;
}

// Age-Specific Props
export interface ChildFriendlySkeletonProps extends BaseSkeletonProps {
  colorTheme?: 'rainbow' | 'pastel' | 'bright';
  showAnimations?: boolean;
}

export interface TeenSkeletonProps extends BaseSkeletonProps {
  gradientTheme?: 'cool' | 'warm' | 'neon';
}

export interface AdultSkeletonProps extends BaseSkeletonProps {
  professionalTheme?: 'minimal' | 'modern' | 'classic';
} 