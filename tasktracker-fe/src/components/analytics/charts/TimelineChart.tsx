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
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClockIcon as TimelineIcon, CalendarIcon, TrendingUpIcon, ClockIcon, TrophyIcon } from 'lucide-react';
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay } from 'date-fns';

interface TimelineChartProps {
  className?: string;
  theme?: 'light' | 'dark' | 'blue' | 'green';
  period?: 'week' | 'month' | 'quarter' | 'year';
}

export const TimelineChart: React.FC<TimelineChartProps> = ({
  className = '',
  theme = 'light',
  period = 'month'
}) => {
  const [data, setData] = useState<TaskTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [viewType, setViewType] = useState<'completion' | 'creation' | 'overdue'>('completion');

  // Fetch timeline data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
      
      const trends = await advancedAnalyticsService.getTaskTrends(startDate, endDate);
      setData(trends);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch timeline data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  // Prepare chart data for timeline visualization
  const prepareChartData = (): ChartData => {
    if (!data || data.length === 0) {
      return { 
        labels: [], 
        datasets: [],
        type: 'line',
        options: getChartOptions()
      };
    }

    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const labels = sortedData.map(item => format(new Date(item.date), 'MMM dd'));

    const datasets = [];

    // Always show completion timeline as primary
    datasets.push({
      label: 'Tasks Completed',
      data: sortedData.map(item => item.tasksCompleted),
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      borderColor: '#22C55E',
      borderWidth: 3,
      fill: viewType === 'completion',
      tension: 0.4,
      pointBackgroundColor: '#22C55E',
      pointBorderColor: '#22C55E',
      pointRadius: 6,
      pointHoverRadius: 8
    });

    if (viewType === 'creation' || viewType === 'completion') {
      datasets.push({
        label: 'Tasks Created',
        data: sortedData.map(item => item.tasksCreated),
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3B82F6',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#3B82F6',
        pointRadius: 4,
        pointHoverRadius: 6
      });
    }

    if (viewType === 'overdue' || viewType === 'completion') {
      datasets.push({
        label: 'Tasks Overdue',
        data: sortedData.map(item => item.tasksOverdue),
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: '#EF4444',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#EF4444',
        pointBorderColor: '#EF4444',
        pointRadius: 4,
        pointHoverRadius: 6
      });
    }

    return { 
      labels, 
      datasets,
      type: 'line',
      options: getChartOptions()
    };
  };

  // Get chart options
  const getChartOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const
      },
      tooltip: {
        enabled: true
      }
    }
  });

  // Calculate timeline statistics
  const calculateStats = () => {
    if (data.length === 0) return null;

    const totalCreated = data.reduce((sum, item) => sum + item.tasksCreated, 0);
    const totalCompleted = data.reduce((sum, item) => sum + item.tasksCompleted, 0);
    const totalOverdue = data.reduce((sum, item) => sum + item.tasksOverdue, 0);
    const avgCompletionRate = data.reduce((sum, item) => sum + item.completionRate, 0) / data.length;

    // Find peak day
    const peakCompletionDay = data.reduce((peak, item) => 
      item.tasksCompleted > peak.tasksCompleted ? item : peak
    );

    // Calculate trend
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, item) => sum + item.completionRate, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, item) => sum + item.completionRate, 0) / secondHalf.length;
    
    const trend = secondAvg > firstAvg ? 'improving' : secondAvg < firstAvg ? 'declining' : 'stable';

    return {
      totalCreated,
      totalCompleted,
      totalOverdue,
      avgCompletionRate,
      peakCompletionDay,
      trend,
      netProgress: totalCompleted - totalCreated
    };
  };

  const chartData = prepareChartData();
  const stats = calculateStats();

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TimelineIcon className="h-5 w-5" />
            Task Timeline
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
            <TimelineIcon className="h-5 w-5" />
            Task Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8">
            <p>Error loading timeline data: {error}</p>
            <Button onClick={fetchData} variant="outline" className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TimelineIcon className="h-5 w-5" />
            Task Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-12">
            <TimelineIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No timeline data available</h3>
            <p className="text-sm">
              Timeline visualization will appear here once you have task activity.
            </p>
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
            <TimelineIcon className="h-5 w-5" />
            Task Timeline
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* View type selector */}
            <Select value={viewType} onValueChange={(value: any) => setViewType(value)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completion">Completion</SelectItem>
                <SelectItem value="creation">Creation</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Period selector */}
            <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="quarter">Quarter</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Timeline statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalCreated}
            </div>
            <div className="text-sm text-gray-600">Created</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats.totalCompleted}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {stats.totalOverdue}
            </div>
            <div className="text-sm text-gray-600">Overdue</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {stats.avgCompletionRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Avg Rate</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Timeline Chart */}
          <div style={{ height: 400 }}>
            <ChartRenderer
              type="line"
              data={chartData}
              theme={theme}
              responsive={true}
              maintainAspectRatio={false}
              options={getChartOptions()}
            />
          </div>

          {/* Timeline insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Peak performance */}
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrophyIcon className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Peak Performance</span>
              </div>
              <div className="text-lg font-bold text-yellow-900">
                {format(new Date(stats.peakCompletionDay.date), 'MMM dd')}
              </div>
              <div className="text-sm text-yellow-700">
                {stats.peakCompletionDay.tasksCompleted} tasks completed ({stats.peakCompletionDay.completionRate.toFixed(1)}%)
              </div>
            </div>

            {/* Trend analysis */}
            <div className={`bg-gradient-to-r ${
              stats.trend === 'improving' ? 'from-green-50 to-green-100 border-green-200' :
              stats.trend === 'declining' ? 'from-red-50 to-red-100 border-red-200' :
              'from-blue-50 to-blue-100 border-blue-200'
            } border rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUpIcon className={`h-5 w-5 ${
                  stats.trend === 'improving' ? 'text-green-600' :
                  stats.trend === 'declining' ? 'text-red-600' :
                  'text-blue-600'
                }`} />
                <span className={`font-medium ${
                  stats.trend === 'improving' ? 'text-green-800' :
                  stats.trend === 'declining' ? 'text-red-800' :
                  'text-blue-800'
                }`}>
                  Performance Trend
                </span>
              </div>
              <div className={`text-lg font-bold ${
                stats.trend === 'improving' ? 'text-green-900' :
                stats.trend === 'declining' ? 'text-red-900' :
                'text-blue-900'
              }`}>
                {stats.trend.charAt(0).toUpperCase() + stats.trend.slice(1)}
              </div>
              <div className={`text-sm ${
                stats.trend === 'improving' ? 'text-green-700' :
                stats.trend === 'declining' ? 'text-red-700' :
                'text-blue-700'
              }`}>
                Net progress: {stats.netProgress > 0 ? '+' : ''}{stats.netProgress} tasks
              </div>
            </div>
          </div>

          {/* Timeline milestones */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Recent Milestones</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {data.slice(-5).reverse().map((item, index) => (
                <div key={item.date} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-3 w-3 text-gray-500" />
                    <span>{format(new Date(item.date), 'MMM dd')}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-xs">
                      +{item.tasksCreated} created
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {item.tasksCompleted} completed
                    </Badge>
                    {item.tasksOverdue > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {item.tasksOverdue} overdue
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimelineChart; 