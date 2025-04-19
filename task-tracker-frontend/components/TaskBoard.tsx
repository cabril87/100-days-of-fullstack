"use client";

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useTasks, Task, TaskStatus } from '@/context/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Plus, AlertCircle } from 'lucide-react';
import { formatDate, getPriorityColor, getPriorityLabel } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

interface TaskBoardProps {
  className?: string;
  showAddButton?: boolean;
}

type TasksByStatus = {
  [key in TaskStatus]: Task[];
};

const getStatusDisplayInfo = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.ToDo:
      return { 
        title: "To Do", 
        bgColor: "bg-gray-100", 
        borderColor: "border-gray-300" 
      };
    case TaskStatus.InProgress:
      return { 
        title: "In Progress", 
        bgColor: "bg-blue-50", 
        borderColor: "border-blue-300" 
      };
    case TaskStatus.Completed:
      return { 
        title: "Completed", 
        bgColor: "bg-green-50", 
        borderColor: "border-green-300" 
      };
    default:
      return { 
        title: status, 
        bgColor: "bg-gray-100", 
        borderColor: "border-gray-300" 
      };
  }
};

export function TaskBoard({ className = "", showAddButton = true }: TaskBoardProps) {
  const { tasks, updateTask, isLoading } = useTasks();
  const [tasksByStatus, setTasksByStatus] = useState<TasksByStatus>({
    [TaskStatus.ToDo]: [],
    [TaskStatus.InProgress]: [],
    [TaskStatus.Completed]: []
  });
  const [isDragging, setIsDragging] = useState(false);

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

  const onDragEnd = async (result: DropResult) => {
    setIsDragging(false);
    
    const { source, destination, draggableId } = result;
    
    // Dropped outside a droppable area
    if (!destination) return;
    
    // Dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    
    const taskId = parseInt(draggableId);
    if (isNaN(taskId)) return;
    
    // Task has moved to a different status
    if (source.droppableId !== destination.droppableId) {
      const newStatus = destination.droppableId as TaskStatus;
      
      // Show optimistic UI update
      const sourceList = [...tasksByStatus[source.droppableId as TaskStatus]];
      const destinationList = [...tasksByStatus[destination.droppableId as TaskStatus]];
      const [removed] = sourceList.splice(source.index, 1);
      
      // Check if the task is the same as we're dragging
      if (removed.id !== taskId) return;
      
      // Update the task's status
      const updatedTask = { ...removed, status: newStatus };
      destinationList.splice(destination.index, 0, updatedTask);
      
      // Update local state for immediate feedback
      setTasksByStatus({
        ...tasksByStatus,
        [source.droppableId as TaskStatus]: sourceList,
        [destination.droppableId as TaskStatus]: destinationList
      });
      
      // Update the server
      try {
        const toastId = toast.loading(`Moving task to ${newStatus}...`);
        await updateTask(taskId, { status: newStatus });
        toast.success(`Task moved to ${newStatus}`, { id: toastId });
      } catch (error) {
        console.error('Error updating task status:', error);
        toast.error('Failed to update task status. The UI will still reflect your change.');
      }
    } else {
      // Task has moved within the same status column (reordering)
      // No backend update needed, just UI reordering
      const list = [...tasksByStatus[source.droppableId as TaskStatus]];
      const [removed] = list.splice(source.index, 1);
      list.splice(destination.index, 0, removed);
      
      setTasksByStatus({
        ...tasksByStatus,
        [source.droppableId as TaskStatus]: list
      });
    }
  };

  const onDragStart = () => {
    setIsDragging(true);
  };

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === TaskStatus.Completed) return false;
    return new Date(task.dueDate) < new Date();
  };

  return (
    <div className={`${className} p-4`}>
      {showAddButton && (
        <div className="flex justify-end mb-4">
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
        <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => {
              const { title, bgColor, borderColor } = getStatusDisplayInfo(status as TaskStatus);
              return (
                <Droppable key={status} droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      className={`${bgColor} rounded-lg border ${borderColor} ${
                        snapshot.isDraggingOver ? 'opacity-70' : ''
                      }`}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      <div className="p-3 mb-2 border-b flex justify-between items-center">
                        <h3 className="font-medium">{title}</h3>
                        <Badge>{statusTasks.length}</Badge>
                      </div>
                      
                      <div className="p-2 min-h-[200px]">
                        {statusTasks.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground text-sm">
                            No tasks
                          </div>
                        ) : (
                          statusTasks.map((task, index) => (
                            <Draggable
                              key={task.id.toString()}
                              draggableId={task.id.toString()}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`mb-2 rounded-md ${
                                    snapshot.isDragging ? 'opacity-60 shadow-lg' : ''
                                  }`}
                                >
                                  <Link href={`/tasks/${task.id}`}>
                                    <Card className={`hover:shadow-md transition-shadow ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}>
                                      <CardContent className="p-3">
                                        <div className="flex justify-between items-start mb-2">
                                          <h4 className="font-medium text-sm">{task.title}</h4>
                                          <Badge className={getPriorityColor(task.priority)}>
                                            {getPriorityLabel(task.priority)}
                                          </Badge>
                                        </div>
                                        
                                        {task.categoryName && (
                                          <div className="mb-2">
                                            <Badge variant="outline" className="text-xs">
                                              {task.categoryName}
                                            </Badge>
                                          </div>
                                        )}
                                        
                                        {task.dueDate && (
                                          <div className="flex items-center text-xs text-muted-foreground">
                                            {isOverdue(task) ? (
                                              <AlertCircle className="h-3 w-3 mr-1 text-red-500" />
                                            ) : (
                                              <Clock className="h-3 w-3 mr-1" />
                                            )}
                                            <span className={isOverdue(task) ? "text-red-500" : ""}>
                                              {formatDate(task.dueDate)}
                                            </span>
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>
                                  </Link>
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>
      )}
    </div>
  );
} 