'use client';

/**
 * Enhanced Kanban Board Component
 * Advanced board with WIP limits, custom columns, templates, and all enhanced features
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  CollisionDetection,
  rectIntersection,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useBoard } from '@/lib/providers/BoardProvider';
import { useTasks } from '@/lib/providers/TaskProvider';
import { Board, BoardColumn, DragEndResult } from '@/lib/types/board';
import { Task } from '@/lib/types/task';
import { EnhancedKanbanColumn } from './EnhancedKanbanColumn';
import { EnhancedTaskCard } from './EnhancedTaskCard';
import { BoardHeader } from './BoardHeader';
import { BoardSettingsPanel } from './BoardSettingsPanel';
import { TemplateSelector } from './TemplateSelector';
import { BoardAnalyticsPanel } from './BoardAnalyticsPanel';
import { Button } from '@/components/ui/button';
import { Plus, Settings, BarChart3, Columns, RefreshCw } from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';

interface EnhancedKanbanBoardProps {
  boardId?: number;
  className?: string;
  showHeader?: boolean;
  showSidePanels?: boolean;
}

export function EnhancedKanbanBoard({ 
  boardId, 
  className = '', 
  showHeader = true,
  showSidePanels = true 
}: EnhancedKanbanBoardProps) {
  const { 
    state: { 
      currentBoard, 
      boardColumns, 
      boardSettings, 
      wipLimitStatuses,
      isLoadingBoard, 
      isLoadingColumns,
      boardError,
      viewState 
    },
    fetchBoardById,
    fetchBoardColumns,
    fetchBoardSettings,
    fetchWipLimitStatus,
    handleDragEnd: boardHandleDragEnd,
    toggleSettings,
    toggleTemplateSelector,
    toggleAnalytics,
    refreshCurrentBoard
  } = useBoard();
  
  const { tasks, fetchTasks, updateTaskStatus } = useTasks();
  const { showToast } = useToast();
  
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [tasksByColumn, setTasksByColumn] = useState<Record<number, Task[]>>({});

  // Configure sensors for drag and drop
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

  // Custom collision detection for columns and tasks
  const customCollisionDetection: CollisionDetection = (args) => {
    // First check for column collisions
    const columnCollisions = rectIntersection({
      ...args,
      droppableContainers: args.droppableContainers.filter((container) =>
        container.id.toString().startsWith('column-')
      ),
    });

    if (columnCollisions.length > 0) {
      return columnCollisions;
    }

    // Then check for task collisions
    return rectIntersection(args);
  };

  // Load board data on mount or when boardId changes
  useEffect(() => {
    if (boardId) {
      loadBoardData();
    }
  }, [boardId]);

  // Group tasks by column when data changes
  useEffect(() => {
    if (boardColumns.length > 0 && tasks.length > 0) {
      groupTasksByColumn();
    }
  }, [boardColumns, tasks]);

  // Load board data
  const loadBoardData = useCallback(async () => {
    if (!boardId) return;

    try {
      await Promise.all([
        fetchBoardById(boardId),
        fetchBoardColumns(boardId),
        fetchBoardSettings(boardId),
        fetchTasks({ boardId }),
        fetchWipLimitStatus(boardId)
      ]);
    } catch (error) {
      console.error('Failed to load board data:', error);
      showToast('Failed to load board data', 'error');
    }
  }, [boardId]);

  // Group tasks by column based on column mapping
  const groupTasksByColumn = useCallback(() => {
    const grouped: Record<number, Task[]> = {};
    
    // Initialize all columns with empty arrays
    boardColumns.forEach(column => {
      grouped[column.id] = [];
    });

    // Group tasks by their status mapped to columns
    tasks.forEach(task => {
      const column = boardColumns.find(col => 
        col.mappedStatus.toLowerCase() === task.status.toLowerCase()
      );
      
      if (column) {
        grouped[column.id].push(task);
      } else {
        // Default to first column if no mapping found
        const firstColumn = boardColumns[0];
        if (firstColumn) {
          grouped[firstColumn.id].push(task);
        }
      }
    });

    setTasksByColumn(grouped);
  }, [boardColumns, tasks]);

  // Find which column a task belongs to
  const findTaskColumn = useCallback((taskId: string | number): number | null => {
    const id = taskId.toString();
    
    for (const [columnId, columnTasks] of Object.entries(tasksByColumn)) {
      if (columnTasks.find(task => task.id.toString() === id)) {
        return parseInt(columnId);
      }
    }
    return null;
  }, [tasksByColumn]);

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const taskId = active.id.toString();
    
    const columnId = findTaskColumn(taskId);
    if (!columnId) return;
    
    const task = tasksByColumn[columnId]?.find(t => t.id.toString() === taskId);
    if (task) {
      setActiveTask(task);
    }
  }, [findTaskColumn, tasksByColumn]);

  // Handle drag end
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !currentBoard) {
      setActiveTask(null);
      return;
    }

    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    const sourceColumnId = findTaskColumn(activeId);
    if (!sourceColumnId) {
      setActiveTask(null);
      return;
    }

    // Determine target column
    let targetColumnId: number;
    
    if (overId.startsWith('column-')) {
      // Dropped on a column
      targetColumnId = parseInt(overId.replace('column-', ''));
    } else {
      // Dropped on a task
      const taskColumnId = findTaskColumn(overId);
      if (!taskColumnId) {
        setActiveTask(null);
        return;
      }
      targetColumnId = taskColumnId;
    }

    // Handle the move
    if (sourceColumnId === targetColumnId) {
      // Reordering within the same column
      handleReorderWithinColumn(activeId, sourceColumnId, overId);
    } else {
      // Moving between columns
      await handleMoveTaskBetweenColumns(activeId, sourceColumnId, targetColumnId);
    }
    
    setActiveTask(null);
  }, [currentBoard, findTaskColumn, tasksByColumn]);

  // Reorder tasks within the same column
  const handleReorderWithinColumn = useCallback((
    taskId: string, 
    columnId: number, 
    overId: string
  ) => {
    const columnTasks = tasksByColumn[columnId];
    if (!columnTasks) return;

    const oldIndex = columnTasks.findIndex(t => t.id.toString() === taskId);
    const newIndex = overId.startsWith('column-') 
      ? columnTasks.length - 1
      : columnTasks.findIndex(t => t.id.toString() === overId);
    
    if (oldIndex !== newIndex && newIndex >= 0) {
      const newTasks = arrayMove(columnTasks, oldIndex, newIndex);
      setTasksByColumn(prev => ({
        ...prev,
        [columnId]: newTasks,
      }));
    }
  }, [tasksByColumn]);

  // Move task between columns
  const handleMoveTaskBetweenColumns = useCallback(async (
    taskId: string,
    sourceColumnId: number,
    targetColumnId: number
  ) => {
    if (!currentBoard) return;

    const task = tasksByColumn[sourceColumnId]?.find(t => t.id.toString() === taskId);
    const targetColumn = boardColumns.find(col => col.id === targetColumnId);
    
    if (!task || !targetColumn) return;

    // Check WIP limits
    const currentTaskCount = tasksByColumn[targetColumnId]?.length || 0;
    if (targetColumn.taskLimit && currentTaskCount >= targetColumn.taskLimit) {
      showToast(`Cannot move task: ${targetColumn.name} is at WIP limit (${targetColumn.taskLimit})`, 'error');
      return;
    }

    // Optimistic UI update
    const sourceTasks = tasksByColumn[sourceColumnId].filter(t => t.id.toString() !== taskId);
    const targetTasks = [...(tasksByColumn[targetColumnId] || []), { ...task, status: targetColumn.mappedStatus }];

    setTasksByColumn(prev => ({
      ...prev,
      [sourceColumnId]: sourceTasks,
      [targetColumnId]: targetTasks,
    }));

    try {
      // Update task status via board service
      await boardHandleDragEnd({
        taskId: parseInt(taskId),
        sourceColumnId,
        destinationColumnId: targetColumnId,
        sourceIndex: 0,
        destinationIndex: targetTasks.length - 1
      } as DragEndResult);
      
      // Also update via task service for consistency
      await updateTaskStatus(taskId, targetColumn.mappedStatus);
      
      showToast(`Task moved to ${targetColumn.name}`, 'success');
      
      // Refresh WIP limit status
      await fetchWipLimitStatus(currentBoard.id);
    } catch (error) {
      console.error('Error moving task:', error);
      showToast('Failed to move task', 'error');
      
      // Revert optimistic update
      groupTasksByColumn();
    }
  }, [currentBoard, tasksByColumn, boardColumns, boardHandleDragEnd, updateTaskStatus, fetchWipLimitStatus, showToast, groupTasksByColumn]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await refreshCurrentBoard();
    if (boardId) {
      await fetchTasks({ boardId });
    }
    showToast('Board refreshed', 'success');
  }, [refreshCurrentBoard, boardId, fetchTasks, showToast]);

  // Get visible columns (excluding hidden columns)
  const visibleColumns = boardColumns.filter(column => column.isVisible);

  // Loading state
  if (isLoadingBoard || isLoadingColumns) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading board...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (boardError || (!currentBoard && !isLoadingBoard)) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="text-muted-foreground">
            {boardError || 'Board not found'}
          </div>
          <Button onClick={() => loadBoardData()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showHeader && currentBoard && (
        <BoardHeader 
          board={currentBoard}
          columns={visibleColumns}
          tasksByColumn={tasksByColumn}
          onRefresh={handleRefresh}
          onSettingsClick={() => toggleSettings()}
          onAnalyticsClick={() => toggleAnalytics()}
          onTemplateClick={() => toggleTemplateSelector()}
        />
      )}

      <div className="flex gap-4">
        {/* Main Board Area */}
        <div className="flex-1">
          <DndContext
            sensors={sensors}
            collisionDetection={customCollisionDetection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="overflow-x-auto">
              <div className="flex gap-4 min-w-max pb-4">
                <SortableContext
                  items={visibleColumns.map(col => `column-${col.id}`)}
                  strategy={horizontalListSortingStrategy}
                >
                  {visibleColumns.map((column) => (
                    <EnhancedKanbanColumn
                      key={column.id}
                      column={column}
                      tasks={tasksByColumn[column.id] || []}
                      wipLimitStatus={wipLimitStatuses.find(status => status.columnId === column.id)}
                      boardSettings={boardSettings}
                      onAddTask={() => {/* TODO: Implement add task */}}
                    />
                  ))}
                </SortableContext>
              </div>
            </div>

            <DragOverlay>
              {activeTask ? (
                <div className="rotate-2 opacity-90 scale-105">
                  <EnhancedTaskCard 
                    task={activeTask} 
                    isDragging={true}
                    boardSettings={boardSettings}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Side Panels */}
        {showSidePanels && (
          <>
            {/* Settings Panel */}
            {viewState.showSettings && currentBoard && (
              <BoardSettingsPanel 
                board={currentBoard}
                onClose={() => toggleSettings(false)}
              />
            )}

            {/* Template Selector */}
            {viewState.showTemplateSelector && (
              <TemplateSelector 
                onClose={() => toggleTemplateSelector(false)}
                onTemplateApplied={() => {
                  toggleTemplateSelector(false);
                  handleRefresh();
                }}
              />
            )}

            {/* Analytics Panel */}
            {viewState.showAnalytics && currentBoard && (
              <BoardAnalyticsPanel 
                board={currentBoard}
                onClose={() => toggleAnalytics(false)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default EnhancedKanbanBoard; 