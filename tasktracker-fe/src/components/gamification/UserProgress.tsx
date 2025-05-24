'use client';

import React from 'react';
import { useGamification } from '@/lib/providers/GamificationProvider';
import { cn } from '@/lib/utils';
import { 
  Star, 
  Award, 
  Zap, 
  Trophy, 
  Flame,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PointsBadge, LevelBadge, StreakBadge } from './PointsBadge';
import { LevelProgressBar } from './ProgressBar';

interface UserProgressProps {
  className?: string;
  showTitle?: boolean;
  compact?: boolean;
  showRefresh?: boolean;
}

export function UserProgress({
  className,
  showTitle = true,
  compact = false,
  showRefresh = false
}: UserProgressProps) {
  const { 
    userProgress, 
    isLoadingProgress, 
    refreshUserProgress,
    error 
  } = useGamification();

  if (isLoadingProgress) {
    return (
      <Card className={cn(className)}>
        {showTitle && (
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Progress</CardTitle>
          </CardHeader>
        )}
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn(className)}>
        {showTitle && (
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Progress</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-600 text-sm">{error}</p>
            {showRefresh && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshUserProgress}
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userProgress) {
    return (
      <Card className={cn(className)}>
        {showTitle && (
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Progress</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">No progress data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <PointsBadge size="sm" />
        <LevelBadge size="sm" />
        {userProgress.currentStreak > 0 && <StreakBadge size="sm" />}
      </div>
    );
  }

  return (
    <Card className={cn(className)}>
      {showTitle && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Your Progress</CardTitle>
            {showRefresh && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refreshUserProgress}
                disabled={isLoadingProgress}
              >
                <RefreshCw className={cn(
                  "h-4 w-4",
                  isLoadingProgress && "animate-spin"
                )} />
              </Button>
            )}
          </div>
          <CardDescription>
            Track your achievements and level up!
          </CardDescription>
        </CardHeader>
      )}
      
      <CardContent className="space-y-4">
        {/* Badges Row */}
        <div className="flex flex-wrap gap-2">
          <PointsBadge />
          <LevelBadge />
          {userProgress.currentStreak > 0 && <StreakBadge />}
        </div>
        
        {/* Level Progress */}
        <div className="space-y-2">
          <LevelProgressBar />
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Tasks</span>
            </div>
            <div className="text-lg font-bold text-blue-900">
              {userProgress.tasksCompleted || 0}
            </div>
            <div className="text-xs text-blue-700">completed</div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-3 border border-amber-200">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-900">Best Streak</span>
            </div>
            <div className="text-lg font-bold text-amber-900">
              {userProgress.highestStreak}
            </div>
            <div className="text-xs text-amber-700">days</div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
          <div className="flex items-center gap-1">
            <Award className="h-3 w-3" />
            <span>{userProgress.badgesEarned || 0} badges earned</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>Level {userProgress.currentLevel}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 