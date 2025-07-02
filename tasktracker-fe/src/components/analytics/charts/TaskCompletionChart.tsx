'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TaskCompletionChartProps } from '@/lib/props/components/analytics.props';

export function TaskCompletionChart({ 
  data, 
  timeRange,
  className 
}: TaskCompletionChartProps) {
  const {
    completedTasks,
    pendingTasks,
    overdueTasks,
    completionRate,
    completionTrends,
    averageCompletionTime,
    tasksByPriority,
    tasksByCategory
  } = data;

  // Convert completion trends to array for visualization
  const dataPoints = Object.entries(completionTrends || {}).map(([key, value]) => ({
    label: key,
    value: value,
    date: new Date(key)
  })).sort((a, b) => a.date.getTime() - b.date.getTime());

  const maxDaily = Math.max(...dataPoints.map(d => d.value));
  const avgDaily = dataPoints.reduce((sum, d) => sum + d.value, 0) / dataPoints.length;

  // Calculate trend
  const recentData = dataPoints.slice(-7);
  const olderData = dataPoints.slice(-14, -7);
  const recentAvg = recentData.length > 0 ? recentData.reduce((sum, d) => sum + d.value, 0) / recentData.length : 0;
  const olderAvg = olderData.length > 0 ? olderData.reduce((sum, d) => sum + d.value, 0) / olderData.length : 0;
  const trend = recentAvg > olderAvg ? 'up' : recentAvg < olderAvg ? 'down' : 'stable';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="space-y-1">
          <p className="text-2xl font-bold">{completedTasks}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-orange-600">{pendingTasks}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-red-600">{overdueTasks}</p>
          <p className="text-xs text-muted-foreground">Overdue</p>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium">Completion Rate</h4>
          <Badge 
            variant={completionRate > 75 ? 'default' : completionRate > 50 ? 'secondary' : 'destructive'}
          >
            {completionRate.toFixed(1)}%
          </Badge>
        </div>
        <Progress value={completionRate} className="h-3" />
      </div>

      {/* Trend Indicator */}
      <div className="flex justify-center">
        <Badge 
          variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'secondary'}
          className="text-xs"
        >
          {trend === 'up' && '📈 Trending Up'}
          {trend === 'down' && '📉 Trending Down'}
          {trend === 'stable' && '➡️ Stable'}
        </Badge>
      </div>

      {/* Completion Chart */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Daily Completions ({timeRange})</h4>
        <div className="space-y-1">
          {dataPoints.slice(-10).map((point, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-xs w-16 text-muted-foreground">
                {point.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <div className="flex-1">
                <Progress 
                  value={maxDaily > 0 ? (point.value / maxDaily) * 100 : 0} 
                  className="h-3"
                />
              </div>
              <span className="text-xs w-8 text-right font-medium">
                {point.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Task Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        {/* By Priority */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">By Priority</h4>
          <div className="space-y-1">
            {Object.entries(tasksByPriority || {}).map(([priority, count]) => (
              <div key={priority} className="flex justify-between text-xs">
                <span className="capitalize">{priority}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By Category */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">By Category</h4>
          <div className="space-y-1">
            {Object.entries(tasksByCategory || {}).map(([category, count]) => (
              <div key={category} className="flex justify-between text-xs">
                <span className="capitalize">{category}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Performance Metrics</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-muted rounded">
            <p className="font-medium">{averageCompletionTime}</p>
            <p className="text-muted-foreground">Avg Completion Time</p>
          </div>
          <div className="p-2 bg-muted rounded">
            <p className="font-medium">{avgDaily.toFixed(1)}</p>
            <p className="text-muted-foreground">Daily Average</p>
          </div>
        </div>
      </div>

      {/* Completion Insights */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Completion Patterns</h4>
        <div className="space-y-1 text-xs text-muted-foreground">
          {completionRate > 75 && (
            <p className="text-green-600">🏆 Excellent completion rate!</p>
          )}
          {completionRate >= 50 && completionRate <= 75 && (
            <p className="text-blue-600">👍 Good progress - keep up the momentum</p>
          )}
          {completionRate < 50 && (
            <p className="text-orange-600">💡 Consider breaking tasks into smaller chunks</p>
          )}
          {overdueTasks > 0 && (
            <p className="text-red-600">⚠️ {overdueTasks} overdue tasks need attention</p>
          )}
          {trend === 'up' && (
            <p className="text-green-600">🚀 Great improvement in recent days</p>
          )}
        </div>
      </div>
    </div>
  );
} 
