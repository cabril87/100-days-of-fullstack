'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Live Points Widget
 * Real-time points display with animations, level progression, and celebration effects.
 * Connects to the gamification SignalR system for live updates.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, TrendingUp, Zap, Crown } from 'lucide-react';
import { LivePointsWidgetProps } from '@/lib/types/widget-props';

export function LivePointsWidget({ 
  userId, 
  className = '',
  isConnected = false,
  gamificationData
}: LivePointsWidgetProps) {
  // Use shared gamification data (always provided from Dashboard)
  const {
    currentPoints = 0,
    currentLevel = 1,
    isLoading = false,
    recentPointsEarned = []
  } = gamificationData || {};

  // Use shared connection status
  const connectionStatus = isConnected;

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [previousPoints, setPreviousPoints] = useState(currentPoints);

  // Calculate level progression
  const pointsForCurrentLevel = (currentLevel - 1) * 100;
  const progressInCurrentLevel = currentPoints - pointsForCurrentLevel;
  const progressPercentage = (progressInCurrentLevel / 100) * 100;

  // Animate when points change
  useEffect(() => {
    if (currentPoints > previousPoints && previousPoints > 0) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }
    setPreviousPoints(currentPoints);
  }, [currentPoints, previousPoints]);

  // Calculate recent activity stats
  const recentPointsTotal = recentPointsEarned.reduce((sum, event) => sum + event.points, 0);
  const recentActivity = recentPointsEarned.slice(0, 3); // Last 3 activities

  return (
    <Card className={`${className} transition-all duration-300 hover:shadow-lg border-2 ${isAnimating ? 'scale-105 shadow-2xl border-yellow-300' : 'border-blue-200 dark:border-blue-700'} bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/10 dark:via-orange-900/10 dark:to-red-900/10`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
          <div className="p-1 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
            <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          Points & Level
          {/* Real-time connection indicator */}
          <div className={`w-2 h-2 rounded-full ${connectionStatus ? 'bg-green-500 animate-pulse' : 'bg-red-400 animate-pulse'}`} />
        </CardTitle>
        <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 border-yellow-300 dark:border-yellow-600">
          Level {isLoading ? '...' : currentLevel}
        </Badge>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {/* Main Points Display */}
          <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-yellow-100 via-orange-100 to-red-100 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 rounded-lg border-2 border-yellow-200 dark:border-yellow-700">
            <div className="text-3xl sm:text-4xl mb-2">⭐</div>
            <div 
              className={`text-2xl sm:text-3xl font-bold transition-all duration-500 ${
                isLoading ? 'text-gray-400 animate-pulse' : 
                isAnimating ? 'text-yellow-600 scale-110 drop-shadow-lg animate-bounce' : 'text-yellow-600 dark:text-yellow-400'
              }`}
              data-points-counter="true"
            >
              {isLoading ? '...' : currentPoints.toLocaleString()}
            </div>
            <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300 font-medium">Total Points</p>
            
            {/* Level progress indicator */}
            <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-yellow-200 dark:border-yellow-700">
              <div className="flex items-center justify-between text-xs text-yellow-600 dark:text-yellow-400">
                <span className="font-medium">Level {currentLevel}</span>
                <span className="font-medium">{progressInCurrentLevel}/100</span>
                <span className="font-medium">Level {currentLevel + 1}</span>
              </div>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="space-y-2 p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex justify-between text-xs font-medium text-blue-700 dark:text-blue-300">
              <span>🎯 Level Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2 sm:h-3 bg-blue-100 dark:bg-blue-900/20"
            />
            <div className="text-center">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {100 - progressInCurrentLevel} XP to Level {currentLevel + 1}
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                Recent Activity
                {recentPointsTotal > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    +{recentPointsTotal} today
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1">
                {recentActivity.map((activity, index) => (
                  <div
                    key={`${activity.timestamp}-${index}`}
                    className="flex items-center justify-between p-2 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 rounded-md"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Zap className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground truncate">
                        {activity.reason}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                      +{activity.points}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievement Milestones */}
          <div className="flex flex-wrap gap-1">
            {currentLevel >= 5 && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Expert
              </Badge>
            )}
            {currentPoints >= 1000 && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <Star className="h-3 w-3" />
                1K Club
              </Badge>
            )}
            {currentPoints >= 5000 && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Elite
              </Badge>
            )}
          </div>

          {/* Loading State */}
          {isLoading && userId && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* No User State */}
          {!userId && !isLoading && (
            <div className="text-center py-4 space-y-2">
              <div className="text-2xl opacity-50">👤</div>
              <div className="text-sm text-muted-foreground">
                Sign in to track points
              </div>
            </div>
          )}

          {/* Connection Status */}
          {!connectionStatus && !isLoading && (
            <div className="text-xs text-amber-600 dark:text-amber-400 text-center py-2">
              ⚠️ Offline - Points will sync when reconnected
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 