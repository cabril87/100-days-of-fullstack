'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect } from 'react';
import { ChartRenderer } from './ChartRenderer';
import { advancedAnalyticsService } from '@/lib/services/analytics';
import type { TaskTrend, ChartData } from '@/lib/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
import { format, subDays, subWeeks, subMonths } from 'date-fns';

interface TaskTrendChartProps {
  className?: string;
  theme?: 'light' | 'dark' | 'blue' | 'green';
  height?: number;
  showControls?: boolean;
  defaultPeriod?: 'week' | 'month' | 'quarter' | 'year';
}

export const TaskTrendChart: React.FC<TaskTrendChartProps> = ({
  className = '',
  theme = 'light',
  height = 400,
  showControls = true,
  defaultPeriod = 'month'
}) => {
  const [data, setData] = useState<TaskTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState(defaultPeriod);
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');

  // Calculate date range based on period
  const getDateRange = (selectedPeriod: string) => {
    const endDate = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case 'week':
        startDate = subWeeks(endDate, 1);
        break;
      case 'month':
        startDate = subMonths(endDate, 1);
        break;
      case 'quarter':
        startDate = subMonths(endDate, 3);
        break;
      case 'year':
        startDate = subMonths(endDate, 12);
        break;
      default:
        startDate = subMonths(endDate, 1);
    }

    return { startDate, endDate };
  };

  // Fetch task trends data
  const fetchData = async (selectedPeriod: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { startDate, endDate } = getDateRange(selectedPeriod);
      const trends = await advancedAnalyticsService.getTaskTrends(startDate, endDate);
      
      setData(trends);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch task trends');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and period change
  useEffect(() => {
    fetchData(period);
  }, [period]);

  // Convert task trends to chart data
  const chartData: ChartData = {
    labels: data.map(item => format(new Date(item.date), 'MMM dd')),
    datasets: [
      {
        label: 'Tasks Created',
        data: data.map(item => item.tasksCreated),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: chartType === 'area'
      },
      {
        label: 'Tasks Completed',
        data: data.map(item => item.tasksCompleted),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: chartType === 'area'
      },
      {
        label: 'Tasks Overdue',
        data: data.map(item => item.tasksOverdue),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: chartType === 'area'
      }
    ]
  };

  // Calculate summary statistics
  const totalCreated = data.reduce((sum, item) => sum + item.tasksCreated, 0);
  const totalCompleted = data.reduce((sum, item) => sum + item.tasksCompleted, 0);
  const totalOverdue = data.reduce((sum, item) => sum + item.tasksOverdue, 0);
  const averageCompletionRate = data.length > 0 
    ? data.reduce((sum, item) => sum + item.completionRate, 0) / data.length 
    : 0;

  // Calculate trend direction
  const getTrendDirection = () => {
    if (data.length < 2) return 'neutral';
    
    const recent = data.slice(-7); // Last 7 days
    const earlier = data.slice(-14, -7); // Previous 7 days
    
    const recentAvg = recent.reduce((sum, item) => sum + item.completionRate, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, item) => sum + item.completionRate, 0) / earlier.length;
    
    if (recentAvg > earlierAvg + 5) return 'up';
    if (recentAvg < earlierAvg - 5) return 'down';
    return 'neutral';
  };

  const trendDirection = getTrendDirection();

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5" />
            Task Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5" />
            Task Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8">
            <p>Error loading task trends: {error}</p>
            <Button 
              onClick={() => fetchData(period)} 
              variant="outline" 
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5" />
            Task Trends
            {trendDirection === 'up' && <TrendingUpIcon className="h-4 w-4 text-green-500" />}
            {trendDirection === 'down' && <TrendingDownIcon className="h-4 w-4 text-red-500" />}
          </CardTitle>
          
          {showControls && (
            <div className="flex items-center gap-2">
              {/* Period selector */}
              <div className="flex rounded-md border">
                {['week', 'month', 'quarter', 'year'].map((p) => (
                  <Button
                    key={p}
                    variant={period === p ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPeriod(p)}
                    className="rounded-none first:rounded-l-md last:rounded-r-md"
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Button>
                ))}
              </div>
              
              {/* Chart type selector */}
              <div className="flex rounded-md border">
                {['line', 'area', 'bar'].map((type) => (
                  <Button
                    key={type}
                    variant={chartType === type ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setChartType(type as any)}
                    className="rounded-none first:rounded-l-md last:rounded-r-md"
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Summary statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalCreated}</div>
            <div className="text-sm text-gray-500">Created</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalCompleted}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{totalOverdue}</div>
            <div className="text-sm text-gray-500">Overdue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {averageCompletionRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">Avg. Completion</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div style={{ height }}>
          <ChartRenderer
            type={chartType}
            data={chartData}
            theme={theme}
            responsive={true}
            maintainAspectRatio={false}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Number of Tasks'
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Date'
                  }
                }
              },
              plugins: {
                legend: {
                  position: 'top' as const
                },
                tooltip: {
                  mode: 'index' as const,
                  intersect: false,
                  callbacks: {
                    afterBody: (context: any) => {
                      const dataIndex = context[0].dataIndex;
                      const item = data[dataIndex];
                      return [`Completion Rate: ${item.completionRate.toFixed(1)}%`];
                    }
                  }
                }
              },
              interaction: {
                mode: 'nearest' as const,
                axis: 'x' as const,
                intersect: false
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskTrendChart; 