'use client';

/**
 * Enhanced Task Card Component
 * Advanced task card with board settings integration and professional features
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/lib/types/task';
import { BoardSettings } from '@/lib/types/board';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Circle,
  User,
  Tag,
  MoreVertical,
  Edit,
  Trash2,
  Flag,
  Paperclip,
  MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface EnhancedTaskCardProps {
  task: Task;
  isDragging: boolean;
  boardSettings?: BoardSettings | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function EnhancedTaskCard({ 
  task, 
  isDragging, 
  boardSettings,
  onEdit,
  onDelete 
}: EnhancedTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id.toString(),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.8 : 1,
  };

  // Priority utilities
  const getPriorityNumber = (priority?: string): number => {
    if (!priority) return 0;
    switch (priority.toLowerCase()) {
      case 'critical': return 5;
      case 'high': return 4;
      case 'medium': return 3;
      case 'low': return 2;
      case 'lowest': return 1;
      default: return 0;
    }
  };

  const getPriorityColor = (priority?: string): string => {
    const priorityNum = getPriorityNumber(priority);
    switch (priorityNum) {
      case 5: return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/20 dark:text-red-400';
      case 4: return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400';
      case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400';
      case 2: return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400';
      case 1: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400';
    }
  };

  const getPriorityIcon = (priority?: string): React.ReactNode => {
    const priorityNum = getPriorityNumber(priority);
    if (priorityNum >= 4) {
      return <Flag className="h-3 w-3" />;
    }
    return null;
  };

  // Date utilities
  const isOverdue = (): boolean => {
    if (!task.dueDate || task.status?.toLowerCase() === 'completed') return false;
    return isPast(new Date(task.dueDate));
  };

  const getDueDateColor = (): string => {
    if (!task.dueDate) return '';
    
    const dueDate = new Date(task.dueDate);
    if (isPast(dueDate) && task.status?.toLowerCase() !== 'completed') {
      return 'text-red-600 dark:text-red-400';
    }
    if (isToday(dueDate)) {
      return 'text-orange-600 dark:text-orange-400';
    }
    if (isTomorrow(dueDate)) {
      return 'text-yellow-600 dark:text-yellow-400';
    }
    return 'text-muted-foreground';
  };

  const formatDueDate = (dueDate: string): string => {
    const date = new Date(dueDate);
    
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isPast(date)) return `Overdue by ${formatDistanceToNow(date)}`;
    
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Get card border color based on priority and due date
  const getCardBorderColor = (): string => {
    if (isOverdue()) return 'border-red-300 dark:border-red-700';
    
    const priorityNum = getPriorityNumber(task.priority);
    if (priorityNum >= 4) return 'border-orange-300 dark:border-orange-700';
    
    return 'border-border';
  };

  // Get card background color
  const getCardBackgroundColor = (): string => {
    if (isOverdue()) return 'bg-red-50 dark:bg-red-950/10';
    
    return 'bg-card';
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md border-2",
        getCardBorderColor(),
        getCardBackgroundColor(),
        isDragging && "shadow-lg rotate-1 scale-105 z-50"
      )}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm leading-tight line-clamp-2">
              {task.title}
            </h4>
            {task.description && boardSettings?.showTaskLabels && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 shrink-0">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/tasks/${task.id}`}>
                  <Edit className="h-3 w-3 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-3 w-3 mr-2" />
                  Quick Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onDelete && (
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Priority Badge */}
        {boardSettings?.showTaskPriorities && task.priority && getPriorityNumber(task.priority) > 0 && (
          <div className="flex items-center gap-2">
            {getPriorityIcon(task.priority)}
            <Badge 
              className={cn("text-xs", getPriorityColor(task.priority))}
              variant="outline"
            >
              {task.priority}
            </Badge>
          </div>
        )}

        {/* Tags */}
        {boardSettings?.showTaskLabels && task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{task.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Due Date */}
        {boardSettings?.showTaskDueDates && task.dueDate && (
          <div className={cn("flex items-center gap-2 text-xs", getDueDateColor())}>
            <Calendar className="h-3 w-3" />
            <span>{formatDueDate(task.dueDate)}</span>
            {isOverdue() && <AlertTriangle className="h-3 w-3" />}
          </div>
        )}

        {/* Assignee */}
        {boardSettings?.showTaskAssignees && task.assignedTo && (
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-xs">
                {task.assignedTo.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">
              {task.assignedTo}
            </span>
          </div>
        )}

        {/* Footer with additional info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {/* Time tracking info */}
            {task.estimatedTimeMinutes && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{Math.round(task.estimatedTimeMinutes / 60)}h</span>
              </div>
            )}
          </div>
          
          {/* Task status indicator */}
          <div className="flex items-center gap-1">
            {task.status?.toLowerCase() === 'completed' || task.status?.toLowerCase() === 'done' ? (
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            ) : (
              <Circle className="h-3 w-3" />
            )}
          </div>
        </div>

        {/* Progress bar for time tracking */}
        {boardSettings?.enableTimeTracking && task.estimatedTimeMinutes && task.actualTimeSpentMinutes && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Progress</span>
              <span>{Math.round(task.actualTimeSpentMinutes / 60)}h / {Math.round(task.estimatedTimeMinutes / 60)}h</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-blue-600 h-1 rounded-full"
                style={{
                  width: `${Math.min((task.actualTimeSpentMinutes / task.estimatedTimeMinutes) * 100, 100)}%`
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default EnhancedTaskCard; 