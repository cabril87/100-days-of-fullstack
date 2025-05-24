'use client';

import React from 'react';
import Link from 'next/link';
import { useGamification } from '@/lib/providers/GamificationProvider';
import { cn } from '@/lib/utils';
import { 
  Trophy, 
  Star, 
  Flame,
  Award,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PointsBadge, LevelBadge, StreakBadge } from './PointsBadge';
import { DailyLogin } from './DailyLogin';

interface GamificationWidgetProps {
  className?: string;
  showDailyLogin?: boolean;
  showQuickActions?: boolean;
}

export function GamificationWidget({
  className,
  showDailyLogin = true,
  showQuickActions = true
}: GamificationWidgetProps) {
  const { 
    userProgress, 
    achievements,
    dailyLoginStatus,
    isLoading,
    error 
  } = useGamification();

  if (isLoading) {
    return (
      <Card className={cn(className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Your Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn(className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedAchievements = achievements.filter(a => a.isCompleted).length;
  const inProgressAchievements = achievements.filter(a => !a.isCompleted && a.achievement.currentProgress > 0).length;

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Your Progress
          </CardTitle>
          <Link href="/gamification">
            <Button variant="ghost" size="sm">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <CardDescription>
          Level up by completing tasks and achievements
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Badges */}
        <div className="flex flex-wrap gap-2">
          <PointsBadge size="sm" />
          <LevelBadge size="sm" />
          {userProgress && userProgress.currentStreak > 0 && (
            <StreakBadge size="sm" />
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Tasks</span>
            </div>
            <div className="text-lg font-bold text-blue-900">
              {userProgress?.tasksCompleted || 0}
            </div>
            <div className="text-xs text-blue-700">completed</div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-3 border border-emerald-200">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-900">Achievements</span>
            </div>
            <div className="text-lg font-bold text-emerald-900">
              {completedAchievements}
            </div>
            <div className="text-xs text-emerald-700">unlocked</div>
          </div>
        </div>

        {/* Daily Login Section */}
        {showDailyLogin && dailyLoginStatus && (
          <div className="border-t pt-3">
            <DailyLogin compact />
          </div>
        )}

        {/* Progress Indicator */}
        {inProgressAchievements > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-amber-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm text-amber-900">
                  {inProgressAchievements} achievement{inProgressAchievements !== 1 ? 's' : ''} in progress
                </h4>
                <p className="text-xs text-amber-700">
                  Keep going to unlock more rewards!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {showQuickActions && (
          <div className="flex gap-2 pt-2 border-t">
            <Link href="/gamification" className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                View Dashboard
              </Button>
            </Link>
            <Link href="/tasks" className="flex-1">
              <Button size="sm" className="w-full">
                Complete Tasks
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 