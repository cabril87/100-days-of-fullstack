'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useResponsive } from './useResponsive';

// ================================
// MOBILE GESTURE SYSTEM
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

/**
 * Enterprise haptic feedback system
 */
export function triggerHapticFeedback(pattern: HapticPattern = 'light') {
  if (typeof window === 'undefined' || !navigator.vibrate) return;

  const patterns = {
    light: [10],
    medium: [20],
    heavy: [30],
    success: [10, 50, 10],
    warning: [20, 100, 20],
    error: [50, 100, 50],
  };

  try {
    navigator.vibrate(patterns[pattern]);
  } catch (error) {
    console.warn('Haptic feedback not supported:', error);
  }
}

/**
 * Advanced mobile gesture hook
 */
export function useMobileGestures(
  callbacks: GestureCallbacks = {},
  config: GestureConfig = {}
) {
  const { hasTouch, isMobile } = useResponsive();
  const [isGestureActive, setIsGestureActive] = useState(false);
  const [pullRefreshState, setPullRefreshState] = useState({
    active: false,
    distance: 0,
    threshold: config.pullRefresh?.threshold || 100,
  });

  const gestureRef = useRef<HTMLElement | null>(null);
  const touchStartRef = useRef<TouchPoint[]>([]);
  const touchCurrentRef = useRef<TouchPoint[]>([]);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialPinchDistanceRef = useRef<number>(0);

  // Default configuration - explicit types to avoid undefined errors
  const defaultConfig = {
    swipe: {
      threshold: config.swipe?.threshold ?? 50,
      velocityThreshold: config.swipe?.velocityThreshold ?? 0.3,
      enabled: config.swipe?.enabled ?? true,
    },
    pinch: {
      threshold: config.pinch?.threshold ?? 0.1,
      enabled: config.pinch?.enabled ?? true,
    },
    longPress: {
      duration: config.longPress?.duration ?? 500,
      enabled: config.longPress?.enabled ?? true,
    },
    pullRefresh: {
      threshold: config.pullRefresh?.threshold ?? 100,
      enabled: config.pullRefresh?.enabled ?? true,
    },
  } as const;

  // Utility functions
  const getTouchPoint = (touch: Touch): TouchPoint => ({
    x: touch.clientX,
    y: touch.clientY,
    timestamp: Date.now(),
  });

  const getDistance = (p1: TouchPoint, p2: TouchPoint): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const getAngle = (p1: TouchPoint, p2: TouchPoint): number => {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
  };

  const getSwipeDirection = (angle: number): SwipeDirection => {
    if (angle >= -45 && angle <= 45) return 'right';
    if (angle >= 45 && angle <= 135) return 'down';
    if (angle >= 135 || angle <= -135) return 'left';
    return 'up';
  };

  // Touch event handlers
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!hasTouch || !isMobile) return;

    const touches = Array.from(event.touches).map(getTouchPoint);
    touchStartRef.current = touches;
    touchCurrentRef.current = touches;
    setIsGestureActive(true);

    // Long press detection
    if (defaultConfig.longPress.enabled && touches.length === 1) {
      longPressTimerRef.current = setTimeout(() => {
        callbacks.onLongPress?.(touches[0]);
        triggerHapticFeedback('medium');
      }, defaultConfig.longPress.duration);
    }

    // Pinch detection setup
    if (defaultConfig.pinch.enabled && touches.length === 2) {
      initialPinchDistanceRef.current = getDistance(touches[0], touches[1]);
    }

    // Pull refresh detection
    if (defaultConfig.pullRefresh.enabled && touches.length === 1) {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop === 0) {
        callbacks.onPullRefreshStart?.();
      }
    }
  }, [hasTouch, isMobile, callbacks, defaultConfig]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!hasTouch || !isMobile || touchStartRef.current.length === 0) return;

    const touches = Array.from(event.touches).map(getTouchPoint);
    touchCurrentRef.current = touches;

    // Clear long press timer on move
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Pinch gesture detection
    if (defaultConfig.pinch.enabled && touches.length === 2 && touchStartRef.current.length === 2) {
      const currentDistance = getDistance(touches[0], touches[1]);
      const scale = currentDistance / initialPinchDistanceRef.current;
      
      if (Math.abs(scale - 1) > defaultConfig.pinch.threshold) {
        const center = {
          x: (touches[0].x + touches[1].x) / 2,
          y: (touches[0].y + touches[1].y) / 2,
        };
        callbacks.onPinch?.({ scale, center });
      }
    }

    // Pull refresh detection
    if (defaultConfig.pullRefresh.enabled && touches.length === 1) {
      const deltaY = touches[0].y - touchStartRef.current[0].y;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollTop === 0 && deltaY > 0) {
        event.preventDefault();
        const distance = Math.min(deltaY, defaultConfig.pullRefresh.threshold * 1.5);
        setPullRefreshState(prev => ({ ...prev, active: true, distance }));
        
        if (distance >= defaultConfig.pullRefresh.threshold && !pullRefreshState.active) {
          triggerHapticFeedback('success');
        }
      }
    }
  }, [hasTouch, isMobile, callbacks, defaultConfig, pullRefreshState.active]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!hasTouch || !isMobile || touchStartRef.current.length === 0) return;

    const touchEnd = touchCurrentRef.current;
    const touchStart = touchStartRef.current;
    setIsGestureActive(false);

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Handle pull refresh
    if (pullRefreshState.active) {
      if (pullRefreshState.distance >= defaultConfig.pullRefresh.threshold) {
        callbacks.onPullRefresh?.();
        triggerHapticFeedback('success');
      }
      setPullRefreshState({ active: false, distance: 0, threshold: defaultConfig.pullRefresh.threshold });
      callbacks.onPullRefreshEnd?.();
    }

    // Single touch gestures
    if (touchStart.length === 1 && touchEnd.length === 1) {
      const start = touchStart[0];
      const end = touchEnd[0];
      const distance = getDistance(start, end);
      const duration = end.timestamp - start.timestamp;

      // Tap detection
      if (distance < 10 && duration < 200) {
        callbacks.onTap?.(end);
        triggerHapticFeedback('light');
        return;
      }

      // Swipe detection
      if (defaultConfig.swipe.enabled && distance > defaultConfig.swipe.threshold) {
        const velocity = distance / duration;
        
        if (velocity > defaultConfig.swipe.velocityThreshold) {
          const angle = getAngle(start, end);
          const direction = getSwipeDirection(angle);
          
          callbacks.onSwipe?.({
            direction,
            distance,
            velocity,
            duration,
          });
          
          triggerHapticFeedback('light');
        }
      }
    }

    // Reset touch references
    touchStartRef.current = [];
    touchCurrentRef.current = [];
  }, [hasTouch, isMobile, callbacks, defaultConfig, pullRefreshState]);

  // Attach event listeners
  useEffect(() => {
    const element = gestureRef.current;
    if (!element || !hasTouch || !isMobile) return;

    const options = { passive: false };
    
    element.addEventListener('touchstart', handleTouchStart, options);
    element.addEventListener('touchmove', handleTouchMove, options);
    element.addEventListener('touchend', handleTouchEnd, options);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, hasTouch, isMobile]);

  return {
    gestureRef,
    isGestureActive,
    pullRefreshState,
    triggerHaptic: triggerHapticFeedback,
    
    // Gesture utilities
    attachGestures: (element: HTMLElement | null) => {
      gestureRef.current = element;
    },
    
    // State helpers
    isPullRefreshActive: pullRefreshState.active,
    pullRefreshProgress: pullRefreshState.distance / pullRefreshState.threshold,
  };
}

/**
 * Swipe navigation hook for mobile interfaces
 */
export function useSwipeNavigation(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  threshold: number = 100
) {
  const { hasTouch, isMobile } = useResponsive();
  const gestureRef = useRef<HTMLElement | null>(null);
  const touchStartRef = useRef<TouchPoint | null>(null);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!hasTouch || !isMobile || event.touches.length !== 1) return;
    
    const touch = event.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };
  }, [hasTouch, isMobile]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!hasTouch || !isMobile || !touchStartRef.current || event.changedTouches.length !== 1) return;

    const touch = event.changedTouches[0];
    const touchEnd: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };

    const deltaX = touchEnd.x - touchStartRef.current.x;
    const deltaY = touchEnd.y - touchStartRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > threshold) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
        triggerHapticFeedback('light');
      }
    }

    touchStartRef.current = null;
  }, [hasTouch, isMobile, onSwipeLeft, onSwipeRight, threshold]);

  useEffect(() => {
    const element = gestureRef.current;
    if (!element || !hasTouch || !isMobile) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd, hasTouch, isMobile]);

  return {
    gestureRef,
    attachGestures: (element: HTMLElement | null) => {
      gestureRef.current = element;
    },
  };
}

/**
 * Pull-to-refresh hook
 */
export function usePullToRefresh(onRefresh: () => void, threshold: number = 100) {
  return useMobileGestures(
    {
      onPullRefresh: onRefresh,
    },
    {
      pullRefresh: { threshold, enabled: true },
    }
  );
}

/**
 * Touch feedback hook for interactive elements
 */
export function useTouchFeedback(
  onPress?: () => void,
  onLongPress?: () => void,
  hapticEnabled: boolean = true
) {
  return useMobileGestures({
    onTap: () => {
      if (hapticEnabled) triggerHapticFeedback('light');
      onPress?.();
    },
    onLongPress: () => {
      if (hapticEnabled) triggerHapticFeedback('medium');
      onLongPress?.();
    },
  });
}

/**
 * Drag and drop gesture hook for mobile
 */
export function useMobileDragDrop(
  onDragStart?: (point: TouchPoint) => void,
  onDragMove?: (point: TouchPoint) => void,
  onDragEnd?: (point: TouchPoint) => void
) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<TouchPoint | null>(null);

  return useMobileGestures({
    onTap: (point) => {
      if (!isDragging) {
        dragStartRef.current = point;
        setIsDragging(true);
        onDragStart?.(point);
      }
    },
    onSwipe: (gesture) => {
      if (isDragging && dragStartRef.current) {
        const endPoint: TouchPoint = {
          x: dragStartRef.current.x + (gesture.direction === 'right' ? gesture.distance : -gesture.distance),
          y: dragStartRef.current.y + (gesture.direction === 'down' ? gesture.distance : -gesture.distance),
          timestamp: Date.now(),
        };
        
        onDragEnd?.(endPoint);
        setIsDragging(false);
        dragStartRef.current = null;
      }
    },
  });
} 