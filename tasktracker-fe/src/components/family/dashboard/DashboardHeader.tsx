'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Heart, Zap, Gift } from 'lucide-react';
import { FamilyDTO, FamilyMemberDTO } from '@/lib/types/family-invitation';
import { FamilyTaskStats } from '@/lib/types/family-task';

interface DashboardHeaderProps {
  family: FamilyDTO;
  familyMembers: FamilyMemberDTO[];
  familyStats: FamilyTaskStats;
}

/**
 * Dashboard Header Component
 * 
 * OVERFLOW DEBUG: This component contains:
 * - Flex container with gap-2 (8px gap)
 * - Left side: Title with icon and text (flex-1 min-w-0)
 * - Right side: Two badges with truncated text
 * - Badge 1: max-w-[60px] with score
 * - Badge 2: max-w-[40px] with level
 * 
 * Total estimated width: Full width with proper flex layout
 */
export default function DashboardHeader({
  family,
  familyMembers,
  familyStats
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-3 max-w-full overflow-hidden">
      {/* Left side - Title and subtitle */}
      <div className="flex-1 min-w-0">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2 leading-tight">
          <Heart className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-purple-600 flex-shrink-0" />
          <span className="truncate">{family.name} Quest Dashboard</span>
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1 leading-tight">
          {familyMembers.length} hero{familyMembers.length !== 1 ? 's' : ''} • 
          {familyStats.completedTasks} quest{familyStats.completedTasks !== 1 ? 's' : ''} completed
        </p>
      </div>
      
      {/* Right side - Badges */}
      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
        <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50 dark:bg-purple-900/20 min-h-[44px] px-1.5 sm:px-2 md:px-3 text-xs">
          <Zap className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate max-w-[60px] sm:max-w-none">{familyStats.familyScore}</span>
        </Badge>
        <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-900/20 min-h-[44px] px-1.5 sm:px-2 md:px-3 text-xs">
          <Gift className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate max-w-[40px] sm:max-w-none">L{Math.floor(familyStats.familyScore / 100) + 1}</span>
        </Badge>
      </div>
    </div>
  );
} 