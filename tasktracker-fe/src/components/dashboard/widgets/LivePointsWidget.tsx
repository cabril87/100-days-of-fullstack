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
import { useGamificationEvents } from '@/lib/hooks/useGamificationEvents';

interface LivePointsWidgetProps {
  userId: number;
  className?: string;
}

export function LivePointsWidget({ userId, className = '' }: LivePointsWidgetProps) {
  const {
    currentPoints,
    currentLevel,
    isLoading,
    isConnected,
    recentPointsEarned
  } = useGamificationEvents(userId);

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
    <Card className={`${className} transition-all duration-300 hover:shadow-lg ${isAnimating ? 'scale-105 shadow-2xl' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500" />
          Points & Level
          {/* Real-time connection indicator */}
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
        </CardTitle>
        <Badge variant="outline" className="text-xs">
          Level {isLoading ? '...' : currentLevel}
        </Badge>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Main Points Display */}
          <div className="flex items-center justify-between">
            <div>
              <div 
                className={`text-2xl font-bold transition-all duration-500 ${
                  isLoading ? 'text-gray-400 animate-pulse' : 
                  isAnimating ? 'text-yellow-600 scale-110' : 'text-blue-600'
                }`}
                data-points-counter="true"
              >
                {isLoading ? '...' : currentPoints.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total Points</p>
            </div>
            
            {/* Level progress indicator */}
            <div className="text-right">
              <div className="text-sm font-medium">
                {progressInCurrentLevel}/100
              </div>
              <p className="text-xs text-muted-foreground">to Level {currentLevel + 1}</p>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Level {currentLevel}</span>
              <span>Level {currentLevel + 1}</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2"
              style={{
                background: `linear-gradient(90deg, 
                  hsl(220, 70%, 50%) 0%, 
                  hsl(250, 70%, 50%) 50%, 
                  hsl(280, 70%, 50%) 100%)`
              }}
            />
          </div>

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4 text-green-500" />
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
                    <div className="flex items-center gap-2">
                      <Zap className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs text-muted-foreground truncate max-w-32">
                        {activity.reason}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
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
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Connection Status */}
          {!isConnected && !isLoading && (
            <div className="text-xs text-amber-600 dark:text-amber-400 text-center py-2">
              ⚠️ Offline - Points will sync when reconnected
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 