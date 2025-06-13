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
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { BoardDetailDTO, BoardColumnDTO, KanbanBoardProps } from '../../lib/types/board';
import { TaskItemResponseDTO, TaskItemStatus } from '../../lib/types/task';
import { BoardService } from '../../lib/services/boardService';
import { taskService } from '../../lib/services/taskService';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { toast } from 'sonner';
import {
  Plus,
  Settings,
  MoreVertical,
  AlertCircle,
  Trophy,
  Target,
  Zap
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils/utils';
import { BoardColumn } from './BoardColumn';
import { TaskCard } from '@/components/boards/TaskCard';
import { CreateTaskModal } from '@/components/boards/CreateTaskModal';
import { EditBoardModal } from '@/components/boards/EditBoardModal';

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ boardId, className }) => {
  const [boardData, setBoardData] = useState<BoardDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<TaskItemResponseDTO | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showEditBoard, setShowEditBoard] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<BoardColumnDTO | null>(null);

  // Configure sensors for drag and drop with mobile support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  // Load board data
  const loadBoardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await BoardService.getBoardById(boardId);
      setBoardData(data);
    } catch (err) {
      console.error('Error loading board data:', err);
      setError('Failed to load board data');
      toast.error('Failed to load board data');
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    loadBoardData();
  }, [loadBoardData]);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const taskId = Number(event.active.id);
    const task = boardData?.tasks.find(t => t.id === taskId);
    setActiveTask(task || null);
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !boardData) return;

    const taskId = Number(active.id);
    const overId = String(over.id);
    
    // Check if dropped on a column
    const targetColumn = boardData.board.columns.find(col => 
      overId === `column-${col.id}` || overId === String(col.id)
    );

    if (!targetColumn) return;

    const task = boardData.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Don't do anything if the task is already in the correct column
    if (task.status === targetColumn.status) return;

    try {
      // Optimistically update the UI
      setBoardData(prev => {
        if (!prev) return prev;
        
        const updatedTasks = prev.tasks.map(t => 
          t.id === taskId 
            ? { ...t, status: targetColumn.status }
            : t
        );

        return {
          ...prev,
          tasks: updatedTasks,
          tasksByColumn: groupTasksByColumn(updatedTasks, prev.board.columns)
        };
      });

      // Update the task status via API
      await taskService.updateTaskStatus(taskId, targetColumn.status);
      
      toast.success('✨ Quest moved successfully!', {
        description: `Moved to ${targetColumn.name}`,
      });

      // Reload to ensure consistency
      await loadBoardData();
    } catch (error) {
      console.error('Error moving task:', error);
      toast.error('Failed to move quest');
      // Reload to revert optimistic update
      await loadBoardData();
    }
  };

  // Group tasks by column for display
  const groupTasksByColumn = (tasks: TaskItemResponseDTO[], columns: BoardColumnDTO[]): Record<string, TaskItemResponseDTO[]> => {
    const grouped: Record<string, TaskItemResponseDTO[]> = {};
    
    columns.forEach(column => {
      grouped[column.status] = tasks.filter(task => task.status === column.status);
    });
    
    return grouped;
  };

  // Handle creating a new task
  const handleCreateTask = async (columnStatus?: TaskItemStatus) => {
    if (columnStatus) {
      setSelectedColumn(boardData?.board.columns.find(col => col.status === columnStatus) || null);
    }
    setShowCreateTask(true);
  };

  // Handle task created
  const handleTaskCreated = async () => {
    setShowCreateTask(false);
    setSelectedColumn(null);
    await loadBoardData();
    toast.success('🎯 New quest created!');
  };

  // Handle board updated
  const handleBoardUpdated = async () => {
    setShowEditBoard(false);
    await loadBoardData();
    toast.success('📋 Board updated successfully!');
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
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

  if (error || !boardData) {
    return (
      <div className={cn("flex items-center justify-center min-h-[400px]", className)}>
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

  const tasksByColumn = groupTasksByColumn(boardData.tasks, boardData.board.columns);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Board Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <span>{boardData.board.name}</span>
            </h1>
            {boardData.board.description && (
              <p className="text-muted-foreground mt-1">{boardData.board.description}</p>
            )}
          </div>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Target className="h-3 w-3" />
            <span>{boardData.taskCount} Quests</span>
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => handleCreateTask()}
            size="sm"
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New Quest</span>
            <span className="sm:hidden">New</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowEditBoard(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Edit Board
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={loadBoardData}>
                <Zap className="h-4 w-4 mr-2" />
                Refresh
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
          {boardData.board.columns
            .sort((a, b) => a.order - b.order)
            .map((column) => (
              <BoardColumn
                key={column.id}
                column={column}
                tasks={tasksByColumn[column.status] || []}
                onCreateTask={() => handleCreateTask(column.status)}
              />
            ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              isDragging
              className="rotate-3 shadow-xl"
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modals */}
      {showCreateTask && (
        <CreateTaskModal
          open={showCreateTask}
          onClose={() => {
            setShowCreateTask(false);
            setSelectedColumn(null);
          }}
          onTaskCreated={handleTaskCreated}
          defaultStatus={selectedColumn?.status}
          boardId={boardId}
        />
      )}

      {showEditBoard && (
        <EditBoardModal
          open={showEditBoard}
          onClose={() => setShowEditBoard(false)}
          onBoardUpdated={handleBoardUpdated}
          board={boardData.board}
        />
      )}
    </div>
  );
}; 