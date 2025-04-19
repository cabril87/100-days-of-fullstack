"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskStatus } from '@/context/TaskContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock } from 'lucide-react';
import { formatDate, getPriorityColor, getPriorityLabel } from '@/lib/utils';
import Link from 'next/link';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id.toString(),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isOverdue = () => {
    if (!task.dueDate || task.status === TaskStatus.Completed) return false;
    return new Date(task.dueDate) < new Date();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-2 touch-manipulation"
    >
      <Link href={`/tasks/${task.id}`} className="block">
        <Card className="hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
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
                {isOverdue() ? (
                  <AlertCircle className="h-3 w-3 mr-1 text-red-500" />
                ) : (
                  <Clock className="h-3 w-3 mr-1" />
                )}
                <span className={isOverdue() ? "text-red-500" : ""}>
                  {formatDate(task.dueDate)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  );
} 