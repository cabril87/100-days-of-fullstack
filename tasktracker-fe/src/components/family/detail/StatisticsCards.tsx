'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Target,
  CheckCircle2,
  Award,
  Users,
  TrendingUp,
  Calendar,
  Zap,
  Crown
} from 'lucide-react';

interface FamilyStats {
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  totalPoints: number;
  weeklyProgress: number;
  memberProgress: Array<{ name: string; tasksCompleted: number; points: number }>;
}

interface StatisticsCardsProps {
  familyStats: FamilyStats;
  familyName: string;
  memberCount: number;
}

/**
 * Statistics Cards Component
 * 
 * OVERFLOW DEBUG: This component contains:
 * - Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
 * - Gap: gap-6 (24px)
 * - 4 gradient cards with padding p-6 (24px)
 * - Each card: transform hover:scale-105 (can cause overflow)
 * - Icons: h-8 w-8 (32px)
 * - Text: responsive sizing
 * 
 * Total estimated width per card: ~280px on desktop, full width on mobile
 */
export default function StatisticsCards({
  familyStats,
  familyName,
  memberCount
}: StatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-full overflow-hidden">
      {/* Total Tasks Card */}
      <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white transform hover:scale-105 transition-all duration-300">
        <CardContent className="p-4 sm:p-6 relative max-w-full">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative z-10 min-w-0">
            <div className="flex items-center justify-between mb-4 gap-2">
              <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm flex-shrink-0">
                <Target className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="text-right min-w-0 flex-1">
                <p className="text-2xl sm:text-3xl font-black truncate">{familyStats.totalTasks}</p>
                <p className="text-blue-100 font-semibold text-xs sm:text-sm truncate">Total Tasks</p>
              </div>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-200 flex-shrink-0" />
              <span className="text-blue-100 text-xs sm:text-sm font-medium truncate">
                {familyStats.activeTasks} active
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completed Tasks Card */}
      <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 text-white transform hover:scale-105 transition-all duration-300">
        <CardContent className="p-4 sm:p-6 relative max-w-full">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative z-10 min-w-0">
            <div className="flex items-center justify-between mb-4 gap-2">
              <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="text-right min-w-0 flex-1">
                <p className="text-2xl sm:text-3xl font-black truncate">{familyStats.completedTasks}</p>
                <p className="text-emerald-100 font-semibold text-xs sm:text-sm truncate">Completed</p>
              </div>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-200 flex-shrink-0" />
              <span className="text-emerald-100 text-xs sm:text-sm font-medium truncate">
                {familyStats.weeklyProgress}% this week
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Points Card */}
      <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white transform hover:scale-105 transition-all duration-300">
        <CardContent className="p-4 sm:p-6 relative max-w-full">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative z-10 min-w-0">
            <div className="flex items-center justify-between mb-4 gap-2">
              <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm flex-shrink-0">
                <Award className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="text-right min-w-0 flex-1">
                <p className="text-2xl sm:text-3xl font-black truncate">{familyStats.totalPoints.toLocaleString()}</p>
                <p className="text-amber-100 font-semibold text-xs sm:text-sm truncate">Family Points</p>
              </div>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-amber-200 flex-shrink-0" />
              <span className="text-amber-100 text-xs sm:text-sm font-medium truncate">
                Team achievement
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Family Members Card */}
      <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 text-white transform hover:scale-105 transition-all duration-300">
        <CardContent className="p-4 sm:p-6 relative max-w-full">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative z-10 min-w-0">
            <div className="flex items-center justify-between mb-4 gap-2">
              <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm flex-shrink-0">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="text-right min-w-0 flex-1">
                <p className="text-2xl sm:text-3xl font-black truncate">{memberCount}</p>
                <p className="text-purple-100 font-semibold text-xs sm:text-sm truncate">Active Members</p>
              </div>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-purple-200 flex-shrink-0" />
              <span className="text-purple-100 text-xs sm:text-sm font-medium truncate">
                {familyName} family
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
