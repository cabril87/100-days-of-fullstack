'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Target } from 'lucide-react';

export default function GamificationPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            🎮 Gamification Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Earn points, unlock achievements, and level up your productivity
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          ⭐ 0 Points
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Achievements Card */}
        <Card className="border-dashed border-2 border-yellow-300 dark:border-yellow-600">
          <CardHeader className="text-center">
            <Trophy className="h-8 w-8 mx-auto text-yellow-500" />
            <CardTitle className="text-xl">Achievements</CardTitle>
            <CardDescription>
              Unlock badges and rewards
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-gray-400 dark:text-gray-600 mb-2">
              0
            </div>
            <p className="text-sm text-gray-500">Achievements Unlocked</p>
          </CardContent>
        </Card>

        {/* Points Card */}
        <Card className="border-dashed border-2 border-blue-300 dark:border-blue-600">
          <CardHeader className="text-center">
            <Star className="h-8 w-8 mx-auto text-blue-500" />
            <CardTitle className="text-xl">Points</CardTitle>
            <CardDescription>
              Earn points for completing tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-gray-400 dark:text-gray-600 mb-2">
              0
            </div>
            <p className="text-sm text-gray-500">Total Points Earned</p>
          </CardContent>
        </Card>

        {/* Challenges Card */}
        <Card className="border-dashed border-2 border-purple-300 dark:border-purple-600">
          <CardHeader className="text-center">
            <Target className="h-8 w-8 mx-auto text-purple-500" />
            <CardTitle className="text-xl">Challenges</CardTitle>
            <CardDescription>
              Complete daily and weekly challenges
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-gray-400 dark:text-gray-600 mb-2">
              0
            </div>
            <p className="text-sm text-gray-500">Active Challenges</p>
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