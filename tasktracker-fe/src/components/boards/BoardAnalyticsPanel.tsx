'use client';

/**
 * Board Analytics Panel Component
 * Comprehensive analytics dashboard with insights and performance metrics
 */

import React, { useState, useEffect } from 'react';
import { Board, BoardAnalytics, ColumnStatistics } from '@/lib/types/board';
import { useBoard } from '@/lib/providers/BoardProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  Activity,
  Users,
  AlertTriangle,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface BoardAnalyticsPanelProps {
  board: Board;
  onClose: () => void;
}

export function BoardAnalyticsPanel({ board, onClose }: BoardAnalyticsPanelProps) {
  const { 
    state: { 
      boardAnalytics, 
      wipLimitStatuses,
      isLoadingAnalytics 
    },
    fetchBoardAnalytics,
    fetchWipLimitStatus
  } = useBoard();
  
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  });

  // Load analytics on mount
  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    await Promise.all([
      fetchBoardAnalytics(board.id, dateRange),
      fetchWipLimitStatus(board.id)
    ]);
  };

  // Calculate completion rate
  const getCompletionRate = (): number => {
    if (!boardAnalytics || boardAnalytics.totalTasks === 0) return 0;
    return Math.round((boardAnalytics.completedTasks / boardAnalytics.totalTasks) * 100);
  };

  // Get cycle time in days
  const getCycleTimeDays = (): number => {
    if (!boardAnalytics) return 0;
    return Math.round(boardAnalytics.averageCycleTime / (24 * 60)); // Convert minutes to days
  };

  // Get efficiency rating
  const getEfficiencyRating = (): string => {
    const completionRate = getCompletionRate();
    if (completionRate >= 90) return 'Excellent';
    if (completionRate >= 75) return 'Good';
    if (completionRate >= 60) return 'Average';
    return 'Needs Improvement';
  };

  // Get efficiency color
  const getEfficiencyColor = (): string => {
    const completionRate = getCompletionRate();
    if (completionRate >= 90) return 'text-green-600';
    if (completionRate >= 75) return 'text-blue-600';
    if (completionRate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get column performance insights
  const getColumnInsights = () => {
    if (!boardAnalytics?.columnStatistics) return [];
    
    return boardAnalytics.columnStatistics.map(col => {
      const isBottleneck = col.averageTimeInColumn > 480; // > 8 hours
      const isEfficient = col.completedTasks > col.totalTasks * 0.8;
      const wipUtilization = col.wipLimitUtilization;
      
      return {
        ...col,
        isBottleneck,
        isEfficient,
        insight: isBottleneck 
          ? 'Potential bottleneck - tasks spending too long here'
          : isEfficient 
          ? 'Performing well with good throughput'
          : 'Could improve task completion rate'
      };
    });
  };

  if (isLoadingAnalytics) {
    return (
      <Card className="w-96 h-fit">
        <CardContent className="pt-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Board Analytics
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto space-y-4">
        {boardAnalytics ? (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">
                <Activity className="h-4 w-4 mr-1" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="columns">
                <Target className="h-4 w-4 mr-1" />
                Columns
              </TabsTrigger>
              <TabsTrigger value="insights">
                <TrendingUp className="h-4 w-4 mr-1" />
                Insights
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Completion Rate</p>
                        <p className="text-xl font-bold">{getCompletionRate()}%</p>
                      </div>
                    </div>
                    <Progress value={getCompletionRate()} className="mt-2 h-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Cycle Time</p>
                        <p className="text-xl font-bold">{getCycleTimeDays()}d</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-purple-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Total Tasks</p>
                        <p className="text-xl font-bold">{boardAnalytics.totalTasks}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">In Progress</p>
                        <p className="text-xl font-bold">{boardAnalytics.inProgressTasks}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Rating */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Board Performance</p>
                      <p className={`text-lg font-bold ${getEfficiencyColor()}`}>
                        {getEfficiencyRating()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Based on completion rate</p>
                      <p className="text-sm font-medium">{getCompletionRate()}% completion</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* WIP Limit Status */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm mb-3">WIP Limit Status</h4>
                  <div className="space-y-2">
                    {wipLimitStatuses.map((status) => (
                      <div key={status.columnId} className="flex items-center justify-between">
                        <span className="text-sm">{status.columnName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {status.currentTaskCount}/{status.wipLimit || 'No limit'}
                          </span>
                          {status.isOverLimit && (
                            <AlertTriangle className="h-3 w-3 text-red-600" />
                          )}
                          {status.isAtLimit && !status.isOverLimit && (
                            <Badge variant="secondary" className="text-xs">At limit</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Columns Tab */}
            <TabsContent value="columns" className="space-y-4">
              <div className="space-y-3">
                {boardAnalytics.columnStatistics.map((column) => (
                  <Card key={column.columnId}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{column.columnName}</h4>
                          <Badge variant="outline" className="text-xs">
                            {column.totalTasks} tasks
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div>
                            <p className="text-xs text-muted-foreground">Completed</p>
                            <p className="text-sm font-medium">{column.completedTasks}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Avg Time</p>
                            <p className="text-sm font-medium">
                              {Math.round(column.averageTimeInColumn / 60)}h
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Throughput</p>
                            <p className="text-sm font-medium">{column.throughput}/day</p>
                          </div>
                        </div>
                        
                        {column.wipLimitUtilization > 0 && (
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>WIP Utilization</span>
                              <span>{Math.round(column.wipLimitUtilization)}%</span>
                            </div>
                            <Progress value={column.wipLimitUtilization} className="h-2" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-4">
              <div className="space-y-3">
                {getColumnInsights().map((insight) => (
                  <Card key={insight.columnId}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {insight.isBottleneck ? (
                          <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                        ) : insight.isEfficient ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{insight.columnName}</h5>
                          <p className="text-xs text-muted-foreground mt-1">
                            {insight.insight}
                          </p>
                          {insight.isBottleneck && (
                            <p className="text-xs text-orange-600 mt-2">
                              Consider reviewing processes or increasing WIP limits
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Recommendations */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm mb-3">Recommendations</h4>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    {getCompletionRate() < 70 && (
                      <p>• Consider breaking down large tasks into smaller, manageable pieces</p>
                    )}
                    {boardAnalytics.inProgressTasks > boardAnalytics.completedTasks && (
                      <p>• Focus on completing existing tasks before starting new ones</p>
                    )}
                    {wipLimitStatuses.some(s => s.isOverLimit) && (
                      <p>• Review WIP limits - some columns are over capacity</p>
                    )}
                    {getCycleTimeDays() > 7 && (
                      <p>• Consider reducing cycle time by identifying and removing bottlenecks</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No analytics data available</p>
            <p className="text-sm">Analytics will appear once you have tasks in your board</p>
          </div>
        )}

        {/* Date Range Info */}
        <div className="text-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 inline mr-1" />
            Data from {format(new Date(dateRange.from), 'MMM dd')} to {format(new Date(dateRange.to), 'MMM dd')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default BoardAnalyticsPanel; 