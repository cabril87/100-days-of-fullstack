'use client';

/**
 * Enhanced Kanban Column Component
 * Advanced column with WIP limits, custom styling, and professional features
 */

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { BoardColumn, BoardSettings, WipLimitStatus } from '@/lib/types/board';
import { Task } from '@/lib/types/task';
import { EnhancedTaskCard } from './EnhancedTaskCard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Settings2, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle2,
  Circle,
  MoreVertical 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface EnhancedKanbanColumnProps {
  column: BoardColumn;
  tasks: Task[];
  wipLimitStatus?: WipLimitStatus;
  boardSettings?: BoardSettings | null;
  onAddTask: () => void;
  onEditColumn?: () => void;
  onToggleVisibility?: () => void;
  onDeleteColumn?: () => void;
}

export function EnhancedKanbanColumn({ 
  column,
  tasks,
  wipLimitStatus,
  boardSettings,
  onAddTask,
  onEditColumn,
  onToggleVisibility,
  onDeleteColumn
}: EnhancedKanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
  });

  // Create array of task IDs for SortableContext
  const taskIds = tasks.map(task => task.id.toString());

  // Calculate WIP limit utilization
  const getWipUtilization = (): number => {
    if (!column.taskLimit) return 0;
    return Math.min((tasks.length / column.taskLimit) * 100, 100);
  };

  // Get WIP limit color
  const getWipLimitColor = (): string => {
    if (!column.taskLimit) return 'default';
    
    const utilization = getWipUtilization();
    if (utilization >= 100) return 'destructive';
    if (utilization >= 80) return 'warning';
    if (utilization >= 60) return 'secondary';
    return 'default';
  };

  // Get column border color based on WIP status
  const getColumnBorderColor = (): string => {
    if (!boardSettings?.enableWipLimits || !column.taskLimit) {
      return column.color || 'border-border';
    }
    
    const utilization = getWipUtilization();
    if (utilization >= 100) return 'border-red-400';
    if (utilization >= 80) return 'border-orange-400';
    if (utilization >= 60) return 'border-yellow-400';
    return column.color || 'border-border';
  };

  // Get background color based on settings and WIP status
  const getColumnBackgroundColor = (): string => {
    if (!boardSettings?.enableWipLimits || !column.taskLimit) {
      return 'bg-card';
    }
    
    const utilization = getWipUtilization();
    if (utilization >= 100) return 'bg-red-50 dark:bg-red-950/10';
    if (utilization >= 80) return 'bg-orange-50 dark:bg-orange-950/10';
    return 'bg-card';
  };

  // Render column icon
  const renderColumnIcon = () => {
    if (!boardSettings?.showColumnIcons || !column.icon) return null;
    
    // Map icon names to components (simplified for demo)
    const iconMap: Record<string, React.ReactNode> = {
      'circle': <Circle className="h-4 w-4" />,
      'checkcircle': <CheckCircle2 className="h-4 w-4" />,
      'alert': <AlertTriangle className="h-4 w-4" />,
    };
    
    return iconMap[column.icon.toLowerCase()] || <Circle className="h-4 w-4" />;
  };

  return (
    <Card 
      ref={setNodeRef}
      className={cn(
        "flex flex-col w-80 min-h-[600px] transition-all duration-200",
        getColumnBackgroundColor(),
        getColumnBorderColor(),
        isOver && "ring-2 ring-primary ring-opacity-50 shadow-lg scale-[1.02]"
      )}
      style={{
        borderColor: column.color,
        borderWidth: '2px'
      }}
    >
      <CardHeader className="pb-3 space-y-3">
        {/* Column Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {renderColumnIcon()}
            <h3 className="font-semibold text-sm truncate">{column.name}</h3>
            <Badge 
              variant={getWipLimitColor() as any}
              className="text-xs shrink-0"
            >
              {tasks.length}
              {column.taskLimit && `/${column.taskLimit}`}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0"
              onClick={onAddTask}
            >
              <Plus className="h-3 w-3" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEditColumn && (
                  <DropdownMenuItem onClick={onEditColumn}>
                    <Settings2 className="h-3 w-3 mr-2" />
                    Edit Column
                  </DropdownMenuItem>
                )}
                {onToggleVisibility && (
                  <DropdownMenuItem onClick={onToggleVisibility}>
                    {column.isVisible ? (
                      <>
                        <EyeOff className="h-3 w-3 mr-2" />
                        Hide Column
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3 mr-2" />
                        Show Column
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {onDeleteColumn && (
                  <DropdownMenuItem onClick={onDeleteColumn} className="text-destructive">
                    <AlertTriangle className="h-3 w-3 mr-2" />
                    Delete Column
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Column Description */}
        {column.description && (
          <p className="text-xs text-muted-foreground">{column.description}</p>
        )}

        {/* WIP Limit Progress */}
        {boardSettings?.enableWipLimits && column.taskLimit && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">WIP Limit</span>
              <span 
                className={cn(
                  "font-medium",
                  getWipUtilization() >= 100 && "text-red-600",
                  getWipUtilization() >= 80 && getWipUtilization() < 100 && "text-orange-600"
                )}
              >
                {Math.round(getWipUtilization())}%
              </span>
            </div>
            <Progress 
              value={getWipUtilization()} 
              className="h-2"
              // @ts-ignore - Custom progress color
              color={getWipLimitColor()}
            />
            {wipLimitStatus?.isOverLimit && (
              <div className="flex items-center gap-1 text-xs text-red-600">
                <AlertTriangle className="h-3 w-3" />
                <span>Over WIP limit</span>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 pt-0">
        {tasks.length === 0 ? (
          <div 
            className={cn(
              "flex flex-col items-center justify-center h-32 text-center border-2 border-dashed rounded-lg transition-colors",
              isOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
            )}
          >
            <p className="text-sm text-muted-foreground mb-2">No tasks</p>
            <p className="text-xs text-muted-foreground/70">
              Drop tasks here or click + to add
            </p>
          </div>
        ) : (
          <SortableContext
            items={taskIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {tasks.map((task) => (
                <EnhancedTaskCard 
                  key={task.id} 
                  task={task} 
                  isDragging={false}
                  boardSettings={boardSettings}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </CardContent>
    </Card>
  );
}

export default EnhancedKanbanColumn; 