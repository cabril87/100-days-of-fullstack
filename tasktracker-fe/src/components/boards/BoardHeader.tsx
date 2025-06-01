'use client';

/**
 * Board Header Component
 * Advanced header with board info, controls, and statistics
 */

import React from 'react';
import { Board, BoardColumn } from '@/lib/types/board';
import { Task } from '@/lib/types/task';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw,
  Settings,
  BarChart3,
  LayoutTemplate,
  Plus,
  Grid3X3,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { formatDate } from 'date-fns';

interface BoardHeaderProps {
  board: Board;
  columns: BoardColumn[];
  tasksByColumn: Record<number, Task[]>;
  onRefresh: () => void;
  onSettingsClick: () => void;
  onAnalyticsClick: () => void;
  onTemplateClick: () => void;
}

export function BoardHeader({
  board,
  columns,
  tasksByColumn,
  onRefresh,
  onSettingsClick,
  onAnalyticsClick,
  onTemplateClick
}: BoardHeaderProps) {
  // Calculate statistics
  const getTotalTasks = (): number => {
    return Object.values(tasksByColumn).reduce((total, tasks) => total + tasks.length, 0);
  };

  const getCompletedTasks = (): number => {
    return Object.values(tasksByColumn).reduce((total, tasks) => {
      return total + tasks.filter(task => 
        task.status?.toLowerCase() === 'completed' || 
        task.status?.toLowerCase() === 'done'
      ).length;
    }, 0);
  };

  const getCompletionPercentage = (): number => {
    const total = getTotalTasks();
    if (total === 0) return 0;
    return Math.round((getCompletedTasks() / total) * 100);
  };

  const getOverdueTasks = (): number => {
    const now = new Date();
    return Object.values(tasksByColumn).reduce((total, tasks) => {
      return total + tasks.filter(task => 
        task.dueDate && 
        new Date(task.dueDate) < now && 
        task.status?.toLowerCase() !== 'completed' &&
        task.status?.toLowerCase() !== 'done'
      ).length;
    }, 0);
  };

  const getTasksInProgress = (): number => {
    return Object.values(tasksByColumn).reduce((total, tasks) => {
      return total + tasks.filter(task => 
        task.status?.toLowerCase() === 'in-progress' ||
        task.status?.toLowerCase() === 'in_progress' ||
        task.status?.toLowerCase() === 'inprogress'
      ).length;
    }, 0);
  };

  const getHighPriorityTasks = (): number => {
    return Object.values(tasksByColumn).reduce((total, tasks) => {
      return total + tasks.filter(task => 
        task.priority?.toLowerCase() === 'high' ||
        task.priority?.toLowerCase() === 'critical'
      ).length;
    }, 0);
  };

  return (
    <div className="space-y-4">
      {/* Main Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Grid3X3 className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">{board.name}</h1>
              {board.description && (
                <p className="text-sm text-muted-foreground">{board.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-medium">
              <LayoutTemplate className="h-3 w-3 mr-1" />
              {board.template}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Updated {formatDate(new Date(board.updatedAt || board.createdAt), 'MMM dd')}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button onClick={onTemplateClick} variant="outline" size="sm">
            <LayoutTemplate className="h-4 w-4 mr-2" />
            Templates
          </Button>
          
          <Button onClick={onAnalyticsClick} variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          
          <Button onClick={onSettingsClick} variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Total Tasks */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
                <p className="text-xl font-bold">{getTotalTasks()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed Tasks */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-xl font-bold">{getCompletedTasks()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-xs text-muted-foreground">In Progress</p>
                <p className="text-xl font-bold">{getTasksInProgress()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overdue Tasks */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-xs text-muted-foreground">Overdue</p>
                <p className="text-xl font-bold">{getOverdueTasks()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* High Priority */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-xs text-muted-foreground">High Priority</p>
                <p className="text-xl font-bold">{getHighPriorityTasks()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Progress */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Progress</p>
                <p className="text-xs font-medium">{getCompletionPercentage()}%</p>
              </div>
              <Progress value={getCompletionPercentage()} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Column Overview */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {columns.map((column) => {
          const taskCount = tasksByColumn[column.id]?.length || 0;
          const isAtLimit = column.taskLimit && taskCount >= column.taskLimit;
          
          return (
            <div
              key={column.id}
              className="flex items-center gap-2 px-3 py-2 bg-card border rounded-md min-w-fit"
              style={{ borderColor: column.color }}
            >
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: column.color }}
              />
              <span className="text-sm font-medium">{column.name}</span>
              <Badge 
                variant={isAtLimit ? "destructive" : "secondary"}
                className="text-xs"
              >
                {taskCount}
                {column.taskLimit && `/${column.taskLimit}`}
              </Badge>
              {isAtLimit && <AlertTriangle className="h-3 w-3 text-red-600" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BoardHeader; 