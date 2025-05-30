/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';
import { TaskTrendChart } from '@/components/analytics/charts/TaskTrendChart';
import { ProductivityHeatmap } from '@/components/analytics/charts/ProductivityHeatmap';
import { TimelineChart } from '@/components/analytics/charts/TimelineChart';
import { advancedAnalyticsService } from '@/lib/services/analytics';
import { TaskTrend } from '@/lib/types/analytics';

interface TrendMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  format: 'number' | 'percentage' | 'time';
}

export default function TrendsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [granularity, setGranularity] = useState('daily');
  const [trendData, setTrendData] = useState<TaskTrend[]>([]);
  const [metrics, setMetrics] = useState<TrendMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrendData();
  }, [timeRange, granularity]);

  const loadTrendData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const trends = await advancedAnalyticsService.getTaskTrends(startDate, endDate);
      setTrendData(trends);

      // Calculate trend metrics
      const calculatedMetrics = calculateTrendMetrics(trends);
      setMetrics(calculatedMetrics);

    } catch (err) {
      setError('Failed to load trend data');
      console.error('Error loading trends:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTrendMetrics = (trends: TaskTrend[]): TrendMetric[] => {
    if (trends.length === 0) return [];

    const latest = trends[trends.length - 1];
    const previous = trends[Math.max(0, trends.length - 7)]; // Week ago comparison

    const avgCompletion = trends.reduce((sum, t) => sum + t.completionRate, 0) / trends.length;
    const totalTasks = trends.reduce((sum, t) => sum + t.tasksCompleted, 0);
    const avgDaily = totalTasks / trends.length;

    return [
      {
        label: 'Completion Rate',
        value: latest.completionRate,
        change: latest.completionRate - previous.completionRate,
        trend: latest.completionRate > previous.completionRate ? 'up' : 'down',
        format: 'percentage'
      },
      {
        label: 'Daily Average',
        value: avgDaily,
        change: latest.tasksCompleted - previous.tasksCompleted,
        trend: latest.tasksCompleted > previous.tasksCompleted ? 'up' : 'down',
        format: 'number'
      },
      {
        label: 'Total Completed',
        value: totalTasks,
        change: 0, // This would need period comparison
        trend: 'neutral',
        format: 'number'
      },
      {
        label: 'Average Rate',
        value: avgCompletion,
        change: 0,
        trend: 'neutral',
        format: 'percentage'
      }
    ];
  };

  const formatValue = (value: number, format: TrendMetric['format']) => {
    switch (format) {
      case 'percentage':
        return `${Math.round(value)}%`;
      case 'time':
        return `${Math.round(value)}h`;
      default:
        return Math.round(value).toLocaleString();
    }
  };

  const formatChange = (change: number, format: TrendMetric['format']) => {
    const prefix = change >= 0 ? '+' : '';
    return prefix + formatValue(change, format);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trend Analysis</h1>
          <p className="text-muted-foreground">
            Detailed trend analysis with multiple timeframes and patterns
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadTrendData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Time Range Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Analysis Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Time Range:</span>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm font-medium">Granularity:</span>
              <Select value={granularity} onValueChange={setGranularity}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Overview */}
      {!isLoading && metrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">{metric.label}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {formatValue(metric.value, metric.format)}
                  </div>
                  <div className="flex items-center gap-1">
                    {metric.trend === 'up' && (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    )}
                    {metric.trend === 'down' && (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <Badge 
                      variant={metric.trend === 'up' ? 'default' : metric.trend === 'down' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {formatChange(metric.change, metric.format)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Trend Visualizations */}
      <Tabs defaultValue="line-chart" className="space-y-4">
        <TabsList>
          <TabsTrigger value="line-chart">Line Chart</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="line-chart" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Completion Trends</CardTitle>
              <CardDescription>
                Daily task completion trends over the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaskTrendChart 
                data={trendData}
                isLoading={isLoading}
                className="h-96"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Productivity Heatmap</CardTitle>
              <CardDescription>
                Productivity patterns throughout the day and week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductivityHeatmap 
                data={[]} // This would be productivity data
                isLoading={isLoading}
                className="h-96"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Timeline</CardTitle>
              <CardDescription>
                Timeline view of task completion patterns and milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TimelineChart 
                data={[]} // This would be timeline data
                isLoading={isLoading}
                className="h-96"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-800 text-center">
              <p className="font-medium">Error Loading Trends</p>
              <p className="text-sm mt-1">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={loadTrendData}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 