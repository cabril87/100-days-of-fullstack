'use client';

import React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Target,
  Plus,
  RefreshCw,
  CheckCircle,
  Circle
} from 'lucide-react';
import { FamilyDTO } from '@/lib/types/family-invitation';

interface TaskManagementHeaderProps {
  family: FamilyDTO;
  isLoading: boolean;
  isBatchMode: boolean;
  onCreateTask: () => void;
  onRefreshTasks: () => void;
  onToggleBatchMode: () => void;
}

/**
 * Task Management Header Component - OVERFLOW SAFE
 * 
 * OVERFLOW FIXES APPLIED:
 * - Responsive layout: flex-col sm:flex-row
 * - Reduced padding: p-4 sm:p-6
 * - Button text: hidden sm:inline for mobile
 * - Icon optimization: h-4 w-4 consistent
 * - Flex wrapping: flex-wrap gap-2
 * - Text truncation: truncate classes
 * 
 * Mobile width: Full width with proper wrapping
 */
export default function TaskManagementHeader({
  family,
  isLoading,
  isBatchMode,
  onCreateTask,
  onRefreshTasks,
  onToggleBatchMode
}: TaskManagementHeaderProps) {
  return (
    <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-cyan-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-cyan-900/20 border border-blue-200 sm:border-2 dark:border-blue-700 max-w-full overflow-hidden">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0">
          {/* Title Section */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg sm:text-xl bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent truncate">
                Family Task Management
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                Task hub for {family.name}
              </CardDescription>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Create Task Button */}
            <Button 
              onClick={onCreateTask}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm"
            >
              <Plus className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Create Task</span>
              <span className="sm:hidden">Create</span>
            </Button>

            {/* Refresh Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={onRefreshTasks}
                  variant="outline"
                  size="sm"
                  className={`transition-all duration-200 ${isLoading ? 'bg-blue-50 border-blue-200' : ''}`}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 text-white p-3 max-w-xs">
                <div className="space-y-1">
                  <p className="font-semibold">🔄 Refresh Family Tasks</p>
                  <p className="text-sm text-gray-300">
                    Click to reload all family tasks and get the latest updates
                  </p>
                  {isLoading && (
                    <p className="text-xs text-blue-300">Refreshing...</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>

            {/* Batch Mode Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleBatchMode}
                  className={`transition-all duration-200 ${isBatchMode 
                    ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {isBatchMode ? (
                      <Circle className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline text-xs font-medium">
                      {isBatchMode ? 'Exit' : 'Select'}
                    </span>
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 text-white p-3 max-w-xs">
                <div className="space-y-1">
                  {isBatchMode ? (
                    <>
                      <p className="font-semibold">✓ Exit Selection Mode</p>
                      <p className="text-sm text-gray-300">
                        Click to exit batch selection mode and return to normal view
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold">☐ Enter Selection Mode</p>
                      <p className="text-sm text-gray-300">
                        Click to select multiple family tasks for batch operations
                      </p>
                    </>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
} 