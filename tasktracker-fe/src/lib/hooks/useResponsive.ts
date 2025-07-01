'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Breakpoint } from '../types/mobile-responsive';

// ================================
// NAVIGATOR CONNECTION API TYPES
// ================================

interface NetworkConnection {
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
  downlink?: number;
  downlinkMax?: number;
  rtt?: number;
  saveData?: boolean;
  type?: 'bluetooth' | 'cellular' | 'ethernet' | 'mixed' | 'none' | 'other' | 'unknown' | 'wifi' | 'wimax';
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkConnection;
  mozConnection?: NetworkConnection;
  webkitConnection?: NetworkConnection;
}

// ================================
// CURSORRULES COMPLIANT DEVICE MATRIX
// ================================

export const deviceMatrix = {
  mobile: {
    small: { width: 320, height: 568 },    // iPhone SE
    medium: { width: 375, height: 667 },   // iPhone 8, 12 mini
    large: { width: 414, height: 896 },    // iPhone 11, 12 Pro Max
    android: { width: 360, height: 640 },  // Galaxy S series
  },
  tablet: {
    ipadMini: { width: 768, height: 1024 }, // iPad Mini
    ipad: { width: 820, height: 1180 },     // iPad 10.9"
    ipadAir: { width: 834, height: 1194 },  // iPad Air
    ipadPro11: { width: 834, height: 1194 }, // iPad Pro 11"
    ipadPro129: { width: 1024, height: 1366 }, // iPad Pro 12.9"
    galaxyTab: { width: 800, height: 1280 }, // Galaxy Tab S series
    galaxyTabPlus: { width: 900, height: 1440 }, // Galaxy Tab S8+
    galaxyTabUltra: { width: 1180, height: 1680 }, // Galaxy Tab S8 Ultra
    fire7: { width: 600, height: 1024 },    // Fire 7"
    fire8: { width: 800, height: 1280 },    // Fire HD 8"
    fire10: { width: 800, height: 1280 },   // Fire HD 10"
    fireMax: { width: 1200, height: 2000 }, // Fire Max 11"
  },
  desktop: {
    small: { width: 1024, height: 768 },   // Small laptop
    medium: { width: 1440, height: 900 },  // MacBook Pro 14"
    large: { width: 1920, height: 1080 },  // Full HD
    xl: { width: 2560, height: 1440 },     // 4K displays
  }
} as const;

// ================================
// ENTERPRISE RESPONSIVE INTERFACES
// ================================

export interface ResponsiveState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  
  // Device-specific flags
  isIPhone: boolean;
  isIPad: boolean;
  isAndroid: boolean;
  isFireTablet: boolean;
  isGalaxyTab: boolean;
  
  // Network & Performance
  isOnline: boolean;
  isSlowConnection: boolean;
  supportsTouch: boolean;
  maxTouchPoints: number;
  
  // Display capabilities
  pixelRatio: number;
  colorScheme: 'light' | 'dark';
  prefersReducedMotion: boolean;
  supportsHover: boolean;
  
  // Responsive utility methods
  isAbove: (breakpoint: Breakpoint) => boolean;
  isBelow: (breakpoint: Breakpoint) => boolean;
  isBetween: (min: Breakpoint, max: Breakpoint) => boolean;
}

export interface TouchOptimizedStyles {
  buttonSize: string;
  touchTarget: string;
  spacing: string;
  fontSize: string;
  borderRadius: string;
  shadow: string;
  transition: string;
  touchClasses: string;
  animationClasses: string;
}

// ================================
// MOBILE-FIRST RESPONSIVE HOOK
// ================================

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 1024,
        height: 768,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        orientation: 'landscape',
        deviceType: 'desktop',
        breakpoint: 'lg',
        isIPhone: false,
        isIPad: false,
        isAndroid: false,
        isFireTablet: false,
        isGalaxyTab: false,
        isOnline: true,
        isSlowConnection: false,
        supportsTouch: false,
        maxTouchPoints: 0,
        pixelRatio: 1,
        colorScheme: 'light',
        prefersReducedMotion: false,
        supportsHover: true,
        isAbove: () => false,
        isBelow: () => false,
        isBetween: () => false,
      };
    }

    return getResponsiveState();
  });

  const updateState = useCallback(() => {
    setState(getResponsiveState());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Throttled resize handler for 60fps performance
    let timeoutId: NodeJS.Timeout;
    const throttledResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateState, 16); // ~60fps
    };

    // Event listeners
    window.addEventListener('resize', throttledResize);
    window.addEventListener('orientationchange', throttledResize);
    window.addEventListener('online', updateState);
    window.addEventListener('offline', updateState);

    // Media query listeners for improved performance
    const mediaQueries = [
      window.matchMedia('(max-width: 768px)'),
      window.matchMedia('(min-width: 769px) and (max-width: 1024px)'),
      window.matchMedia('(min-width: 1025px)'),
      window.matchMedia('(orientation: portrait)'),
      window.matchMedia('(prefers-color-scheme: dark)'),
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(hover: hover)'),
    ];

    mediaQueries.forEach(mq => {
      if (mq.addEventListener) {
        mq.addEventListener('change', updateState);
      } else {
        // Legacy browsers
        mq.addListener(updateState);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', throttledResize);
      window.removeEventListener('orientationchange', throttledResize);
      window.removeEventListener('online', updateState);
      window.removeEventListener('offline', updateState);

      mediaQueries.forEach(mq => {
        if (mq.removeEventListener) {
          mq.removeEventListener('change', updateState);
        } else {
          // Legacy browsers
          mq.removeListener(updateState);
        }
      });
    };
  }, [updateState]);

  return state;
}

// ================================
// TOUCH-OPTIMIZED STYLING HOOK
// ================================

export function useTouchOptimized(): TouchOptimizedStyles {
  const responsive = useResponsive();

  return useMemo(() => {
    if (responsive.isMobile) {
      return {
        buttonSize: 'min-h-[44px] min-w-[44px] px-4 py-2 text-base',
        touchTarget: 'min-h-[44px] min-w-[44px]',
        spacing: 'space-y-4 gap-4',
        fontSize: 'text-base leading-6',
        borderRadius: 'rounded-lg',
        shadow: 'shadow-md hover:shadow-lg',
        transition: 'transition-all duration-200 ease-out',
        touchClasses: 'select-none touch-manipulation',
        animationClasses: 'animate-in slide-in-from-bottom-2 duration-300',
      };
    }

    if (responsive.isTablet) {
      return {
        buttonSize: 'min-h-[48px] min-w-[48px] px-5 py-2.5 text-lg',
        touchTarget: 'min-h-[48px] min-w-[48px]',
        spacing: 'space-y-5 gap-5',
        fontSize: 'text-lg leading-7',
        borderRadius: 'rounded-xl',
        shadow: 'shadow-lg hover:shadow-xl',
        transition: 'transition-all duration-250 ease-out',
        touchClasses: 'select-none touch-manipulation',
        animationClasses: 'animate-in slide-in-from-bottom-3 duration-400',
      };
    }

    // Desktop
    return {
      buttonSize: 'min-h-[40px] min-w-[40px] px-4 py-2 text-sm',
      touchTarget: 'min-h-[40px] min-w-[40px]',
      spacing: 'space-y-3 gap-3',
      fontSize: 'text-sm leading-5',
      borderRadius: 'rounded-md',
      shadow: 'shadow hover:shadow-md',
      transition: 'transition-all duration-150 ease-out',
      touchClasses: 'select-none',
      animationClasses: 'animate-in fade-in duration-200',
    };
  }, [responsive.isMobile, responsive.isTablet]);
}

// ================================
// RESPONSIVE UTILITIES
// ================================

export function getBreakpoint(width: number): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' {
  if (width < 640) return 'xs';
  if (width < 768) return 'sm';
  if (width < 1024) return 'md';
  if (width < 1280) return 'lg';
  if (width < 1536) return 'xl';
  return '2xl';
}

export function getDeviceType(width: number): 'mobile' | 'tablet' | 'desktop' {
  if (width <= 768) return 'mobile';
  if (width <= 1024) return 'tablet';
  return 'desktop';
}

export function detectDeviceModel(userAgent: string): string {
  if (/iPhone/.test(userAgent)) {
    if (/iPhone SE/.test(userAgent)) return 'iPhone SE';
    if (/iPhone 1[2-9]/.test(userAgent)) return 'iPhone 12+';
    return 'iPhone';
  }
  
  if (/iPad/.test(userAgent)) {
    if (/iPad Pro/.test(userAgent)) return 'iPad Pro';
    if (/iPad Air/.test(userAgent)) return 'iPad Air';
    if (/iPad mini/.test(userAgent)) return 'iPad Mini';
    return 'iPad';
  }
  
  if (/Android/.test(userAgent)) {
    if (/Galaxy Tab/.test(userAgent)) return 'Galaxy Tab';
    if (/Fire/.test(userAgent)) return 'Fire Tablet';
    return 'Android Device';
  }
  
  return 'Unknown Device';
}

// ================================
// HELPER FUNCTIONS
// ================================

function getResponsiveState(): ResponsiveState {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const userAgent = navigator.userAgent;
  
  // Device type detection
  const deviceType = getDeviceType(width);
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';
  
  // Orientation
  const orientation = width > height ? 'landscape' : 'portrait';
  
  // Breakpoint
  const breakpoint = getBreakpoint(width);
  
  // Device-specific flags
  const isIPhone = /iPhone/.test(userAgent);
  const isIPad = /iPad/.test(userAgent);
  const isAndroid = /Android/.test(userAgent) && !/iPad/.test(userAgent);
  const isFireTablet = /Fire/.test(userAgent);
  const isGalaxyTab = /Galaxy Tab/.test(userAgent);
  
  // Network & Performance - FIXED: No more any types
  const isOnline = navigator.onLine;
  const navigatorWithConnection = navigator as NavigatorWithConnection;
  const connection = navigatorWithConnection.connection || navigatorWithConnection.mozConnection || navigatorWithConnection.webkitConnection;
  const isSlowConnection = connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g' || false;
  
  // Touch capabilities
  const supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  
  // Display capabilities
  const pixelRatio = window.devicePixelRatio || 1;
  const colorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supportsHover = window.matchMedia('(hover: hover)').matches;

  // Breakpoint comparison utility functions
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);
  
  const isAbove = (targetBreakpoint: Breakpoint): boolean => {
    const targetIndex = breakpointOrder.indexOf(targetBreakpoint);
    return currentIndex > targetIndex;
  };
  
  const isBelow = (targetBreakpoint: Breakpoint): boolean => {
    const targetIndex = breakpointOrder.indexOf(targetBreakpoint);
    return currentIndex < targetIndex;
  };
  
  const isBetween = (minBreakpoint: Breakpoint, maxBreakpoint: Breakpoint): boolean => {
    const minIndex = breakpointOrder.indexOf(minBreakpoint);
    const maxIndex = breakpointOrder.indexOf(maxBreakpoint);
    return currentIndex >= minIndex && currentIndex <= maxIndex;
  };

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    orientation,
    deviceType,
    breakpoint,
    isIPhone,
    isIPad,
    isAndroid,
    isFireTablet,
    isGalaxyTab,
    isOnline,
    isSlowConnection,
    supportsTouch,
    maxTouchPoints,
    pixelRatio,
    colorScheme,
    prefersReducedMotion,
    supportsHover,
    isAbove,
    isBelow,
    isBetween,
  };
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