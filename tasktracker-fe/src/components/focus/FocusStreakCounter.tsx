'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Flame, 
  Zap, 
  Star, 
  Calendar,
  TrendingUp,
  Trophy
} from 'lucide-react';
import { focusService } from '@/lib/services/focusService';
import { FocusStreakData } from '@/lib/types/focus';

interface FocusStreakCounterProps {
  className?: string;
  compact?: boolean;
}

export function FocusStreakCounter({ className, compact = false }: FocusStreakCounterProps) {
  const [streakData, setStreakData] = useState<FocusStreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStreakData();
  }, []);

  const loadStreakData = async () => {
    try {
      setLoading(true);
      const response = await focusService.getProductivityInsights();
      
      if (response.data) {
        setStreakData(response.data.streakData);
      }
    } catch (err) {
      console.error('Error loading streak data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStreakIcon = (streak: number) => {
    if (streak >= 30) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (streak >= 14) return <Flame className="h-5 w-5 text-orange-500" />;
    if (streak >= 7) return <Zap className="h-5 w-5 text-blue-500" />;
    if (streak >= 3) return <Star className="h-5 w-5 text-purple-500" />;
    return <Calendar className="h-5 w-5 text-gray-500" />;
  };

  const getStreakMessage = (streak: number) => {
    if (streak >= 30) return "Legendary focus master! 🏆";
    if (streak >= 14) return "You're on fire! 🔥";
    if (streak >= 7) return "Great momentum! ⚡";
    if (streak >= 3) return "Building a habit! ⭐";
    if (streak >= 1) return "Good start! 📅";
    return "Start your streak today!";
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return "text-yellow-600";
    if (streak >= 14) return "text-orange-600";
    if (streak >= 7) return "text-blue-600";
    if (streak >= 3) return "text-purple-600";
    return "text-gray-600";
  };

  const getNextMilestone = (streak: number) => {
    if (streak < 3) return { target: 3, label: "Habit Builder" };
    if (streak < 7) return { target: 7, label: "Week Warrior" };
    if (streak < 14) return { target: 14, label: "Flame Keeper" };
    if (streak < 30) return { target: 30, label: "Focus Master" };
    if (streak < 60) return { target: 60, label: "Dedication Legend" };
    return { target: 100, label: "Ultimate Focus" };
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!streakData) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Complete focus sessions to start your streak!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const nextMilestone = getNextMilestone(streakData.currentStreak);
  const progressToNext = (streakData.currentStreak / nextMilestone.target) * 100;

  if (compact) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        {getStreakIcon(streakData.currentStreak)}
        <div>
          <div className="flex items-center space-x-2">
            <span className={`font-bold text-lg ${getStreakColor(streakData.currentStreak)}`}>
              {streakData.currentStreak}
            </span>
            <Badge variant="outline" className="text-xs">
              {streakData.currentStreak === 1 ? 'day' : 'days'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {getStreakMessage(streakData.currentStreak)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Focus Streak</CardTitle>
        {getStreakIcon(streakData.currentStreak)}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Streak */}
          <div>
            <div className="flex items-baseline space-x-2">
              <span className={`text-3xl font-bold ${getStreakColor(streakData.currentStreak)}`}>
                {streakData.currentStreak}
              </span>
              <span className="text-sm text-muted-foreground">
                {streakData.currentStreak === 1 ? 'day' : 'days'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {getStreakMessage(streakData.currentStreak)}
            </p>
          </div>

          {/* Progress to Next Milestone */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Next: {nextMilestone.label}</span>
              <span>{streakData.currentStreak}/{nextMilestone.target}</span>
            </div>
            <Progress value={progressToNext} className="h-2" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div>
              <div className="text-sm font-medium">Longest</div>
              <div className="text-lg font-bold text-blue-600">
                {streakData.longestStreak}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Quality</div>
              <div className="text-lg font-bold text-yellow-600">
                {streakData.qualityStreak}
              </div>
            </div>
          </div>

          {/* Impact */}
          {streakData.streakImpactOnProductivity !== 0 && (
            <div className="pt-2 border-t">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  <span className="font-medium">
                    {streakData.streakImpactOnProductivity > 0 ? '+' : ''}
                    {streakData.streakImpactOnProductivity.toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground ml-1">productivity impact</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 