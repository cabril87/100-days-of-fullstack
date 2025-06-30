// Advanced Calendar Gesture Management Hook for Enterprise TaskTracker System
// Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md - Enterprise Hook Standards
// Copyright (c) 2025 TaskTracker Enterprise

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  CalendarGestureProps,
  TouchGestureEvent,
  HapticFeedbackPattern,
  UseCalendarGesturesReturn
} from '../types/calendar-enhancements';

// ============================================================================
// HAPTIC FEEDBACK UTILITY
// ============================================================================

interface HapticPatterns {
  light: HapticFeedbackPattern;
  medium: HapticFeedbackPattern;
  heavy: HapticFeedbackPattern;
  start: HapticFeedbackPattern;
  success: HapticFeedbackPattern;
  error: HapticFeedbackPattern;
}

const HAPTIC_PATTERNS: HapticPatterns = {
  light: { pattern: 'light', vibrationMs: 10 },
  medium: { pattern: 'medium', vibrationMs: 20 },
  heavy: { pattern: 'heavy', vibrationMs: 30 },
  start: { pattern: 'start', vibrationMs: [50, 100, 50] },
  success: { pattern: 'success', vibrationMs: [100, 50, 100] },
  error: { pattern: 'error', vibrationMs: [200, 100, 200, 100, 200] },
};

function triggerHapticFeedback(pattern: keyof HapticPatterns): void {
  if (!navigator.vibrate) return;
  
  const hapticPattern = HAPTIC_PATTERNS[pattern];
  if (Array.isArray(hapticPattern.vibrationMs)) {
    navigator.vibrate(hapticPattern.vibrationMs);
  } else {
    navigator.vibrate(hapticPattern.vibrationMs);
  }
}

// ============================================================================
// GESTURE DETECTION UTILITIES
// ============================================================================

interface TouchState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startTime: number;
  isActive: boolean;
  initialDistance: number;
  currentDistance: number;
  isMultiTouch: boolean;
}

function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function getGestureDirection(deltaX: number, deltaY: number): 'left' | 'right' | 'up' | 'down' {
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  
  if (absX > absY) {
    return deltaX > 0 ? 'right' : 'left';
  } else {
    return deltaY > 0 ? 'down' : 'up';
  }
}

function getTouchDistance(touches: React.TouchList): number {
  if (touches.length < 2) return 0;
  
  const touch1 = touches[0];
  const touch2 = touches[1];
  
  return calculateDistance(
    touch1.clientX,
    touch1.clientY,
    touch2.clientX,
    touch2.clientY
  );
}

// ============================================================================
// CALENDAR GESTURES HOOK
// ============================================================================

export function useCalendarGestures(config: CalendarGestureProps): UseCalendarGesturesReturn {
  const [gestureState, setGestureState] = useState<{
    isGestureActive: boolean;
    currentGesture: TouchGestureEvent | null;
    lastGesture: TouchGestureEvent | null;
  }>({
    isGestureActive: false,
    currentGesture: null,
    lastGesture: null,
  });

  const touchStateRef = useRef<TouchState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0,
    isActive: false,
    initialDistance: 0,
    currentDistance: 0,
    isMultiTouch: false,
  });

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // GESTURE EVENT HANDLERS
  // ============================================================================

  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (!config.isEnabled) return;

    const touch = event.touches[0];
    const now = Date.now();

    // Clear any existing long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Initialize touch state
    touchStateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      startTime: now,
      isActive: true,
      initialDistance: getTouchDistance(event.touches),
      currentDistance: getTouchDistance(event.touches),
      isMultiTouch: event.touches.length > 1,
    };

    setGestureState(prev => ({
      ...prev,
      isGestureActive: true,
    }));

    // Set up long press detection for single touch
    if (event.touches.length === 1) {
      longPressTimerRef.current = setTimeout(() => {
        if (touchStateRef.current.isActive) {
          triggerHapticFeedback('medium');
          config.onLongPress(event);
        }
      }, config.longPressDuration);
    }

    // Light haptic feedback on touch start
    triggerHapticFeedback('light');
  }, [config]);

  const handleTouchMove = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (!config.isEnabled || !touchStateRef.current.isActive) return;

    const touch = event.touches[0];
    touchStateRef.current.currentX = touch.clientX;
    touchStateRef.current.currentY = touch.clientY;

    // Handle multi-touch gestures (pinch zoom)
    if (event.touches.length > 1) {
      touchStateRef.current.isMultiTouch = true;
      touchStateRef.current.currentDistance = getTouchDistance(event.touches);
      
      if (touchStateRef.current.initialDistance > 0) {
        const scale = touchStateRef.current.currentDistance / touchStateRef.current.initialDistance;
        
        // Only trigger pinch zoom if significant scale change
        if (Math.abs(scale - 1) > 0.1) {
          config.onPinchZoom(scale);
        }
      }
      
      // Cancel long press on multi-touch
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      return;
    }

    // Check if movement exceeds minimum distance for swipe cancellation
    const deltaX = touchStateRef.current.currentX - touchStateRef.current.startX;
    const deltaY = touchStateRef.current.currentY - touchStateRef.current.startY;
    const distance = calculateDistance(
      touchStateRef.current.startX,
      touchStateRef.current.startY,
      touchStateRef.current.currentX,
      touchStateRef.current.currentY
    );

    // Cancel long press if moved too much
    if (distance > 10 && longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Update current gesture if significant movement
    if (distance > config.minimumSwipeDistance / 2) {
      const direction = getGestureDirection(deltaX, deltaY);
      const currentGesture: TouchGestureEvent = {
        direction,
        distance,
        duration: Date.now() - touchStateRef.current.startTime,
        startPosition: {
          x: touchStateRef.current.startX,
          y: touchStateRef.current.startY,
        },
        endPosition: {
          x: touchStateRef.current.currentX,
          y: touchStateRef.current.currentY,
        },
      };

      setGestureState(prev => ({
        ...prev,
        currentGesture,
      }));
    }
  }, [config]);

  const handleTouchEnd = useCallback(() => {
    if (!config.isEnabled || !touchStateRef.current.isActive) return;

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    const deltaX = touchStateRef.current.currentX - touchStateRef.current.startX;
    const deltaY = touchStateRef.current.currentY - touchStateRef.current.startY;
    const distance = calculateDistance(
      touchStateRef.current.startX,
      touchStateRef.current.startY,
      touchStateRef.current.currentX,
      touchStateRef.current.currentY
    );
    const duration = Date.now() - touchStateRef.current.startTime;

    // Only process swipe if it meets minimum distance requirement
    if (distance >= config.minimumSwipeDistance && !touchStateRef.current.isMultiTouch) {
      const direction = getGestureDirection(deltaX, deltaY);
      
      const gestureEvent: TouchGestureEvent = {
        direction,
        distance,
        duration,
        startPosition: {
          x: touchStateRef.current.startX,
          y: touchStateRef.current.startY,
        },
        endPosition: {
          x: touchStateRef.current.currentX,
          y: touchStateRef.current.currentY,
        },
      };

      // Trigger appropriate gesture handler
      switch (direction) {
        case 'left':
          config.onSwipeLeft();
          triggerHapticFeedback('medium');
          break;
        case 'right':
          config.onSwipeRight();
          triggerHapticFeedback('medium');
          break;
        case 'up':
          config.onSwipeUp();
          triggerHapticFeedback('medium');
          break;
        case 'down':
          config.onSwipeDown();
          triggerHapticFeedback('medium');
          break;
      }

      setGestureState(prev => ({
        ...prev,
        isGestureActive: false,
        currentGesture: null,
        lastGesture: gestureEvent,
      }));
    } else {
      // Reset gesture state if no valid gesture detected
      setGestureState(prev => ({
        ...prev,
        isGestureActive: false,
        currentGesture: null,
      }));
    }

    // Reset touch state
    touchStateRef.current.isActive = false;
  }, [config]);

  // ============================================================================
  // CLEANUP EFFECT
  // ============================================================================

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // ============================================================================
  // RETURN HOOK INTERFACE
  // ============================================================================

  return {
    gestureHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    gestureState,
    settings: config,
  };
}

// ============================================================================
// PRESET GESTURE CONFIGURATIONS
// ============================================================================

export const CALENDAR_GESTURE_PRESETS = {
  mobile: {
    minimumSwipeDistance: 50,
    longPressDuration: 500,
    isEnabled: true,
  },
  tablet: {
    minimumSwipeDistance: 60,
    longPressDuration: 400,
    isEnabled: true,
  },
  desktop: {
    minimumSwipeDistance: 40,
    longPressDuration: 600,
    isEnabled: false, // Typically disabled on desktop
  },
} as const;

// ============================================================================
// GESTURE UTILITY FUNCTIONS
// ============================================================================

export function getOptimalGestureConfig(
  deviceType: 'mobile' | 'tablet' | 'desktop',
  userPreferences?: Partial<CalendarGestureProps>
): Partial<CalendarGestureProps> {
  const preset = CALENDAR_GESTURE_PRESETS[deviceType];
  return {
    ...preset,
    ...userPreferences,
  };
}

export function isGestureSupported(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function isHapticFeedbackSupported(): boolean {
  return 'vibrate' in navigator;
} 