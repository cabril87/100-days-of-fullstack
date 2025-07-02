'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface MemberProgress {
  name: string;
  tasksCompleted: number;
  points: number;
}

interface FamilyLeaderboardProps {
  memberProgress: MemberProgress[];
}

/**
 * Family Leaderboard Component
 * 
 * OVERFLOW DEBUG: This component contains:
 * - Card with gradient background and border-2
 * - CardHeader with p-6 and CardContent with space-y-4
 * - Member items with flex layout and min-w-0
 * - Crown/ranking icons: w-10 h-10 (40px)
 * - Text with truncate classes
 * - Responsive padding and spacing
 * 
 * Total estimated width: Full width with overflow protection
 */
export default function FamilyLeaderboard({ memberProgress }: FamilyLeaderboardProps) {
  if (memberProgress.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-2 border-indigo-200 dark:border-indigo-700 max-w-full overflow-hidden">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 flex-shrink-0" />
          <span className="truncate">Family Leaderboard</span>
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          See how each family member is contributing to our shared goals
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 max-w-full overflow-hidden">
        <div className="space-y-3 sm:space-y-4 max-w-full overflow-hidden">
          {memberProgress
            .sort((a, b) => b.points - a.points)
            .map((member, index) => (
            <div 
              key={`${member.name}-${index}`} 
              className="flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 min-w-0 gap-3"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg flex-shrink-0 ${
                  index === 0 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                  index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                  index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700' :
                  'bg-gradient-to-r from-blue-400 to-blue-500'
                }`}>
                  <span className="text-xs sm:text-sm">
                    {index === 0 ? '👑' : `#${index + 1}`}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-lg truncate">
                    {member.name || 'Unknown Member'}
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                    {member.tasksCompleted} tasks completed
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400">
                  {member.points.toLocaleString()}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">points</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 
