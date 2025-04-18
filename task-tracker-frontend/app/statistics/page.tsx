"use client";

import { useEffect } from "react";
import { useStatistics } from "@/context/StatisticsContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPercentage, formatDuration } from "@/lib/utils";
import { BarChart, CheckCircle, Clock, PieChart, AlertCircle, TrendingUp } from "lucide-react";

export default function StatisticsPage() {
  const { 
    statistics, 
    productivitySummary, 
    completionRate,
    tasksByStatus, 
    isLoading,
    fetchAllStatistics,
    fetchProductivitySummary,
    fetchCompletionRate,
    fetchTasksByStatusDistribution
  } = useStatistics();

  useEffect(() => {
    // Fetch all statistics data
    fetchAllStatistics();
    fetchProductivitySummary();
    fetchCompletionRate();
    fetchTasksByStatusDistribution();
  }, [fetchAllStatistics, fetchProductivitySummary, fetchCompletionRate, fetchTasksByStatusDistribution]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Statistics & Analytics</h1>
        <p className="text-muted-foreground">
          Analyze your task completion and productivity metrics
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="distributions">Distributions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading || !completionRate ? "—" : completionRate.totalTasks}
                </div>
                <p className="text-xs text-muted-foreground">
                  All tasks in your account
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
                  {completionRate 
                    ? `${completionRate.completedTasks} of ${completionRate.totalTasks} tasks completed` 
                    : "Tasks completed"
                  }
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
                  {isLoading || !productivitySummary 
                    ? "—" 
                    : formatDuration(productivitySummary.averageTimeToComplete.totalHours)
                  }
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
                <div className="text-2xl font-bold">
                  {isLoading || !statistics ? "—" : statistics.overdueCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tasks past their due date
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Task Status Distribution</CardTitle>
              <CardDescription>
                Breakdown of your tasks by current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading || !statistics ? (
                <div className="h-[200px] flex items-center justify-center">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {statistics.tasksByStatus.map((statusGroup) => (
                    <div key={statusGroup.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColorClass(statusGroup.label)}`}></div>
                          <span>{statusGroup.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{statusGroup.count}</span>
                          <span className="text-sm text-muted-foreground">
                            ({formatPercentage(statusGroup.percentage)})
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getStatusColorClass(statusGroup.label)}`} 
                          style={{ width: `${statusGroup.percentage * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Productivity Tab */}
        <TabsContent value="productivity" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Productivity Metrics</CardTitle>
                <CardDescription>
                  Your task completion and creation patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading || !productivitySummary ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
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
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">Average Completion Rate</div>
                        <div className="text-sm font-medium">{formatPercentage(productivitySummary.averageCompletionRate)}</div>
                      </div>
                      <div className="bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-500 h-full" 
                          style={{ width: `${productivitySummary.averageCompletionRate * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">Average Time to Complete</div>
                        <div className="text-sm font-medium">
                          {formatDuration(productivitySummary.averageTimeToComplete.totalHours)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {productivitySummary.averageTimeToComplete.days > 0 && 
                            `${productivitySummary.averageTimeToComplete.days} days, `}
                          {productivitySummary.averageTimeToComplete.hours} hours, 
                          {productivitySummary.averageTimeToComplete.minutes} minutes
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Task Completion Trend</CardTitle>
                <CardDescription>
                  Task completion over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading || !statistics ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px]">
                    <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-center text-muted-foreground">
                      Productivity trend visualization will be added in a future update.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Distributions Tab */}
        <TabsContent value="distributions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Priority Distribution</CardTitle>
                <CardDescription>
                  Tasks categorized by priority level
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading || !statistics ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {statistics.tasksByPriority.map((priorityGroup) => (
                      <div key={priorityGroup.label} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getPriorityColorClass(priorityGroup.label)}`}></div>
                            <span>{priorityGroup.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{priorityGroup.count}</span>
                            <span className="text-sm text-muted-foreground">
                              ({formatPercentage(priorityGroup.percentage)})
                            </span>
                          </div>
                        </div>
                        <div className="bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getPriorityColorClass(priorityGroup.label)}`} 
                            style={{ width: `${priorityGroup.percentage * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>
                  Tasks grouped by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading || !statistics ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {statistics.tasksByCategory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[200px]">
                        <BarChart className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className="text-center text-muted-foreground">
                          No categories have been assigned to tasks yet.
                        </p>
                      </div>
                    ) : (
                      statistics.tasksByCategory.map((categoryGroup) => (
                        <div key={categoryGroup.label} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span>{categoryGroup.label || "Uncategorized"}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{categoryGroup.count}</span>
                              <span className="text-sm text-muted-foreground">
                                ({formatPercentage(categoryGroup.percentage)})
                              </span>
                            </div>
                          </div>
                          <div className="bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-indigo-500 h-full" 
                              style={{ width: `${categoryGroup.percentage * 100}%` }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper functions for color classes
function getStatusColorClass(status: string): string {
  switch (status) {
    case 'ToDo':
      return 'bg-gray-500';
    case 'InProgress':
      return 'bg-blue-500';
    case 'Completed':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
}

function getPriorityColorClass(priority: string): string {
  switch (priority) {
    case 'Very Low':
    case '1':
      return 'bg-gray-500';
    case 'Low':
    case '2':
      return 'bg-blue-500';
    case 'Medium':
    case '3':
      return 'bg-yellow-500';
    case 'High':
    case '4':
      return 'bg-orange-500';
    case 'Urgent':
    case '5':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
} 