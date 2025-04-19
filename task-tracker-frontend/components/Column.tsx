"use client";

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/context/TaskContext';
import { Badge } from '@/components/ui/badge';
import { TaskCard } from './TaskCard';

interface ColumnProps {
  id: string;
  title: string;
  status: TaskStatus;
  tasks: Task[];
}

// Get column styling based on status
const getColumnStyle = (status: TaskStatus, isOver: boolean) => {
  const baseClasses = "rounded-lg min-h-[500px] flex flex-col border";
  const bgColorClass = isOver ? "bg-opacity-70" : "";
  
  switch (status) {
    case TaskStatus.ToDo:
      return `${baseClasses} bg-gray-100 ${bgColorClass} border-gray-300`;
    case TaskStatus.InProgress:
      return `${baseClasses} bg-blue-50 ${bgColorClass} border-blue-300`;
    case TaskStatus.Completed:
      return `${baseClasses} bg-green-50 ${bgColorClass} border-green-300`;
    default:
      return `${baseClasses} bg-gray-100 ${bgColorClass} border-gray-300`;
  }
};

export function Column({ id, title, status, tasks }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  // Generate task ids array for SortableContext
  const taskIds = tasks.map(task => task.id.toString());

  return (
    <div
      ref={setNodeRef}
      className={getColumnStyle(status, isOver)}
    >
      <div className="p-3 border-b flex justify-between items-center">
        <h3 className="font-medium">{title}</h3>
        <Badge variant="outline">{tasks.length}</Badge>
      </div>

      <div className="p-2 flex-1">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No tasks
          </div>
        ) : (
          <SortableContext
            items={taskIds}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
} 