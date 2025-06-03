'use client';

/**
 * Progress Tracking Dashboard Component
 * Provides comprehensive progress tracking and analytics for boards
 */

import React, { useState, useMemo } from 'react';

// Types
import { Board, BoardColumn } from '@/lib/types/board';
import { Task } from '@/lib/types/task';
import { 
  ProgressData,
  ColumnProgress,
  TimelineData,
  PriorityDistribution,
  ProgressTrackingDashboardProps 
} from '@/lib/types/progress';

// Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Icons
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Clock,
  Target,
  Users,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Zap
} from 'lucide-react';

// Utils
import { formatDistanceToNow, isAfter, isBefore, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export function ProgressTrackingDashboard({
  board,
  columns,
  tasks,
  isOpen,
  onClose
}: ProgressTrackingDashboardProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [viewMode, setViewMode] = useState<'overview' | 'columns' | 'timeline'>('overview');

  // Calculate overall progress data
  const progressData = useMemo((): ProgressData => {
    const now = new Date();
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const pendingTasks = tasks.filter(task => task.status === 'todo').length;
    const overdueTasks = tasks.filter(task => {
      if (!task.dueDate || task.status === 'done') return false;
      return isBefore(new Date(task.dueDate), now);
    }).length;

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Calculate average completion time (simplified)
    const completedTasksWithDates = tasks.filter(task => 
      task.status === 'done' && task.createdAt && task.completedAt
    );
    const averageCompletionTime = completedTasksWithDates.length > 0
      ? completedTasksWithDates.reduce((acc, task) => {
          const created = new Date(task.createdAt);
          const completed = new Date(task.completedAt!);
          return acc + (completed.getTime() - created.getTime());
        }, 0) / completedTasksWithDates.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    // Calculate throughput (tasks completed per week)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const throughput = tasks.filter(task => 
      task.status === 'done' && 
      task.completedAt && 
      isAfter(new Date(task.completedAt), oneWeekAgo)
    ).length;

    // Calculate velocity (story points - simplified)
    const velocity = completedTasks * 2; // Simplified: assume 2 points per task

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      overdueTasks,
      completionRate,
      averageCompletionTime,
      throughput,
      velocity
    };
  }, [tasks]);

  // Calculate column progress data
  const columnProgress = useMemo((): ColumnProgress[] => {
    return columns.map(column => {
      const columnTasks = tasks.filter(task => {
        // Map task status to column based on column's mappedStatus
        return task.status === column.mappedStatus;
      });

      const completedTasksInColumn = columnTasks.filter(task => task.status === 'done').length;
      const wipUtilization = column.taskLimit 
        ? (columnTasks.length / column.taskLimit) * 100 
        : 0;

      // Simplified average time in column calculation
      const averageTimeInColumn = columnTasks.length > 0 ? 2.5 : 0; // Placeholder
      
      // Calculate throughput rate (tasks per week - simplified)
      const throughputRate = completedTasksInColumn * 0.5; // Simplified calculation
      
      // Determine bottleneck indicator
      const bottleneckIndicator = wipUtilization > 80;

      return {
        columnId: column.id,
        columnName: column.name,
        taskCount: columnTasks.length,
        completedTasksInColumn,
        averageTimeInColumn,
        wipUtilization,
        throughputRate,
        bottleneckIndicator
      };
    });
  }, [columns, tasks]);

  // Calculate timeline data
  const timelineData = useMemo((): TimelineData[] => {
    const now = new Date();
    const data: TimelineData[] = [];
    
    // Generate last 30 days of data
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const completed = tasks.filter(task =>
        task.completedAt && 
        task.completedAt.startsWith(dateStr)
      ).length;
      
      const created = tasks.filter(task =>
        task.createdAt.startsWith(dateStr)
      ).length;
      
      // Simplified moved and archived counts
      const moved = Math.floor(Math.random() * 3); // Placeholder
      const archived = 0; // Placeholder
      
      data.push({ date: dateStr, completed, created, moved, archived });
    }
    
    return data;
  }, [tasks]);

  // Get priority distribution
  const priorityDistribution = useMemo(() => {
    const distribution = { low: 0, medium: 0, high: 0, critical: 0 };
    tasks.forEach(task => {
      const priority = task.priority.toLowerCase();
      if (priority in distribution) {
        distribution[priority as keyof typeof distribution]++;
      }
    });
    return distribution;
  }, [tasks]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in-progress':
        return 'text-blue-600';
      case 'overdue':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Progress Tracking Dashboard
          </DialogTitle>
          <DialogDescription>
            Comprehensive analytics and progress tracking for {board.name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Select value={viewMode} onValueChange={(value: string) => setViewMode(value as 'overview' | 'columns' | 'timeline')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                </SelectContent>
              </Select>

              <Select value={timeRange} onValueChange={(value: string) => setTimeRange(value as 'week' | 'month' | 'quarter')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {viewMode === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Completion Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {progressData.completionRate.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {progressData.completedTasks} of {progressData.totalTasks} tasks
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Throughput
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {progressData.throughput}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      tasks completed this week
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Avg. Completion Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {progressData.averageCompletionTime.toFixed(1)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      days average
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Overdue Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${progressData.overdueTasks > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {progressData.overdueTasks}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      need attention
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Task Status Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Task Status Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Completed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{progressData.completedTasks}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {((progressData.completedTasks / progressData.totalTasks) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">In Progress</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{progressData.inProgressTasks}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {((progressData.inProgressTasks / progressData.totalTasks) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                        <span className="text-sm">Pending</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{progressData.pendingTasks}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {((progressData.pendingTasks / progressData.totalTasks) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Priority Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(priorityDistribution).map(([priority, count]) => (
                      <div key={priority} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            priority === 'critical' ? 'bg-red-500' :
                            priority === 'high' ? 'bg-orange-500' :
                            priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></div>
                          <span className="text-sm capitalize">{priority}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{count}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {((count / progressData.totalTasks) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {viewMode === 'columns' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Column Performance</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {columnProgress.map((column) => (
                  <Card key={column.columnId}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{column.columnName}</CardTitle>
                      <CardDescription>
                        {column.taskCount} tasks • {column.wipUtilization.toFixed(1)}% WIP utilization
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Tasks in column:</span>
                        <Badge variant="outline">{column.taskCount}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Avg. time in column:</span>
                        <span className="text-muted-foreground">{column.averageTimeInColumn} days</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(column.wipUtilization, 100)}%` }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'timeline' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Task Creation vs Completion Timeline
                </CardTitle>
                <CardDescription>
                  Last 30 days activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Timeline Chart</h3>
                  <p className="text-muted-foreground">
                    Advanced timeline visualization coming soon
                  </p>
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>Total tasks created in last 30 days: {timelineData.reduce((acc, day) => acc + day.created, 0)}</p>
                    <p>Total tasks completed in last 30 days: {timelineData.reduce((acc, day) => acc + day.completed, 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 