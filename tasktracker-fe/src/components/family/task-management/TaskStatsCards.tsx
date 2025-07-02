'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Target,
  CheckCircle,
  Clock,
  UserPlus
} from 'lucide-react';
import { FamilyTaskItemDTO } from '@/lib/types/tasks';

interface TaskStatsCardsProps {
  filteredTasks: FamilyTaskItemDTO[];
  isBatchMode: boolean;
}

/**
 * Task Statistics Cards Component - OVERFLOW SAFE
 * 
 * OVERFLOW FIXES APPLIED:
 * - Removed hover:scale-105 (causes overflow)
 * - Reduced padding: p-3 sm:p-4 (mobile-first)
 * - Smaller icons: h-6 w-6 sm:h-8 sm:w-8
 * - Responsive text: text-lg sm:text-2xl
 * - Grid optimization: grid-cols-2 md:grid-cols-4
 * - Max width protection: max-w-full overflow-hidden
 * 
 * iPhone 12 Pro (390px) safe: 2 cards per row, ~180px each
 */
export default function TaskStatsCards({ filteredTasks, isBatchMode }: TaskStatsCardsProps) {
  if (isBatchMode) {
    return null; // Hidden in batch mode for cleaner UX
  }

  const completedTasks = filteredTasks.filter(t => t.isCompleted).length;
  const overdueTasks = filteredTasks.filter(t => 
    !t.isCompleted && t.dueDate && new Date(t.dueDate) < new Date()
  ).length;
  const assignedTasks = filteredTasks.filter(t => t.assignedToFamilyMemberId).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-full overflow-hidden">
      {/* Total Tasks Card */}
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white transition-all duration-200 hover:shadow-xl">
        <CardContent className="p-3 sm:p-4 max-w-full">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0 flex-1">
              <div className="text-lg sm:text-2xl font-bold truncate">{filteredTasks.length}</div>
              <p className="text-blue-100 text-xs sm:text-sm font-medium truncate">Total Tasks</p>
            </div>
            <Target className="h-6 w-6 sm:h-8 sm:w-8 text-blue-200 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
      
      {/* Completed Tasks Card */}
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white transition-all duration-200 hover:shadow-xl">
        <CardContent className="p-3 sm:p-4 max-w-full">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0 flex-1">
              <div className="text-lg sm:text-2xl font-bold truncate">{completedTasks}</div>
              <p className="text-green-100 text-xs sm:text-sm font-medium truncate">Completed</p>
            </div>
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-200 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
      
      {/* Overdue Tasks Card */}
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white transition-all duration-200 hover:shadow-xl">
        <CardContent className="p-3 sm:p-4 max-w-full">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0 flex-1">
              <div className="text-lg sm:text-2xl font-bold truncate">{overdueTasks}</div>
              <p className="text-orange-100 text-xs sm:text-sm font-medium truncate">Overdue</p>
            </div>
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-200 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
      
      {/* Assigned Tasks Card */}
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white transition-all duration-200 hover:shadow-xl">
        <CardContent className="p-3 sm:p-4 max-w-full">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0 flex-1">
              <div className="text-lg sm:text-2xl font-bold truncate">{assignedTasks}</div>
              <p className="text-purple-100 text-xs sm:text-sm font-medium truncate">Assigned</p>
            </div>
            <UserPlus className="h-6 w-6 sm:h-8 sm:w-8 text-purple-200 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 

