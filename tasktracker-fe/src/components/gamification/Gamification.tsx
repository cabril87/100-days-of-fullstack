'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Target, Flame, Wifi, WifiOff } from 'lucide-react';
import { GamificationContentProps } from '@/lib/types/component-props';
import { useGamificationEvents } from '@/lib/hooks/useGamificationEvents';

export default function GamificationContent({ user }: GamificationContentProps) {
  // Connect to real-time gamification system
  const {
    currentPoints,
    currentLevel,
    currentStreak,
    totalAchievements,
    totalBadges,
    isLoading,
    isConnected,
    activeCelebrations,
    recentAchievements,
    hasRecentActivity,
    dismissCelebration,
    refreshGamificationData
  } = useGamificationEvents(user.id);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            🎮 Gamification Hub
            {/* Real-time connection indicator */}
            <div className="flex items-center gap-2 text-sm">
              {isConnected ? (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <Wifi className="h-4 w-4" />
                  <span>Live</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-gray-400">
                  <WifiOff className="h-4 w-4" />
                  <span>Offline</span>
                </div>
              )}
            </div>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Earn points, unlock achievements, and level up your productivity
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Live points counter with real-time updates */}
          <Badge 
            variant="secondary" 
            className="text-lg px-3 py-1 transition-all duration-300"
            data-points-counter="true"
          >
            ⭐ {isLoading ? '...' : currentPoints.toLocaleString()} Points
          </Badge>
          {/* Refresh button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshGamificationData}
            disabled={isLoading}
          >
            {isLoading ? '⟳' : '↻'} Refresh
          </Button>
        </div>
      </div>

      {/* Achievement Celebrations */}
      {activeCelebrations.length > 0 && (
        <div className="space-y-2">
          {activeCelebrations.map((celebration) => (
            <div
              key={celebration.id}
              className={`
                relative p-4 rounded-lg border-2 animate-in slide-in-from-top-2 duration-300
                ${celebration.priority === 'high' 
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-600' 
                  : celebration.priority === 'medium'
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 dark:from-blue-900/20 dark:to-purple-900/20 dark:border-blue-600'
                  : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-600'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {celebration.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {celebration.message}
                  </p>
                </div>
                <button
                  onClick={() => dismissCelebration(celebration.id)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
                >
                  ×
                </button>
              </div>
              {celebration.points && (
                <div className="mt-2">
                  <Badge variant="secondary" className="text-sm">
                    +{celebration.points} points
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Achievements Card - Now shows REAL data from backend */}
        <Card 
          className="border-dashed border-2 border-yellow-300 dark:border-yellow-600 transition-all duration-300 hover:scale-105"
          data-gamification="true"
        >
          <CardHeader className="text-center">
            <Trophy className="h-8 w-8 mx-auto text-yellow-500" />
            <CardTitle className="text-xl">Achievements</CardTitle>
            <CardDescription>
              Unlock badges and rewards
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className={`text-3xl font-bold mb-2 transition-all duration-300 ${
              isLoading ? 'text-gray-400 dark:text-gray-600 animate-pulse' : 
              totalAchievements > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400 dark:text-gray-600'
            }`}>
              {isLoading ? '...' : totalAchievements}
            </div>
            <p className="text-sm text-gray-500">
              {totalAchievements === 1 ? 'Achievement Unlocked' : 'Achievements Unlocked'}
            </p>
            {recentAchievements.length > 0 && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  Recent: {recentAchievements[0].achievementName}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Points Card - Enhanced with level display */}
        <Card className="border-dashed border-2 border-blue-300 dark:border-blue-600 transition-all duration-300 hover:scale-105">
          <CardHeader className="text-center">
            <Star className="h-8 w-8 mx-auto text-blue-500" />
            <CardTitle className="text-xl">Points & Level</CardTitle>
            <CardDescription>
              Earn points for completing tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className={`text-3xl font-bold mb-2 transition-all duration-300 ${
              isLoading ? 'text-gray-400 dark:text-gray-600 animate-pulse' : 'text-blue-600 dark:text-blue-400'
            }`}>
              {isLoading ? '...' : currentPoints.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500">Total Points Earned</p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <Badge variant="secondary" className="text-sm">
                Level {isLoading ? '...' : currentLevel}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Streak Card - New card showing productivity streak */}
        <Card className="border-dashed border-2 border-orange-300 dark:border-orange-600 transition-all duration-300 hover:scale-105">
          <CardHeader className="text-center">
            <Flame className="h-8 w-8 mx-auto text-orange-500" />
            <CardTitle className="text-xl">Streak</CardTitle>
            <CardDescription>
              Daily productivity streak
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className={`text-3xl font-bold mb-2 transition-all duration-300 ${
              isLoading ? 'text-gray-400 dark:text-gray-600 animate-pulse' : 
              currentStreak > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400 dark:text-gray-600'
            }`}>
              {isLoading ? '...' : currentStreak}
            </div>
            <p className="text-sm text-gray-500">
              {currentStreak === 1 ? 'Day Streak' : 'Days Streak'}
            </p>
            {currentStreak >= 7 && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs bg-orange-50 dark:bg-orange-900/20">
                  🔥 On Fire!
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Badges Card - Shows badge collection */}
        <Card className="border-dashed border-2 border-purple-300 dark:border-purple-600 transition-all duration-300 hover:scale-105">
          <CardHeader className="text-center">
            <Target className="h-8 w-8 mx-auto text-purple-500" />
            <CardTitle className="text-xl">Badges</CardTitle>
            <CardDescription>
              Collect special badges
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className={`text-3xl font-bold mb-2 transition-all duration-300 ${
              isLoading ? 'text-gray-400 dark:text-gray-600 animate-pulse' : 
              totalBadges > 0 ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-gray-600'
            }`}>
              {isLoading ? '...' : totalBadges}
            </div>
            <p className="text-sm text-gray-500">
              {totalBadges === 1 ? 'Badge Earned' : 'Badges Earned'}
            </p>
            {hasRecentActivity && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs bg-purple-50 dark:bg-purple-900/20">
                  🎖️ Active
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Section */}
      <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            🚧 Coming Soon
          </CardTitle>
          <CardDescription className="text-lg">
            Gamification features are currently under development
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Planned Features:
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Points system for task completion</li>
              <li>• Achievement badges and rewards</li>
              <li>• Daily and weekly challenges</li>
              <li>• Leaderboards and competitions</li>
              <li>• Level progression system</li>
              <li>• Customizable rewards and incentives</li>
            </ul>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-500">
            This page will display live gamification data when the features are implemented.
          </p>
          
          <Button variant="outline" className="mt-4">
            View Roadmap
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 