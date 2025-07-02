import React, { useState, useCallback } from 'react';
import { triggerHapticFeedback } from './haptic.helper';

/**
 * Touch Gesture Hook
 */
export function useTouchGestures(onGesture?: (direction: 'up' | 'down' | 'left' | 'right', distance: number) => void) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isUpSwipe = distanceY > minSwipeDistance;
    const isDownSwipe = distanceY < -minSwipeDistance;

    if (isLeftSwipe) {
      onGesture?.('left', Math.abs(distanceX));
      triggerHapticFeedback('light');
    } else if (isRightSwipe) {
      onGesture?.('right', Math.abs(distanceX));
      triggerHapticFeedback('light');
    } else if (isUpSwipe) {
      onGesture?.('up', Math.abs(distanceY));
      triggerHapticFeedback('light');
    } else if (isDownSwipe) {
      onGesture?.('down', Math.abs(distanceY));
      triggerHapticFeedback('light');
    }
  }, [touchStart, touchEnd, onGesture]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
} 