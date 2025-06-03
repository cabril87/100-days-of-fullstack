'use client';

/**
 * Kanban Task Card Component
 * Clean, draggable task card with gamification and priority display
 */

import React, { useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Types
import { KanbanTaskCardProps } from '@/lib/types/kanban';

// Components
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Icons
import {
  MoreVertical,
  Edit2,
  Trash2,
  Calendar,
  User,
  AlertTriangle,
  Clock,
  Star,
  Target,
  CheckCircle2,
  Circle,
  Flag,
  Trophy,
  Zap
} from 'lucide-react';

// Utils
import { cn } from '@/lib/utils';
import { formatDistanceToNow, isPast } from 'date-fns';

export function KanbanTaskCard({
  task,
  isDragging = false,
  isSelected = false,
  onEdit,
  onDelete,
  onSelect,
  boardSettings,
  showGamification = true
}: KanbanTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Get priority configuration
  const getPriorityConfig = () => {
    const priorityMap = {
      'critical': { color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-950', icon: AlertTriangle, label: 'Critical' },
      'high': { color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-950', icon: Flag, label: 'High' },
      'medium': { color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-950', icon: Circle, label: 'Medium' },
      'low': { color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-950', icon: Circle, label: 'Low' },
    };

    return priorityMap[task.priority as keyof typeof priorityMap] || priorityMap.medium;
  };

  const priorityConfig = getPriorityConfig();

  // Check if task is overdue
  const isOverdue = useMemo(() => {
    if (!task.dueDate) return false;
    return isPast(new Date(task.dueDate));
  }, [task.dueDate]);

  // Check if task is due soon (within 24 hours)
  const isDueSoon = useMemo(() => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilDue > 0 && hoursUntilDue <= 24;
  }, [task.dueDate]);

  // Format due date
  const formatDueDate = () => {
    if (!task.dueDate) return null;
    return formatDistanceToNow(new Date(task.dueDate), { addSuffix: true });
  };

  // Calculate gamification metrics for the task
  const getTaskGamificationMetrics = () => {
    if (!showGamification) return null;

    // Estimate points based on priority and complexity
    const basePoints = {
      'critical': 15,
      'high': 10,
      'medium': 5,
      'low': 3
    };

    const points = basePoints[task.priority as keyof typeof basePoints] || 5;

    // Check for special conditions that add bonus points
    let bonusPoints = 0;
    if (isOverdue) bonusPoints += 2; // Overdue tasks are worth more
    if (task.description && task.description.length > 100) bonusPoints += 1; // Complex tasks
    if (task.dueDate && isDueSoon) bonusPoints += 1; // Urgent tasks

    return {
      totalPoints: points + bonusPoints,
      basePoints: points,
      bonusPoints,
      hasUrgencyBonus: isDueSoon,
      hasOverdueBonus: isOverdue,
      hasComplexityBonus: task.description && task.description.length > 100
    };
  };

  const gamificationMetrics = getTaskGamificationMetrics();

  // Get task status icon
  const getStatusIcon = () => {
    const statusMap = {
      'todo': Circle,
      'in-progress': Clock,
      'done': CheckCircle2,
      'completed': CheckCircle2
    };

    const IconComponent = statusMap[task.status as keyof typeof statusMap] || Circle;
    return <IconComponent className="h-3 w-3" />;
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-all duration-200",
        "hover:shadow-md border border-border/50",
        "bg-card hover:bg-card/80",
        isDragging && "opacity-50 rotate-2 shadow-lg",
        isSelected && "ring-2 ring-primary ring-opacity-50",
        isOverdue && "border-red-300 bg-red-50/50 dark:bg-red-950/20",
        isDueSoon && !isOverdue && "border-orange-300 bg-orange-50/50 dark:bg-orange-950/20"
      )}
    >
      <CardContent className="p-3 space-y-2">
        {/* Task Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm leading-5 truncate">
              {task.title}
            </h4>
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            {/* Priority Badge */}
            {boardSettings?.enablePriorityColors && (
              <Badge
                variant="secondary"
                className={cn(
                  "h-5 px-1.5 text-xs",
                  priorityConfig.bg,
                  priorityConfig.color
                )}
              >
                <priorityConfig.icon className="h-2.5 w-2.5 mr-1" />
                {priorityConfig.label}
              </Badge>
            )}

            {/* Task Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Task
                </DropdownMenuItem>
                {onSelect && (
                  <DropdownMenuItem onClick={() => onSelect(task.id)}>
                    <Target className="h-4 w-4 mr-2" />
                    Select Task
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(task.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Task Description */}
        {task.description && boardSettings?.showTaskLabels && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Task Metadata */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {/* Status */}
          <div className="flex items-center gap-1">
            {getStatusIcon()}
            <span className="capitalize">{task.status.replace('-', ' ')}</span>
          </div>

          {/* Due Date */}
          {task.dueDate && boardSettings?.showTaskDueDates && (
            <div className={cn(
              "flex items-center gap-1",
              isOverdue && "text-red-600",
              isDueSoon && !isOverdue && "text-orange-600"
            )}>
              <Calendar className="h-3 w-3" />
              <span>{formatDueDate()}</span>
              {isOverdue && <AlertTriangle className="h-3 w-3" />}
            </div>
          )}

          {/* Assignee */}
          {task.assignedToName && boardSettings?.showTaskAssignees && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="truncate max-w-20">{task.assignedToName}</span>
            </div>
          )}
        </div>

        {/* Gamification Section */}
        {showGamification && gamificationMetrics && (
          <div className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs">
                <Trophy className="h-3 w-3 text-yellow-600" />
                <span className="font-medium">{gamificationMetrics.totalPoints}pts</span>
              </div>
              
              {gamificationMetrics.bonusPoints > 0 && (
                <div className="flex items-center gap-1">
                  {gamificationMetrics.hasUrgencyBonus && (
                    <span title="Urgency bonus">
                      <Zap className="h-3 w-3 text-orange-500" />
                    </span>
                  )}
                  {gamificationMetrics.hasOverdueBonus && (
                    <span title="Overdue bonus">
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                    </span>
                  )}
                  {gamificationMetrics.hasComplexityBonus && (
                    <span title="Complexity bonus">
                      <Star className="h-3 w-3 text-blue-500" />
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              {gamificationMetrics.bonusPoints > 0 && (
                <span>+{gamificationMetrics.bonusPoints} bonus</span>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="h-4 px-1.5 text-xs"
              >
                {tag}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <Badge 
                variant="outline" 
                className="h-4 px-1.5 text-xs"
              >
                +{task.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Progress Bar (if task has progress) */}
        {task.progressPercentage !== undefined && task.progressPercentage > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{task.progressPercentage}%</span>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-1">
              <div 
                className="bg-primary h-1 rounded-full transition-all duration-300"
                style={{ width: `${task.progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 