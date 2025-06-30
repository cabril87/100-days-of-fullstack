'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

// ================================
// ENTERPRISE RESPONSIVE SYSTEM
// Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md Enterprise Standards
// ================================

// Import types from lib/types following enterprise file organization
import type {
  Breakpoint,
  Orientation,
  DeviceType,
  TouchCapability,
  ResponsiveState,
  ResponsiveBreakpoints,
  UseResponsiveReturn
} from '@/lib/types/mobile-responsive';

// ResponsiveState interface imported from types file

// Breakpoint definitions (matching Tailwind)
const BREAKPOINTS: ResponsiveBreakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Enterprise-grade responsive hook
 * Provides comprehensive device detection and responsive utilities
 */
export function useResponsive(): UseResponsiveReturn {
  const [state, setState] = useState<Omit<ResponsiveState, 'isAbove' | 'isBelow' | 'isBetween'>>(() => {
    // SSR-safe initial state
    if (typeof window === 'undefined') {
      return {
        breakpoint: 'lg' as Breakpoint,
        isXs: false,
        isSm: false,
        isMd: false,
        isLg: true,
        isXl: false,
        is2Xl: false,
        deviceType: 'desktop' as DeviceType,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        width: 1024,
        height: 768,
        orientation: 'landscape' as Orientation,
        isPortrait: false,
        isLandscape: true,
        touchCapability: 'no-touch' as TouchCapability,
        hasTouch: false,
        hasHover: true,
        pixelRatio: 1,
        isRetina: false,
        reducedMotion: false,
        darkMode: false,
      };
    }

    // Calculate initial client-side state inline to avoid circular dependency
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    
    let breakpoint: Breakpoint = 'xs';
    if (width >= BREAKPOINTS['2xl']) breakpoint = '2xl';
    else if (width >= BREAKPOINTS.xl) breakpoint = 'xl';
    else if (width >= BREAKPOINTS.lg) breakpoint = 'lg';
    else if (width >= BREAKPOINTS.md) breakpoint = 'md';
    else if (width >= BREAKPOINTS.sm) breakpoint = 'sm';
    
    let deviceType: DeviceType = 'desktop';
    if (width < BREAKPOINTS.md) deviceType = 'mobile';
    else if (width < BREAKPOINTS.lg) deviceType = 'tablet';
    
    let touchCapability: TouchCapability = 'no-touch';
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const hasHover = window.matchMedia('(hover: hover)').matches;
    
    if (hasTouch && hasHover) touchCapability = 'hybrid';
    else if (hasTouch) touchCapability = 'touch';
    
    const orientation: Orientation = height > width ? 'portrait' : 'landscape';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    return {
      breakpoint,
      isXs: breakpoint === 'xs',
      isSm: breakpoint === 'sm',
      isMd: breakpoint === 'md',
      isLg: breakpoint === 'lg',
      isXl: breakpoint === 'xl',
      is2Xl: breakpoint === '2xl',
      deviceType,
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop',
      width,
      height,
      orientation,
      isPortrait: orientation === 'portrait',
      isLandscape: orientation === 'landscape',
      touchCapability,
      hasTouch,
      hasHover,
      pixelRatio,
      isRetina: pixelRatio > 1,
      reducedMotion,
      darkMode,
    };
  });

  // Get current responsive state
  const getResponsiveState = useCallback((): Omit<ResponsiveState, 'isAbove' | 'isBelow' | 'isBetween'> => {
    if (typeof window === 'undefined') {
      return {
        breakpoint: 'lg' as Breakpoint,
        isXs: false,
        isSm: false,
        isMd: false,
        isLg: true,
        isXl: false,
        is2Xl: false,
        deviceType: 'desktop' as DeviceType,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        width: 1024,
        height: 768,
        orientation: 'landscape' as Orientation,
        isPortrait: false,
        isLandscape: true,
        touchCapability: 'no-touch' as TouchCapability,
        hasTouch: false,
        hasHover: true,
        pixelRatio: 1,
        isRetina: false,
        reducedMotion: false,
        darkMode: false,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    
    // Determine breakpoint
    let breakpoint: Breakpoint = 'xs';
    if (width >= BREAKPOINTS['2xl']) breakpoint = '2xl';
    else if (width >= BREAKPOINTS.xl) breakpoint = 'xl';
    else if (width >= BREAKPOINTS.lg) breakpoint = 'lg';
    else if (width >= BREAKPOINTS.md) breakpoint = 'md';
    else if (width >= BREAKPOINTS.sm) breakpoint = 'sm';
    
    // Device type detection
    let deviceType: DeviceType = 'desktop';
    if (width < BREAKPOINTS.md) deviceType = 'mobile';
    else if (width < BREAKPOINTS.lg) deviceType = 'tablet';
    
    // Touch capability detection
    let touchCapability: TouchCapability = 'no-touch';
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const hasHover = window.matchMedia('(hover: hover)').matches;
    
    if (hasTouch && hasHover) touchCapability = 'hybrid';
    else if (hasTouch) touchCapability = 'touch';
    
    // Orientation
    const orientation: Orientation = height > width ? 'portrait' : 'landscape';
    
    // Motion preferences
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Dark mode
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    return {
      breakpoint,
      isXs: breakpoint === 'xs',
      isSm: breakpoint === 'sm',
      isMd: breakpoint === 'md',
      isLg: breakpoint === 'lg',
      isXl: breakpoint === 'xl',
      is2Xl: breakpoint === '2xl',
      deviceType,
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop',
      width,
      height,
      orientation,
      isPortrait: orientation === 'portrait',
      isLandscape: orientation === 'landscape',
      touchCapability,
      hasTouch,
      hasHover,
      pixelRatio,
      isRetina: pixelRatio > 1,
      reducedMotion,
      darkMode,
    };
  }, []);

  // Update state on resize/orientation change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateState = () => {
      setState(getResponsiveState());
    };

    // Initial update
    updateState();

    // Event listeners
    window.addEventListener('resize', updateState);
    window.addEventListener('orientationchange', updateState);
    
    // Media query listeners for preferences
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleMotionChange = () => updateState();
    const handleDarkChange = () => updateState();
    
    motionQuery.addEventListener('change', handleMotionChange);
    darkQuery.addEventListener('change', handleDarkChange);

    return () => {
      window.removeEventListener('resize', updateState);
      window.removeEventListener('orientationchange', updateState);
      motionQuery.removeEventListener('change', handleMotionChange);
      darkQuery.removeEventListener('change', handleDarkChange);
    };
  }, [getResponsiveState]);

  // Utility functions
  const isAbove = useCallback((breakpoint: Breakpoint): boolean => {
    return state.width >= BREAKPOINTS[breakpoint];
  }, [state.width]);

  const isBelow = useCallback((breakpoint: Breakpoint): boolean => {
    return state.width < BREAKPOINTS[breakpoint];
  }, [state.width]);

  const isBetween = useCallback((min: Breakpoint, max: Breakpoint): boolean => {
    return state.width >= BREAKPOINTS[min] && state.width < BREAKPOINTS[max];
  }, [state.width]);

  // Memoized final state
  return useMemo(() => ({
    ...state,
    isAbove,
    isBelow,
    isBetween,
  }), [state, isAbove, isBelow, isBetween]);
}

/**
 * Hook for responsive values
 * Returns different values based on current breakpoint
 */
export function useResponsiveValue<T>(values: Partial<Record<Breakpoint, T>>, defaultValue: T): T {
  const { breakpoint } = useResponsive();
  
  return useMemo(() => {
    // Try current breakpoint first
    if (values[breakpoint] !== undefined) {
      return values[breakpoint]!;
    }
    
    // Fall back to largest available breakpoint that's smaller
    const orderedBreakpoints: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
    const currentIndex = orderedBreakpoints.indexOf(breakpoint);
    
    for (let i = currentIndex + 1; i < orderedBreakpoints.length; i++) {
      const bp = orderedBreakpoints[i];
      if (values[bp] !== undefined) {
        return values[bp]!;
      }
    }
    
    return defaultValue;
  }, [values, breakpoint, defaultValue]);
}

/**
 * Hook for conditional rendering based on breakpoints
 */
export function useBreakpointConditional() {
  const responsive = useResponsive();
  
  return {
    showOnMobile: responsive.isMobile,
    showOnTablet: responsive.isTablet,
    showOnDesktop: responsive.isDesktop,
    hideOnMobile: !responsive.isMobile,
    hideOnTablet: !responsive.isTablet,
    hideOnDesktop: !responsive.isDesktop,
    showAbove: (breakpoint: Breakpoint) => responsive.isAbove(breakpoint),
    showBelow: (breakpoint: Breakpoint) => responsive.isBelow(breakpoint),
    showBetween: (min: Breakpoint, max: Breakpoint) => responsive.isBetween(min, max),
  };
}

/**
 * Hook for touch-optimized interactions
 */
export function useTouchOptimized() {
  const { hasTouch, touchCapability, reducedMotion } = useResponsive();
  
  return {
    // Touch-specific classes
    touchClasses: hasTouch ? 'touch-manipulation select-none' : '',
    
    // Button sizes
    buttonSize: hasTouch ? 'min-h-[44px] min-w-[44px]' : 'min-h-[32px] min-w-[32px]',
    
    // Animation preferences
    animationClasses: reducedMotion ? 'motion-reduce:transition-none' : 'transition-all duration-200',
    
    // Touch capabilities
    touchCapability,
    hasTouch,
    
    // Gesture support
    supportsGestures: touchCapability === 'touch' || touchCapability === 'hybrid',
  };
}

/**
 * Hook for responsive grid configurations
 */
export function useResponsiveGrid() {
  const { breakpoint } = useResponsive();
  
  const getGridCols = useCallback((config: Partial<Record<Breakpoint, number>>) => {
    const defaultCols = config.xs || 1;
    // Try current breakpoint first
    if (config[breakpoint] !== undefined) {
      return config[breakpoint]!;
    }
    
    // Fall back to largest available breakpoint that's smaller
    const orderedBreakpoints: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
    const currentIndex = orderedBreakpoints.indexOf(breakpoint);
    
    for (let i = currentIndex + 1; i < orderedBreakpoints.length; i++) {
      const bp = orderedBreakpoints[i];
      if (config[bp] !== undefined) {
        return config[bp]!;
      }
    }
    
    return defaultCols;
  }, [breakpoint]);
  
  const getGridGap = useCallback((config: Partial<Record<Breakpoint, string>>) => {
    const defaultGap = config.xs || 'gap-4';
    // Try current breakpoint first
    if (config[breakpoint] !== undefined) {
      return config[breakpoint]!;
    }
    
    // Fall back to largest available breakpoint that's smaller
    const orderedBreakpoints: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
    const currentIndex = orderedBreakpoints.indexOf(breakpoint);
    
    for (let i = currentIndex + 1; i < orderedBreakpoints.length; i++) {
      const bp = orderedBreakpoints[i];
      if (config[bp] !== undefined) {
        return config[bp]!;
      }
    }
    
    return defaultGap;
  }, [breakpoint]);
  
  return {
    getGridCols,
    getGridGap,
    currentBreakpoint: breakpoint,
  };
}

/**
 * Hook for responsive font sizes
 */
export function useResponsiveTypography() {
  return {
    heading1: useResponsiveValue({
      xs: 'text-2xl',
      sm: 'text-3xl',
      md: 'text-4xl',
      lg: 'text-5xl',
    }, 'text-2xl'),
    
    heading2: useResponsiveValue({
      xs: 'text-xl',
      sm: 'text-2xl',
      md: 'text-3xl',
      lg: 'text-4xl',
    }, 'text-xl'),
    
    heading3: useResponsiveValue({
      xs: 'text-lg',
      sm: 'text-xl',
      md: 'text-2xl',
      lg: 'text-3xl',
    }, 'text-lg'),
    
    body: useResponsiveValue({
      xs: 'text-sm',
      sm: 'text-base',
      md: 'text-base',
      lg: 'text-lg',
    }, 'text-sm'),
    
    caption: useResponsiveValue({
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
    }, 'text-xs'),
  };
} 