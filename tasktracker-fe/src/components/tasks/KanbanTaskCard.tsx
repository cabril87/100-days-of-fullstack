'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/lib/types/task';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatDistanceToNow } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface KanbanTaskCardProps {
  task: Task;
  boardView: 'compact' | 'detailed';
  isDragging: boolean;
}

export function KanbanTaskCard({ task, boardView, isDragging }: KanbanTaskCardProps) {
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
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  // Convert string priority to number for comparison and processing
  const getPriorityNumber = (priority?: string): number => {
    if (!priority) return 0;
    switch (priority.toLowerCase()) {
      case 'critical':
        return 5;
      case 'high':
        return 4;
      case 'medium':
        return 3;
      case 'low':
        return 2;
      case 'lowest':
        return 1;
      default:
        return 0;
    }
  };

  // Priority colors
  const getPriorityColor = (priority?: string): string => {
    const priorityNum: number = getPriorityNumber(priority);
    switch (priorityNum) {
      case 5:
        return 'bg-red-100 text-red-800 border-red-200';
      case 4:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 3:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 2:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 1:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority?: string): string => {
    const priorityNum: number = getPriorityNumber(priority);
    switch (priorityNum) {
      case 5:
        return 'Critical';
      case 4:
        return 'High';
      case 3:
        return 'Medium';
      case 2:
        return 'Low';
      case 1:
        return 'Lowest';
      default:
        return 'None';
    }
  };

  // Check if task is overdue
  const isOverdue = (): boolean => {
    if (!task.dueDate || task.status?.toLowerCase() === 'completed') return false;
    return new Date(task.dueDate) < new Date();
  };

  // Format due date
  const formatDueDate = (dueDate: string): string => {
    const date: Date = new Date(dueDate);
    const now: Date = new Date();
    
    if (date < now) {
      return `Overdue by ${formatDistanceToNow(date)}`;
    } else {
      return `Due ${formatDistanceToNow(date, { addSuffix: true })}`;
    }
  };

  const CompactView = () => (
    <Card 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md ${
        isDragging ? 'shadow-lg rotate-1 scale-105' : ''
      } ${isOverdue() ? 'border-red-200 bg-red-50' : ''}`}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{task.title}</h4>
            {task.priority && getPriorityNumber(task.priority) > 3 && (
              <Badge className={`text-xs mt-1 ${getPriorityColor(task.priority)}`}>
                {getPriorityLabel(task.priority)}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {isOverdue() && (
              <AlertTriangle className="h-3 w-3 text-red-500" />
            )}
            {task.dueDate && (
              <Clock className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const DetailedView = () => (
    <Card 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md ${
        isDragging ? 'shadow-lg rotate-1 scale-105' : ''
      } ${isOverdue() ? 'border-red-200 bg-red-50' : ''}`}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
              {task.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
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
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1">
            {task.priority && (
              <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                {getPriorityLabel(task.priority)}
              </Badge>
            )}
            
            {task.categoryId && (
              <Badge variant="outline" className="text-xs">
                <Tag className="h-2 w-2 mr-1" />
                Category {task.categoryId}
              </Badge>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              {task.assignedToName && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{task.assignedToName}</span>
                </div>
              )}
            </div>
            
            {task.dueDate && (
              <div className={`flex items-center gap-1 ${
                isOverdue() ? 'text-red-500' : ''
              }`}>
                {isOverdue() ? (
                  <AlertTriangle className="h-3 w-3" />
                ) : (
                  <Calendar className="h-3 w-3" />
                )}
                <span className="truncate">
                  {formatDueDate(task.dueDate)}
                </span>
              </div>
            )}
          </div>

          {/* Progress indicator if available */}
          {task.progressPercentage !== undefined && task.progressPercentage > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{task.progressPercentage}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-1">
                <div 
                  className="bg-primary h-1 rounded-full transition-all duration-300" 
                  style={{ width: `${task.progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Return appropriate view based on boardView prop
  return boardView === 'compact' ? <CompactView /> : <DetailedView />;
}

export default KanbanTaskCard; 