'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Trophy, Flame, Target, Wifi, WifiOff } from 'lucide-react';
import { UseGamificationEventsReturn } from '@/lib/types/gamification';

interface GamificationProps {
  user: { id: number; username: string; email: string };
  gamificationData: UseGamificationEventsReturn;
  isConnected: boolean;
}

export default function Gamification({ gamificationData, isConnected }: GamificationProps) {
  const {
    currentPoints = 0,
    currentLevel = 1,
    currentStreak = 0,
    totalAchievements = 0,
    totalBadges = 0,
    recentAchievements = [],
    isLoading = false
  } = gamificationData;

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
          >
            ⭐ {isLoading ? '...' : currentPoints.toLocaleString()} Points
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Achievements Card */}
        <Card className="border-dashed border-2 border-yellow-300 dark:border-yellow-600 transition-all duration-300 hover:scale-105">
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

        {/* Points Card */}
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

        {/* Streak Card */}
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

        {/* Badges Card */}
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
          </CardContent>
        </Card>
      </div>

      {/* Status Section */}
      <Card className="border-dashed border-2 border-green-300 dark:border-green-600">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            {isConnected ? '🚀 Real-Time Active' : '⚠️ Offline Mode'}
          </CardTitle>
          <CardDescription className="text-lg">
            {isConnected 
              ? 'Your gamification data updates in real-time!'
              : 'Connect to see live updates'
            }
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
} 