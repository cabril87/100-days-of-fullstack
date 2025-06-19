"use client";

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Enterprise Enhanced Celebration System
 * Comprehensive real-time gamification celebrations with family context
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md rules
 */

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { soundService } from '@/lib/services/soundService';
import { Crown, Trophy, Star, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSignalRConnectionManager } from '@/lib/hooks/useSignalRConnectionManager';
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

export default function EnhancedCelebrationSystem({
  userId,
  familyId,
  enableToasts = true,
  enableConfetti = true,
  enableCelebrationCards = true,
  enableSoundEffects = false, // Conservative default for family environments - TODO: implement sound effects
  celebrationIntensity = 'moderate',
  familyMemberAgeGroup = 'Adult',
  className = ''
}: EnhancedCelebrationSystemProps) {

  // Enterprise state management with explicit typing
  const [activeCelebrations, setActiveCelebrations] = useState<EnterpriseCelebrationNotification[]>([]);
  
  // Initialize sound service with current settings
  useEffect(() => {
    soundService.initialize(enableSoundEffects, 0.3, familyMemberAgeGroup);
  }, [enableSoundEffects, familyMemberAgeGroup]);
  const [celebrationConfig, setCelebrationConfig] = useState<EnterpriseCelebrationConfig>({
    confettiSettings: {
      particleCount: 100,
      spread: 70,
      startVelocity: 30,
      decay: 0.9,
      gravity: 1,
      colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7']
    },
    toastDuration: 4000,
    cardDuration: 6000,
    soundVolume: 0.3,
    maxConcurrentCelebrations: 3,
    familyBroadcastEnabled: true
  });

  // Age-appropriate celebration configuration
  const ageAppropriateConfig = useMemo((): EnterpriseCelebrationConfig => {
    const baseConfig = { ...celebrationConfig };
    
    switch (familyMemberAgeGroup) {
      case 'Child':
        return {
          ...baseConfig,
          confettiSettings: {
            ...baseConfig.confettiSettings,
            particleCount: 150,
            spread: 90,
            colors: ['#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43']
          },
          toastDuration: 6000,
          cardDuration: 8000,
          soundVolume: 0.4
        };
      case 'Teen':
        return {
          ...baseConfig,
          confettiSettings: {
            ...baseConfig.confettiSettings,
            particleCount: 120,
            spread: 80,
            colors: ['#6c5ce7', '#fd79a8', '#fdcb6e', '#e17055', '#74b9ff']
          },
          toastDuration: 5000,
          cardDuration: 7000,
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
        config.confettiSettings.particleCount = Math.floor(config.confettiSettings.particleCount * 1.5);
        config.toastDuration = Math.floor(config.toastDuration * 1.2);
        config.cardDuration = Math.floor(config.cardDuration * 1.2);
        config.maxConcurrentCelebrations = 5;
        break;
      case 'maximum':
        config.confettiSettings.particleCount = Math.floor(config.confettiSettings.particleCount * 2);
        config.toastDuration = Math.floor(config.toastDuration * 1.5);
        config.cardDuration = Math.floor(config.cardDuration * 1.5);
        config.maxConcurrentCelebrations = 8;
        break;
    }
    
    return config;
  }, [ageAppropriateConfig, celebrationIntensity]);

  // Enterprise confetti trigger with family context
  const triggerEnterpriseConfetti = useCallback((celebrationLevel: number, familyContext?: EnterpriseCelebrationNotification['familyContext']) => {
    if (!enableConfetti) return;

    const config = intensityAdjustedConfig.confettiSettings;
    const intensity = Math.min(celebrationLevel / 5, 1);
    
    // Base confetti burst
    confetti({
      particleCount: Math.floor(config.particleCount * intensity),
      spread: config.spread,
      startVelocity: config.startVelocity * intensity,
      decay: config.decay,
      gravity: config.gravity,
      colors: config.colors,
      origin: { x: 0.5, y: 0.7 }
    });

    // Family celebration enhancement
    if (familyContext?.isSharedCelebration && celebrationLevel >= 4) {
      // Additional side bursts for family celebrations
      setTimeout(() => {
        confetti({
          particleCount: Math.floor(config.particleCount * 0.6),
          spread: 60,
          startVelocity: 25,
          colors: config.colors,
          origin: { x: 0.2, y: 0.8 }
        });
      }, 200);
      
      setTimeout(() => {
        confetti({
          particleCount: Math.floor(config.particleCount * 0.6),
          spread: 60,
          startVelocity: 25,
          colors: config.colors,
          origin: { x: 0.8, y: 0.8 }
        });
      }, 400);
    }

    // Maximum level celebration (level 5)
    if (celebrationLevel === 5) {
      setTimeout(() => {
        confetti({
          particleCount: Math.floor(config.particleCount * 0.8),
          spread: 100,
          startVelocity: 35,
          colors: ['#ffd700', '#ffed4e', '#ff6b6b', '#4ecdc4'],
          origin: { x: 0.5, y: 0.3 }
        });
      }, 600);
    }
  }, [enableConfetti, intensityAdjustedConfig]);

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

  // Celebration card dismissal
  const dismissCelebration = useCallback((celebrationId: string) => {
    setActiveCelebrations(prev => prev.filter(c => c.id !== celebrationId));
  }, []);

  // Auto-update configuration based on props changes
  useEffect(() => {
    setCelebrationConfig(prev => ({
      ...prev,
      familyBroadcastEnabled: !!familyId
    }));
  }, [familyId]);

  return (
    <div className={`enterprise-celebration-system ${className}`}>
      {/* Active Celebration Cards */}
      {enableCelebrationCards && activeCelebrations.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
          {activeCelebrations.map((celebration) => (
            <Card 
              key={celebration.id} 
              className={`${celebration.color} text-white border-0 shadow-2xl animate-in slide-in-from-right-full duration-500 hover:scale-105 transition-transform`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0">
                      {celebration.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm mb-1">
                        {celebration.title}
                      </div>
                      <div className="text-xs opacity-90 line-clamp-2">
                        {celebration.message}
                      </div>
                      {celebration.familyContext?.isSharedCelebration && (
                        <div className="flex items-center gap-1 mt-2">
                          <Users className="h-3 w-3" />
                          <span className="text-xs opacity-75">Family Celebration</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge 
                      variant="secondary" 
                      className="bg-white/20 text-white text-xs px-1 py-0"
                    >
                      {celebration.celebrationLevel === 5 ? '🌟' : 
                       celebration.celebrationLevel === 4 ? '⭐' : 
                       celebration.celebrationLevel === 3 ? '✨' : 
                       celebration.celebrationLevel === 2 ? '💫' : '⚡'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissCelebration(celebration.id)}
                      className="h-6 w-6 p-0 text-white hover:bg-white/20"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Debug Information (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs max-w-xs">
          <div>🎉 Enterprise Celebration System</div>
          <div>User: {userId || 'None'}</div>
          <div>Family: {familyId || 'None'}</div>
          <div>Age Group: {familyMemberAgeGroup}</div>
          <div>Intensity: {celebrationIntensity}</div>
          <div>Active: {activeCelebrations.length}</div>
          <div>Config: {JSON.stringify(intensityAdjustedConfig.confettiSettings.particleCount)}</div>
        </div>
      )}
    </div>
  );
} 