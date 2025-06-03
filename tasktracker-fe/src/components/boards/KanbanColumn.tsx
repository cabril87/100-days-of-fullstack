'use client';

/**
 * Kanban Column Component
 * Clean column implementation with drag-and-drop, WIP limits, and gamification
 */

import React, { useMemo, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

// Types
import { KanbanColumnProps } from '@/lib/types/kanban';

// Components
import { KanbanTaskCard } from './KanbanTaskCard';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Icons
import { 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Target,
  TrendingUp,
  Users,
  GripVertical
} from 'lucide-react';

// Utils
import { cn } from '@/lib/utils';

export function KanbanColumn({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onTaskMove,
  boardSettings,
  wipStatus,
  showGamification = true
}: KanbanColumnProps) {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `column-${column.id}`,
  });

  // Make column sortable for reordering
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging: isColumnDragging,
  } = useSortable({ 
    id: `column-${column.id}`,
    data: {
      type: 'column',
      column,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Combine refs
  const setNodeRef = (node: HTMLElement | null) => {
    setDroppableRef(node);
    setSortableRef(node);
  };

  // Create array of task IDs for SortableContext
  const taskIds = useMemo(() => tasks.map(task => task.id.toString()), [tasks]);

  // Calculate WIP limit utilization
  const getWipUtilization = (): number => {
    if (!column.taskLimit) return 0;
    return Math.min((tasks.length / column.taskLimit) * 100, 100);
  };

  // Get WIP limit status
  const getWipLimitStatus = (): 'normal' | 'warning' | 'exceeded' => {
    if (!column.taskLimit) return 'normal';
    
    const utilization = getWipUtilization();
    if (utilization >= 100) return 'exceeded';
    if (utilization >= 80) return 'warning';
    return 'normal';
  };

  // Check if adding a task is allowed
  const canAddTask = (): boolean => {
    if (!boardSettings?.enableWipLimits || !column.taskLimit) return true;
    return tasks.length < column.taskLimit;
  };

  // Handle add task with WIP limit validation
  const handleAddTask = () => {
    if (!canAddTask()) {
      // You could show a toast here - for now just return
      return;
    }
    onAddTask();
  };

  // Get column border color based on WIP status
  const getColumnBorderColor = (): string => {
    if (!boardSettings?.enableWipLimits || !column.taskLimit) {
      return column.color || 'border-border';
    }
    
    const status = getWipLimitStatus();
    switch (status) {
      case 'exceeded': return 'border-red-400';
      case 'warning': return 'border-orange-400';
      default: return column.color || 'border-border';
    }
  };

  // Get background color based on settings and WIP status
  const getColumnBackgroundColor = (): string => {
    if (!boardSettings?.enableWipLimits || !column.taskLimit) {
      return 'bg-card';
    }
    
    const status = getWipLimitStatus();
    switch (status) {
      case 'exceeded': return 'bg-red-50 dark:bg-red-950/10';
      case 'warning': return 'bg-orange-50 dark:bg-orange-950/10';
      default: return 'bg-card';
    }
  };

  // Render column icon
  const renderColumnIcon = () => {
    if (!boardSettings?.showColumnIcons || !column.icon) return null;
    
    // Map icon names to components
    const iconMap: Record<string, React.ReactNode> = {
      'circle': <Circle className="h-4 w-4" />,
      'checkcircle': <CheckCircle2 className="h-4 w-4" />,
      'alert': <AlertTriangle className="h-4 w-4" />,
      'target': <Target className="h-4 w-4" />,
      'trending': <TrendingUp className="h-4 w-4" />,
      'users': <Users className="h-4 w-4" />,
    };
    
    return iconMap[column.icon.toLowerCase()] || <Circle className="h-4 w-4" />;
  };

  // Calculate gamification metrics for the column
  const getColumnGamificationMetrics = () => {
    if (!showGamification) return null;

    const completedTasks = tasks.filter(task => 
      column.isDoneColumn || task.status === 'done' || task.status === 'completed'
    ).length;

    const highPriorityTasks = tasks.filter(task => 
      task.priority === 'high' || task.priority === 'critical'
    ).length;

    const overdueTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate) < new Date();
    }).length;

    return {
      completedTasks,
      highPriorityTasks,
      overdueTasks,
      efficiency: tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0
    };
  };

  const gamificationMetrics = getColumnGamificationMetrics();
  const wipLimitStatus = getWipLimitStatus();

  return (
    <Card 
      ref={setNodeRef}
      style={{
        borderColor: getColumnBorderColor(),
        ...style,
      }}
      className={cn(
        "flex flex-col w-80 min-h-[600px] transition-all duration-200",
        getColumnBackgroundColor(),
        "border-2 hover:border-opacity-80 relative overflow-hidden",
        "hover:shadow-lg transform-gpu",
        isOver && "ring-2 ring-primary ring-opacity-50 shadow-xl scale-[1.01] border-primary/50",
        isColumnDragging && "opacity-50 rotate-1 shadow-2xl",
        !column.isVisible && "opacity-50 pointer-events-none"
      )}
    >
      {/* Decorative accent bar */}
      <div 
        className="absolute top-0 left-0 w-full h-1"
        style={{ backgroundColor: column.color }}
      />

      <CardHeader className="pb-3">
        {/* Column Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Drag Handle */}
            <div
              className="flex items-center cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </div>
            
            {renderColumnIcon()}
            <h3 className="font-semibold text-sm truncate" style={{ color: column.color }}>
              {column.name}
              {!column.isVisible && <span className="text-xs text-muted-foreground ml-1">(Hidden)</span>}
            </h3>
            <Badge 
              variant={wipLimitStatus === 'exceeded' ? 'destructive' : 
                     wipLimitStatus === 'warning' ? 'secondary' : 'outline'}
              className="text-xs shrink-0"
            >
              {tasks.length}
              {column.taskLimit && `/${column.taskLimit}`}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Add Task Button */}
            <Button 
              onClick={handleAddTask}
              variant="ghost" 
              size="sm"
              className={cn(
                "h-6 w-6 p-0 hover:bg-primary/10",
                !canAddTask() && "opacity-50 cursor-not-allowed"
              )}
              disabled={!canAddTask()}
              title={!canAddTask() ? "WIP limit reached" : "Add task"}
            >
              <Plus className="h-3 w-3" />
            </Button>

            {/* Column Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditTask && onEditTask(column as any)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Column
                </DropdownMenuItem>
                <DropdownMenuItem>
                  {column.isVisible ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {column.isVisible ? 'Hide' : 'Show'} Column
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDeleteTask && onDeleteTask(column.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Column
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Column Description */}
        {column.description && (
          <p className="text-xs text-muted-foreground mt-1">{column.description}</p>
        )}

        {/* WIP Limit Progress */}
        {boardSettings?.enableWipLimits && column.taskLimit && (
          <div className="space-y-1 mt-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">WIP Limit</span>
              <span 
                className={cn(
                  "font-medium",
                  wipLimitStatus === 'exceeded' && "text-red-600",
                  wipLimitStatus === 'warning' && "text-orange-600"
                )}
              >
                {Math.round(getWipUtilization())}%
              </span>
            </div>
            <Progress 
              value={getWipUtilization()} 
              className="h-1.5"
            />
            {wipLimitStatus === 'exceeded' && (
              <div className="flex items-center gap-1 text-xs text-red-600">
                <AlertTriangle className="h-3 w-3" />
                <span>Over WIP limit</span>
              </div>
            )}
            {wipLimitStatus === 'warning' && (
              <div className="flex items-center gap-1 text-xs text-orange-600">
                <AlertTriangle className="h-3 w-3" />
                <span>Near WIP limit</span>
              </div>
            )}
          </div>
        )}

        {/* WIP Limit Enforcement Message */}
        {!canAddTask() && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
              <AlertTriangle className="h-3 w-3 shrink-0" />
              <span>Cannot add tasks: WIP limit reached ({tasks.length}/{column.taskLimit})</span>
            </div>
          </div>
        )}

        {/* Gamification Metrics */}
        {showGamification && gamificationMetrics && (
          <div className="mt-2 p-2 bg-muted/50 rounded-md">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span>{gamificationMetrics.completedTasks} done</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-orange-600" />
                <span>{gamificationMetrics.highPriorityTasks} priority</span>
              </div>
              {gamificationMetrics.overdueTasks > 0 && (
                <div className="flex items-center gap-1 col-span-2">
                  <AlertTriangle className="h-3 w-3 text-red-600" />
                  <span>{gamificationMetrics.overdueTasks} overdue</span>
                </div>
              )}
            </div>
            {gamificationMetrics.efficiency > 0 && (
              <div className="mt-2">
                <div className="flex justify-between text-xs">
                  <span>Efficiency</span>
                  <span className="font-medium">{Math.round(gamificationMetrics.efficiency)}%</span>
                </div>
                <Progress value={gamificationMetrics.efficiency} className="h-1 mt-1" />
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 pt-0 space-y-3">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Circle className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No tasks</p>
              <Button 
                onClick={handleAddTask}
                variant="ghost" 
                size="sm" 
                className="mt-2 text-xs"
                disabled={!canAddTask()}
              >
                <Plus className="h-3 w-3 mr-1" />
                {canAddTask() ? 'Add first task' : 'WIP limit reached'}
              </Button>
            </div>
          ) : (
            tasks.map((task) => (
              <KanbanTaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                boardSettings={boardSettings}
                showGamification={showGamification}
              />
            ))
          )}
        </SortableContext>
      </CardContent>
    </Card>
  );
} 