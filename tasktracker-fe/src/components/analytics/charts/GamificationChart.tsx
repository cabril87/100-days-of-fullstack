'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { GamificationChartProps } from '@/lib/props/components/analytics.props';

export function GamificationChart({ 
  data, 
  timeRange,
  className 
}: GamificationChartProps) {
  // Defensive programming: Handle undefined data with fallback values
  const safeLevelProgress = data?.levelProgress || {
    currentPoints: 0,
    pointsToNextLevel: 100,
    progressPercentage: 0
  };

  const safeData = {
    totalPoints: data?.totalPoints ?? 0,
    currentLevel: data?.currentLevel ?? 1,
    currentStreak: data?.currentStreak ?? 0,
    longestStreak: data?.longestStreak ?? 0,
    badgesEarned: data?.badgesEarned ?? 0,
    achievementsUnlocked: data?.achievementsUnlocked ?? 0,
    pointsHistory: data?.pointsHistory ?? {},
    levelProgress: safeLevelProgress
  };

  // Convert points history to array for visualization
  const pointsData = Object.entries(safeData.pointsHistory).map(([key, value]) => ({
    label: key,
    value: typeof value === 'number' ? value : 0,
    date: new Date(key)
  })).sort((a, b) => a.date.getTime() - b.date.getTime());

  const maxPoints = pointsData.length > 0 ? Math.max(...pointsData.map(d => d.value)) : 100;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Level Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium">Level Progress</h4>
          <Badge variant="default">Level {safeData.currentLevel}</Badge>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{safeData.levelProgress.currentPoints} points</span>
            <span>{safeData.levelProgress.pointsToNextLevel} to next level</span>
          </div>
          <Progress 
            value={safeData.levelProgress.progressPercentage} 
            className="h-3"
          />
        </div>
      </div>

      {/* Gamification Stats Grid */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="space-y-1">
          <p className="text-xl font-bold text-yellow-600">{safeData.totalPoints.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Points</p>
        </div>
        <div className="space-y-1">
          <p className="text-xl font-bold text-purple-600">{safeData.badgesEarned}</p>
          <p className="text-xs text-muted-foreground">Badges Earned</p>
        </div>
        <div className="space-y-1">
          <p className="text-xl font-bold text-green-600">{safeData.currentStreak}</p>
          <p className="text-xs text-muted-foreground">Current Streak</p>
        </div>
        <div className="space-y-1">
          <p className="text-xl font-bold text-blue-600">{safeData.achievementsUnlocked}</p>
          <p className="text-xs text-muted-foreground">Achievements</p>
        </div>
      </div>

      {/* Points History Chart */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Points History ({timeRange})</h4>
        <div className="space-y-1">
          {pointsData.slice(-7).map((point, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-xs w-16 text-muted-foreground">
                {point.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <div className="flex-1">
                <Progress 
                  value={maxPoints > 0 ? (point.value / maxPoints) * 100 : 0} 
                  className="h-3"
                />
              </div>
              <span className="text-xs w-12 text-right font-medium">
                {point.value}pts
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Streak Information */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Streak Performance</h4>
        <div className="flex justify-between items-center p-2 bg-muted rounded-lg">
          <div className="text-center">
            <p className="text-sm font-bold">{safeData.currentStreak}</p>
            <p className="text-xs text-muted-foreground">Current</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-orange-600">{safeData.longestStreak}</p>
            <p className="text-xs text-muted-foreground">Best Ever</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold">
              {safeData.currentStreak >= safeData.longestStreak ? '🔥' : safeData.currentStreak > 0 ? '⚡' : '💤'}
            </p>
            <p className="text-xs text-muted-foreground">Status</p>
          </div>
        </div>
      </div>

      {/* Gamification Insights */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Achievement Insights</h4>
        <div className="space-y-1 text-xs text-muted-foreground">
          {safeData.currentStreak >= safeData.longestStreak && safeData.currentStreak > 0 && (
            <p className="text-green-600">🏆 New personal best streak! Keep it going!</p>
          )}
          {safeData.currentStreak >= 7 && (
            <p className="text-blue-600">🔥 On fire! 1 week streak achieved</p>
          )}
          {safeData.currentStreak >= 30 && (
            <p className="text-purple-600">🚀 Incredible dedication! 30+ day streak</p>
          )}
          {safeData.levelProgress.progressPercentage > 80 && (
            <p className="text-yellow-600">⭐ Almost leveled up! {safeData.levelProgress.pointsToNextLevel} points to go</p>
          )}
          {safeData.badgesEarned > 10 && (
            <p className="text-indigo-600">🎖️ Badge collector! {safeData.badgesEarned} badges earned</p>
          )}
        </div>
      </div>
    </div>
  );
} 
