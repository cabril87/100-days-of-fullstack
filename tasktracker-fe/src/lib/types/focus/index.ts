/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Focus Types Index
 * Selective exports to avoid conflicts
 * .cursorrules compliant
 */

// Core Focus Types (primary)
export * from './focus';

// Focus components (selective exports)
export type {
  FocusPageProps,
  FocusSessionManagerProps
} from './focus-components';

// Focus page types (selective to avoid conflicts)
export type {
  FocusSessionAnalytics,
  FocusSessionStats
} from '@/lib/types/focus/focus-page'; 