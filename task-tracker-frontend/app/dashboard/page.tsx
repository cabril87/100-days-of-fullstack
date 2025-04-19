"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTasks, TaskStatus } from "@/context/TaskContext";
import { useStatistics } from "@/context/StatisticsContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { AlertCircle, CheckCircle, Clock, PlusCircle, RotateCw, LayoutGrid, Move } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import Link from "next/link";
import { Todo } from "@/components/ui/Todo";

export default function DashboardPage() {
  const { tasks, isLoading: tasksLoading } = useTasks();
  const { 
    productivitySummary,
    completionRate,
    tasksByStatus,
    isLoading, 
    error,
    retryFetchAll
  } = useStatistics();

  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const loadAttemptedRef = useRef(false);
  const [loadTimeout, setLoadTimeout] = useState<NodeJS.Timeout | null>(null);

  // Load data on component mount only once
  useEffect(() => {
    if (!loadAttemptedRef.current) {
      loadAttemptedRef.current = true;
      
      // Call retry fetch directly
      retryFetchAll();
      
      // Set a timeout to mark that we've attempted loading
      const timeout = setTimeout(() => {
        setHasAttemptedLoad(true);
      }, 2000);
      
      setLoadTimeout(timeout);
      
      // Clean up the timeout on unmount
      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }
  }, [retryFetchAll]);

  // Count tasks by status
  const todoCount = tasks.filter(task => task.status === 'ToDo').length;
  const inProgressCount = tasks.filter(task => task.status === 'InProgress').length;
  const completedCount = tasks.filter(task => task.status === 'Completed').length;
  const totalTasks = tasks.length;
  
  // Calculate completion rate
  const calculatedCompletionRate = totalTasks > 0 
    ? Math.round((completedCount / totalTasks) * 100) 
    : 0;
    
  // Use API completion rate if available, otherwise use calculated
  const displayCompletionRate = completionRate?.completionRate ?? calculatedCompletionRate;

  // Find overdue tasks
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.status === 'Completed') return false;
    return new Date(task.dueDate) < new Date();
  });

  // Calculate task priority distributions
  const priorityDistribution = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const highPriorityCount = (priorityDistribution[4] || 0) + (priorityDistribution[5] || 0);

  // Calculate average completion time
  const getTimeToComplete = () => {
    // Use API value if available
    if (productivitySummary?.averageTimeToComplete?.totalHours) {
      return formatDuration(productivitySummary.averageTimeToComplete.totalHours);
    }
    
    // Calculate from tasks if API data is not available
    const completedTasksWithDates = tasks.filter(task => 
      task.status === 'Completed' && task.completedAt && task.createdAt
    );
    
    if (completedTasksWithDates.length === 0) {
      return "—";
    }
    
    const totalHours = completedTasksWithDates.reduce((sum, task) => {
      const completedDate = new Date(task.completedAt!);
      const createdDate = new Date(task.createdAt);
      const diffHours = (completedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
      return sum + diffHours;
    }, 0);
    
    const avgHours = totalHours / completedTasksWithDates.length;
    return formatDuration(avgHours);
  };

  // Handle retry button click
  const handleRetry = () => {
    retryFetchAll();
    
    // Reset loadTimeout
    if (loadTimeout) {
      clearTimeout(loadTimeout);
    }
    
    const timeout = setTimeout(() => {
      setHasAttemptedLoad(true);
    }, 2000);
    
    setLoadTimeout(timeout);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Your task productivity at a glance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRetry} disabled={isLoading}>
            <RotateCw className="mr-2 h-4 w-4" />
            Refresh Statistics
          </Button>
          <Link href="/tasks/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <div className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {completedCount} completed, {todoCount + inProgressCount} remaining
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayCompletionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {completedCount} out of {totalTasks} tasks
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTimeToComplete()}</div>
            <p className="text-xs text-muted-foreground">
              Per completed task
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {highPriorityCount} high priority tasks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Task Status and Productivity Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Task Status</CardTitle>
            <CardDescription>
              Distribution of your tasks by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="text-muted-foreground w-28">To Do</div>
                    <div className="flex-1">
                      <div className="bg-gray-100 h-4 rounded-full overflow-hidden">
                        <div 
                          className="bg-gray-500 h-full rounded-full" 
                          style={{ width: totalTasks ? `${(todoCount / totalTasks) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                    <div className="ml-3 text-sm font-medium w-10 text-right">{todoCount}</div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="text-muted-foreground w-28">In Progress</div>
                    <div className="flex-1">
                      <div className="bg-gray-100 h-4 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full rounded-full" 
                          style={{ width: totalTasks ? `${(inProgressCount / totalTasks) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                    <div className="ml-3 text-sm font-medium w-10 text-right">{inProgressCount}</div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="text-muted-foreground w-28">Completed</div>
                    <div className="flex-1">
                      <div className="bg-gray-100 h-4 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-500 h-full rounded-full" 
                          style={{ width: totalTasks ? `${(completedCount / totalTasks) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                    <div className="ml-3 text-sm font-medium w-10 text-right">{completedCount}</div>
                  </div>
                </div>
                
                {totalTasks > 0 && (
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'To Do', value: todoCount },
                            { name: 'In Progress', value: inProgressCount },
                            { name: 'Completed', value: completedCount },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          labelLine={false}
                          label={({ name, percent }) => {
                            // Don't render labels for very small segments (less than 5%)
                            if (percent < 0.05) return null;
                            return `${name}: ${(percent * 100).toFixed(0)}%`;
                          }}
                        >
                          <Cell fill="#6b7280" />
                          <Cell fill="#3b82f6" />
                          <Cell fill="#22c55e" />
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} tasks`, 'Count']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Quick Tasks</CardTitle>
            <CardDescription>
              Add and manage quick to-do items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Todo className="border-0 shadow-none p-0" />
          </CardContent>
        </Card>
      </div>

      {/* Task Boards section */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/tasks/new">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Task
                </Button>
              </Link>
              <Link href="/tasks?filter=overdue">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  View Overdue Tasks ({overdueTasks.length})
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Boards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/tasks/board">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Task Board
                </Button>
              </Link>
              <Link href="/tasks/board-dnd-kit">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Move className="mr-2 h-4 w-4" />
                  Modern Task Board
                </Button>
              </Link>
              <Link href="/tasks?priority=high">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  High Priority Tasks ({highPriorityCount})
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/statistics">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  View All Statistics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 