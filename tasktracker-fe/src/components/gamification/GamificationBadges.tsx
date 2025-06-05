'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, Award, Flame, Trophy } from 'lucide-react';
import { GamificationBadgesProps } from '@/lib/types';

// Skeleton version for loading states
export function GamificationBadgesSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
      <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
      <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
    </div>
  );
}

export function GamificationBadges({ user, streakDays = 0, achievements = 0 }: GamificationBadgesProps) {
  const level = Math.floor(user.points / 100) + 1;

  return (
    <div className="flex flex-wrap gap-2">
      {/* Points Badge */}
      <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
        <Star className="h-4 w-4 text-amber-500 mr-1" />
        {user?.points?.toLocaleString() || '0'} pts
      </Badge>

      {/* Level Badge */}
      <Badge className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100">
        <Award className="h-4 w-4 text-purple-500 mr-1" />
        Level {level}
      </Badge>

      {/* Streak Badge */}
      {streakDays > 0 && (
        <Badge className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100">
          <Flame className="h-4 w-4 text-orange-500 mr-1" />
          {streakDays} days
        </Badge>
      )}

      {/* Achievements Badge */}
      {achievements > 0 && (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
          <Trophy className="h-4 w-4 text-emerald-500 mr-1" />
          {achievements} achievements
        </Badge>
      )}
    </div>
  );
} 