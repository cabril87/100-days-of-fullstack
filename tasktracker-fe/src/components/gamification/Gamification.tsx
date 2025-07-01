'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Trophy, Flame, Target, Wifi, WifiOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { UseGamificationEventsReturn, AchievementUnlockedEvent } from '@/lib/types/gamification';
import { TouchFeedback } from '@/components/calendar/MobileCalendarEnhancements';
import { useResponsive, useTouchOptimized } from '@/lib/hooks/useResponsive';
import { useMobileGestures } from '@/lib/hooks/useMobileGestures';
import { triggerHapticFeedback } from '@/components/search/MobileSearchEnhancements';
import { cn } from '@/lib/utils/utils';

interface GamificationProps {
  user: { id: number; username: string; email: string };
  gamificationData: UseGamificationEventsReturn;
  isConnected: boolean;
}

// Enhanced gamification card categories for swipe navigation
const CARD_CATEGORIES = [
  {
    id: 'overview',
    name: 'Overview',
    cards: ['achievements', 'points', 'streak', 'badges']
  },
  {
    id: 'progress',
    name: 'Progress',
    cards: ['level', 'experience', 'goals', 'milestones']
  },
  {
    id: 'social',
    name: 'Social',
    cards: ['leaderboard', 'friends', 'challenges', 'teams']
  }
];

export default function Gamification({ gamificationData, isConnected }: GamificationProps) {
  const {
    currentPoints = 0,
    currentLevel = 1,
    currentStreak = 0,
    totalAchievements = 0,
    totalBadges = 0,
    recentAchievements = [],
    isLoading = false
  } = gamificationData;

  // Mobile-first responsive state
  const responsive = useResponsive();
  const { touchClasses, buttonSize, animationClasses } = useTouchOptimized();
  const [currentCategory, setCurrentCategory] = useState(0);
  const [isPressed, setIsPressed] = useState<string | null>(null);

  // Container ref for gesture attachment
  const containerRef = useRef<HTMLDivElement>(null);

  // Enhanced mobile gestures for swipe navigation
  const mobileGestures = useMobileGestures({
    onSwipe: useCallback((gesture: { direction: 'left' | 'right' | 'up' | 'down'; distance: number; velocity: number; duration: number }) => {
      if (!responsive.isMobile) return;
      
      if (gesture.direction === 'left' && currentCategory < CARD_CATEGORIES.length - 1) {
        setCurrentCategory(prev => prev + 1);
        triggerHapticFeedback('light');
      } else if (gesture.direction === 'right' && currentCategory > 0) {
        setCurrentCategory(prev => prev - 1);
        triggerHapticFeedback('light');
      }
    }, [currentCategory, responsive.isMobile]),
    
    onLongPress: useCallback(() => {
      // Long press for additional context menu in future
      triggerHapticFeedback('heavy');
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
      ? Math.min(currentCategory + 1, CARD_CATEGORIES.length - 1)
      : Math.max(currentCategory - 1, 0);
    
    setCurrentCategory(newIndex);
    triggerHapticFeedback('medium');
  }, [currentCategory]);

  // Handle card press interactions
  const handleCardPress = useCallback((cardType: string) => {
    setIsPressed(cardType);
    triggerHapticFeedback('light');
    
    // Reset press state after animation
    setTimeout(() => setIsPressed(null), 150);
  }, []);

  // Handle achievement unlock celebration
  const handleAchievementCelebration = useCallback((achievement: AchievementUnlockedEvent) => {
    triggerHapticFeedback('heavy');
    // Additional celebration logic can be added here
  }, []);

  return (
    <div 
      ref={containerRef}
      className="max-w-6xl mx-auto space-y-6"
    >
      {/* Page Header with enhanced touch targets */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            🎮 Gamification Hub
            {/* Real-time connection indicator with proper touch target */}
            <TouchFeedback 
              onPress={() => {
                triggerHapticFeedback('light');
                console.log('Connection status:', isConnected ? 'Connected' : 'Disconnected');
              }}
              hapticPattern="light"
            >
              <div className={cn(
                "flex items-center gap-2 text-sm rounded-lg px-3 py-2 transition-all duration-200",
                buttonSize,
                touchClasses,
                "hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95",
                isConnected 
                  ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20" 
                  : "text-gray-400 bg-gray-50 dark:bg-gray-900/20"
              )}>
                {isConnected ? (
                  <>
                    <Wifi className="h-4 w-4" />
                    <span>Live</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4" />
                    <span>Offline</span>
                  </>
                )}
              </div>
            </TouchFeedback>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Earn points, unlock achievements, and level up your productivity
          </p>
        </div>
        
        {/* Enhanced live points counter with touch feedback */}
        <TouchFeedback 
          onPress={() => handleCardPress('points-header')}
          hapticPattern="medium"
        >
          <Badge 
            variant="secondary" 
            className={cn(
              "text-lg px-4 py-2 transition-all duration-300 cursor-pointer",
              buttonSize,
              touchClasses,
              "hover:scale-105 active:scale-95",
              isPressed === 'points-header' && "scale-95"
            )}
          >
            ⭐ {isLoading ? '...' : currentPoints.toLocaleString()} Points
          </Badge>
        </TouchFeedback>
      </div>

      {/* Mobile category navigation */}
      {responsive.isMobile && (
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          <TouchFeedback 
            onPress={() => navigateCategory('prev')}
            hapticPattern="light"
          >
            <button
              className={cn(
                "flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 shadow-sm transition-all duration-200",
                buttonSize,
                touchClasses,
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95"
              )}
              disabled={currentCategory === 0}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </TouchFeedback>
          
          <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-white">
              {CARD_CATEGORIES[currentCategory].name}
            </div>
            <div className="flex gap-1 mt-1">
              {CARD_CATEGORIES.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
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
                "flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 shadow-sm transition-all duration-200",
                buttonSize,
                touchClasses,
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95"
              )}
              disabled={currentCategory === CARD_CATEGORIES.length - 1}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </TouchFeedback>
        </div>
      )}

      {/* Enhanced cards grid with proper touch targets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Achievements Card with enhanced touch interaction */}
        <TouchFeedback 
          onPress={() => handleCardPress('achievements')}
          onLongPress={() => {
            triggerHapticFeedback('heavy');
            // Could open achievement details modal
          }}
          hapticPattern="medium"
        >
          <Card className={cn(
            "border-dashed border-2 border-yellow-300 dark:border-yellow-600 cursor-pointer transition-all duration-300",
            touchClasses,
            animationClasses,
            "hover:scale-105 hover:shadow-lg active:scale-95",
            isPressed === 'achievements' && "scale-95 shadow-lg",
            // Ensure minimum touch target size
            "min-h-[180px]"
          )}>
            <CardHeader className="text-center pb-3">
              <div className={cn(
                "mx-auto mb-2 p-3 rounded-full bg-yellow-50 dark:bg-yellow-900/20 transition-all duration-300",
                buttonSize, // Ensures 44px minimum for icon container
                "hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
              )}>
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
              <CardTitle className="text-xl">Achievements</CardTitle>
              <CardDescription>
                Unlock badges and rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <div className={cn(
                "text-3xl font-bold mb-2 transition-all duration-300",
                isLoading ? 'text-gray-400 dark:text-gray-600 animate-pulse' : 
                totalAchievements > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400 dark:text-gray-600'
              )}>
                {isLoading ? '...' : totalAchievements}
              </div>
              <p className="text-sm text-gray-500">
                {totalAchievements === 1 ? 'Achievement Unlocked' : 'Achievements Unlocked'}
              </p>
              {recentAchievements.length > 0 && (
                <div className="mt-2">
                  <TouchFeedback 
                    onPress={() => handleAchievementCelebration(recentAchievements[0])}
                    hapticPattern="heavy"
                  >
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs cursor-pointer transition-all duration-200",
                        "hover:bg-yellow-50 dark:hover:bg-yellow-900/20 active:scale-95",
                        buttonSize // Ensure proper touch target
                      )}
                    >
                      Recent: {recentAchievements[0].achievementName}
                    </Badge>
                  </TouchFeedback>
                </div>
              )}
            </CardContent>
          </Card>
        </TouchFeedback>

        {/* Points Card with enhanced touch interaction */}
        <TouchFeedback 
          onPress={() => handleCardPress('points')}
          onLongPress={() => {
            triggerHapticFeedback('heavy');
            // Could show points breakdown
          }}
          hapticPattern="medium"
        >
          <Card className={cn(
            "border-dashed border-2 border-blue-300 dark:border-blue-600 cursor-pointer transition-all duration-300",
            touchClasses,
            animationClasses,
            "hover:scale-105 hover:shadow-lg active:scale-95",
            isPressed === 'points' && "scale-95 shadow-lg",
            "min-h-[180px]"
          )}>
            <CardHeader className="text-center pb-3">
              <div className={cn(
                "mx-auto mb-2 p-3 rounded-full bg-blue-50 dark:bg-blue-900/20 transition-all duration-300",
                buttonSize,
                "hover:bg-blue-100 dark:hover:bg-blue-900/30"
              )}>
                <Star className="h-8 w-8 text-blue-500" />
              </div>
              <CardTitle className="text-xl">Points & Level</CardTitle>
              <CardDescription>
                Earn points for completing tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <div className={cn(
                "text-3xl font-bold mb-2 transition-all duration-300",
                isLoading ? 'text-gray-400 dark:text-gray-600 animate-pulse' : 'text-blue-600 dark:text-blue-400'
              )}>
                {isLoading ? '...' : currentPoints.toLocaleString()}
              </div>
              <p className="text-sm text-gray-500">Total Points Earned</p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <TouchFeedback 
                  onPress={() => {
                    triggerHapticFeedback('light');
                    // Could show level progression
                  }}
                  hapticPattern="light"
                >
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-sm cursor-pointer transition-all duration-200",
                      "hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-95",
                      buttonSize
                    )}
                  >
                    Level {isLoading ? '...' : currentLevel}
                  </Badge>
                </TouchFeedback>
              </div>
            </CardContent>
          </Card>
        </TouchFeedback>

        {/* Streak Card with enhanced touch interaction */}
        <TouchFeedback 
          onPress={() => handleCardPress('streak')}
          onLongPress={() => {
            triggerHapticFeedback('heavy');
            // Could show streak calendar
          }}
          hapticPattern="medium"
        >
          <Card className={cn(
            "border-dashed border-2 border-orange-300 dark:border-orange-600 cursor-pointer transition-all duration-300",
            touchClasses,
            animationClasses,
            "hover:scale-105 hover:shadow-lg active:scale-95",
            isPressed === 'streak' && "scale-95 shadow-lg",
            "min-h-[180px]"
          )}>
            <CardHeader className="text-center pb-3">
              <div className={cn(
                "mx-auto mb-2 p-3 rounded-full bg-orange-50 dark:bg-orange-900/20 transition-all duration-300",
                buttonSize,
                "hover:bg-orange-100 dark:hover:bg-orange-900/30"
              )}>
                <Flame className="h-8 w-8 text-orange-500" />
              </div>
              <CardTitle className="text-xl">Streak</CardTitle>
              <CardDescription>
                Daily productivity streak
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <div className={cn(
                "text-3xl font-bold mb-2 transition-all duration-300",
                isLoading ? 'text-gray-400 dark:text-gray-600 animate-pulse' : 
                currentStreak > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400 dark:text-gray-600'
              )}>
                {isLoading ? '...' : currentStreak}
              </div>
              <p className="text-sm text-gray-500">
                {currentStreak === 1 ? 'Day Streak' : 'Days Streak'}
              </p>
              {currentStreak >= 7 && (
                <div className="mt-2">
                  <TouchFeedback 
                    onPress={() => {
                      triggerHapticFeedback('heavy');
                      // Celebrate streak milestone
                    }}
                    hapticPattern="heavy"
                  >
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs bg-orange-50 dark:bg-orange-900/20 cursor-pointer transition-all duration-200",
                        "hover:bg-orange-100 dark:hover:bg-orange-900/30 active:scale-95",
                        buttonSize
                      )}
                    >
                      🔥 On Fire!
                    </Badge>
                  </TouchFeedback>
                </div>
              )}
            </CardContent>
          </Card>
        </TouchFeedback>

        {/* Badges Card with enhanced touch interaction */}
        <TouchFeedback 
          onPress={() => handleCardPress('badges')}
          onLongPress={() => {
            triggerHapticFeedback('heavy');
            // Could open badge collection
          }}
          hapticPattern="medium"
        >
          <Card className={cn(
            "border-dashed border-2 border-purple-300 dark:border-purple-600 cursor-pointer transition-all duration-300",
            touchClasses,
            animationClasses,
            "hover:scale-105 hover:shadow-lg active:scale-95",
            isPressed === 'badges' && "scale-95 shadow-lg",
            "min-h-[180px]"
          )}>
            <CardHeader className="text-center pb-3">
              <div className={cn(
                "mx-auto mb-2 p-3 rounded-full bg-purple-50 dark:bg-purple-900/20 transition-all duration-300",
                buttonSize,
                "hover:bg-purple-100 dark:hover:bg-purple-900/30"
              )}>
                <Target className="h-8 w-8 text-purple-500" />
              </div>
              <CardTitle className="text-xl">Badges</CardTitle>
              <CardDescription>
                Collect special badges
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <div className={cn(
                "text-3xl font-bold mb-2 transition-all duration-300",
                isLoading ? 'text-gray-400 dark:text-gray-600 animate-pulse' : 
                totalBadges > 0 ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-gray-600'
              )}>
                {isLoading ? '...' : totalBadges}
              </div>
              <p className="text-sm text-gray-500">
                {totalBadges === 1 ? 'Badge Earned' : 'Badges Earned'}
              </p>
            </CardContent>
          </Card>
        </TouchFeedback>
      </div>

      {/* Enhanced Status Section with touch feedback */}
      <TouchFeedback 
        onPress={() => {
          triggerHapticFeedback('medium');
          // Could show connection details or retry connection
        }}
        hapticPattern="medium"
      >
        <Card className={cn(
          "border-dashed border-2 border-green-300 dark:border-green-600 cursor-pointer transition-all duration-300",
          touchClasses,
          animationClasses,
          "hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]",
          // Ensure minimum touch target for the entire status card
          "min-h-[120px]"
        )}>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              {isConnected ? '🚀 Real-Time Active' : '⚠️ Offline Mode'}
            </CardTitle>
            <CardDescription className="text-lg">
              {isConnected 
                ? 'Your gamification data updates in real-time!'
                : 'Tap to retry connection'
              }
            </CardDescription>
          </CardHeader>
        </Card>
      </TouchFeedback>

      {/* Mobile gesture indicator */}
      {responsive.isMobile && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            <span>Swipe left/right to navigate</span>
            <div className="w-8 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
} 