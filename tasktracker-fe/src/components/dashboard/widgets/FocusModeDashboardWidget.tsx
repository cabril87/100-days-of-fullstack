'use client';

/*
 * Focus Mode Dashboard Widget
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { 
  Timer, 
  Play, 
  Target, 
  ArrowRight,
  Clock,
  Flame,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

interface FocusModeDashboardWidgetProps {
  userId?: number;
  className?: string;
}

interface FocusStats {
  todayFocusTime: number; // in minutes
  streakDays: number;
  sessionsCompleted: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

export function FocusModeDashboardWidget({ 
  userId, 
  className 
}: FocusModeDashboardWidgetProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [focusStats, setFocusStats] = useState<FocusStats>({
    todayFocusTime: 0,
    streakDays: 0,
    sessionsCompleted: 0,
    weeklyGoal: 300, // 5 hours per week
    weeklyProgress: 0
  });

  const loadFocusStats = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // Simulate loading focus stats (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual focus service call
      setFocusStats({
        todayFocusTime: Math.floor(Math.random() * 120), // 0-2 hours
        streakDays: Math.floor(Math.random() * 14), // 0-14 days
        sessionsCompleted: Math.floor(Math.random() * 8), // 0-8 sessions today
        weeklyGoal: 300, // 5 hours
        weeklyProgress: Math.floor(Math.random() * 300) // 0-300 minutes this week
      });
    } catch (error) {
      console.error('Failed to load focus stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadFocusStats();
  }, [loadFocusStats]);
  
  useEffect(() => {
    loadFocusStats();
  }, [loadFocusStats]);

  const navigateToFocus = () => {
    router.push('/focus');
  };

  const startQuickSession = () => {
    router.push('/focus?session=quick');
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getProgressPercentage = () => {
    return Math.min((focusStats.weeklyProgress / focusStats.weeklyGoal) * 100, 100);
  };

  const getStreakBadge = (streak: number) => {
    if (streak >= 7) return { icon: '🔥', label: 'On Fire!', color: 'bg-red-500' };
    if (streak >= 3) return { icon: '⭐', label: 'Great', color: 'bg-yellow-500' };
    if (streak >= 1) return { icon: '💪', label: 'Building', color: 'bg-blue-500' };
    return { icon: '🌱', label: 'Start', color: 'bg-green-500' };
  };

  const streakBadge = getStreakBadge(focusStats.streakDays);

  return (
    <Card className={`border-2 border-orange-200 dark:border-orange-700 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 shadow-lg hover:shadow-xl transition-all duration-300 ${className || ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Timer className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                Focus Sessions
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Boost your productivity
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
            FOCUS
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
          </div>
        ) : (
          <>
            {/* Today's Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Today</span>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatTime(focusStats.todayFocusTime)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">focused</div>
              </div>
              
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Sessions</span>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {focusStats.sessionsCompleted}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">completed</div>
              </div>
            </div>

            {/* Streak */}
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Focus Streak
                  </span>
                </div>
                <Badge className={`text-xs ${streakBadge.color}`}>
                  {streakBadge.icon} {streakBadge.label}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {focusStats.streakDays}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  days in a row
                </div>
              </div>
            </div>

            {/* Weekly Progress */}
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Weekly Goal
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(focusStats.weeklyProgress)} / {formatTime(focusStats.weeklyGoal)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {getProgressPercentage().toFixed(0)}% complete
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button 
                onClick={startQuickSession}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white transition-colors duration-200"
                size="sm"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Quick Session (25m)
              </Button>
              
              <Button 
                onClick={navigateToFocus}
                variant="outline"
                className="w-full transition-colors duration-200"
                size="sm"
              >
                <Target className="h-4 w-4 mr-2" />
                Open Focus Mode
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 
