/*
 * UI Types Index
 * Central export point for all UI-related type definitions
 * Compliance with .cursorrules enterprise standards
 */

// Core UI Types
export * from './ui';

// UI Component Types
export * from './ui-components';

// Mobile Responsive Types
export * from './mobile-responsive';

// Widget Types
export * from './widgets';

// Skeleton Types
export * from './skeleton';

// ============================================================================
// UI COMPONENT TYPES - CENTRAL EXPORTS
// According to .cursorrules: All types must be in lib/types/ subdirectories
// ============================================================================

// Export only existing UI component types
export * from './ui-components';
export * from './mobile-responsive';
export * from './widgets';

// Export selected skeleton types to avoid conflicts
export type {
  BaseSkeletonProps,
  AccessibleSkeletonProps,
  ThemedSkeletonProps
} from './skeleton';

// ============================================================================
// LEGACY EXPORTS (Keep for compatibility)
// ============================================================================

// UI component types (comprehensive)
export * from './ui-components';

// Touch and responsive types
export * from './touch-responsive';

// Charts and data visualization
export * from './charts';

// Media and content types
export * from './media-content';

// Skeleton variants and configurations
export * from './skeleton';

// ============================================================================
// UI TYPES INDEX - .cursorrules compliant
// Export only existing files, avoid duplicates
// ============================================================================

export * from './ui-components';
export * from './mobile-responsive';
export * from './widgets';

// Export specific skeleton types to avoid conflicts
export type {
  BaseSkeletonProps,
  AccessibleSkeletonProps,
  ThemedSkeletonProps
} from './skeleton'; 