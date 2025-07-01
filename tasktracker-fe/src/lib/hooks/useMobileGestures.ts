'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useResponsive } from './useResponsive';

// ================================
// WEBKIT CSS PROPERTIES INTERFACE
// ================================

interface WebKitCSSProperties {
  webkitUserSelect?: string;
  webkitTouchCallout?: string;
  webkitTapHighlightColor?: string;
}

type WebKitCSSStyleDeclaration = CSSStyleDeclaration & WebKitCSSProperties;

// ================================
// CURSORRULES COMPLIANT GESTURE TYPES
// ================================

export interface GestureEvent {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  deltaX: number;
  deltaY: number;
  distance: number;
  duration: number;
  velocity: number;
}

export interface SwipeGesture extends GestureEvent {
  direction: 'left' | 'right' | 'up' | 'down';
}

export interface TapGesture {
  x: number;
  y: number;
  duration: number;
}

export interface LongPressGesture {
  x: number;
  y: number;
  duration: number;
}

export interface GestureHandlers {
  onSwipe?: (gesture: SwipeGesture) => void;
  onTap?: (gesture: TapGesture) => void;
  onLongPress?: (gesture: LongPressGesture) => void;
  onTouchStart?: (event: TouchEvent) => void;
  onTouchMove?: (event: TouchEvent) => void;
  onTouchEnd?: (event: TouchEvent) => void;
}

export interface GestureConfig {
  swipeThreshold?: number;        // Minimum distance for swipe (default: 50)
  tapTimeout?: number;           // Maximum duration for tap (default: 300ms)
  longPressTimeout?: number;     // Minimum duration for long press (default: 500ms)
  velocityThreshold?: number;    // Minimum velocity for swipe (default: 0.3)
  enableHaptic?: boolean;        // Enable haptic feedback (default: true)
  preventDefault?: boolean;      // Prevent default touch behavior (default: true)
  passive?: boolean;             // Use passive event listeners (default: false)
}

export interface MobileGesturesReturn {
  attachGestures: (element: HTMLElement) => void;
  detachGestures: (element?: HTMLElement) => void;
  isActive: boolean;
  currentGesture: 'none' | 'touching' | 'swiping' | 'tapping' | 'longpressing';
}

// ================================
// HAPTIC FEEDBACK UTILITY
// ================================

export function triggerHapticFeedback(
  type: 'light' | 'medium' | 'heavy',
  enabled: boolean = true
): void {
  if (!enabled || !('vibrate' in navigator)) return;

  const patterns = {
    light: [10],
    medium: [10, 50, 10],
    heavy: [20, 100, 20, 100, 20]
  };

  try {
    navigator.vibrate(patterns[type]);
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
  }
}

// ================================
// MOBILE-FIRST GESTURE HOOK
// ================================

export function useMobileGestures(
  handlers: GestureHandlers,
  config: GestureConfig = {}
): MobileGesturesReturn {
  // ✅ DEFAULT CONFIGURATION (CURSORRULES COMPLIANT)
  const defaultConfig: Required<GestureConfig> = {
    swipeThreshold: 50,
    tapTimeout: 300,
    longPressTimeout: 500,
    velocityThreshold: 0.3,
    enableHaptic: true,
    preventDefault: true,
    passive: false,
  };

  const finalConfig = { ...defaultConfig, ...config };

  // ✅ GESTURE STATE MANAGEMENT
  const gestureState = useRef({
    isActive: false,
    currentGesture: 'none' as 'none' | 'touching' | 'swiping' | 'tapping' | 'longpressing',
    startTime: 0,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    moved: false,
    longPressTimer: null as NodeJS.Timeout | null,
    attachedElement: null as HTMLElement | null,
  });

  // ✅ GESTURE CALCULATION UTILITIES
  const calculateDistance = useCallback((x1: number, y1: number, x2: number, y2: number): number => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }, []);

  const calculateVelocity = useCallback((distance: number, duration: number): number => {
    return duration > 0 ? distance / duration : 0;
  }, []);

  const getSwipeDirection = useCallback((deltaX: number, deltaY: number): 'left' | 'right' | 'up' | 'down' => {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }, []);

  // ✅ GESTURE EVENT HANDLERS (60FPS OPTIMIZED)
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!gestureState.current.isActive) return;

    const touch = event.touches[0];
    if (!touch) return;

    gestureState.current.startTime = Date.now();
    gestureState.current.startX = touch.clientX;
    gestureState.current.startY = touch.clientY;
    gestureState.current.endX = touch.clientX;
    gestureState.current.endY = touch.clientY;
    gestureState.current.moved = false;
    gestureState.current.currentGesture = 'touching';

    // Clear any existing long press timer
    if (gestureState.current.longPressTimer) {
      clearTimeout(gestureState.current.longPressTimer);
    }

    // Start long press timer
    gestureState.current.longPressTimer = setTimeout(() => {
      if (!gestureState.current.moved && gestureState.current.currentGesture === 'touching') {
        gestureState.current.currentGesture = 'longpressing';
        
        // Trigger haptic feedback for long press
        if (finalConfig.enableHaptic) {
          triggerHapticFeedback('medium');
        }

        const duration = Date.now() - gestureState.current.startTime;
        const longPressGesture: LongPressGesture = {
          x: gestureState.current.startX,
          y: gestureState.current.startY,
          duration,
        };

        handlers.onLongPress?.(longPressGesture);
      }
    }, finalConfig.longPressTimeout);

    // Prevent default if configured
    if (finalConfig.preventDefault) {
      event.preventDefault();
    }

    // Call custom handler
    handlers.onTouchStart?.(event);
  }, [handlers, finalConfig.enableHaptic, finalConfig.longPressTimeout, finalConfig.preventDefault]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!gestureState.current.isActive) return;

    const touch = event.touches[0];
    if (!touch) return;

    gestureState.current.endX = touch.clientX;
    gestureState.current.endY = touch.clientY;
    gestureState.current.moved = true;
    gestureState.current.currentGesture = 'swiping';

    // Clear long press timer if movement detected
    if (gestureState.current.longPressTimer) {
      clearTimeout(gestureState.current.longPressTimer);
      gestureState.current.longPressTimer = null;
    }

    // Prevent default if configured
    if (finalConfig.preventDefault) {
      event.preventDefault();
    }

    // Call custom handler
    handlers.onTouchMove?.(event);
  }, [handlers, finalConfig.preventDefault]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!gestureState.current.isActive) return;

    const endTime = Date.now();
    const duration = endTime - gestureState.current.startTime;
    const deltaX = gestureState.current.endX - gestureState.current.startX;
    const deltaY = gestureState.current.endY - gestureState.current.startY;
    const distance = calculateDistance(
      gestureState.current.startX,
      gestureState.current.startY,
      gestureState.current.endX,
      gestureState.current.endY
    );
    const velocity = calculateVelocity(distance, duration);

    // Clear long press timer
    if (gestureState.current.longPressTimer) {
      clearTimeout(gestureState.current.longPressTimer);
      gestureState.current.longPressTimer = null;
    }

    // Determine gesture type based on movement and timing
    if (gestureState.current.currentGesture === 'longpressing') {
      // Long press already handled
    } else if (
      distance >= finalConfig.swipeThreshold &&
      velocity >= finalConfig.velocityThreshold
    ) {
      // Swipe gesture
      const direction = getSwipeDirection(deltaX, deltaY);
      
      // Trigger haptic feedback for swipe
      if (finalConfig.enableHaptic) {
        triggerHapticFeedback('light');
      }

      const swipeGesture: SwipeGesture = {
        startX: gestureState.current.startX,
        startY: gestureState.current.startY,
        endX: gestureState.current.endX,
        endY: gestureState.current.endY,
        deltaX,
        deltaY,
            distance,
        duration,
            velocity,
        direction,
      };

      handlers.onSwipe?.(swipeGesture);
    } else if (
      !gestureState.current.moved &&
      duration <= finalConfig.tapTimeout
    ) {
      // Tap gesture
      if (finalConfig.enableHaptic) {
          triggerHapticFeedback('light');
      }

      const tapGesture: TapGesture = {
        x: gestureState.current.startX,
        y: gestureState.current.startY,
        duration,
      };

      handlers.onTap?.(tapGesture);
    }

    // Reset gesture state
    gestureState.current.currentGesture = 'none';
    gestureState.current.moved = false;

    // Prevent default if configured
    if (finalConfig.preventDefault) {
      event.preventDefault();
    }

    // Call custom handler
    handlers.onTouchEnd?.(event);
  }, [
    handlers,
    calculateDistance,
    calculateVelocity,
    getSwipeDirection,
    finalConfig.swipeThreshold,
    finalConfig.velocityThreshold,
    finalConfig.tapTimeout,
    finalConfig.enableHaptic,
    finalConfig.preventDefault,
  ]);

  // ✅ GESTURE ATTACHMENT/DETACHMENT
  const attachGestures = useCallback((element: HTMLElement) => {
    if (!element || gestureState.current.attachedElement === element) return;

    // Detach from previous element
    if (gestureState.current.attachedElement) {
      detachGestures();
    }

    gestureState.current.attachedElement = element;
    gestureState.current.isActive = true;

    // Add touch event listeners with proper options
    const eventOptions = {
      passive: finalConfig.passive,
      capture: false,
    };

    element.addEventListener('touchstart', handleTouchStart, eventOptions);
    element.addEventListener('touchmove', handleTouchMove, eventOptions);
    element.addEventListener('touchend', handleTouchEnd, eventOptions);
    element.addEventListener('touchcancel', handleTouchEnd, eventOptions);

    // Add CSS for better touch handling
    element.style.touchAction = finalConfig.preventDefault ? 'none' : 'auto';
    element.style.userSelect = 'none';
    const webkitStyle = element.style as WebKitCSSStyleDeclaration;
    webkitStyle.webkitUserSelect = 'none';
    webkitStyle.webkitTouchCallout = 'none';
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, finalConfig.passive, finalConfig.preventDefault]);

  const detachGestures = useCallback((element?: HTMLElement) => {
    const targetElement = element || gestureState.current.attachedElement;
    if (!targetElement) return;

    // Clear any pending timers
    if (gestureState.current.longPressTimer) {
      clearTimeout(gestureState.current.longPressTimer);
      gestureState.current.longPressTimer = null;
    }

    // Remove event listeners
    targetElement.removeEventListener('touchstart', handleTouchStart);
    targetElement.removeEventListener('touchmove', handleTouchMove);
    targetElement.removeEventListener('touchend', handleTouchEnd);
    targetElement.removeEventListener('touchcancel', handleTouchEnd);

    // Reset CSS
    targetElement.style.touchAction = '';
    targetElement.style.userSelect = '';
    const webkitStyle = targetElement.style as WebKitCSSStyleDeclaration;
    webkitStyle.webkitUserSelect = '';
    webkitStyle.webkitTouchCallout = '';

    // Reset state
    gestureState.current.isActive = false;
    gestureState.current.currentGesture = 'none';
    gestureState.current.attachedElement = null;
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // ✅ CLEANUP ON UNMOUNT
  useEffect(() => {
    return () => {
      detachGestures();
    };
  }, [detachGestures]);

  // ✅ RETURN GESTURE INTERFACE
  return {
    attachGestures,
    detachGestures,
    isActive: gestureState.current.isActive,
    currentGesture: gestureState.current.currentGesture,
  };
}

// ================================
// CONVENIENCE HOOKS
// ================================

/**
 * Simplified swipe-only gesture hook
 */
export function useSwipeGestures(
  onSwipe: (gesture: SwipeGesture) => void,
  config?: Partial<GestureConfig>
): MobileGesturesReturn {
  return useMobileGestures({ onSwipe }, config);
}

/**
 * Simplified tap-only gesture hook
 */
export function useTapGestures(
  onTap: (gesture: TapGesture) => void,
  config?: Partial<GestureConfig>
): MobileGesturesReturn {
  return useMobileGestures({ onTap }, config);
}

/**
 * Simplified long press-only gesture hook
 */
export function useLongPressGestures(
  onLongPress: (gesture: LongPressGesture) => void,
  config?: Partial<GestureConfig>
): MobileGesturesReturn {
  return useMobileGestures({ onLongPress }, config);
}

/**
 * Combined gesture hook with commonly used gestures
 */
export function useCommonGestures(
  handlers: {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    onTap?: () => void;
    onLongPress?: () => void;
  },
  config?: Partial<GestureConfig>
): MobileGesturesReturn {
  const onSwipe = useCallback((gesture: SwipeGesture) => {
    switch (gesture.direction) {
      case 'left':
        handlers.onSwipeLeft?.();
        break;
      case 'right':
        handlers.onSwipeRight?.();
        break;
      case 'up':
        handlers.onSwipeUp?.();
        break;
      case 'down':
        handlers.onSwipeDown?.();
        break;
    }
  }, [handlers]);

  const onTap = useCallback(() => {
    handlers.onTap?.();
  }, [handlers]);

  const onLongPress = useCallback(() => {
    handlers.onLongPress?.();
  }, [handlers]);

  return useMobileGestures({ onSwipe, onTap, onLongPress }, config);
}

// ================================
// GESTURE UTILITIES
// ================================

/**
 * Check if device supports touch gestures
 */
export function supportsTouch(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Check if device supports haptic feedback
 */
export function supportsHaptic(): boolean {
  return 'vibrate' in navigator;
}

/**
 * Get optimal gesture configuration for device
 */
export function getOptimalGestureConfig(): GestureConfig {
  const isMobile = window.innerWidth <= 768;
  const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
  
  if (isMobile) {
    return {
      swipeThreshold: 40,      // Lower threshold for smaller screens
      tapTimeout: 250,         // Faster taps on mobile
      longPressTimeout: 450,   // Slightly shorter for mobile
      velocityThreshold: 0.25, // Lower velocity requirement
      enableHaptic: true,
      preventDefault: true,
      passive: false,
    };
  }

  if (isTablet) {
    return {
      swipeThreshold: 60,      // Higher threshold for larger screens
      tapTimeout: 300,
      longPressTimeout: 500,
      velocityThreshold: 0.3,
      enableHaptic: true,
      preventDefault: true,
      passive: false,
    };
  }

  // Desktop with touch support
  return {
    swipeThreshold: 80,
    tapTimeout: 200,
    longPressTimeout: 600,
    velocityThreshold: 0.4,
    enableHaptic: false,     // Usually no haptic on desktop
    preventDefault: false,   // Allow normal behavior on desktop
    passive: true,
  };
} 