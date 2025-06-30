'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProductivityChartProps } from '@/lib/types/analytics';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ProductivityChart({ 
  data, 
  timeRange,
  className 
}: ProductivityChartProps) {
  const {
    productivityScore,
    efficiencyRating,
    averageFocusTime,
    focusSessionsCompleted,
    peakProductivityHours,
    productivityTrends
  } = data;

  // Convert productivity trends to array for visualization
  const dataPoints = Object.entries(productivityTrends).map(([key, value]) => ({
    label: key,
    value: value,
    date: new Date(key)
  })).sort((a, b) => a.date.getTime() - b.date.getTime());

  const maxValue = Math.max(...dataPoints.map(d => d.value));

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="space-y-1">
          <p className="text-2xl font-bold text-green-600">{productivityScore}</p>
          <p className="text-xs text-muted-foreground">Productivity Score</p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{efficiencyRating}</p>
          <p className="text-xs text-muted-foreground">Efficiency Rating</p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-orange-600">{focusSessionsCompleted}</p>
          <p className="text-xs text-muted-foreground">Focus Sessions</p>
        </div>
      </div>

      {/* Simple Bar Chart Visualization */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Productivity Trends ({timeRange})</h4>
        <div className="space-y-1">
          {dataPoints.slice(-7).map((point, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-xs w-16 text-muted-foreground">
                {point.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <div className="flex-1">
                <Progress 
                  value={maxValue > 0 ? (point.value / maxValue) * 100 : 0} 
                  className="h-3"
                />
              </div>
              <span className="text-xs w-8 text-right font-medium">
                {point.value.toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Peak Hours */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Peak Productivity Hours</h4>
        <div className="flex flex-wrap gap-1">
          {peakProductivityHours.length > 0 ? (
            peakProductivityHours.slice(0, 6).map((hour, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {hour}
              </Badge>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">No peak hours data available</p>
          )}
        </div>
      </div>

      {/* Focus Time */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Focus Time Summary</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-muted rounded">
            <p className="font-medium">{averageFocusTime}</p>
            <p className="text-muted-foreground">Average Focus Time</p>
          </div>
          <div className="p-2 bg-muted rounded">
            <p className="font-medium">{focusSessionsCompleted}</p>
            <p className="text-muted-foreground">Sessions Completed</p>
          </div>
        </div>
      </div>

      {/* Productivity Insights */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Insights</h4>
        <div className="space-y-1 text-xs text-muted-foreground">
          {productivityScore > 75 && (
            <p className="text-green-600">🚀 Excellent productivity levels maintained</p>
          )}
          {productivityScore >= 50 && productivityScore <= 75 && (
            <p className="text-blue-600">💪 Good productivity with room for improvement</p>
          )}
          {productivityScore < 50 && (
            <p className="text-orange-600">⚡ Consider optimizing your workflow</p>
          )}
          {peakProductivityHours.length > 0 && (
            <p>🕒 Most productive during {peakProductivityHours.slice(0, 2).join(' and ')}</p>
          )}
          {efficiencyRating > 80 && (
            <p className="text-purple-600">⭐ High efficiency rating - great time management!</p>
          )}
        </div>
      </div>
    </div>
  );
} 