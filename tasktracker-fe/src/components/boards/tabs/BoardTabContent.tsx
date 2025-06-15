'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  Plus,
  Trophy,
  Target,
  Sparkles,
  ChevronDown,
  AlertCircle
} from 'lucide-react';

// DnD Kit imports
import {
  DndContext,
  DragEndEvent as DndDragEndEvent,
  DragStartEvent,
  DragOverEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

// Types and Services
import { BoardTabContentProps } from '@/lib/types/board-tabs';
import { BoardDetailDTO, BoardColumnDTO } from '@/lib/types/board';
import { TaskItemResponseDTO, TaskItemStatus } from '@/lib/types/task';
import { BoardService } from '@/lib/services/boardService';
import { dragDropService } from '@/lib/services/dragDropService';

// Components
import { CreateTaskModal } from '../CreateTaskModal';
import { QuestSelectionModal } from '../QuestSelectionModal';

// Import the existing BoardColumn and TaskCard components from KanbanBoard
// We'll need to extract these into separate files for reuse
import { KanbanBoard } from '../KanbanBoard';

export const BoardTabContent: React.FC<BoardTabContentProps> = ({
  board,
  onBoardUpdate,
  onBoardDelete,
}) => {
  const [boardData, setBoardData] = useState<BoardDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showQuestSelection, setShowQuestSelection] = useState(false);
  const [selectedColumnStatus, setSelectedColumnStatus] = useState<TaskItemStatus | undefined>();

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load board data
  const loadBoardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await BoardService.getBoardById(board.id);
      setBoardData(data);
    } catch (err) {
      console.error('Failed to load board data:', err);
      setError('Failed to load board data');
      toast.error('Failed to load board data');
    } finally {
      setLoading(false);
    }
  }, [board.id]);

  useEffect(() => {
    loadBoardData();
  }, [loadBoardData]);

  // Group tasks by column
  const groupTasksByColumn = (tasks: TaskItemResponseDTO[], columns: BoardColumnDTO[]): Record<string, TaskItemResponseDTO[]> => {
    const grouped: Record<string, TaskItemResponseDTO[]> = {};
    columns.forEach(column => {
      grouped[column.status.toString()] = tasks.filter(task => task.status.toString() === column.status.toString());
    });
    return grouped;
  };

  const handleCreateTask = async (columnStatus?: TaskItemStatus) => {
    setSelectedColumnStatus(columnStatus);
    setShowCreateTask(true);
  };

  const handleQuestSelection = async (columnStatus?: TaskItemStatus) => {
    setSelectedColumnStatus(columnStatus);
    setShowQuestSelection(true);
  };

  const handleTaskCreated = async () => {
    setShowCreateTask(false);
    setShowQuestSelection(false);
    await loadBoardData();
    toast.success('🎯 Quest created successfully!');
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Action Bar Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>

        {/* Board Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="h-96">
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(3)].map((_, j) => (
                    <Skeleton key={j} className="h-24 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error || !boardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 p-6">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Failed to Load Board</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {error || 'Unable to load board data'}
              </p>
            </div>
            <Button onClick={loadBoardData} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg">
              <Trophy className="h-5 w-5" />
            </div>
            <Badge variant="secondary" className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-emerald-200">
              <Target className="h-3 w-3 mr-1" />
              <span>{boardData.taskCount} Quests</span>
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Quest Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Quest</span>
                <span className="sm:hidden">Add</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border">
              <DropdownMenuItem onClick={() => handleCreateTask()} className="text-foreground hover:bg-accent">
                <Plus className="h-4 w-4 mr-2" />
                Create New Quest
                <span className="ml-auto text-xs text-muted-foreground">Fresh start</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleQuestSelection()} className="text-foreground hover:bg-accent">
                <Target className="h-4 w-4 mr-2" />
                Add Existing Quest
                <span className="ml-auto text-xs text-muted-foreground">From tasks</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Kanban Board - Use the existing component but without header */}
      <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
        <KanbanBoard
          boardId={board.id}
          className="border-0 shadow-none [&>div:first-child]:hidden" // Hide the header
          enableAnimations={true}
          enableGamification={true}
          theme="gradient"
        />
      </div>

      {/* Modals */}
      <CreateTaskModal
        open={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        onTaskCreated={handleTaskCreated}
        defaultStatus={selectedColumnStatus}
        boardId={board.id}
      />

      <QuestSelectionModal
        open={showQuestSelection}
        onClose={() => setShowQuestSelection(false)}
        onTaskCreated={handleTaskCreated}
        defaultStatus={selectedColumnStatus}
        boardId={board.id}
      />
    </div>
  );
}; 