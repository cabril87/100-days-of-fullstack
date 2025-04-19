"use client";

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
  useSensors 
} from '@dnd-kit/core';
import { 
  SortableContext, 
  arrayMove, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { useTasks, Task, TaskStatus } from '@/context/TaskContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Plus, AlertCircle } from 'lucide-react';
import { formatDate, getPriorityColor, getPriorityLabel } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';
import { TaskCard } from './TaskCard';
import { Column } from './Column';
import { TaskBadge } from '@/components/ui/task-badge';

interface TaskBoardProps {
  className?: string;
  showAddButton?: boolean;
}

type TasksByStatus = {
  [key in TaskStatus]: Task[];
};

export function TaskBoardDndKit({ className = "", showAddButton = true }: TaskBoardProps) {
  const { tasks, updateTask, isLoading } = useTasks();
  const [tasksByStatus, setTasksByStatus] = useState<TasksByStatus>({
    [TaskStatus.ToDo]: [],
    [TaskStatus.InProgress]: [],
    [TaskStatus.Completed]: []
  });
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Configure dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group tasks by status
  useEffect(() => {
    if (tasks.length) {
      const grouped = tasks.reduce((acc, task) => {
        if (!acc[task.status]) {
          acc[task.status] = [];
        }
        acc[task.status].push(task);
        return acc;
      }, {} as TasksByStatus);

      // Ensure all status columns exist
      const fullGrouped = {
        [TaskStatus.ToDo]: grouped[TaskStatus.ToDo] || [],
        [TaskStatus.InProgress]: grouped[TaskStatus.InProgress] || [],
        [TaskStatus.Completed]: grouped[TaskStatus.Completed] || []
      };

      setTasksByStatus(fullGrouped);
    }
  }, [tasks]);

  // Find the container a task belongs to
  const findContainer = (taskId: number) => {
    for (const [status, statusTasks] of Object.entries(tasksByStatus)) {
      if (statusTasks.find(task => task.id === taskId)) {
        return status;
      }
    }
    return null;
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskId = Number(active.id);
    
    const taskContainer = findContainer(taskId);
    if (!taskContainer) return;
    
    const foundTask = tasksByStatus[taskContainer as TaskStatus].find(task => task.id === taskId);
    if (foundTask) {
      setActiveTask(foundTask);
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      return;
    }
    
    const activeTaskId = Number(active.id);
    const activeContainer = findContainer(activeTaskId);
    
    if (!activeContainer) {
      setActiveTask(null);
      return;
    }

    // Check if the item was dropped in a different container
    const overId = String(over.id);
    
    // If dropped on a task, handle differently than if dropped on a column
    if (!overId.startsWith('column-')) {
      const overTaskId = Number(over.id);
      const overContainer = findContainer(overTaskId);
      
      if (overContainer === activeContainer) {
        // Reordering within the same container
        const activeItems = tasksByStatus[activeContainer as TaskStatus];
        const oldIndex = activeItems.findIndex(task => task.id === activeTaskId);
        const newIndex = activeItems.findIndex(task => task.id === overTaskId);
        
        if (oldIndex !== newIndex) {
          const newItems = arrayMove(activeItems, oldIndex, newIndex);
          
          setTasksByStatus({
            ...tasksByStatus,
            [activeContainer]: newItems
          });
        }
      } else if (overContainer) {
        // Moving to a different container
        await moveTaskBetweenContainers(
          activeTaskId,
          activeContainer as TaskStatus, 
          overContainer as TaskStatus,
          overTaskId
        );
      }
    } else {
      // Dropped on a column directly
      const overContainer = overId.replace('column-', '') as TaskStatus;
      
      if (activeContainer !== overContainer) {
        // Moving to a different container - append to the end
        await moveTaskBetweenContainers(
          activeTaskId,
          activeContainer as TaskStatus, 
          overContainer,
          null
        );
      }
    }
    
    setActiveTask(null);
  };

  // Move a task between containers
  const moveTaskBetweenContainers = async (
    taskId: number,
    fromContainer: TaskStatus,
    toContainer: TaskStatus,
    referenceTaskId: number | null
  ) => {
    // Find the task in the original container
    const fromTasks = [...tasksByStatus[fromContainer]];
    const toTasks = [...tasksByStatus[toContainer]];
    
    const taskIndex = fromTasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) return;
    
    // Remove from original container
    const [task] = fromTasks.splice(taskIndex, 1);
    
    // Update task status
    const updatedTask = { ...task, status: toContainer };
    
    // Insert in new container
    if (referenceTaskId !== null) {
      const referenceIndex = toTasks.findIndex(task => task.id === referenceTaskId);
      if (referenceIndex !== -1) {
        toTasks.splice(referenceIndex, 0, updatedTask);
      } else {
        toTasks.push(updatedTask);
      }
    } else {
      // Append to the end if no reference task
      toTasks.push(updatedTask);
    }
    
    // Update local state for immediate feedback
    setTasksByStatus({
      ...tasksByStatus,
      [fromContainer]: fromTasks,
      [toContainer]: toTasks
    });
    
    // Update server
    try {
      const toastId = toast.loading(`Moving task to ${toContainer}...`);
      await updateTask(taskId, { status: toContainer });
      toast.success(`Task moved to ${toContainer}`, { id: toastId });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status. The UI will still reflect your change.');
    }
  };

  // Handle drag over - not used in this implementation but could be customized
  const handleDragOver = () => {
    // Optional customization
  };

  const getColumnTasks = (status: TaskStatus) => {
    return tasksByStatus[status] || [];
  };

  return (
    <div className={`${className} p-4 space-y-6`}>
      {showAddButton && (
        <div className="flex justify-end">
          <Link href="/tasks/new">
            <Button>
              <Plus size={16} className="mr-2" />
              Add Task
            </Button>
          </Link>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.values(TaskStatus).map((status) => (
              <Column 
                key={status} 
                id={`column-${status}`} 
                title={status === 'ToDo' ? 'To Do' : status === 'InProgress' ? 'In Progress' : status}
                status={status as TaskStatus}
                tasks={getColumnTasks(status as TaskStatus)}
              />
            ))}
          </div>
          
          <DragOverlay>
            {activeTask ? (
              <div className="w-full opacity-80">
                <Card className="shadow-lg border-2 border-primary">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{activeTask.title}</h4>
                      <TaskBadge
                        type="priority"
                        priority={activeTask.priority}
                        animated={activeTask.priority === 5}
                      />
                    </div>
                    
                    {activeTask.categoryName && (
                      <div className="mb-2">
                        <TaskBadge
                          type="category"
                        >
                          {activeTask.categoryName}
                        </TaskBadge>
                      </div>
                    )}
                    
                    {activeTask.dueDate && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        {new Date(activeTask.dueDate) < new Date() && activeTask.status !== TaskStatus.Completed ? (
                          <AlertCircle className="h-3 w-3 mr-1 text-red-500" />
                        ) : (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        <span className={new Date(activeTask.dueDate) < new Date() && activeTask.status !== TaskStatus.Completed ? "text-red-500" : ""}>
                          {formatDate(activeTask.dueDate)}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
} 