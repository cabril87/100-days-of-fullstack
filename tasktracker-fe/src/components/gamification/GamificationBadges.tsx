'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, Award, Flame, Trophy, ChevronLeft, ChevronRight, Calendar, Target, Medal, Zap } from 'lucide-react';
import { GamificationBadgesProps } from '@/lib/types/ui';
import { TouchFeedback } from '@/components/calendar/MobileCalendarEnhancements';
import { useResponsive, useTouchOptimized } from '@/lib/hooks/useResponsive';
import { useMobileGestures, triggerHapticFeedback } from '@/lib/hooks/useMobileGestures';
import { cn } from '@/lib/helpers/utils/utils';

// Enhanced badge categories with more comprehensive badge types
const BADGE_CATEGORIES = [
  {
    id: 'core',
    name: 'Core Stats',
    icon: Star,
    badges: ['points', 'level', 'achievements', 'streak']
  },
  {
    id: 'achievements',
    name: 'Achievements',
    icon: Trophy,
    badges: ['recent', 'featured', 'rare', 'legendary']
  },
  {
    id: 'activity',
    name: 'Activity',
    icon: Zap,
    badges: ['daily', 'weekly', 'monthly', 'yearly']
  },
  {
    id: 'special',
    name: 'Special',
    icon: Medal,
    badges: ['seasonal', 'limited', 'community', 'milestones']
  }
];

// Skeleton version for loading states with enhanced touch targets
export function GamificationBadgesSkeleton() {
  const { buttonSize } = useTouchOptimized();
  
  return (
    <div className="flex items-center gap-2 py-2">
      <div className={cn(
        "bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse",
        buttonSize,
        "w-16"
      )} />
      <div className={cn(
        "bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse",
        buttonSize,
        "w-20"
      )} />
      <div className={cn(
        "bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse",
        buttonSize,
        "w-24"
      )} />
    </div>
  );
}

export function GamificationBadges({ user, streakDays = 0, achievements = 0 }: GamificationBadgesProps) {
  const level = Math.floor(user.points / 100) + 1;
  
  // Mobile-first responsive state
  const responsive = useResponsive();
  const { touchClasses, buttonSize, animationClasses } = useTouchOptimized();
  const [currentCategory, setCurrentCategory] = useState(0);
  const [isPressed, setIsPressed] = useState<string | null>(null);
  const [showAllBadges, setShowAllBadges] = useState(false);
  
  // Container ref for gesture attachment
  const containerRef = useRef<HTMLDivElement>(null);

  // Enhanced mobile gestures for swipe navigation between categories
  const mobileGestures = useMobileGestures({
    onSwipe: useCallback((gesture: { direction: 'left' | 'right' | 'up' | 'down'; distance: number; velocity: number; duration: number }) => {
      if (!responsive.isMobile) return;
      
      if (gesture.direction === 'left' && currentCategory < BADGE_CATEGORIES.length - 1) {
        setCurrentCategory(prev => prev + 1);
        triggerHapticFeedback('light');
      } else if (gesture.direction === 'right' && currentCategory > 0) {
        setCurrentCategory(prev => prev - 1);
        triggerHapticFeedback('light');
      }
    }, [currentCategory, responsive.isMobile]),
    
    onLongPress: useCallback(() => {
      // Long press to show all badges
      setShowAllBadges(prev => !prev);
      triggerHapticFeedback('heavy');
    }, []),
    
    onTap: useCallback(() => {
      // Tap for interaction feedback
      triggerHapticFeedback('light');
    }, []),
  }, {
    swipeThreshold: 50,
    longPressTimeout: 500,
    enableHaptic: true
  });

  // Attach gestures to container
  useEffect(() => {
    if (containerRef.current) {
      mobileGestures.attachGestures(containerRef.current);
    }
  }, [mobileGestures]);

  // Handle category navigation
  const navigateCategory = useCallback((direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? Math.min(currentCategory + 1, BADGE_CATEGORIES.length - 1)
      : Math.max(currentCategory - 1, 0);
    
    setCurrentCategory(newIndex);
    triggerHapticFeedback('medium');
  }, [currentCategory]);

  // Handle badge press interactions
  const handleBadgePress = useCallback((badgeType: string) => {
    setIsPressed(badgeType);
    triggerHapticFeedback('light');
    
    // Reset press state after animation
    setTimeout(() => setIsPressed(null), 150);
  }, []);

  // Handle achievement celebration
  const handleAchievementCelebration = useCallback(() => {
    triggerHapticFeedback('heavy');
    // Additional celebration logic can be added here
  }, []);

  // Calculate extended stats for enhanced badges
  const extendedStats = {
    weeklyGoal: Math.min(100, Math.round((user.points % 1000) / 10)),
    monthlyStreak: Math.floor(streakDays / 7),
    totalTasks: Math.floor(user.points / 10), // Estimate tasks from points
    efficiency: Math.min(100, Math.round(75 + (achievements * 2.5))), // Calculated efficiency
  };

  // Get badges for current category
  const getCurrentCategoryBadges = () => {
    const category = BADGE_CATEGORIES[currentCategory];
    
    switch (category.id) {
      case 'core':
        return [
          {
            key: 'points',
            icon: Star,
            label: `${user?.points?.toLocaleString() || '0'} pts`,
            variant: 'default' as const,
            color: 'blue'
          },
          {
            key: 'level',
            icon: Award,
            label: `Level ${level}`,
            variant: 'secondary' as const,
            color: 'purple'
          },
          ...(achievements > 0 ? [{
            key: 'achievements',
            icon: Trophy,
            label: `${achievements} achievements`,
            variant: 'default' as const,
            color: 'emerald'
          }] : []),
          ...(streakDays > 0 ? [{
            key: 'streak',
            icon: Flame,
            label: `${streakDays} days`,
            variant: 'default' as const,
            color: 'orange'
          }] : [])
        ];
        
      case 'achievements':
        return [
          ...(achievements > 0 ? [{
            key: 'recent-achievement',
            icon: Trophy,
            label: 'Recent Achievement',
            variant: 'default' as const,
            color: 'yellow'
          }] : []),
          ...(achievements >= 5 ? [{
            key: 'achiever',
            icon: Medal,
            label: 'Achiever',
            variant: 'secondary' as const,
            color: 'indigo'
          }] : []),
          ...(achievements >= 10 ? [{
            key: 'master',
            icon: Star,
            label: 'Master',
            variant: 'default' as const,
            color: 'purple'
          }] : [])
        ];
        
      case 'activity':
        return [
          ...(extendedStats.weeklyGoal > 50 ? [{
            key: 'weekly-goal',
            icon: Target,
            label: `${extendedStats.weeklyGoal}% Weekly`,
            variant: 'secondary' as const,
            color: 'green'
          }] : []),
          ...(extendedStats.totalTasks > 20 ? [{
            key: 'productive',
            icon: Zap,
            label: 'Productive',
            variant: 'default' as const,
            color: 'blue'
          }] : []),
          ...(extendedStats.efficiency > 80 ? [{
            key: 'efficient',
            icon: Award,
            label: `${extendedStats.efficiency}% Efficient`,
            variant: 'secondary' as const,
            color: 'cyan'
          }] : [])
        ];
        
      case 'special':
        return [
          ...(streakDays >= 7 ? [{
            key: 'week-warrior',
            icon: Calendar,
            label: 'Week Warrior',
            variant: 'default' as const,
            color: 'pink'
          }] : []),
          ...(level >= 5 ? [{
            key: 'level-master',
            icon: Star,
            label: 'Level Master',
            variant: 'secondary' as const,
            color: 'violet'
          }] : []),
          ...(user.points >= 1000 ? [{
            key: 'thousand-club',
            icon: Medal,
            label: '1K Club',
            variant: 'default' as const,
            color: 'gold'
          }] : [])
        ];
        
      default:
        return [];
    }
  };

  const currentBadges = getCurrentCategoryBadges();
  const visibleBadges = showAllBadges ? currentBadges : currentBadges.slice(0, responsive.isMobile ? 2 : 4);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex flex-col gap-3 py-2",
        touchClasses
      )}
    >
      {/* Mobile category navigation */}
      {responsive.isMobile && BADGE_CATEGORIES.length > 1 && (
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2">
          <TouchFeedback 
            onPress={() => navigateCategory('prev')}
            hapticPattern="light"
          >
            <button
              className={cn(
                "flex items-center justify-center rounded-md bg-white dark:bg-gray-800 shadow-sm transition-all duration-200",
                buttonSize,
                touchClasses,
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95"
              )}
              disabled={currentCategory === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </TouchFeedback>
          
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
              {React.createElement(BADGE_CATEGORIES[currentCategory].icon, { className: "h-4 w-4" })}
              {BADGE_CATEGORIES[currentCategory].name}
            </div>
            <div className="flex gap-1 mt-1">
              {BADGE_CATEGORIES.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-300",
                    index === currentCategory 
                      ? "bg-blue-500" 
                      : "bg-gray-300 dark:bg-gray-600"
                  )}
                />
              ))}
            </div>
          </div>
          
          <TouchFeedback 
            onPress={() => navigateCategory('next')}
            hapticPattern="light"
          >
            <button
              className={cn(
                "flex items-center justify-center rounded-md bg-white dark:bg-gray-800 shadow-sm transition-all duration-200",
                buttonSize,
                touchClasses,
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95"
              )}
              disabled={currentCategory === BADGE_CATEGORIES.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </TouchFeedback>
        </div>
      )}

      {/* Enhanced badges with proper touch targets */}
      <div className="flex flex-wrap gap-2">
        {visibleBadges.map((badge) => {
          const Icon = badge.icon;
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
            purple: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
            emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800',
            orange: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
            yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
            indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800',
            green: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
            cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800',
            pink: 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800',
            violet: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800',
            gold: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800'
          };

          return (
            <TouchFeedback 
              key={badge.key}
              onPress={() => handleBadgePress(badge.key)}
              onLongPress={() => {
                if (badge.key === 'achievements' || badge.key === 'recent-achievement') {
                  handleAchievementCelebration();
                } else {
                  triggerHapticFeedback('medium');
                }
              }}
              hapticPattern="light"
            >
              <Badge 
                variant={badge.variant}
                className={cn(
                  "cursor-pointer transition-all duration-200 flex items-center gap-1.5",
                  colorClasses[badge.color as keyof typeof colorClasses],
                  touchClasses,
                  animationClasses,
                  buttonSize, // Ensure 44px minimum touch target
                  "active:scale-95 hover:scale-105",
                  isPressed === badge.key && "scale-95 shadow-md"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{badge.label}</span>
              </Badge>
            </TouchFeedback>
          );
        })}

        {/* Show more/less toggle for non-mobile or when there are more badges */}
        {(currentBadges.length > (responsive.isMobile ? 2 : 4)) && (
          <TouchFeedback 
            onPress={() => {
              setShowAllBadges(prev => !prev);
              triggerHapticFeedback('medium');
            }}
            hapticPattern="medium"
          >
            <Badge 
              variant="outline"
              className={cn(
                "cursor-pointer transition-all duration-200 border-dashed",
                "bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100",
                "dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-800/50",
                touchClasses,
                animationClasses,
                buttonSize,
                "active:scale-95 hover:scale-105"
              )}
            >
              {showAllBadges ? '← Less' : `+${currentBadges.length - (responsive.isMobile ? 2 : 4)} More`}
            </Badge>
          </TouchFeedback>
        )}
      </div>

      {/* Mobile gesture indicator */}
      {responsive.isMobile && BADGE_CATEGORIES.length > 1 && (
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-0.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
            <span>Swipe for more • Long press for details</span>
            <div className="w-6 h-0.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
} 
