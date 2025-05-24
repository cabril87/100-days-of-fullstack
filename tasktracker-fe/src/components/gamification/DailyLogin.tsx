'use client';

import React from 'react';
import { useGamification } from '@/lib/providers/GamificationProvider';
import { cn } from '@/lib/utils';
import { 
  Calendar,
  Gift,
  Flame,
  Star,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PointsBadge, StreakBadge } from './PointsBadge';

interface DailyLoginProps {
  className?: string;
  compact?: boolean;
}

export function DailyLogin({
  className,
  compact = false
}: DailyLoginProps) {
  const { 
    dailyLoginStatus,
    userProgress,
    claimDailyReward,
    refreshDailyLoginStatus,
    isLoading,
    error 
  } = useGamification();

  const handleClaimReward = async () => {
    try {
      await claimDailyReward();
    } catch (err) {
      console.error('Failed to claim daily reward:', err);
    }
  };

  if (isLoading || !dailyLoginStatus) {
    return (
      <Card className={cn(className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Daily Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn(className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Daily Login</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-600 text-sm">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshDailyLoginStatus}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {dailyLoginStatus.hasClaimedToday ? (
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Claimed today</span>
          </div>
        ) : (
          <Button size="sm" onClick={handleClaimReward}>
            <Gift className="h-4 w-4 mr-2" />
            Claim {dailyLoginStatus.todayReward} pts
          </Button>
        )}
        {dailyLoginStatus.currentStreak > 0 && (
          <StreakBadge size="sm" value={dailyLoginStatus.currentStreak} />
        )}
      </div>
    );
  }

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          Daily Login
        </CardTitle>
        <CardDescription>
          Login daily to maintain your streak and earn rewards
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className={cn(
          "p-4 rounded-lg border",
          dailyLoginStatus.hasClaimedToday 
            ? "bg-emerald-50 border-emerald-200" 
            : "bg-blue-50 border-blue-200"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {dailyLoginStatus.hasClaimedToday ? (
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Gift className="h-5 w-5 text-blue-600" />
                </div>
              )}
              
              <div>
                <h3 className="font-medium text-sm">
                  {dailyLoginStatus.hasClaimedToday 
                    ? "Today's reward claimed!" 
                    : "Daily reward available"}
                </h3>
                <p className="text-xs text-gray-600">
                  {dailyLoginStatus.hasClaimedToday 
                    ? "Come back tomorrow for more rewards" 
                    : `Claim ${dailyLoginStatus.todayReward} points`}
                </p>
              </div>
            </div>
            
            {!dailyLoginStatus.hasClaimedToday && (
              <Button onClick={handleClaimReward}>
                <Gift className="h-4 w-4 mr-2" />
                Claim
              </Button>
            )}
          </div>
        </div>

        {/* Streak Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Current Streak</span>
            </div>
            <div className="text-lg font-bold text-orange-900">
              {dailyLoginStatus.currentStreak}
            </div>
            <div className="text-xs text-orange-700">days</div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-3 border border-amber-200">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-900">Next Reward</span>
            </div>
            <div className="text-lg font-bold text-amber-900">
              {dailyLoginStatus.nextReward}
            </div>
            <div className="text-xs text-amber-700">points</div>
          </div>
        </div>

        {/* Streak Bonus Info */}
        {dailyLoginStatus.streakBonus && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Flame className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-sm text-purple-900">Streak Bonus Active!</h4>
                <p className="text-xs text-purple-700">
                  You're earning bonus points for your login streak
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="text-center text-xs text-gray-500 pt-2 border-t">
          <div className="flex items-center justify-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Resets daily at midnight</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 