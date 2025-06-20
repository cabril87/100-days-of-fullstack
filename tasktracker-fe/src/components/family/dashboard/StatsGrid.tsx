'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Target, CheckCircle, Crown, Flame } from 'lucide-react';
import { FamilyTaskStats } from '@/lib/types/family-task';
import { triggerHapticFeedback } from '@/components/search/MobileSearchEnhancements';
import confetti from 'canvas-confetti';

interface StatsGridProps {
  familyStats: FamilyTaskStats;
  enableHaptic: boolean;
  enableAnimations: boolean;
}

/**
 * Stats Grid Component
 * 
 * OVERFLOW DEBUG: This component contains:
 * - Grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
 * - Gap: gap-1.5 sm:gap-2 lg:gap-3 (6px mobile)
 * - 4 cards with reduced padding: p-2 sm:p-3 md:p-4 (8px mobile)
 * - Each card: border sm:border-2 (1px mobile, 2px larger)
 * - Icons: h-8 w-8 (32px mobile)
 * - Text: shortened for mobile
 * 
 * Total estimated width per card: ~180px on mobile
 */
export default function StatsGrid({
  familyStats,
  enableHaptic,
  enableAnimations
}: StatsGridProps) {
  const triggerStatsAnimation = (statType: string) => {
    if (!enableAnimations) return;
    
    const colors = {
      tasks: ['#10B981', '#34D399'],
      score: ['#F59E0B', '#FBBF24'],
      progress: ['#3B82F6', '#60A5FA'],
      achievements: ['#8B5CF6', '#A78BFA']
    };
    
    confetti({
      particleCount: 20,
      spread: 40,
      startVelocity: 15,
      colors: colors[statType as keyof typeof colors] || ['#6366F1'],
      origin: { x: 0.5, y: 0.6 }
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 lg:gap-3 max-w-full overflow-hidden">
      {/* Total Tasks Card */}
      <Card 
        className="gradient-border bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 border sm:border-2 border-purple-200 dark:border-purple-700 hover:shadow-xl transition-all duration-300 cursor-pointer group"
        onClick={() => {
          triggerStatsAnimation('tasks');
          if (enableHaptic) triggerHapticFeedback('light');
        }}
      >
        <CardContent className="p-2 sm:p-3 md:p-4">
          <div className="flex items-center justify-between min-w-0 gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-purple-600 dark:text-purple-400 truncate">Quests</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-purple-700 dark:text-purple-300 group-hover:scale-110 transition-transform duration-200">
                {familyStats.totalTasks}
              </p>
              <p className="text-xs text-purple-500 mt-1 truncate">Total</p>
            </div>
            <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-purple-200 to-purple-300 dark:from-purple-700 dark:to-purple-600 flex items-center justify-center group-hover:rotate-12 transition-transform duration-200 flex-shrink-0">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-purple-700 dark:text-purple-200" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completed Tasks Card */}
      <Card 
        className="gradient-border bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 border sm:border-2 border-green-200 dark:border-green-700 hover:shadow-xl transition-all duration-300 cursor-pointer group"
        onClick={() => {
          triggerStatsAnimation('tasks');
          if (enableHaptic) triggerHapticFeedback('medium');
        }}
      >
        <CardContent className="p-2 sm:p-3 md:p-4">
          <div className="flex items-center justify-between min-w-0 gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-green-600 dark:text-green-400 truncate">Done</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-700 dark:text-green-300 group-hover:scale-110 transition-transform duration-200">
                {familyStats.completedTasks}
              </p>
              <p className="text-xs text-green-500 mt-1 truncate">Complete</p>
            </div>
            <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-green-200 to-green-300 dark:from-green-700 dark:to-green-600 flex items-center justify-center group-hover:bounce transition-all duration-200 flex-shrink-0">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-700 dark:text-green-200" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Family Score Card */}
      <Card 
        className="gradient-border bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-orange-900/20 border sm:border-2 border-amber-200 dark:border-amber-700 hover:shadow-xl transition-all duration-300 cursor-pointer group"
        onClick={() => {
          triggerStatsAnimation('score');
          if (enableHaptic) triggerHapticFeedback('heavy');
        }}
      >
        <CardContent className="p-2 sm:p-3 md:p-4">
          <div className="flex items-center justify-between min-w-0 gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 truncate">Score</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-amber-700 dark:text-amber-300 group-hover:scale-110 transition-transform duration-200">
                {familyStats.familyScore}
              </p>
              <p className="text-xs text-amber-500 mt-1 truncate">Points</p>
            </div>
            <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-amber-200 to-amber-300 dark:from-amber-700 dark:to-amber-600 flex items-center justify-center group-hover:rotate-45 transition-transform duration-200 flex-shrink-0">
              <Crown className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-amber-700 dark:text-amber-200" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress Card */}
      <Card 
        className="gradient-border bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 dark:from-blue-900/20 dark:via-cyan-900/20 dark:to-indigo-900/20 border sm:border-2 border-blue-200 dark:border-blue-700 hover:shadow-xl transition-all duration-300 cursor-pointer group"
        onClick={() => {
          triggerStatsAnimation('progress');
          if (enableHaptic) triggerHapticFeedback('success');
        }}
      >
        <CardContent className="p-2 sm:p-3 md:p-4">
          <div className="flex items-center justify-between min-w-0 gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 truncate">Weekly</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-300 group-hover:scale-110 transition-transform duration-200">
                {familyStats.weeklyProgress}%
              </p>
              <p className="text-xs text-blue-500 mt-1 truncate">Progress</p>
            </div>
            <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 dark:from-blue-700 dark:to-blue-600 flex items-center justify-center group-hover:pulse transition-all duration-200 flex-shrink-0">
              <Flame className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-700 dark:text-blue-200" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 