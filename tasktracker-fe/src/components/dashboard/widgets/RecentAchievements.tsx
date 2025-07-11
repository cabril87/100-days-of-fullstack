'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Recent Achievements Widget
 * Displays recent achievement unlocks with celebration animations and real-time updates.
 * Connects to the gamification SignalR system for live achievement notifications.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Star, 
  Zap, 
  Calendar,
  TrendingUp
} from 'lucide-react';
import { RecentAchievementsProps } from '@/lib/props/widgets/main.props';

export function RecentAchievements({ 
  userId, 
  maxDisplay = 3,
  className = '',
  isConnected = false,
  gamificationData
}: RecentAchievementsProps) {
  // Use shared gamification data (always provided from Dashboard)
  const {
    totalAchievements = 0,
    recentAchievements = [],
    isLoading = false
  } = gamificationData || {};

  // Use shared connection status
  const connectionStatus = isConnected;

  // Animation state for new achievements
  const [celebratingAchievements, setCelebratingAchievements] = useState<Set<number>>(new Set());

  // Handle new achievement celebrations
  useEffect(() => {
    const achievementCelebrations = recentAchievements.filter(achievement => 
      new Date(achievement.timestamp).getTime() > Date.now() - 60000 // Last minute
    );
    
    achievementCelebrations.forEach(celebration => {
      // Use timestamp as unique ID for animation
      const celebrationId = celebration.timestamp.getTime();
      setCelebratingAchievements(prev => new Set([...prev, celebrationId]));
      
      // Remove celebration animation after duration
      setTimeout(() => {
        setCelebratingAchievements(prev => {
          const newSet = new Set(prev);
          newSet.delete(celebrationId);
          return newSet;
        });
      }, 3000);
    });
  }, [recentAchievements]);

  // Format achievement date
  const formatDate = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
  };

  // Get achievement rarity color
  const getRarityColor = (points: number) => {
    if (points >= 100) return 'text-purple-600 dark:text-purple-400'; // Legendary
    if (points >= 50) return 'text-orange-600 dark:text-orange-400';  // Epic
    if (points >= 25) return 'text-blue-600 dark:text-blue-400';      // Rare
    return 'text-green-600 dark:text-green-400';                      // Common
  };

  // Get achievement icon based on points/type
  const getAchievementIcon = (achievementName: string, points: number) => {
    const name = achievementName.toLowerCase();
    
    if (name.includes('task') || name.includes('complete')) return '✅';
    if (name.includes('streak') || name.includes('daily')) return '🔥';
    if (name.includes('family') || name.includes('team')) return '👨‍👩‍👧‍👦';
    if (name.includes('focus') || name.includes('time')) return '⏰';
    if (name.includes('perfect') || name.includes('master')) return '💎';
    if (points >= 100) return '🏆';
    if (points >= 50) return '🥇';
    if (points >= 25) return '🥈';
    return '🥉';
  };

  const displayAchievements = recentAchievements.slice(0, maxDisplay);

  return (
    <Card className={`${className} transition-all duration-300 hover:shadow-lg border-2 border-purple-200 dark:border-purple-700 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/10 dark:via-blue-900/10 dark:to-indigo-900/10`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-700 dark:text-purple-300">
          <div className="p-1 bg-purple-100 dark:bg-purple-900/20 rounded-full">
            <Trophy className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          Recent Achievements
          {/* Real-time connection indicator */}
          <div className={`w-2 h-2 rounded-full ${connectionStatus ? 'bg-green-500 animate-pulse' : 'bg-red-400 animate-pulse'}`} />
        </CardTitle>
        <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 border-purple-300 dark:border-purple-600">
          {totalAchievements || 0} Total
        </Badge>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Loading State */}
          {isLoading && userId && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
            </div>
          )}

          {/* No User State */}
          {!userId && !isLoading && (
            <div className="text-center py-8 space-y-3">
              <div className="text-4xl opacity-50">👤</div>
              <div className="text-sm text-muted-foreground">
                Sign in to view achievements
              </div>
            </div>
          )}

          {/* No Achievements State */}
          {!isLoading && displayAchievements.length === 0 && (
            <div className="text-center py-8 space-y-3">
              <div className="text-4xl opacity-50">🏆</div>
              <div className="text-sm text-muted-foreground">
                No achievements yet
              </div>
              <div className="text-xs text-muted-foreground">
                Complete tasks and reach milestones to unlock achievements!
              </div>
            </div>
          )}

          {/* Achievement List */}
          {displayAchievements.map((achievement, index) => {
            const achievementId = achievement.timestamp.getTime();
            const isCelebrating = celebratingAchievements.has(achievementId);
            
            return (
              <div
                key={`${achievement.achievementId}-${index}`}
                className={`
                  relative p-3 rounded-lg border transition-all duration-500
                  ${isCelebrating 
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-600 scale-105 shadow-lg' 
                    : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 dark:from-gray-900/50 dark:to-slate-900/50 dark:border-gray-700'
                  }
                `}
              >
                {/* Celebration Sparkles */}
                {isCelebrating && (
                  <div className="absolute top-1 right-1">
                    <Zap className="h-4 w-4 text-yellow-500 animate-pulse" />
                  </div>
                )}

                <div className="flex items-start gap-3">
                  {/* Achievement Icon */}
                  <div className="text-2xl">
                    {getAchievementIcon(achievement.achievementName, achievement.points)}
                  </div>

                  {/* Achievement Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium text-sm truncate ${getRarityColor(achievement.points)}`}>
                        {achievement.achievementName}
                      </h4>
                      <Badge variant="secondary" className="text-xs flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        +{achievement.points}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(achievement.timestamp)}</span>
                    </div>
                  </div>
                </div>

                {/* New Achievement Indicator */}
                {isCelebrating && (
                  <div className="absolute -top-1 -right-1">
                    <Badge variant="destructive" className="text-xs animate-bounce">
                      NEW!
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}

          {/* View All Button */}
          {totalAchievements > maxDisplay && (
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center gap-2"
              onClick={() => {
                // Navigate to full achievements page
                window.location.href = '/gamification';
              }}
            >
              View All {totalAchievements} Achievements
              <TrendingUp className="h-3 w-3" />
            </Button>
          )}

          {/* Achievement Progress Hint */}
          {!isLoading && totalAchievements < 5 && (
            <div className="text-center py-2">
              <div className="text-xs text-muted-foreground">
                💡 Complete more tasks to unlock achievements!
              </div>
            </div>
          )}

          {/* Connection Status */}
          {!connectionStatus && !isLoading && (
            <div className="text-xs text-amber-600 dark:text-amber-400 text-center py-2">
              ⚠️ Offline - New achievements will appear when reconnected
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
