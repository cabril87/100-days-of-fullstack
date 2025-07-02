// ============================================================================
// SKELETON TYPES - .cursorrules compliant  
// ============================================================================
// Only types, enums, and unions - NO Props interfaces (those are in lib/props/ui/)

// Core Skeleton Types
export type SkeletonVariant = 
  | 'default' | 'card' | 'text' | 'avatar' | 'button'
  | 'pulse' | 'wave' | 'gamified' | 'child' | 'teen' | 'adult'
  | 'child-friendly';

export type SkeletonSize = 'small' | 'medium' | 'large' | 'xl';

export type SkeletonAnimation = 'pulse' | 'wave' | 'shimmer' | 'none';

export type SkeletonSpeed = 'slow' | 'normal' | 'fast';

export type SkeletonTheme = 'child' | 'teen' | 'adult';

export type SkeletonColorScheme = 'light' | 'dark' | 'auto';

// Navigation Types
export type NavigationVariant = 'horizontal' | 'vertical' | 'mobile';

// Form Types
export type FormFieldType = 'text' | 'select' | 'checkbox' | 'textarea' | 'radio' | 'date';
export type FormLayout = 'vertical' | 'horizontal' | 'grid';

// Dashboard Types  
export type DashboardVariant = 'grid' | 'list' | 'compact';

// Security Level Types
export type SecurityLevel = 'low' | 'medium' | 'high' | 'critical';

// Progress Types
export type ProgressType = 'linear' | 'circular' | 'radial';

// Chart Types
export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut';

// Timeline Types
export type TimelineRange = 'day' | 'week' | 'month' | 'year';

// Gamification Types
export type GamificationTheme = 'child' | 'teen' | 'adult';
export type BadgeSize = 'small' | 'medium' | 'large';
export type ColorTheme = 'rainbow' | 'pastel' | 'bright';
export type GradientTheme = 'cool' | 'warm' | 'neon';
export type ProfessionalTheme = 'minimal' | 'modern' | 'classic';

// Age-Specific Theme Types
export type AgeTheme = 'child' | 'teen' | 'adult';
export type UserType = 'child' | 'teen' | 'adult';

// Skeleton State Types
export type SkeletonState = 'loading' | 'loaded' | 'error' | 'empty';

// Orientation Types
export type Orientation = 'horizontal' | 'vertical';

// Accessibility Types
export type AriaLive = 'polite' | 'assertive' | 'off';

// Combined Skeleton Configuration Type
export type SkeletonConfig = {
  variant: SkeletonVariant;
  size?: SkeletonSize;
  animation?: SkeletonAnimation;
  speed?: SkeletonSpeed;
  theme?: SkeletonTheme;
  colorScheme?: SkeletonColorScheme;
  state?: SkeletonState;
};

// Skeleton Utility Types
export type SkeletonLoadingState = {
  isLoading: boolean;
  error?: Error;
  retryCount: number;
  lastRetry?: Date;
};

export type SkeletonMetrics = {
  loadingStartTime: Date;
  loadingEndTime?: Date;
  loadingDuration?: number;
  retryCount: number;
  errorCount: number;
}; 