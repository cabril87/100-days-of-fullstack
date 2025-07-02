/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Mobile Responsive Configuration Types
 * 
 * IMPORTANT: All component props interfaces have been moved to 
 * @/lib/props/components/mobile.props.ts for .cursorrules compliance.
 * 
 * This file contains only:
 * - Configuration objects
 * - Breakpoint definitions
 * - Device detection types
 * - Non-component interfaces
 */

// ============================================================================
// MOBILE RESPONSIVE TYPES
// According to .cursorrules: All types must be in lib/types/ subdirectories
// ============================================================================

// ================================
// BREAKPOINT CONFIGURATION
// ================================

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

// ================================
// RESPONSIVE CONFIGURATION
// ================================

export interface ResponsiveConfig {
  breakpoints: BreakpointConfig;
  defaultBreakpoint: Breakpoint;
  mobileFirst: boolean;
  useMatchMedia: boolean;
}

// ================================
// DEVICE DETECTION
// ================================

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  currentBreakpoint: Breakpoint;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  touchSupported: boolean;
}

// ================================
// RESPONSIVE UTILITIES
// ================================

export interface ResponsiveValue<T> {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
  base?: T;
}

export interface ResponsiveStyleConfig {
  padding: ResponsiveValue<string>;
  margin: ResponsiveValue<string>;
  fontSize: ResponsiveValue<string>;
  lineHeight: ResponsiveValue<string>;
  spacing: ResponsiveValue<string>;
}

// ================================
// MOBILE GESTURES
// ================================

export interface TouchGestureConfig {
  swipeThreshold: number;
  swipeTimeout: number;
  tapTimeout: number;
  longPressTimeout: number;
  hapticFeedback: boolean;
}

// ================================
// MOBILE NAVIGATION
// ================================

export interface MobileNavigationConfig {
  showBottomBar: boolean;
  showSidebar: boolean;
  collapseThreshold: Breakpoint;
  hamburgerBreakpoint: Breakpoint;
} 