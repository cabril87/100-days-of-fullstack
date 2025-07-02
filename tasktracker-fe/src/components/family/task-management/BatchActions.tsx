'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  CheckCircle,
  Trophy,
  Trash2
} from 'lucide-react';
import { FamilyTaskItemDTO } from '@/lib/types/tasks';
import type { BatchActionsProps } from '@/lib/props/components/family.props';

/**
 * Batch Actions Component - OVERFLOW SAFE
 * 
 * OVERFLOW FIXES APPLIED:
 * - Responsive layout: flex-col sm:flex-row
 * - Reduced padding: p-3 sm:p-4
 * - Button text: hidden sm:inline for mobile
 * - Flex wrapping: flex-wrap gap-2
 * - Text truncation: truncate classes
 * 
 * Mobile layout: Stacked buttons with proper spacing
 */
export default function BatchActions({
  isBatchMode,
  selectedTasks,
  filteredTasks,
  isSelectAllChecked,
  onSelectAll,
  onBatchComplete,
  onBatchDelete
}: BatchActionsProps) {
  if (!isBatchMode || selectedTasks.size === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 sm:border-2 dark:border-blue-700 max-w-full overflow-hidden">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col gap-3 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
            {/* Selection Info */}
            <div className="flex items-center gap-3 min-w-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectAll(!isSelectAllChecked)}
                    className="flex items-center gap-2 bg-white/80 hover:bg-white transition-all duration-200 text-xs sm:text-sm"
                  >
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">
                      {isSelectAllChecked ? 'Deselect All' : 'Select All'}
                    </span>
                    <span className="sm:hidden">
                      {isSelectAllChecked ? '☐' : '☑️'}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 text-white p-3 max-w-xs">
                  <div className="space-y-1">
                    {isSelectAllChecked ? (
                      <>
                        <p className="font-semibold">☐ Deselect All Family Tasks</p>
                        <p className="text-sm text-gray-300">
                          Click to deselect all {filteredTasks.length} currently visible family tasks
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold">☑️ Select All Family Tasks</p>
                        <p className="text-sm text-gray-300">
                          Click to select all {filteredTasks.length} currently visible family tasks at once
                        </p>
                      </>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
              
              <span className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 font-medium truncate">
                {selectedTasks.size} of {filteredTasks.length} selected
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              {/* Batch Complete Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onBatchComplete}
                    className="flex items-center gap-2 text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 border-green-200 transition-all duration-200 text-xs sm:text-sm"
                  >
                    <Trophy className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Complete ({selectedTasks.size})</span>
                    <span className="sm:hidden">✓ {selectedTasks.size}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 text-white p-3 max-w-xs">
                  <div className="space-y-1">
                    <p className="font-semibold">🏆 Complete Selected Family Tasks</p>
                    <p className="text-sm text-gray-300">
                      Mark all {selectedTasks.size} selected family task{selectedTasks.size === 1 ? '' : 's'} as completed and earn XP rewards
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>

              {/* Batch Delete Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onBatchDelete}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border-red-200 transition-all duration-200 text-xs sm:text-sm"
                  >
                    <Trash2 className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Delete ({selectedTasks.size})</span>
                    <span className="sm:hidden">🗑️ {selectedTasks.size}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 text-white p-3 max-w-xs">
                  <div className="space-y-1">
                    <p className="font-semibold">🗑️ Delete Selected Family Tasks</p>
                    <p className="text-sm text-gray-300">
                      Permanently delete all {selectedTasks.size} selected family task{selectedTasks.size === 1 ? '' : 's'}
                    </p>
                    <p className="text-xs text-red-300">⚠️ This action cannot be undone</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 

