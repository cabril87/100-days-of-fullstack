'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Streak Counter Widget
 * Displays productivity streaks with fire effects and motivational messages.
 * Connects to the gamification SignalR system for real-time streak updates.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Flame, Target, Zap } from 'lucide-react';
import { useGamificationEvents } from '@/lib/hooks/useGamificationEvents';

interface StreakCounterProps {
  userId: number;
  className?: string;
}

export function StreakCounter({ userId, className = '' }: StreakCounterProps) {
  const {
    currentStreak,
    isLoading,
    isConnected
  } = useGamificationEvents(userId);

  // Animation state for streak updates
  const [isAnimating, setIsAnimating] = useState(false);
  const [previousStreak, setPreviousStreak] = useState(currentStreak);

  // Animate when streak changes
  useEffect(() => {
    if (currentStreak > previousStreak && previousStreak > 0) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000);
    }
    setPreviousStreak(currentStreak);
  }, [currentStreak, previousStreak]);

  // Calculate streak milestones and progress
  const getNextMilestone = (streak: number) => {
    const milestones = [3, 7, 14, 30, 60, 100, 365];
    return milestones.find(milestone => milestone > streak) || (streak + 100);
  };

  const getPreviousMilestone = (streak: number) => {
    const milestones = [0, 3, 7, 14, 30, 60, 100, 365];
    return milestones.reverse().find(milestone => milestone <= streak) || 0;
  };

  const nextMilestone = getNextMilestone(currentStreak);
  const previousMilestone = getPreviousMilestone(currentStreak);
  const progressToNext = ((currentStreak - previousMilestone) / (nextMilestone - previousMilestone)) * 100;

  // Get streak status and motivation
  const getStreakStatus = (streak: number) => {
    if (streak === 0) return { 
      status: 'Start Your Journey', 
      color: 'text-gray-500', 
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      message: 'Complete a task today to start your streak!' 
    };
    if (streak < 3) return { 
      status: 'Getting Started', 
      color: 'text-green-600', 
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      message: 'Keep going! You\'re building momentum.' 
    };
    if (streak < 7) return { 
      status: 'Building Momentum', 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      message: 'Great progress! You\'re forming a habit.' 
    };
    if (streak < 14) return { 
      status: 'Week Warrior', 
      color: 'text-orange-600', 
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      message: 'Amazing! You\'ve built a solid routine.' 
    };
    if (streak < 30) return { 
      status: 'Streak Master', 
      color: 'text-red-600', 
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      message: 'Incredible dedication! You\'re on fire!' 
    };
    if (streak < 60) return { 
      status: 'Productivity Legend', 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      message: 'Legendary! Your consistency is inspiring.' 
    };
    if (streak < 100) return { 
      status: 'Habit Guru', 
      color: 'text-indigo-600', 
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
      message: 'You\'ve mastered the art of consistency!' 
    };
    return { 
      status: 'Streak Deity', 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      message: 'Unbelievable! You\'re a productivity inspiration!' 
    };
  };

  const streakInfo = getStreakStatus(currentStreak);

  // Get fire intensity based on streak
  const getFireIntensity = (streak: number) => {
    if (streak === 0) return '🌱';
    if (streak < 3) return '🔥';
    if (streak < 7) return '🔥🔥';
    if (streak < 14) return '🔥🔥🔥';
    if (streak < 30) return '🔥🔥🔥🔥';
    return '🔥🔥🔥🔥🔥';
  };

  // Get achievement badges based on streak
  const getStreakBadges = (streak: number) => {
    const badges = [];
    if (streak >= 3) badges.push({ icon: '🎯', title: '3-Day Starter' });
    if (streak >= 7) badges.push({ icon: '⚡', title: 'Week Warrior' });
    if (streak >= 14) badges.push({ icon: '💪', title: 'Two Week Champion' });
    if (streak >= 30) badges.push({ icon: '👑', title: 'Month Master' });
    if (streak >= 60) badges.push({ icon: '💎', title: 'Diamond Dedication' });
    if (streak >= 100) badges.push({ icon: '🏆', title: 'Century Club' });
    if (streak >= 365) badges.push({ icon: '🌟', title: 'Year Legend' });
    return badges;
  };

  const streakBadges = getStreakBadges(currentStreak);

  return (
    <Card className={`${className} transition-all duration-300 hover:shadow-lg ${isAnimating ? 'scale-105 shadow-2xl' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500" />
          Productivity Streak
          {/* Real-time connection indicator */}
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
        </CardTitle>
        <Badge variant="outline" className={`text-xs ${streakInfo.color}`}>
          {streakInfo.status}
        </Badge>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Main Streak Display */}
          <div className={`text-center p-4 rounded-lg ${streakInfo.bgColor} transition-all duration-500`}>
            <div className="text-4xl mb-2">
              {getFireIntensity(currentStreak)}
            </div>
            <div 
              className={`text-3xl font-bold transition-all duration-500 ${
                isLoading ? 'text-gray-400 animate-pulse' : 
                isAnimating ? `${streakInfo.color} scale-110` : streakInfo.color
              }`}
            >
              {isLoading ? '...' : currentStreak}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {currentStreak === 1 ? 'Day Streak' : 'Days Streak'}
            </p>
          </div>

          {/* Motivational Message */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground italic">
              {streakInfo.message}
            </p>
          </div>

          {/* Progress to Next Milestone */}
          {currentStreak > 0 && nextMilestone && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{previousMilestone} days</span>
                <span className="text-center font-medium">
                  {nextMilestone - currentStreak} days to {nextMilestone}
                </span>
                <span>{nextMilestone} days</span>
              </div>
              <Progress 
                value={progressToNext} 
                className="h-2"
                style={{
                  background: `linear-gradient(90deg, 
                    hsl(15, 70%, 50%) 0%, 
                    hsl(30, 70%, 50%) 50%, 
                    hsl(45, 70%, 50%) 100%)`
                }}
              />
              <div className="text-center">
                <Badge variant="secondary" className="text-xs">
                  <Target className="h-3 w-3 mr-1" />
                  Next: {nextMilestone} Day Milestone
                </Badge>
              </div>
            </div>
          )}

          {/* Streak Statistics */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-md">
              <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                {Math.max(currentStreak, 1)}
              </div>
              <div className="text-xs text-muted-foreground">Current</div>
            </div>
            <div className="p-2 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-md">
              <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {nextMilestone}
              </div>
              <div className="text-xs text-muted-foreground">Next Goal</div>
            </div>
          </div>

          {/* Achievement Badges */}
          {streakBadges.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground text-center">
                Streak Achievements
              </div>
              <div className="flex flex-wrap gap-1 justify-center">
                                  {streakBadges.slice(-3).map((badge) => (
                    <Badge 
                      key={badge.title} 
                      variant="secondary" 
                      className="text-xs flex items-center gap-1"
                    >
                      <span>{badge.icon}</span>
                      <span>{badge.title}</span>
                    </Badge>
                  ))}
              </div>
            </div>
          )}

          {/* Call to Action */}
          {currentStreak === 0 && (
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center gap-2"
              onClick={() => {
                // Navigate to task creation
                window.location.href = '/tasks';
              }}
            >
              <Zap className="h-3 w-3" />
              Start Your Streak Today!
            </Button>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
            </div>
          )}

          {/* Connection Status */}
          {!isConnected && !isLoading && (
            <div className="text-xs text-amber-600 dark:text-amber-400 text-center py-2">
              ⚠️ Offline - Streak will sync when reconnected
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 