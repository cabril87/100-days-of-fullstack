// ================================
// MOBILE RESPONSIVE SYSTEM TYPES
// Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md Enterprise Standards
// ================================

import { ReactNode } from 'react';

// ================================
// RESPONSIVE BREAKPOINT TYPES
// ================================

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type Orientation = 'portrait' | 'landscape';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type TouchCapability = 'touch' | 'no-touch' | 'hybrid';

export interface ResponsiveState {
  // Current breakpoint
  breakpoint: Breakpoint;
  
  // Boolean helpers for each breakpoint
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  is2Xl: boolean;
  
  // Device information
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  
  // Screen properties
  width: number;
  height: number;
  orientation: Orientation;
  isPortrait: boolean;
  isLandscape: boolean;
  
  // Touch capabilities
  touchCapability: TouchCapability;
  hasTouch: boolean;
  hasHover: boolean;
  
  // Advanced features
  pixelRatio: number;
  isRetina: boolean;
  reducedMotion: boolean;
  darkMode: boolean;
  
  // Responsive utilities
  isAbove: (breakpoint: Breakpoint) => boolean;
  isBelow: (breakpoint: Breakpoint) => boolean;
  isBetween: (min: Breakpoint, max: Breakpoint) => boolean;
}

export interface ResponsiveBreakpoints {
  readonly xs: number;
  readonly sm: number;
  readonly md: number;
  readonly lg: number;
  readonly xl: number;
  readonly '2xl': number;
}

// ================================
// MOBILE GESTURE TYPES
// ================================

export type SwipeDirection = 'up' | 'down' | 'left' | 'right';
export type GestureType = 'swipe' | 'pinch' | 'tap' | 'long-press' | 'pull-refresh';
export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

export interface SwipeGesture {
  direction: SwipeDirection;
  distance: number;
  velocity: number;
  duration: number;
}

export interface PinchGesture {
  scale: number;
  center: { x: number; y: number };
}

export interface GestureConfig {
  swipe?: {
    threshold?: number;
    velocityThreshold?: number;
    enabled?: boolean;
  };
  pinch?: {
    threshold?: number;
    enabled?: boolean;
  };
  longPress?: {
    duration?: number;
    enabled?: boolean;
  };
  pullRefresh?: {
    threshold?: number;
    enabled?: boolean;
  };
}

export interface GestureCallbacks {
  onSwipe?: (gesture: SwipeGesture) => void;
  onPinch?: (gesture: PinchGesture) => void;
  onTap?: (point: TouchPoint) => void;
  onLongPress?: (point: TouchPoint) => void;
  onPullRefresh?: () => void;
  onPullRefreshStart?: () => void;
  onPullRefreshEnd?: () => void;
}

export interface MobileGestureState {
  gestureRef: React.RefObject<HTMLElement | null>;
  isGestureActive: boolean;
  pullRefreshState: PullRefreshState;
  triggerHaptic: (pattern: HapticPattern) => void;
  attachGestures: (element: HTMLElement | null) => void;
  isPullRefreshActive: boolean;
  pullRefreshProgress: number;
}

export interface PullRefreshState {
  active: boolean;
  distance: number;
  threshold: number;
}

// ================================
// TOUCH OPTIMIZATION TYPES
// ================================

export interface TouchOptimizedState {
  touchClasses: string;
  buttonSize: string;
  animationClasses: string;
  touchCapability: TouchCapability;
  hasTouch: boolean;
  supportsGestures: boolean;
}

export interface TouchFeedbackConfig {
  hapticEnabled?: boolean;
  longPressEnabled?: boolean;
  longPressDuration?: number;
  pressScaleEffect?: boolean;
}

// ================================
// RESPONSIVE COMPONENT TYPES
// ================================

export interface ResponsiveContainerProps {
  children: ReactNode;
  breakpoints?: Partial<Record<Breakpoint, ReactNode>>;
  className?: string;
}

export interface ResponsiveValueConfig<T> {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

export interface ResponsiveGridConfig {
  cols?: ResponsiveValueConfig<number>;
  gap?: ResponsiveValueConfig<string>;
  rows?: ResponsiveValueConfig<number>;
}

export interface ResponsiveTypographyConfig {
  heading1: string;
  heading2: string;
  heading3: string;
  body: string;
  caption: string;
}

// ================================
// MOBILE CALENDAR ENHANCEMENT TYPES
// ================================

export type CalendarViewType = 'month' | 'week' | 'day' | 'list';

export interface MobileCalendarEnhancementsProps {
  currentDate: Date;
  viewType: CalendarViewType;
  onDateChange: (date: Date) => void;
  onViewChange: (view: CalendarViewType) => void;
  onRefresh?: () => void;
  onCreateEvent?: () => void;
  isLoading?: boolean;
  className?: string;
  children?: ReactNode;
}

export interface PullToRefreshProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
  threshold?: number;
  children?: ReactNode;
}

export interface MobileGestureIndicatorProps {
  direction: 'left' | 'right' | 'up' | 'down';
  isActive: boolean;
  progress: number;
}

export interface TouchFeedbackProps {
  children: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  hapticPattern?: HapticPattern;
  className?: string;
  disabled?: boolean;
}

export interface MobileViewSwitcherProps {
  currentView: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  className?: string;
}

export interface MobileNavigationBarProps {
  currentDate: Date;
  viewType: CalendarViewType;
  onDateChange: (date: Date) => void;
  onCreateEvent?: () => void;
  className?: string;
}

// ================================
// RESPONSIVE HOOK RETURN TYPES
// ================================

export type UseResponsiveReturn = ResponsiveState;

export interface UseResponsiveValueReturn<T> {
  value: T;
  breakpoint: Breakpoint;
}

export interface UseBreakpointConditionalReturn {
  showOnMobile: boolean;
  showOnTablet: boolean;
  showOnDesktop: boolean;
  hideOnMobile: boolean;
  hideOnTablet: boolean;
  hideOnDesktop: boolean;
  showAbove: (breakpoint: Breakpoint) => boolean;
  showBelow: (breakpoint: Breakpoint) => boolean;
  showBetween: (min: Breakpoint, max: Breakpoint) => boolean;
}

export type UseTouchOptimizedReturn = TouchOptimizedState;

export interface UseResponsiveGridReturn {
  getGridCols: (config: ResponsiveValueConfig<number>) => number;
  getGridGap: (config: ResponsiveValueConfig<string>) => string;
  currentBreakpoint: Breakpoint;
}

export type UseResponsiveTypographyReturn = ResponsiveTypographyConfig;

export interface UseSwipeNavigationReturn {
  gestureRef: React.RefObject<HTMLElement | null>;
  attachGestures: (element: HTMLElement | null) => void;
}

export type UsePullToRefreshReturn = MobileGestureState;

export type UseTouchFeedbackReturn = MobileGestureState;

// ================================
// MOBILE UI COMPONENT TYPES
// ================================

export interface MobileControlBarProps {
  enableHaptic: boolean;
  setEnableHaptic: (enabled: boolean) => void;
  enableAnimations: boolean;
  setEnableAnimations: (enabled: boolean) => void;
  className?: string;
}

export interface MobileToolbarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: ReactNode;
  className?: string;
}

export interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  snapPoints?: number[];
  initialSnap?: number;
  className?: string;
}

export interface MobileFloatingActionButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// ================================
// ACCESSIBILITY TYPES
// ================================

export interface AccessibilityConfig {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
}

export interface TouchAccessibilityProps {
  minTouchTarget: number;
  touchMargin: number;
  focusVisible: boolean;
  ariaLabel?: string;
  ariaDescription?: string;
}

// ================================
// PERFORMANCE OPTIMIZATION TYPES
// ================================

export interface ResponsiveImageProps {
  src: string;
  alt: string;
  sizes: ResponsiveValueConfig<string>;
  className?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
}

export interface LazyLoadConfig {
  threshold: number;
  rootMargin: string;
  triggerOnce: boolean;
}

// ================================
// ANIMATION AND TRANSITION TYPES
// ================================

export interface MobileAnimationConfig {
  duration: number;
  easing: string;
  reducedMotion: boolean;
}

export interface SwipeAnimationProps {
  direction: SwipeDirection;
  distance: number;
  duration: number;
  onComplete?: () => void;
}

export interface PullRefreshAnimationProps {
  progress: number;
  isActive: boolean;
  threshold: number;
}

// ================================
// ERROR HANDLING TYPES
// ================================

export interface ResponsiveError {
  code: string;
  message: string;
  component: string;
  breakpoint?: Breakpoint;
  deviceType?: DeviceType;
}

export interface TouchGestureError {
  type: GestureType;
  message: string;
  originalEvent?: TouchEvent;
} 