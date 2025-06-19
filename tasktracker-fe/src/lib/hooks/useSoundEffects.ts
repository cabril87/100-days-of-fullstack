/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Sound Effects Hook for TaskTracker Enterprise
 * Provides easy integration of sound effects with user settings
 */

import { useEffect, useCallback } from 'react';
import { soundService } from '@/lib/services/soundService';

/**
 * Hook to manage sound effects with user preferences
 */
export function useSoundEffects(
  audioFeedback: boolean = false,
  volume: number = 0.3,
  ageGroup: 'Child' | 'Teen' | 'Adult' = 'Adult'
) {
  // Initialize sound service when settings change
  useEffect(() => {
    soundService.initialize(audioFeedback, volume, ageGroup);
  }, [audioFeedback, volume, ageGroup]);

  // Memoized sound effect functions
  const playTaskComplete = useCallback(() => {
    soundService.playTaskComplete();
  }, []);

  const playAchievementUnlocked = useCallback(() => {
    soundService.playAchievementUnlocked();
  }, []);

  const playLevelUp = useCallback(() => {
    soundService.playLevelUp();
  }, []);

  const playPointsEarned = useCallback(() => {
    soundService.playPointsEarned();
  }, []);

  const playStreakMilestone = useCallback(() => {
    soundService.playStreakMilestone();
  }, []);

  const playBadgeEarned = useCallback(() => {
    soundService.playBadgeEarned();
  }, []);

  const playButtonClick = useCallback(() => {
    soundService.playButtonClick();
  }, []);

  const playSuccess = useCallback(() => {
    soundService.playSuccess();
  }, []);

  const playError = useCallback(() => {
    soundService.playError();
  }, []);

  const playNotification = useCallback(() => {
    soundService.playNotification();
  }, []);

  const playFamilyCelebration = useCallback(() => {
    soundService.playFamilyCelebration();
  }, []);

  const playDragPickup = useCallback(() => {
    soundService.playDragPickup();
  }, []);

  const playDragDrop = useCallback(() => {
    soundService.playDragDrop();
  }, []);

  const playCelebrationByLevel = useCallback((level: 1 | 2 | 3 | 4 | 5) => {
    soundService.playCelebrationByLevel(level);
  }, []);

  return {
    // Sound effect functions
    playTaskComplete,
    playAchievementUnlocked,
    playLevelUp,
    playPointsEarned,
    playStreakMilestone,
    playBadgeEarned,
    playButtonClick,
    playSuccess,
    playError,
    playNotification,
    playFamilyCelebration,
    playDragPickup,
    playDragDrop,
    playCelebrationByLevel,

    // Settings
    isEnabled: audioFeedback,
    volume,
    ageGroup,

    // Service access for advanced usage
    soundService
  };
}

export default useSoundEffects; 