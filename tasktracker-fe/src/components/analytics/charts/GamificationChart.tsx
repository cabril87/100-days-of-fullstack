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
import { GamificationChartProps } from '@/lib/types/analytics';

export function GamificationChart({ 
  data, 
  timeRange,
  className 
}: GamificationChartProps) {
  const { 
    totalPoints, 
    currentLevel, 
    currentStreak, 
    longestStreak,
    badgesEarned,
    achievementsUnlocked,
    pointsHistory,
    levelProgress 
  } = data;

  // Convert points history to array for visualization
  const pointsData = Object.entries(pointsHistory).map(([key, value]) => ({
    label: key,
    value: value,
    date: new Date(key)
  })).sort((a, b) => a.date.getTime() - b.date.getTime());

  const maxPoints = Math.max(...pointsData.map(d => d.value));

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Level Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium">Level Progress</h4>
          <Badge variant="default">Level {currentLevel}</Badge>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{levelProgress.currentPoints} points</span>
            <span>{levelProgress.pointsToNextLevel} to next level</span>
          </div>
          <Progress 
            value={levelProgress.progressPercentage} 
            className="h-3"
          />
        </div>
      </div>

      {/* Gamification Stats Grid */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="space-y-1">
          <p className="text-xl font-bold text-yellow-600">{totalPoints.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Points</p>
        </div>
        <div className="space-y-1">
          <p className="text-xl font-bold text-purple-600">{badgesEarned}</p>
          <p className="text-xs text-muted-foreground">Badges Earned</p>
        </div>
        <div className="space-y-1">
          <p className="text-xl font-bold text-green-600">{currentStreak}</p>
          <p className="text-xs text-muted-foreground">Current Streak</p>
        </div>
        <div className="space-y-1">
          <p className="text-xl font-bold text-blue-600">{achievementsUnlocked}</p>
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
            <p className="text-sm font-bold">{currentStreak}</p>
            <p className="text-xs text-muted-foreground">Current</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-orange-600">{longestStreak}</p>
            <p className="text-xs text-muted-foreground">Best Ever</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold">
              {currentStreak >= longestStreak ? '🔥' : currentStreak > 0 ? '⚡' : '💤'}
            </p>
            <p className="text-xs text-muted-foreground">Status</p>
          </div>
        </div>
      </div>

      {/* Gamification Insights */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Achievement Insights</h4>
        <div className="space-y-1 text-xs text-muted-foreground">
          {currentStreak >= longestStreak && currentStreak > 0 && (
            <p className="text-green-600">🏆 New personal best streak! Keep it going!</p>
          )}
          {currentStreak >= 7 && (
            <p className="text-blue-600">🔥 On fire! 1 week streak achieved</p>
          )}
          {currentStreak >= 30 && (
            <p className="text-purple-600">🚀 Incredible dedication! 30+ day streak</p>
          )}
          {levelProgress.progressPercentage > 80 && (
            <p className="text-yellow-600">⭐ Almost leveled up! {levelProgress.pointsToNextLevel} points to go</p>
          )}
          {badgesEarned > 10 && (
            <p className="text-indigo-600">🎖️ Badge collector! {badgesEarned} badges earned</p>
          )}
        </div>
      </div>
    </div>
  );
} 