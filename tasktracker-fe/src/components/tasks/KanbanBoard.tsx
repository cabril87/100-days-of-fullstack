'use client';

import React, { useState, useEffect } from 'react';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTasks } from '@/lib/providers/TaskProvider';
import { Task } from '@/lib/types/task';
import { KanbanColumn } from './KanbanColumn';
import { KanbanTaskCard } from './KanbanTaskCard';
import { Button } from '@/components/ui/button';
import { Plus, RotateCcw, Settings, Grid3X3 } from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type TaskStatus = 'ToDo' | 'InProgress' | 'Completed';

interface TasksByStatus {
  ToDo: Task[];
  InProgress: Task[];
  Completed: Task[];
}

interface KanbanBoardProps {
  className?: string;
  showHeader?: boolean;
}

const TASK_STATUSES: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'ToDo', label: 'To Do', color: 'bg-slate-100 border-slate-200' },
  { value: 'InProgress', label: 'In Progress', color: 'bg-blue-50 border-blue-200' },
  { value: 'Completed', label: 'Completed', color: 'bg-green-50 border-green-200' },
];

export function KanbanBoard({ className = '', showHeader = true }: KanbanBoardProps) {
  const { tasks, loading, error, updateTaskStatus, fetchTasks } = useTasks();
  const { showToast } = useToast();
  
  const [tasksByStatus, setTasksByStatus] = useState<TasksByStatus>({
    ToDo: [],
    InProgress: [],
    Completed: [],
  });
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [boardView, setBoardView] = useState<'compact' | 'detailed'>('detailed');

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

  // Custom collision detection to handle task-to-column and task-to-task drops
  const customCollisionDetection: CollisionDetection = (args) => {
    // First, let's see if there are any collisions with the columns
    const columnCollisions = rectIntersection({
      ...args,
      droppableContainers: args.droppableContainers.filter((container) =>
        container.id.toString().startsWith('column-')
      ),
    });

    if (columnCollisions.length > 0) {
      return columnCollisions;
    }

    // If no column collisions, check for task collisions
    return rectIntersection(args);
  };

  // Group tasks by status when tasks change
  useEffect(() => {
    const grouped: TasksByStatus = {
      ToDo: [],
      InProgress: [],
      Completed: [],
    };

    tasks.forEach((task: Task) => {
      const status = mapTaskStatusToKanban(task.status);
      if (grouped[status]) {
        grouped[status].push(task);
      }
    });

    setTasksByStatus(grouped);
  }, [tasks]);

  // Map API task status to Kanban status
  const mapTaskStatusToKanban = (status: string): TaskStatus => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'todo':
      case 'not started':
        return 'ToDo';
      case 'in progress':
      case 'in_progress':
      case 'inprogress':
      case 'working':
        return 'InProgress';
      case 'completed':
      case 'done':
      case 'finished':
        return 'Completed';
      default:
        return 'ToDo';
    }
  };

  // Map Kanban status back to API status
  const mapKanbanStatusToApi = (status: TaskStatus): string => {
    switch (status) {
      case 'ToDo':
        return 'Pending';
      case 'InProgress':
        return 'In Progress';
      case 'Completed':
        return 'Completed';
      default:
        return 'Pending';
    }
  };

  // Find which column a task belongs to
  const findContainer = (taskId: string | number): TaskStatus | null => {
    const id = taskId.toString();
    
    for (const [status, statusTasks] of Object.entries(tasksByStatus)) {
      if (statusTasks.find((task: Task) => task.id.toString() === id)) {
        return status as TaskStatus;
      }
    }
    return null;
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskId = active.id.toString();
    
    const container = findContainer(taskId);
    if (!container) return;
    
    const task = tasksByStatus[container].find(t => t.id.toString() === taskId);
    if (task) {
      setActiveTask(task);
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    const activeContainer = findContainer(activeId);
    if (!activeContainer) {
      setActiveTask(null);
      return;
    }

    // Determine target container
    let overContainer: TaskStatus;
    
    if (overId.startsWith('column-')) {
      // Dropped on a column
      overContainer = overId.replace('column-', '') as TaskStatus;
    } else {
      // Dropped on a task
      const taskContainer = findContainer(overId);
      if (!taskContainer) {
        setActiveTask(null);
        return;
      }
      overContainer = taskContainer;
    }

    // Handle the move
    if (activeContainer === overContainer) {
      // Reordering within the same column
      const oldIndex = tasksByStatus[activeContainer].findIndex(t => t.id.toString() === activeId);
      const newIndex = overId.startsWith('column-') 
        ? tasksByStatus[activeContainer].length - 1
        : tasksByStatus[overContainer].findIndex(t => t.id.toString() === overId);
      
      if (oldIndex !== newIndex && newIndex >= 0) {
        const newTasks = arrayMove(tasksByStatus[activeContainer], oldIndex, newIndex);
        setTasksByStatus(prev => ({
          ...prev,
          [activeContainer]: newTasks,
        }));
      }
    } else {
      // Moving between columns
      await moveTaskBetweenColumns(activeId, activeContainer, overContainer);
    }
    
    setActiveTask(null);
  };

  // Move task between columns
  const moveTaskBetweenColumns = async (
    taskId: string,
    fromContainer: TaskStatus,
    toContainer: TaskStatus
  ) => {
    const task = tasksByStatus[fromContainer].find(t => t.id.toString() === taskId);
    if (!task) return;

    // Optimistic UI update
    const fromTasks = tasksByStatus[fromContainer].filter(t => t.id.toString() !== taskId);
    const toTasks = [...tasksByStatus[toContainer], { ...task, status: mapKanbanStatusToApi(toContainer) }];

    setTasksByStatus(prev => ({
      ...prev,
      [fromContainer]: fromTasks,
      [toContainer]: toTasks,
    }));

    try {
      const apiStatus = mapKanbanStatusToApi(toContainer);
      await updateTaskStatus(taskId, apiStatus);
      
      showToast(`Task moved to ${toContainer}`, 'success');
    } catch (error) {
      console.error('Error updating task status:', error);
      showToast('Failed to update task status', 'error');
      
      // Revert optimistic update
      fetchTasks();
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchTasks();
    showToast('Board refreshed', 'success');
  };

  // Get task count for status
  const getTaskCount = (status: TaskStatus) => tasksByStatus[status].length;

  // Get total task count
  const getTotalTasks = () => tasks.length;

  // Get completion percentage
  const getCompletionPercentage = () => {
    const total = getTotalTasks();
    if (total === 0) return 0;
    return Math.round((getTaskCount('Completed') / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-sm text-destructive">Error loading tasks: {error}</p>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RotateCcw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showHeader && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Grid3X3 className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">Task Board</h1>
            <Badge variant="secondary">{getTotalTasks()} tasks</Badge>
            <Badge variant="outline">{getCompletionPercentage()}% complete</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Tabs value={boardView} onValueChange={(value) => setBoardView(value as 'compact' | 'detailed')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="compact">Compact</TabsTrigger>
                <TabsTrigger value="detailed">Detailed</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4" />
            </Button>
            
            <Link href="/tasks/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </Link>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TASK_STATUSES.map((statusConfig) => (
            <KanbanColumn
              key={statusConfig.value}
              id={`column-${statusConfig.value}`}
              title={statusConfig.label}
              tasks={tasksByStatus[statusConfig.value]}
              taskCount={getTaskCount(statusConfig.value)}
              color={statusConfig.color}
              boardView={boardView}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-3 opacity-95">
              <KanbanTaskCard 
                task={activeTask} 
                isDragging={true}
                boardView={boardView}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default KanbanBoard; 