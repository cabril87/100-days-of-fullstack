"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useStatistics } from "@/context/StatisticsContext";
import { useTasks } from "@/context/TaskContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPercentage, formatDuration } from "@/lib/utils";
import { PlusCircle, CheckCircle, Clock, PieChart, BarChart3, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const { tasks, isLoading: tasksLoading } = useTasks();
  const { 
    productivitySummary, 
    completionRate,
    isLoading: statsLoading,
    fetchProductivitySummary,
    fetchCompletionRate
  } = useStatistics();

  useEffect(() => {
    fetchProductivitySummary();
    fetchCompletionRate();
  }, [fetchProductivitySummary, fetchCompletionRate]);

  const isLoading = tasksLoading || statsLoading;

  // Get counts for different task statuses
  const todoCount = tasks.filter(task => task.status === 'ToDo').length;
  const inProgressCount = tasks.filter(task => task.status === 'InProgress').length;
  const completedCount = tasks.filter(task => task.status === 'Completed').length;
  const totalTasks = tasks.length;

  // Get overdue tasks
  const overdueTasks = tasks.filter(task => {
    if (task.status === 'Completed') return false;
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date();
  });

  // Calculate task priority distributions
  const priorityDistribution = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const highPriorityCount = (priorityDistribution[4] || 0) + (priorityDistribution[5] || 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your tasks and productivity
          </p>
        </div>
        <Link href="/tasks/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </Link>
      </div>

      {/* Task Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "—" : totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              Active and completed tasks
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading || !completionRate ? "—" : formatPercentage(completionRate.completionRate)}
            </div>
            <p className="text-xs text-muted-foreground">
              {completionRate ? `${completionRate.completedTasks} of ${completionRate.totalTasks} tasks completed` : "Tasks completed"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading || !productivitySummary ? "—" : formatDuration(productivitySummary.averageTimeToComplete.totalHours)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average time to complete tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "—" : overdueTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Tasks past their due date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Task Status and Productivity  */}
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
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="text-muted-foreground w-24">To Do</div>
                    <div className="flex-1">
                      <div className="bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-gray-500 h-full" 
                          style={{ width: totalTasks ? `${(todoCount / totalTasks) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                    <div className="ml-2 text-sm font-medium">{todoCount}</div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="text-muted-foreground w-24">In Progress</div>
                    <div className="flex-1">
                      <div className="bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full" 
                          style={{ width: totalTasks ? `${(inProgressCount / totalTasks) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                    <div className="ml-2 text-sm font-medium">{inProgressCount}</div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="text-muted-foreground w-24">Completed</div>
                    <div className="flex-1">
                      <div className="bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-500 h-full" 
                          style={{ width: totalTasks ? `${(completedCount / totalTasks) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                    <div className="ml-2 text-sm font-medium">{completedCount}</div>
                  </div>
                </div>
                
                <div className="flex justify-center pt-4">
                  <Link href="/tasks">
                    <Button variant="outline" size="sm">View All Tasks</Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Productivity</CardTitle>
            <CardDescription>
              Your productivity statistics and metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || !productivitySummary ? (
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-3">
                    <div className="text-sm text-muted-foreground">Tasks per Day</div>
                    <div className="text-2xl font-bold">{productivitySummary.averageTasksPerDay.toFixed(1)}</div>
                  </div>
                  
                  <div className="border rounded-lg p-3">
                    <div className="text-sm text-muted-foreground">Tasks per Week</div>
                    <div className="text-2xl font-bold">{productivitySummary.averageTasksPerWeek.toFixed(1)}</div>
                  </div>
                </div>
                
                <div className="flex justify-center pt-4">
                  <Link href="/statistics">
                    <Button variant="outline" size="sm">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Statistics
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
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
              <Link href="/tasks?filter=high-priority">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  High Priority Tasks ({highPriorityCount})
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 