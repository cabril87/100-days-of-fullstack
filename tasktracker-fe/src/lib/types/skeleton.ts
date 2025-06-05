// Central skeleton types - All skeleton interfaces following project standards
// lib/types/skeleton.ts - Centralized type definitions

// ✅ Base skeleton interfaces with explicit typing
export interface BaseSkeletonProps {
  className?: string;
  variant?: 'default' | 'gamified' | 'child-friendly';
  isAnimated?: boolean;
}

// ✅ Parental Control Skeleton Interfaces
export interface ChildAccountCardSkeletonProps extends BaseSkeletonProps {
  showAvatar: boolean;
  showBadges: boolean;
  showStatus: boolean;
}

export interface ScreenTimeChartSkeletonProps extends BaseSkeletonProps {
  chartType: 'bar' | 'line' | 'pie';
  showAxes: boolean;
  dataPointCount: number;
}

export interface PermissionRequestListSkeletonProps extends BaseSkeletonProps {
  itemCount: number;
  showActions: boolean;
  showTimestamps: boolean;
}

export interface ActivityPanelSkeletonProps extends BaseSkeletonProps {
  panelCount: number;
  showIcons: boolean;
  showTimestamps: boolean;
}

export interface ActivityTimelineSkeletonProps extends BaseSkeletonProps {
  eventCount: number;
  showMarkers: boolean;
  showDescriptions: boolean;
}

// ✅ MFA Skeleton Interfaces
export interface QRCodeSkeletonProps extends BaseSkeletonProps {
  size: 'small' | 'medium' | 'large';
  showBorder: boolean;
  showScanningAnimation: boolean;
}

export interface MFACodeInputSkeletonProps extends BaseSkeletonProps {
  digitCount: 6;
  showFocusState: boolean;
  showErrorState: boolean;
}

export interface BackupCodesGridSkeletonProps extends BaseSkeletonProps {
  codeCount: number;
  showCopyButtons: boolean;
  gridColumns: number;
}

export interface SecurityLevelBadgeSkeletonProps extends BaseSkeletonProps {
  showShield: boolean;
  showLevel: boolean;
  showProgress: boolean;
}

// ✅ Family Invitation Skeleton Interfaces  
export interface InvitationFormSkeletonProps extends BaseSkeletonProps {
  showEmailField: boolean;
  showRoleSelector: boolean;
  showSubmitButton: boolean;
}

export interface FamilyMemberListSkeletonProps extends BaseSkeletonProps {
  memberCount: number;
  showAvatars: boolean;
  showRoles: boolean;
  showActions: boolean;
}

export interface PendingInvitationCardSkeletonProps extends BaseSkeletonProps {
  cardCount: number;
  showTimer: boolean;
  showStatus: boolean;
}

// ✅ Session Management Skeleton Interfaces
export interface DeviceListSkeletonProps extends BaseSkeletonProps {
  deviceCount: number;
  showSecurityBadges: boolean;
  showTrustIndicators: boolean;
  showActions: boolean;
}

export interface SessionTimelineSkeletonProps extends BaseSkeletonProps {
  eventCount: number;
  showTimestamps: boolean;
  showActivityIcons: boolean;
}

export interface SecurityDashboardSkeletonProps extends BaseSkeletonProps {
  showScoreCard: boolean;
  showRecommendations: boolean;
  showActivityFeed: boolean;
  cardCount: number;
}

// ✅ Settings & Profile Skeleton Interfaces
export interface ProfileHeaderSkeletonProps extends BaseSkeletonProps {
  showAvatar: boolean;
  showBadges: boolean;
  showStats: boolean;
  userType: 'child' | 'teen' | 'adult';
}

export interface ProfileFormSkeletonProps extends BaseSkeletonProps {
  fieldCount: number;
  showAvatarUpload: boolean;
  showSocialLinks: boolean;
  showBio: boolean;
}

export interface SettingsMenuSkeletonProps extends BaseSkeletonProps {
  tabCount: number;
  showIcons: boolean;
  showNotificationBadges: boolean;
}

export interface SettingsSectionSkeletonProps extends BaseSkeletonProps {
  sectionTitle: string;
  itemCount: number;
  showToggles: boolean;
  showDropdowns: boolean;
}

export interface FamilyManagementSkeletonProps extends BaseSkeletonProps {
  memberCount: number;
  showRoleManagement: boolean;
  showInviteSection: boolean;
}

// ✅ Gamification Skeleton Interfaces
export interface AchievementBadgeSkeletonProps extends BaseSkeletonProps {
  badgeSize: 'small' | 'medium' | 'large';
  showProgress: boolean;
  showLevel: boolean;
  shimmerEffect: boolean;
}

export interface ProgressBarSkeletonProps extends BaseSkeletonProps {
  showPercentage: boolean;
  showLabel: boolean;
  progressType: 'linear' | 'circular';
  theme: 'child' | 'teen' | 'adult';
}

export interface GameStatsCardSkeletonProps extends BaseSkeletonProps {
  showIcon: boolean;
  showTrend: boolean;
  showValue: boolean;
  statType: 'points' | 'achievements' | 'level' | 'streak';
}

export interface NotificationBadgeSkeletonProps extends BaseSkeletonProps {
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showCount: boolean;
  pulseAnimation: boolean;
}

// ✅ Common UI Skeleton Interfaces
export interface NavigationSkeletonProps extends BaseSkeletonProps {
  menuItemCount: number;
  showUserAvatar: boolean;
  hasNotificationBadge: boolean;
  showBreadcrumbs: boolean;
}

export interface SidebarSkeletonProps extends BaseSkeletonProps {
  sectionCount: number;
  showSearch: boolean;
  showUserSection: boolean;
  isCollapsed: boolean;
}

export interface DashboardCardSkeletonProps extends BaseSkeletonProps {
  cardCount: number;
  showStats: boolean;
  hasProgressBars: boolean;
  showCharts: boolean;
}

export interface DataTableSkeletonProps extends BaseSkeletonProps {
  rowCount: number;
  columnCount: number;
  hasActions: boolean;
  showPagination: boolean;
  showFilters: boolean;
}

export interface FormSkeletonProps extends BaseSkeletonProps {
  fieldCount: number;
  hasSubmitButton: boolean;
  showValidation: boolean;
  formLayout: 'single-column' | 'two-column' | 'grid';
}

// ✅ Age-Appropriate Skeleton Interfaces
export interface ChildFriendlySkeletonProps extends BaseSkeletonProps {
  colorScheme: 'rainbow' | 'pastel' | 'bright';
  animationSpeed: 'slow' | 'normal' | 'fast';
  roundedCorners: boolean;
  showFriendlyIcons: boolean;
}

export interface TeenSkeletonProps extends BaseSkeletonProps {
  theme: 'modern' | 'sleek' | 'gaming';
  showCoolAnimations: boolean;
  gradientEffects: boolean;
}

export interface AdultSkeletonProps extends BaseSkeletonProps {
  professional: boolean;
  minimalist: boolean;
  businessTheme: boolean;
}

// ✅ Implementation Interfaces
export interface SkeletonComponent {
  isLoading: boolean;
  fallback: React.ComponentType<BaseSkeletonProps>;
  errorFallback?: React.ComponentType<{ error: Error }>;
  retryCallback?: () => void;
}

export interface AccessibleSkeletonProps {
  'aria-label': string;
  'aria-busy': boolean;
  'aria-live': 'polite' | 'assertive';
  role: 'status' | 'progressbar';
}

export interface ThemedSkeletonProps {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  animationDuration: number;
  borderRadius: number;
} 