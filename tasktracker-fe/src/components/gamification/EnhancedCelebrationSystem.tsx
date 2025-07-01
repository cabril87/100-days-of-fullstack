"use client";

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Enterprise Enhanced Celebration System
 * Comprehensive real-time gamification celebrations with family context
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md rules
 * 
 * MOBILE-FIRST RESPONSIVE ENHANCEMENTS:
 * - Responsive confetti configurations for mobile/tablet/desktop
 * - Touch-optimized celebration cards with 44px+ touch targets
 * - Swipe-to-dismiss gesture support
 * - Haptic feedback integration
 * - Tablet-specific celebration patterns
 * - Portrait/landscape orientation handling
 * - Battery-aware performance optimization
 */

import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { soundService } from '@/lib/services/soundService';
import { Crown, Trophy, Star, Users, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSignalRConnectionManager } from '@/lib/hooks/useSignalRConnectionManager';
import { useResponsive } from '@/lib/hooks/useResponsive';
import { useTouchOptimized } from '@/lib/hooks/useResponsive';
import { useMobileGestures } from '@/lib/hooks/useMobileGestures';
import { TouchFeedback } from '@/components/calendar/MobileCalendarEnhancements';
import { cn } from '@/lib/utils/utils';
import type { 
  TaskCompletionEventDTO, 
  FamilyActivityEventDTO, 
  FamilyMilestoneEventDTO 
} from '@/lib/types/family-events';
import type { 
  ParsedGamificationEvents
} from '@/lib/types/backend-signalr-events';
import type {
  BackendGamificationEventDTO,
  BackendTaskCompletionEventDTO,
  BackendFamilyActivityEventDTO,
  BackendFamilyMilestoneEventDTO
} from '@/lib/types/backend-signalr-events';
import {
  parseGamificationEvent,
  parseTaskCompletionEvent,
  parseFamilyActivityEvent,
  parseFamilyMilestoneEvent
} from '@/lib/types/backend-signalr-events';
import type {
  EnterpriseCelebrationNotification,
  EnterpriseCelebrationConfig
} from '@/lib/types/enterprise-celebrations';
import type { 
  EnhancedCelebrationSystemProps 
} from '@/lib/types/component-props/enterprise-celebration-props';

// ================================
// MOBILE-FIRST RESPONSIVE TYPES
// ================================

interface ResponsiveConfettiConfig {
  mobile: {
    particleCount: number;
    spread: number;
    startVelocity: number;
    decay: number;
    gravity: number;
    colors: string[];
  };
  tablet: {
    particleCount: number;
    spread: number;
    startVelocity: number;
    decay: number;
    gravity: number;
    colors: string[];
  };
  desktop: {
    particleCount: number;
    spread: number;
    startVelocity: number;
    decay: number;
    gravity: number;
    colors: string[];
  };
}

interface CelebrationCardGesture {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isDragging: boolean;
  velocity: number;
}

export default function EnhancedCelebrationSystem({
  userId,
  familyId,
  enableToasts = true,
  enableConfetti = true,
  enableCelebrationCards = true,
  enableSoundEffects = false, // Conservative default for family environments
  celebrationIntensity = 'moderate',
  familyMemberAgeGroup = 'Adult',
  className = ''
}: EnhancedCelebrationSystemProps) {

  // ================================
  // MOBILE-FIRST RESPONSIVE HOOKS
  // ================================
  
  const responsive = useResponsive();
  const touchOptimized = useTouchOptimized();
  
  // Enterprise gesture handling with proper configuration
  const gestureHandlers = useMemo(() => ({
    onSwipe: (gesture: any) => {
      // Handle celebration card swipe dismissal
      console.log('Swipe gesture:', gesture);
    },
    onTap: () => {
      // Handle celebration card tap
      console.log('Tap gesture');
    },
    onLongPress: () => {
      // Handle celebration card long press dismissal
      console.log('Long press gesture');
    }
  }), []);
  
  const mobileGestures = useMobileGestures(gestureHandlers, {
    swipeThreshold: 50,
    enableHaptic: true,
    preventDefault: true
  });
  
  // Enterprise state management with explicit typing
  const [activeCelebrations, setActiveCelebrations] = useState<EnterpriseCelebrationNotification[]>([]);
  const [cardGestures, setCardGestures] = useState<Map<string, CelebrationCardGesture>>(new Map());
  const celebrationCardsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  
  // Initialize sound service with current settings
  useEffect(() => {
    soundService.initialize(enableSoundEffects, 0.3, familyMemberAgeGroup);
  }, [enableSoundEffects, familyMemberAgeGroup]);

  // ================================
  // RESPONSIVE CONFETTI CONFIGURATIONS
  // ================================
  
  const responsiveConfettiConfig = useMemo((): ResponsiveConfettiConfig => {
    const baseColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'];
    const premiumColors = ['#ffd700', '#ffed4e', '#ff6b6b', '#4ecdc4', '#6c5ce7', '#fd79a8'];
    
    return {
      mobile: {
        particleCount: 30, // Reduced for mobile performance
        spread: 50,
        startVelocity: 20,
        decay: 0.85,
        gravity: 0.8,
        colors: baseColors
      },
      tablet: {
        particleCount: 75, // Medium for tablets
        spread: 70,
        startVelocity: 25,
        decay: 0.9,
        gravity: 1,
        colors: premiumColors
      },
      desktop: {
        particleCount: 120, // Full effect for desktop
        spread: 90,
        startVelocity: 35,
        gravity: 1.2,
        decay: 0.95,
        colors: premiumColors
      }
    };
  }, []);

  // Get current device confetti config
  const currentConfettiConfig = useMemo(() => {
    if (responsive.isMobile) return responsiveConfettiConfig.mobile;
    if (responsive.isTablet) return responsiveConfettiConfig.tablet;
    return responsiveConfettiConfig.desktop;
  }, [responsive.isMobile, responsive.isTablet, responsiveConfettiConfig]);

  const [celebrationConfig, setCelebrationConfig] = useState<EnterpriseCelebrationConfig>({
    confettiSettings: currentConfettiConfig,
    toastDuration: responsive.isMobile ? 3000 : 4000, // Shorter on mobile
    cardDuration: responsive.isMobile ? 5000 : 6000,
    soundVolume: 0.3,
    maxConcurrentCelebrations: responsive.isMobile ? 2 : 3, // Fewer on mobile
    familyBroadcastEnabled: true
  });

  // Update celebration config when device type changes
  useEffect(() => {
    setCelebrationConfig(prev => ({
      ...prev,
      confettiSettings: currentConfettiConfig,
      toastDuration: responsive.isMobile ? 3000 : 4000,
      cardDuration: responsive.isMobile ? 5000 : 6000,
      maxConcurrentCelebrations: responsive.isMobile ? 2 : 3
    }));
  }, [currentConfettiConfig, responsive.isMobile]);

  // Age-appropriate celebration configuration
  const ageAppropriateConfig = useMemo((): EnterpriseCelebrationConfig => {
    const baseConfig = { ...celebrationConfig };
    
    switch (familyMemberAgeGroup) {
      case 'Child':
        return {
          ...baseConfig,
          confettiSettings: {
            ...baseConfig.confettiSettings,
            particleCount: Math.floor(baseConfig.confettiSettings.particleCount * 1.2),
            spread: Math.min(baseConfig.confettiSettings.spread + 20, 100),
            colors: ['#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43']
          },
          toastDuration: baseConfig.toastDuration + 1000,
          cardDuration: baseConfig.cardDuration + 2000,
          soundVolume: 0.4
        };
      case 'Teen':
        return {
          ...baseConfig,
          confettiSettings: {
            ...baseConfig.confettiSettings,
            particleCount: Math.floor(baseConfig.confettiSettings.particleCount * 1.1),
            colors: ['#6c5ce7', '#fd79a8', '#fdcb6e', '#e17055', '#74b9ff']
          },
          toastDuration: baseConfig.toastDuration + 500,
          cardDuration: baseConfig.cardDuration + 1000,
          soundVolume: 0.35
        };
      default: // Adult
        return baseConfig;
    }
  }, [familyMemberAgeGroup, celebrationConfig]);

  // Intensity-based configuration adjustment
  const intensityAdjustedConfig = useMemo((): EnterpriseCelebrationConfig => {
    const config = { ...ageAppropriateConfig };
    
    switch (celebrationIntensity) {
      case 'minimal':
        config.confettiSettings.particleCount = Math.floor(config.confettiSettings.particleCount * 0.3);
        config.toastDuration = Math.floor(config.toastDuration * 0.7);
        config.cardDuration = Math.floor(config.cardDuration * 0.7);
        config.maxConcurrentCelebrations = 1;
        break;
      case 'moderate':
        // Use base config
        break;
      case 'full':
        config.confettiSettings.particleCount = Math.floor(config.confettiSettings.particleCount * 1.3);
        config.toastDuration = Math.floor(config.toastDuration * 1.1);
        config.cardDuration = Math.floor(config.cardDuration * 1.1);
        config.maxConcurrentCelebrations = responsive.isMobile ? 3 : 5;
        break;
      case 'maximum':
        config.confettiSettings.particleCount = Math.floor(config.confettiSettings.particleCount * 1.6);
        config.toastDuration = Math.floor(config.toastDuration * 1.3);
        config.cardDuration = Math.floor(config.cardDuration * 1.3);
        config.maxConcurrentCelebrations = responsive.isMobile ? 4 : 8;
        break;
    }
    
    return config;
  }, [ageAppropriateConfig, celebrationIntensity, responsive.isMobile]);

  // ================================
  // RESPONSIVE CELEBRATION CARD CLASSES
  // ================================
  
  const celebrationCardClasses = useMemo(() => {
    const baseClasses = cn(
      // Base styling
      "fixed z-50 transform transition-all duration-300 ease-out",
      "bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700",
      "backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95",
      
      // Touch optimization
      touchOptimized.touchClasses,
      "select-none cursor-pointer",
      
      // Responsive sizing
      responsive.isMobile && [
        "w-[calc(100vw-2rem)] max-w-sm", // Mobile: full width with margin
        "min-h-[60px]", // Minimum touch target
        "text-sm" // Smaller text on mobile
      ],
      responsive.isTablet && [
        "w-96 max-w-[calc(100vw-4rem)]", // Tablet: larger but constrained
        "min-h-[70px]",
        "text-base"
      ],
      responsive.isDesktop && [
        "w-80", // Desktop: fixed width
        "min-h-[80px]",
        "text-base"
      ],
      
      // Orientation handling
      responsive.orientation === 'portrait' && responsive.isTablet && "max-w-sm",
      responsive.orientation === 'landscape' && responsive.isTablet && "max-w-md"
    );
    
    return baseClasses;
  }, [responsive, touchOptimized.touchClasses]);

  // ================================
  // TOUCH GESTURE HANDLING
  // ================================
  
  const handleTouchStart = useCallback((e: React.TouchEvent, celebrationId: string) => {
    if (!responsive.isMobile) return;
    
    const touch = e.touches[0];
    const gesture: CelebrationCardGesture = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isDragging: false,
      velocity: 0
    };
    
    setCardGestures(prev => new Map(prev.set(celebrationId, gesture)));
    
    // Haptic feedback on touch start (commented out due to interface mismatch)
    if (mobileGestures?.onHaptic) {
      mobileGestures.onHaptic('light');
    }
  }, [responsive.isMobile, mobileGestures]);

  const handleTouchMove = useCallback((e: React.TouchEvent, celebrationId: string) => {
    if (!responsive.isMobile) return;
    
    const touch = e.touches[0];
    const gesture = cardGestures.get(celebrationId);
    if (!gesture) return;
    
    const deltaX = touch.clientX - gesture.startX;
    const deltaY = touch.clientY - gesture.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Start dragging if moved more than 10px
    if (distance > 10 && !gesture.isDragging) {
      gesture.isDragging = true;
      
      // Haptic feedback when drag starts (commented out due to interface mismatch)
      if (mobileGestures?.triggerHaptic) {
        mobileGestures.triggerHaptic('medium');
      }
    }
    
    if (gesture.isDragging) {
      gesture.currentX = touch.clientX;
      gesture.currentY = touch.clientY;
      gesture.velocity = Math.abs(deltaX) / 100; // Simple velocity calculation
      
      setCardGestures(prev => new Map(prev.set(celebrationId, gesture)));
      
      // Apply transform to card
      const cardElement = celebrationCardsRef.current.get(celebrationId);
      if (cardElement) {
        const opacity = Math.max(0.3, 1 - Math.abs(deltaX) / 200);
        cardElement.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.1}deg)`;
        cardElement.style.opacity = opacity.toString();
      }
    }
  }, [responsive.isMobile, cardGestures, mobileGestures]);

  const handleTouchEnd = useCallback((e: React.TouchEvent, celebrationId: string) => {
    if (!responsive.isMobile) return;
    
    const gesture = cardGestures.get(celebrationId);
    if (!gesture) return;
    
    const deltaX = gesture.currentX - gesture.startX;
    const shouldDismiss = Math.abs(deltaX) > 100 || gesture.velocity > 0.5;
    
    const cardElement = celebrationCardsRef.current.get(celebrationId);
    if (cardElement) {
      if (shouldDismiss) {
        // Animate dismiss
        cardElement.style.transform = `translateX(${deltaX > 0 ? '100%' : '-100%'}) rotate(${deltaX * 0.2}deg)`;
        cardElement.style.opacity = '0';
        
        // Remove after animation
        setTimeout(() => {
          dismissCelebration(celebrationId);
        }, 300);
        
        // Strong haptic feedback for dismiss
        if (mobileGestures?.triggerHaptic) {
          mobileGestures.triggerHaptic('heavy');
        }
      } else {
        // Snap back
        cardElement.style.transform = 'translateX(0) rotate(0deg)';
        cardElement.style.opacity = '1';
        
        // Light haptic feedback for snap back
        if (mobileGestures?.triggerHaptic) {
          mobileGestures.triggerHaptic('light');
        }
      }
    }
    
    // Clean up gesture
    setCardGestures(prev => {
      const newMap = new Map(prev);
      newMap.delete(celebrationId);
      return newMap;
    });
  }, [responsive.hasTouch, cardGestures, mobileGestures]);

  // ================================
  // ENHANCED CONFETTI TRIGGER
  // ================================
  
  const triggerEnterpriseConfetti = useCallback((celebrationLevel: number, familyContext?: EnterpriseCelebrationNotification['familyContext']) => {
    if (!enableConfetti) return;

    const config = intensityAdjustedConfig.confettiSettings;
    const intensity = Math.min(celebrationLevel / 5, 1);
    
    // Responsive positioning based on device
    const originConfig = responsive.isMobile 
      ? { x: 0.5, y: 0.8 } // Lower on mobile to account for virtual keyboards
      : responsive.isTablet
      ? { x: 0.5, y: 0.7 } // Medium position for tablets
      : { x: 0.5, y: 0.6 }; // Higher on desktop
    
    // Base confetti burst with responsive settings
    confetti({
      particleCount: Math.floor(config.particleCount * intensity),
      spread: config.spread,
      startVelocity: config.startVelocity * intensity,
      decay: config.decay,
      gravity: config.gravity,
      colors: config.colors,
      origin: originConfig
    });

    // Enhanced effects for tablets and desktop only (performance optimization)
    if (!responsive.isMobile && familyContext?.isSharedCelebration && celebrationLevel >= 4) {
      // Side bursts for family celebrations
      setTimeout(() => {
        confetti({
          particleCount: Math.floor(config.particleCount * 0.4),
          spread: 50,
          startVelocity: config.startVelocity * 0.8,
          colors: config.colors,
          origin: { x: 0.2, y: originConfig.y }
        });
      }, 200);
      
      setTimeout(() => {
        confetti({
          particleCount: Math.floor(config.particleCount * 0.4),
          spread: 50,
          startVelocity: config.startVelocity * 0.8,
          colors: config.colors,
          origin: { x: 0.8, y: originConfig.y }
        });
      }, 400);
    }

    // Maximum level celebration (level 5) - enhanced for larger screens
    if (celebrationLevel === 5 && !responsive.isMobile) {
      setTimeout(() => {
        confetti({
          particleCount: Math.floor(config.particleCount * (responsive.isTablet ? 0.6 : 0.8)),
          spread: 100,
          startVelocity: config.startVelocity * 1.2,
          colors: ['#ffd700', '#ffed4e', '#ff6b6b', '#4ecdc4'],
          origin: { x: 0.5, y: 0.3 }
        });
      }, 600);
    }
  }, [enableConfetti, intensityAdjustedConfig, responsive]);

  // ================================
  // CELEBRATION CARD MANAGEMENT
  // ================================
  
  const dismissCelebration = useCallback((celebrationId: string) => {
    setActiveCelebrations(prev => prev.filter(c => c.id !== celebrationId));
    celebrationCardsRef.current.delete(celebrationId);
    
    // Clean up gesture state
    setCardGestures(prev => {
      const newMap = new Map(prev);
      newMap.delete(celebrationId);
      return newMap;
    });
  }, []);

  // Enterprise celebration creation
  const createEnterpriseCelebration = useCallback((
    type: EnterpriseCelebrationNotification['type'],
    title: string,
    message: string,
    icon: React.ReactNode,
    color: string,
    celebrationLevel: 1 | 2 | 3 | 4 | 5,
    familyContext?: EnterpriseCelebrationNotification['familyContext'],
    soundEffect?: EnterpriseCelebrationNotification['soundEffect']
  ): EnterpriseCelebrationNotification => {
    return {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      icon,
      color,
      duration: intensityAdjustedConfig.cardDuration,
      priority: celebrationLevel >= 4 ? 'high' : celebrationLevel >= 3 ? 'medium' : 'low',
      familyContext,
      celebrationLevel,
      soundEffect,
      timestamp: new Date()
    };
  }, [intensityAdjustedConfig.cardDuration]);

  // Enterprise task completion handler
  const handleTaskCompletionEvent = useCallback((event: TaskCompletionEventDTO) => {
    if (!userId || event.completedByUserId !== userId) return;

    const isHighValue = event.pointsEarned >= 25;
    const isUrgentTask = event.priority === 'Urgent' || event.priority === 'High';
    const celebrationLevel: 1 | 2 | 3 | 4 | 5 = isHighValue && isUrgentTask ? 5 : isHighValue ? 4 : isUrgentTask ? 3 : 2;

    const familyContext: EnterpriseCelebrationNotification['familyContext'] | undefined = event.familyId ? {
      familyId: event.familyId,
      isSharedCelebration: true
    } : undefined;

    // Create celebration notification
    if (enableCelebrationCards) {
      const celebration = createEnterpriseCelebration(
        'task_completion',
        '🎉 Task Completed!',
        `"${event.taskTitle}" completed! +${event.pointsEarned} points earned`,
        <Trophy className="h-5 w-5" />,
        'bg-gradient-to-r from-green-500 to-emerald-500',
        celebrationLevel,
        familyContext,
        'achievement'
      );

      setActiveCelebrations(prev => {
        const updated = [celebration, ...prev].slice(0, intensityAdjustedConfig.maxConcurrentCelebrations);
        return updated;
      });

      // Auto-remove celebration
      setTimeout(() => {
        setActiveCelebrations(prev => prev.filter(c => c.id !== celebration.id));
      }, celebration.duration);
    }

    // Toast notification
    if (enableToasts) {
      toast.success(`Task Completed! +${event.pointsEarned} points`, {
        description: `"${event.taskTitle}" has been completed successfully`,
        duration: intensityAdjustedConfig.toastDuration,
        className: "border-l-4 border-green-500"
      });
    }

    // Confetti celebration
    triggerEnterpriseConfetti(celebrationLevel, familyContext);

    // Sound effects
    soundService.playCelebrationByLevel(celebrationLevel);

    // Achievement unlock celebration
    if (event.achievementUnlocked) {
      setTimeout(() => {
        if (enableToasts) {
          toast.success(`🏆 Achievement Unlocked!`, {
            description: event.achievementUnlocked,
            duration: intensityAdjustedConfig.toastDuration + 1000,
            className: "border-l-4 border-yellow-500"
          });
        }
        triggerEnterpriseConfetti(5, familyContext);
        soundService.playAchievementUnlocked();
      }, 1500);
    }

    // Level up celebration
    if (event.triggeredLevelUp && event.newLevel) {
      setTimeout(() => {
        if (enableToasts) {
          toast.success(`⭐ Level Up!`, {
            description: `Congratulations! You've reached Level ${event.newLevel}!`,
            duration: intensityAdjustedConfig.toastDuration + 2000,
            className: "border-l-4 border-purple-500"
          });
        }
        triggerEnterpriseConfetti(5, familyContext);
        soundService.playLevelUp();
      }, 2500);
    }
  }, [userId, enableCelebrationCards, enableToasts, createEnterpriseCelebration, intensityAdjustedConfig, triggerEnterpriseConfetti]);

  // Enterprise family activity handler
  const handleFamilyActivity = useCallback((event: FamilyActivityEventDTO) => {
    if (!familyId || event.familyId !== familyId) return;

    const isHighImpact = (event.pointsEarned || 0) >= 50;
    const celebrationLevel: 1 | 2 | 3 | 4 | 5 = isHighImpact ? 4 : 2;

    const familyContext: EnterpriseCelebrationNotification['familyContext'] = {
      familyId: event.familyId,
      isSharedCelebration: true
    };

    if (enableCelebrationCards) {
      const celebration = createEnterpriseCelebration(
        'family_milestone',
        '👨‍👩‍👧‍👦 Family Activity',
        `${event.userDisplayName || 'Family member'} ${event.description}`,
        <Users className="h-5 w-5" />,
        'bg-gradient-to-r from-blue-500 to-purple-500',
        celebrationLevel,
        familyContext
      );

      setActiveCelebrations(prev => {
        const updated = [celebration, ...prev].slice(0, intensityAdjustedConfig.maxConcurrentCelebrations);
        return updated;
      });

      setTimeout(() => {
        setActiveCelebrations(prev => prev.filter(c => c.id !== celebration.id));
      }, celebration.duration);
    }

    if (enableToasts && isHighImpact) {
      toast.success('🎉 Family Achievement!', {
        description: event.description,
        duration: intensityAdjustedConfig.toastDuration,
        className: "border-l-4 border-blue-500"
      });
    }
  }, [familyId, enableCelebrationCards, enableToasts, createEnterpriseCelebration, intensityAdjustedConfig]);

  // Enterprise family milestone handler
  const handleFamilyMilestone = useCallback((event: FamilyMilestoneEventDTO) => {
    if (!familyId || event.familyId !== familyId) return;

    const celebrationLevel = event.celebrationLevel || 4;
    const shouldTriggerConfetti = event.triggerConfetti !== false;

    const familyContext: EnterpriseCelebrationNotification['familyContext'] = {
      familyId: event.familyId,
      isSharedCelebration: true
    };

    if (enableCelebrationCards) {
      const celebration = createEnterpriseCelebration(
        'family_milestone',
        '🏆 Family Milestone Achieved!',
        `${event.title} - ${event.pointsEarned || 0} points earned!`,
        <Crown className="h-5 w-5" />,
        event.colorTheme || 'bg-gradient-to-r from-purple-500 to-pink-500',
        celebrationLevel as 1 | 2 | 3 | 4 | 5,
        familyContext,
        event.soundEffect as EnterpriseCelebrationNotification['soundEffect']
      );

      setActiveCelebrations(prev => {
        const updated = [celebration, ...prev].slice(0, intensityAdjustedConfig.maxConcurrentCelebrations);
        return updated;
      });

      setTimeout(() => {
        setActiveCelebrations(prev => prev.filter(c => c.id !== celebration.id));
      }, celebration.duration);
    }

    if (enableToasts) {
      toast.success('🏆 Family Milestone!', {
        description: event.description,
        duration: intensityAdjustedConfig.toastDuration + 1000,
        className: "border-l-4 border-purple-500"
      });
    }

    if (shouldTriggerConfetti) {
      triggerEnterpriseConfetti(celebrationLevel, familyContext);
      // Play family celebration sound
      soundService.playFamilyCelebration();
    }

    // Additional celebration message if provided
    if (event.description) {
      setTimeout(() => {
        toast(event.description, {
          duration: 4000,
          className: "border-l-4 border-pink-500"
        });
      }, 2000);
    }
  }, [familyId, enableCelebrationCards, enableToasts, createEnterpriseCelebration, intensityAdjustedConfig, triggerEnterpriseConfetti]);

  // Enterprise gamification event handlers
  const handlePointsEarned = useCallback((event: ParsedGamificationEvents['pointsEarned']) => {
    if (!userId || !event || event.userId !== userId) return;

    const isSignificant = event.points >= 25;
    if (!isSignificant) return; // Only celebrate significant point gains

    if (enableToasts) {
      toast.success(`+${event.points} Points!`, {
        description: event.reason,
        duration: intensityAdjustedConfig.toastDuration,
        className: "border-l-4 border-yellow-500"
      });
    }

    // Sound effect for points
    soundService.playPointsEarned();
  }, [userId, enableToasts, intensityAdjustedConfig.toastDuration]);

  const handleAchievementUnlocked = useCallback((event: ParsedGamificationEvents['achievementUnlocked']) => {
    if (!userId || !event || event.userId !== userId) return; 

    const celebrationLevel: 1 | 2 | 3 | 4 | 5 = event.difficulty === 'VeryHard' ? 5 : 
                                                 event.difficulty === 'Hard' ? 4 : 
                                                 event.difficulty === 'Medium' ? 3 : 2;

    if (enableCelebrationCards) {
      const celebration = createEnterpriseCelebration(
        'achievement_unlocked',
        '🏆 Achievement Unlocked!',
        `${event.achievementName} (+${event.points} points)`,
        <Trophy className="h-5 w-5" />,
        'bg-gradient-to-r from-yellow-500 to-orange-500',
        celebrationLevel
      );

      setActiveCelebrations(prev => {
        const updated = [celebration, ...prev].slice(0, intensityAdjustedConfig.maxConcurrentCelebrations);
        return updated;
      });

      setTimeout(() => {
        setActiveCelebrations(prev => prev.filter(c => c.id !== celebration.id));
      }, celebration.duration);
    }

    if (enableToasts) {
      toast.success('🏆 Achievement Unlocked!', {
        description: `${event.achievementName} - ${event.category}`,
        duration: intensityAdjustedConfig.toastDuration + 1000,
        className: "border-l-4 border-yellow-500"
      });
    }

    triggerEnterpriseConfetti(celebrationLevel);
    
    // Sound effect for achievement
    soundService.playAchievementUnlocked();
  }, [userId, enableCelebrationCards, enableToasts, createEnterpriseCelebration, intensityAdjustedConfig, triggerEnterpriseConfetti]);

  const handleLevelUp = useCallback((event: ParsedGamificationEvents['levelUp']) => {
    if (!userId || !event || event.userId !== userId) return;

    if (enableCelebrationCards) {
      const celebration = createEnterpriseCelebration(
        'level_up',
        '⭐ Level Up!',
        `Congratulations! You've reached Level ${event.newLevel}!`,
        <Star className="h-5 w-5" />,
        'bg-gradient-to-r from-purple-500 to-blue-500',
        5, // Level ups are always maximum celebration
        undefined,
        'level_up'
      );

      setActiveCelebrations(prev => {
        const updated = [celebration, ...prev].slice(0, intensityAdjustedConfig.maxConcurrentCelebrations);
        return updated;
      });

      setTimeout(() => {
        setActiveCelebrations(prev => prev.filter(c => c.id !== celebration.id));
      }, celebration.duration);
    }

    if (enableToasts) {
      toast.success('⭐ Level Up!', {
        description: `Welcome to Level ${event.newLevel}! ${event.bonusPoints ? `+${event.bonusPoints} bonus points!` : ''}`,
        duration: intensityAdjustedConfig.toastDuration + 2000,
        className: "border-l-4 border-purple-500"
      });
    }

    triggerEnterpriseConfetti(5);
    
    // Sound effect for level up
    soundService.playLevelUp();
  }, [userId, enableCelebrationCards, enableToasts, createEnterpriseCelebration, intensityAdjustedConfig, triggerEnterpriseConfetti]);

  const handleStreakUpdated = useCallback((event: ParsedGamificationEvents['streakUpdated']) => {
    if (!userId || !event || event.userId !== userId) return;

    const isSignificantStreak = event.currentStreak >= 7 && event.currentStreak % 7 === 0; // Weekly milestones
    if (!isSignificantStreak) return;

    const celebrationLevel: 1 | 2 | 3 | 4 | 5 = event.currentStreak >= 30 ? 5 : 
                                                 event.currentStreak >= 14 ? 4 : 3;

    if (enableToasts) {
      toast.success(`🔥 ${event.currentStreak} Day Streak!`, {
        description: `Amazing consistency! Keep it up!`,
        duration: intensityAdjustedConfig.toastDuration,
        className: "border-l-4 border-orange-500"
      });
    }

    if (celebrationLevel >= 4) {
      triggerEnterpriseConfetti(celebrationLevel);
      // Sound effect for streak milestone
      soundService.playStreakMilestone();
    }
  }, [userId, enableToasts, intensityAdjustedConfig.toastDuration, triggerEnterpriseConfetti]);

  const handleBadgeEarned = useCallback((event: ParsedGamificationEvents['badgeEarned']) => {
    if (!userId || !event || event.userId !== userId) return;

    const celebrationLevel: 1 | 2 | 3 | 4 | 5 = event.rarity === 'Legendary' ? 5 : 
                                                 event.rarity === 'Epic' ? 4 : 
                                                 event.rarity === 'Rare' ? 3 : 2;

    if (enableToasts) {
      toast.success('🎖️ Badge Earned!', {
        description: `${event.badgeName} (${event.rarity})`,
        duration: intensityAdjustedConfig.toastDuration,
        className: "border-l-4 border-indigo-500"
      });
    }

    if (celebrationLevel >= 3) {
      triggerEnterpriseConfetti(celebrationLevel);
      // Sound effect for badge earned
      soundService.playBadgeEarned();
    }
  }, [userId, enableToasts, intensityAdjustedConfig.toastDuration, triggerEnterpriseConfetti]);

  // Set up SignalR event handlers with enterprise event management
  // Using exact backend-matching event types - NO ANY TYPES
  useSignalRConnectionManager('enhanced-celebration-system', {
    // Backend gamification events - matches ReceiveGamificationEvent
    onReceiveGamificationEvent: useCallback((event: BackendGamificationEventDTO) => {
      const parsedEvents = parseGamificationEvent(event);
      
      // Handle parsed events with proper type safety
      if (parsedEvents.pointsEarned) {
        handlePointsEarned(parsedEvents.pointsEarned);
      }
      if (parsedEvents.achievementUnlocked) {
        handleAchievementUnlocked(parsedEvents.achievementUnlocked);
      }
      if (parsedEvents.levelUp) {
        handleLevelUp(parsedEvents.levelUp);
      }
      if (parsedEvents.streakUpdated) {
        handleStreakUpdated(parsedEvents.streakUpdated);
      }
      if (parsedEvents.badgeEarned) {
        handleBadgeEarned(parsedEvents.badgeEarned);
      }
    }, [handlePointsEarned, handleAchievementUnlocked, handleLevelUp, handleStreakUpdated, handleBadgeEarned]),
    
    // Backend task completion events - matches ReceiveTaskCompletionEvent
    onReceiveTaskCompletionEvent: useCallback((event: BackendTaskCompletionEventDTO) => {
      const taskEvent = parseTaskCompletionEvent(event);
      handleTaskCompletionEvent(taskEvent);
    }, [handleTaskCompletionEvent]),
    
    // Backend family task completion - matches ReceiveFamilyTaskCompletion
    onReceiveFamilyTaskCompletion: useCallback((event: BackendTaskCompletionEventDTO) => {
      const taskEvent = parseTaskCompletionEvent(event);
      handleTaskCompletionEvent(taskEvent);
    }, [handleTaskCompletionEvent]),
    
    // Backend family activity events - matches ReceiveFamilyActivity
    onReceiveFamilyActivity: useCallback((event: BackendFamilyActivityEventDTO) => {
      const activityEvent = parseFamilyActivityEvent(event);
      handleFamilyActivity(activityEvent);
    }, [handleFamilyActivity]),
    
    // Backend family milestone events - matches ReceiveFamilyMilestone
    onReceiveFamilyMilestone: useCallback((event: BackendFamilyMilestoneEventDTO) => {
      const milestoneEvent = parseFamilyMilestoneEvent(event);
      handleFamilyMilestone(milestoneEvent);
    }, [handleFamilyMilestone])
  });

  // Auto-update configuration based on props changes
  useEffect(() => {
    setCelebrationConfig(prev => ({
      ...prev,
      familyBroadcastEnabled: !!familyId
    }));
  }, [familyId]);

  // ================================
  // RESPONSIVE POSITIONING HELPER
  // ================================
  
  const getCelebrationPosition = useCallback((index: number) => {
    const baseTop = responsive.isMobile ? 16 : 20; // Closer to top on mobile
    const cardHeight = responsive.isMobile ? 70 : 90; // Smaller cards on mobile
    const gap = responsive.isMobile ? 8 : 12;
    
    return {
      top: baseTop + (index * (cardHeight + gap)),
      right: responsive.isMobile ? 8 : 16,
      left: responsive.isMobile ? 8 : undefined // Center on mobile
    };
  }, [responsive.isMobile]);

  return (
    <div className={cn('enterprise-celebration-system relative', className)}>
      {/* Active Celebration Cards with Mobile-First Responsive Design */}
      {enableCelebrationCards && activeCelebrations.length > 0 && (
        <div 
          className={cn(
            "fixed z-50",
            // Responsive positioning
            responsive.isMobile && "inset-x-2 top-4",
            responsive.isTablet && "top-4 right-4 left-auto",
            responsive.isDesktop && "top-6 right-6 left-auto"
          )}
        >
          {activeCelebrations.map((celebration, index) => {
            const position = getCelebrationPosition(index);
            
            return (
              <TouchFeedback
                key={celebration.id}
                onPress={() => {
                  // Tap to trigger additional celebration effects
                  if (celebration.celebrationLevel >= 4) {
                    triggerEnterpriseConfetti(celebration.celebrationLevel, celebration.familyContext);
                  }
                }}
                onLongPress={() => dismissCelebration(celebration.id)}
                hapticPattern="medium"
              >
                <Card 
                  ref={(el) => {
                    if (el) {
                      celebrationCardsRef.current.set(celebration.id, el);
                    }
                  }}
                  className={cn(
                    celebrationCardClasses,
                    celebration.color,
                    "text-white border-0 shadow-2xl",
                    // Enhanced mobile animations
                    "animate-in slide-in-from-right-full duration-500",
                    responsive.isMobile && "slide-in-from-top-full",
                    // Hover/touch effects
                    "hover:scale-105 active:scale-95 transition-all",
                    // Touch optimization
                    "active:shadow-xl active:brightness-110"
                  )}
                  style={{
                    position: 'absolute',
                    top: `${position.top}px`,
                                         right: position.right ? `${position.right}px` : undefined,
                     left: position.left ? `${position.left}px` : undefined,
                    zIndex: 60 - index // Higher z-index for newer celebrations
                  }}
                  onTouchStart={(e) => handleTouchStart(e, celebration.id)}
                  onTouchMove={(e) => handleTouchMove(e, celebration.id)}
                  onTouchEnd={(e) => handleTouchEnd(e, celebration.id)}
                >
                  <CardContent 
                    className={cn(
                      "p-3 sm:p-4", // Responsive padding
                      responsive.isMobile && "p-2" // Tighter padding on mobile
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      {/* Main content area */}
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        {/* Icon - responsive sizing */}
                        <div 
                          className={cn(
                            "flex-shrink-0",
                            responsive.isMobile && "text-lg", // Smaller icons on mobile
                            responsive.isTablet && "text-xl",
                            responsive.isDesktop && "text-2xl"
                          )}
                        >
                          {celebration.icon}
                        </div>
                        
                        {/* Text content */}
                        <div className="flex-1 min-w-0">
                          <div 
                            className={cn(
                              "font-semibold mb-1 leading-tight",
                              responsive.isMobile && "text-sm",
                              responsive.isTablet && "text-base",
                              responsive.isDesktop && "text-base"
                            )}
                          >
                            {celebration.title}
                          </div>
                          <div 
                            className={cn(
                              "opacity-90 line-clamp-2 leading-tight",
                              responsive.isMobile && "text-xs",
                              responsive.isTablet && "text-sm",
                              responsive.isDesktop && "text-sm"
                            )}
                          >
                            {celebration.message}
                          </div>
                          
                          {/* Family context indicator */}
                          {celebration.familyContext?.isSharedCelebration && (
                            <div 
                              className={cn(
                                "flex items-center gap-1 mt-1.5",
                                responsive.isMobile && "mt-1"
                              )}
                            >
                              <Users 
                                className={cn(
                                  responsive.isMobile && "h-3 w-3",
                                  responsive.isTablet && "h-3.5 w-3.5",
                                  responsive.isDesktop && "h-4 w-4"
                                )} 
                              />
                              <span 
                                className={cn(
                                  "opacity-75",
                                  responsive.isMobile && "text-xs",
                                  responsive.isTablet && "text-xs",
                                  responsive.isDesktop && "text-sm"
                                )}
                              >
                                Family Celebration
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Action area - responsive */}
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        {/* Celebration level indicator */}
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "bg-white/20 text-white border-0",
                            responsive.isMobile && "text-xs px-1.5 py-0.5",
                            responsive.isTablet && "text-xs px-2 py-0.5",
                            responsive.isDesktop && "text-sm px-2 py-1"
                          )}
                        >
                          {celebration.celebrationLevel === 5 ? '🌟' : 
                           celebration.celebrationLevel === 4 ? '⭐' : 
                           celebration.celebrationLevel === 3 ? '✨' : 
                           celebration.celebrationLevel === 2 ? '💫' : '⚡'}
                        </Badge>
                        
                        {/* Touch-optimized dismiss button */}
                        <TouchFeedback
                          onPress={() => dismissCelebration(celebration.id)}
                          hapticPattern="light"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "text-white hover:bg-white/20 active:bg-white/30 border-0",
                              // Touch target sizing - 44px minimum
                              touchOptimized.buttonSize,
                              responsive.isMobile && "h-8 w-8 p-0 min-h-[44px] min-w-[44px]",
                              responsive.isTablet && "h-7 w-7 p-0",
                              responsive.isDesktop && "h-6 w-6 p-0"
                            )}
                            aria-label="Dismiss celebration"
                          >
                            <X 
                              className={cn(
                                responsive.isMobile && "h-4 w-4",
                                responsive.isTablet && "h-3.5 w-3.5",
                                responsive.isDesktop && "h-3 w-3"
                              )} 
                            />
                          </Button>
                        </TouchFeedback>
                      </div>
                    </div>
                    
                    {/* Swipe indicator for mobile */}
                    {responsive.isMobile && (
                      <div className="flex justify-center mt-2 opacity-50">
                        <div className="h-1 w-8 bg-white/30 rounded-full"></div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TouchFeedback>
            );
          })}
        </div>
      )}

      {/* Mobile Tutorial Overlay (First Time) */}
      {responsive.isMobile && activeCelebrations.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="absolute top-20 left-4 right-4 bg-black/80 text-white p-3 rounded-lg text-sm animate-in fade-in-50 duration-1000">
            <div className="text-center">
              <div className="font-medium mb-1">🎉 Celebration Tips</div>
              <div className="text-xs opacity-90">
                Tap to celebrate again • Swipe to dismiss • Long press for quick dismiss
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Information (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          className={cn(
            "fixed bg-black/80 text-white p-2 rounded text-xs max-w-xs",
            responsive.isMobile && "bottom-2 left-2 right-2 max-w-none",
            responsive.isTablet && "bottom-4 left-4",
            responsive.isDesktop && "bottom-4 left-4"
          )}
        >
          <div className="space-y-1">
            <div className="font-medium">🎉 Enterprise Celebration System</div>
            <div className="grid grid-cols-2 gap-x-4 text-xs">
              <div>User: {userId || 'None'}</div>
              <div>Family: {familyId || 'None'}</div>
              <div>Device: {responsive.deviceType}</div>
              <div>Touch: {responsive.hasTouch ? 'Yes' : 'No'}</div>
              <div>Age: {familyMemberAgeGroup}</div>
              <div>Intensity: {celebrationIntensity}</div>
              <div>Active: {activeCelebrations.length}</div>
              <div>Particles: {intensityAdjustedConfig.confettiSettings.particleCount}</div>
            </div>
            <div className="text-xs opacity-75 mt-2">
              Screen: {responsive.width}×{responsive.height} • 
              Orientation: {responsive.orientation}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 