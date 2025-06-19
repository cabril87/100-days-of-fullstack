'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppearanceFormData } from '@/lib/types/forms';
import { soundService } from '@/lib/services/soundService';
import { spriteAnimationService } from '@/lib/services/spriteAnimationService';

interface AppearanceContextType {
  // Settings
  settings: AppearanceFormData;
  updateSettings: (newSettings: Partial<AppearanceFormData>) => void;
  resetSettings: () => void;
  
  // Animation helpers
  shouldAnimate: (type?: 'general' | 'particles' | 'celebrations') => boolean;
  getAnimationClass: (baseClass: string, animatedClass: string) => string;
  getAnimationDuration: () => number;
  
  // Gamification helpers
  shouldShowProgressBars: () => boolean;
  shouldShowAchievementAnimations: () => boolean;
  shouldEnableLevelUpEffects: () => boolean;
  isCompactMode: () => boolean;
  
  // Sound helpers
  playTestSound: (soundType: string) => void;
  getAvailableSounds: () => string[];
  
  // Sprite animation helpers
  playTestAnimation: (animationType: string, position?: { x: number; y: number }) => void;
  getAvailableAnimations: () => string[];
  
  // Loading state
  isLoading: boolean;
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

const defaultSettings: AppearanceFormData = {
  theme: 'system',
  colorScheme: 'default',
  fontSize: 'medium',
  animations: {
    enableAnimations: true,
    reducedMotion: false,
    animationSpeed: 'normal',
    particleEffects: true,
    spriteAnimations: true,
    characterAnimations: true,
  },
  accessibility: {
    highContrast: false,
    focusIndicators: true,
    screenReaderOptimized: false,
    keyboardNavigation: true,
    audioFeedback: true,
  },
  gamification: {
    showAchievementAnimations: true,
    enableLevelUpEffects: true,
    showProgressBars: true,
    compactMode: false,
    ageAppropriateThemes: true,
  },
};

interface AppearanceProviderProps {
  children: ReactNode;
}

export function AppearanceProvider({ children }: AppearanceProviderProps) {
  const [settings, setSettings] = useState<AppearanceFormData>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const stored = localStorage.getItem('tasktracker-appearance-settings');
        if (stored) {
          const parsedSettings = JSON.parse(stored);
          
          // Deep merge to ensure all new fields are included
          const mergedSettings = {
            ...defaultSettings,
            ...parsedSettings,
            animations: {
              ...defaultSettings.animations,
              ...parsedSettings.animations
            },
            accessibility: {
              ...defaultSettings.accessibility,
              ...parsedSettings.accessibility
            },
            gamification: {
              ...defaultSettings.gamification,
              ...parsedSettings.gamification
            }
          };
          
          console.log('🎮 Loaded settings with sprite animations:', mergedSettings.animations);
          setSettings(mergedSettings);
          
          // Initialize sound service with loaded settings
          soundService.initialize(mergedSettings.accessibility.audioFeedback, 0.3, 'Adult');
        } else {
          console.log('🎮 Using default settings with sprite animations:', defaultSettings.animations);
          // Initialize with defaults
          soundService.initialize(defaultSettings.accessibility.audioFeedback, 0.3, 'Adult');
        }
      } catch (error) {
        console.warn('Failed to load appearance settings:', error);
        soundService.initialize(defaultSettings.accessibility.audioFeedback, 0.3, 'Adult');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('tasktracker-appearance-settings', JSON.stringify(settings));
        // Update sound service when audio feedback changes
        soundService.initialize(settings.accessibility.audioFeedback, 0.3, 'Adult');
      } catch (error) {
        console.warn('Failed to save appearance settings:', error);
      }
    }
  }, [settings, isLoading]);

  const updateSettings = useCallback((newSettings: Partial<AppearanceFormData>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // Deep merge nested objects
      if (newSettings.animations) {
        updated.animations = { ...prev.animations, ...newSettings.animations };
      }
      if (newSettings.accessibility) {
        updated.accessibility = { ...prev.accessibility, ...newSettings.accessibility };
      }
      if (newSettings.gamification) {
        updated.gamification = { ...prev.gamification, ...newSettings.gamification };
      }
      
      return updated;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    soundService.initialize(defaultSettings.accessibility.audioFeedback, 0.3, 'Adult');
  }, []);

  // Animation helpers
  const shouldAnimate = useCallback((type: 'general' | 'particles' | 'celebrations' = 'general') => {
    if (settings.animations.reducedMotion) return false;
    if (!settings.animations.enableAnimations) return false;
    
    switch (type) {
      case 'particles':
        return settings.animations.particleEffects;
      case 'celebrations':
        return settings.gamification.showAchievementAnimations;
      default:
        return true;
    }
  }, [settings.animations, settings.gamification]);

  const getAnimationClass = useCallback((baseClass: string, animatedClass: string) => {
    return shouldAnimate() ? `${baseClass} ${animatedClass}` : baseClass;
  }, [shouldAnimate]);

  const getAnimationDuration = useCallback(() => {
    if (settings.animations.reducedMotion) return 0;
    
    switch (settings.animations.animationSpeed) {
      case 'slow': return 800;
      case 'fast': return 200;
      default: return 400;
    }
  }, [settings.animations]);

  // Gamification helpers
  const shouldShowProgressBars = useCallback(() => {
    return settings.gamification.showProgressBars;
  }, [settings.gamification]);

  const shouldShowAchievementAnimations = useCallback(() => {
    return settings.gamification.showAchievementAnimations && shouldAnimate('celebrations');
  }, [settings.gamification, shouldAnimate]);

  const shouldEnableLevelUpEffects = useCallback(() => {
    return settings.gamification.enableLevelUpEffects && shouldAnimate('celebrations');
  }, [settings.gamification, shouldAnimate]);

  const isCompactMode = useCallback(() => {
    return settings.gamification.compactMode;
  }, [settings.gamification]);

  // Sound helpers
  const getAvailableSounds = useCallback(() => {
    return [
      'success',
      'error', 
      'notification',
      'taskComplete',
      'achievementUnlocked',
      'levelUp',
      'pointsEarned',
      'dragDrop',
      'buttonClick',
      'modalOpen',
      'modalClose',
      'familyNotification',
      'urgentAlert',
      'celebration'
    ];
  }, []);

  const playTestSound = useCallback((soundType: string) => {
    if (!settings.accessibility.audioFeedback) return;
    
    switch (soundType) {
      case 'success':
        soundService.playSuccess();
        break;
      case 'error':
        soundService.playError();
        break;
      case 'notification':
        soundService.playNotification();
        break;
      case 'taskComplete':
        soundService.playTaskComplete();
        break;
      case 'achievementUnlocked':
        soundService.playAchievementUnlocked();
        break;
      case 'levelUp':
        soundService.playLevelUp();
        break;
      case 'pointsEarned':
        soundService.playPointsEarned();
        break;
      case 'dragDrop':
        soundService.playDragDrop();
        break;
      case 'buttonClick':
        soundService.playButtonClick();
        break;
      case 'modalOpen':
        soundService.playModalOpen();
        break;
      case 'modalClose':
        soundService.playModalClose();
        break;
      case 'familyNotification':
        soundService.playFamilyNotification();
        break;
      case 'urgentAlert':
        soundService.playUrgentAlert();
        break;
      case 'celebration':
        soundService.playCelebration();
        break;
      default:
        console.warn(`Unknown sound type: ${soundType}`);
    }
  }, [settings.accessibility.audioFeedback]);

  // Sprite animation helpers
  const getAvailableAnimations = useCallback(() => {
    return [
      'achievement-unlock',
      'level-up',
      'task-complete',
      'points-earned',
      'star-burst',
      'confetti-explosion',
      'character-celebration',
      'badge-earned',
      'streak-milestone',
      'family-notification'
    ];
  }, []);

  const playTestAnimation = useCallback((animationType: string, position?: { x: number; y: number }) => {
    console.log('🎮 AppearanceContext: Testing animation:', animationType);
    console.log('🎮 Sprite animations enabled:', settings.animations.spriteAnimations);
    console.log('🎮 Character animations enabled:', settings.animations.characterAnimations);
    console.log('🎮 General animations enabled:', settings.animations.enableAnimations);
    
    // Default to true if spriteAnimations is undefined (for backwards compatibility)
    const spriteAnimationsEnabled = settings.animations.spriteAnimations !== false;
    
    if (!spriteAnimationsEnabled || !settings.animations.enableAnimations) {
      console.log('❌ Animations disabled in settings');
      return;
    }
    
    // Default to center of screen if no position provided
    const defaultPosition = { 
      x: window.innerWidth / 2, 
      y: window.innerHeight / 2 
    };
    const animationPosition = position || defaultPosition;
    
    console.log('🎯 Playing animation at position:', animationPosition);
    
    spriteAnimationService.playAnimation(animationType as any, animationPosition);
  }, [settings.animations.spriteAnimations, settings.animations.characterAnimations, settings.animations.enableAnimations]);

  const contextValue: AppearanceContextType = {
    settings,
    updateSettings,
    resetSettings,
    shouldAnimate,
    getAnimationClass,
    getAnimationDuration,
    shouldShowProgressBars,
    shouldShowAchievementAnimations,
    shouldEnableLevelUpEffects,
    isCompactMode,
    playTestSound,
    getAvailableSounds,
    playTestAnimation,
    getAvailableAnimations,
    isLoading,
  };

  return (
    <AppearanceContext.Provider value={contextValue}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearanceSettings() {
  const context = useContext(AppearanceContext);
  if (context === undefined) {
    throw new Error('useAppearanceSettings must be used within an AppearanceProvider');
  }
  return context;
} 