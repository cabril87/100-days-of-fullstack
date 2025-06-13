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

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskPriority } from '../../lib/types/task';
import { TaskCardProps } from '../../lib/types/board';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

import { Button } from '../ui/button';
import {
  Clock,
  User,
  Star,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { cn } from '../../lib/utils/utils';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  columnColor = '#6B7280',
  isDragging = false,
  className,
  onEdit,
  onDelete,
  onView
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id.toString(),
    data: {
      taskId: task.id,
      status: task.status,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Priority styling
  const getPriorityConfig = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.High:
        return {
          icon: ArrowUp,
          color: 'text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-950',
          borderColor: 'border-red-200 dark:border-red-800',
          label: 'High'
        };
      case TaskPriority.Medium:
        return {
          icon: Minus,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50 dark:bg-yellow-950',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          label: 'Medium'
        };
      case TaskPriority.Low:
        return {
          icon: ArrowDown,
          color: 'text-green-500',
          bgColor: 'bg-green-50 dark:bg-green-950',
          borderColor: 'border-green-200 dark:border-green-800',
          label: 'Low'
        };
      default:
        return {
          icon: Minus,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50 dark:bg-gray-950',
          borderColor: 'border-gray-200 dark:border-gray-800',
          label: 'Normal'
        };
    }
  };

  const priorityConfig = getPriorityConfig(task.priority);
  const PriorityIcon = priorityConfig.icon;

  // Format due date
  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    const now = new Date();
    const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) {
      return { text: `${Math.abs(diffInDays)}d overdue`, color: 'text-red-500', urgent: true };
    } else if (diffInDays === 0) {
      return { text: 'Due today', color: 'text-orange-500', urgent: true };
    } else if (diffInDays === 1) {
      return { text: 'Due tomorrow', color: 'text-yellow-500', urgent: false };
    } else if (diffInDays <= 7) {
      return { text: `Due in ${diffInDays}d`, color: 'text-blue-500', urgent: false };
    } else {
      return { text: format(date, 'MMM d'), color: 'text-muted-foreground', urgent: false };
    }
  };

  const dueDateInfo = formatDueDate(task.dueDate);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "group cursor-grab active:cursor-grabbing transition-all duration-200",
        "hover:shadow-md hover:scale-[1.02] hover:-translate-y-1",
        isDragging && "opacity-50 rotate-3 shadow-xl scale-105",
        isSortableDragging && "z-50",
        priorityConfig.bgColor,
        priorityConfig.borderColor,
        "border-l-4",
        className
      )}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-3 space-y-3">
        {/* Header with priority and actions */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className={cn("flex items-center space-x-1", priorityConfig.color)}>
                    <PriorityIcon className="h-3 w-3" />
                    <span className="text-xs font-medium">{priorityConfig.label}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Priority: {priorityConfig.label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(task)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Quest
                </DropdownMenuItem>
              )}
              {(onView || onEdit) && onDelete && <DropdownMenuSeparator />}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(task)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Quest
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Task title */}
        <div>
          <h4 className="font-medium text-sm leading-tight line-clamp-2">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={tag.id || index}
                variant="outline"
                className="text-xs px-1.5 py-0.5 h-auto"
                style={{
                  borderColor: `${columnColor}40`,
                  color: columnColor,
                  backgroundColor: `${columnColor}10`,
                }}
              >
                {tag.name}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-auto">
                +{task.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer with metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-2">
            {/* Assigned user */}
            {task.assignedToUserName && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span className="truncate max-w-[60px]">
                        {task.assignedToUserName.split(' ')[0]}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Assigned to: {task.assignedToUserName}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Points */}
            {task.points && task.points > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center space-x-1 text-yellow-500">
                      <Star className="h-3 w-3 fill-current" />
                      <span>{task.points}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Quest Points: {task.points}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Due date */}
          {dueDateInfo && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className={cn(
                    "flex items-center space-x-1",
                    dueDateInfo.color,
                    dueDateInfo.urgent && "font-medium"
                  )}>
                    {dueDateInfo.urgent && <AlertTriangle className="h-3 w-3" />}
                    <Clock className="h-3 w-3" />
                    <span>{dueDateInfo.text}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Due: {task.dueDate ? format(new Date(task.dueDate), 'PPP') : 'No due date'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 