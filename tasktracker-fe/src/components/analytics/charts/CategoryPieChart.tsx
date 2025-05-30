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
import type { AdvancedAnalytics, CategoryBreakdown, ChartData } from '@/lib/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChartIcon, TrendingUpIcon, ClockIcon, PercentIcon } from 'lucide-react';
import { format, subMonths, subWeeks } from 'date-fns';

interface CategoryPieChartProps {
  className?: string;
  theme?: 'light' | 'dark' | 'blue' | 'green';
  chartType?: 'pie' | 'doughnut';
  period?: 'week' | 'month' | 'quarter';
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({
  className = '',
  theme = 'light',
  chartType = 'pie',
  period = 'month'
}) => {
  const [data, setData] = useState<CategoryBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChart, setSelectedChart] = useState(chartType);
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  // Color palette for categories
  const categoryColors = [
    '#3B82F6', // Blue
    '#10B981', // Green  
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280'  // Gray
  ];

  // Fetch category breakdown data
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
        default:
          startDate = subMonths(endDate, 1);
      }
      
      const analytics = await advancedAnalyticsService.getAdvancedAnalytics(startDate, endDate);
      setData(analytics.categoryBreakdown || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch category data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  // Prepare chart data
  const prepareChartData = (): ChartData => {
    if (!data || data.length === 0) {
      return { labels: [], datasets: [] };
    }

    const sortedData = [...data].sort((a, b) => b.count - a.count);
    
    return {
      labels: sortedData.map(item => item.category),
      datasets: [{
        data: sortedData.map(item => item.count),
        backgroundColor: categoryColors.slice(0, sortedData.length),
        borderColor: categoryColors.slice(0, sortedData.length).map(color => color),
        borderWidth: 2,
        hoverOffset: 4
      }]
    };
  };

  // Calculate totals and stats
  const calculateStats = () => {
    const totalTasks = data.reduce((sum, cat) => sum + cat.count, 0);
    const avgCompletionRate = data.length > 0 
      ? data.reduce((sum, cat) => sum + cat.completionRate, 0) / data.length 
      : 0;
    const avgTime = data.length > 0
      ? data.reduce((sum, cat) => sum + cat.averageTime, 0) / data.length
      : 0;
    
    const topCategory = data.reduce((top, cat) => 
      cat.count > top.count ? cat : top, data[0] || { category: '', count: 0, percentage: 0, completionRate: 0, averageTime: 0 }
    );
    
    return { totalTasks, avgCompletionRate, avgTime, topCategory };
  };

  // Get chart options
  const getChartOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 12,
          padding: 20,
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const count = data.datasets[0].data[i];
                const percentage = ((count / data.datasets[0].data.reduce((a: number, b: number) => a + b, 0)) * 100).toFixed(1);
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor[i],
                  lineWidth: 2,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const category = data[context.dataIndex];
            const percentage = category?.percentage || 0;
            return [
              `${context.label}: ${context.parsed} tasks`,
              `${percentage.toFixed(1)}% of total`,
              `${category?.completionRate.toFixed(1)}% completed`,
              `${category?.averageTime.toFixed(1)}h average time`
            ];
          }
        }
      }
    }
  });

  // Get performance insights
  const getInsights = () => {
    if (data.length === 0) return [];
    
    const insights = [];
    const totalTasks = data.reduce((sum, cat) => sum + cat.count, 0);
    
    // Find dominant category
    const dominant = data.find(cat => cat.percentage > 40);
    if (dominant) {
      insights.push(`${dominant.category} dominates with ${dominant.percentage.toFixed(1)}% of tasks`);
    }
    
    // Find high completion rate categories
    const highCompletion = data.filter(cat => cat.completionRate > 80);
    if (highCompletion.length > 0) {
      insights.push(`${highCompletion.length} categories have >80% completion rate`);
    }
    
    // Find time-intensive categories
    const timeIntensive = data.filter(cat => cat.averageTime > 5);
    if (timeIntensive.length > 0) {
      insights.push(`${timeIntensive.length} categories take >5 hours on average`);
    }
    
    return insights;
  };

  const chartData = prepareChartData();
  const stats = calculateStats();
  const insights = getInsights();

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Category Distribution
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
            <PieChartIcon className="h-5 w-5" />
            Category Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8">
            <p>Error loading category data: {error}</p>
            <Button onClick={fetchData} variant="outline" className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Category Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-12">
            <PieChartIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No category data available</h3>
            <p className="text-sm">
              Category distribution will appear here once you have tasks in different categories.
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
            <PieChartIcon className="h-5 w-5" />
            Category Distribution
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Period selector */}
            <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="quarter">Quarter</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Chart type selector */}
            <Select value={selectedChart} onValueChange={(value: any) => setSelectedChart(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="doughnut">Doughnut</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalTasks}
            </div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats.avgCompletionRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Avg Completion</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {stats.avgTime.toFixed(1)}h
            </div>
            <div className="text-sm text-gray-600">Avg Time</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {data.length}
            </div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Chart */}
          <div style={{ height: 400 }}>
            <ChartRenderer
              type={selectedChart as any}
              data={chartData}
              theme={theme}
              responsive={true}
              maintainAspectRatio={false}
              options={getChartOptions()}
            />
          </div>

          {/* Top category and insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top category */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUpIcon className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Most Active Category</span>
              </div>
              <div className="text-lg font-bold text-blue-900">
                {stats.topCategory.category}
              </div>
              <div className="text-sm text-blue-700">
                {stats.topCategory.count} tasks ({stats.topCategory.percentage.toFixed(1)}%)
              </div>
            </div>

            {/* Insights */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <PercentIcon className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Insights</span>
              </div>
              {insights.length > 0 ? (
                <div className="space-y-1">
                  {insights.map((insight, index) => (
                    <div key={index} className="text-sm text-green-700">
                      • {insight}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-green-700">
                  Balanced distribution across categories
                </div>
              )}
            </div>
          </div>

          {/* Category details */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Category Breakdown</h4>
            <div className="grid gap-2">
              {data.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full border-2"
                      style={{ 
                        backgroundColor: categoryColors[index],
                        borderColor: categoryColors[index]
                      }}
                    />
                    <span className="font-medium">{category.category}</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">
                      {category.count} tasks
                    </Badge>
                    <Badge variant="outline">
                      {category.percentage.toFixed(1)}%
                    </Badge>
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <PercentIcon className="h-3 w-3" />
                      {category.completionRate.toFixed(1)}% done
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <ClockIcon className="h-3 w-3" />
                      {category.averageTime.toFixed(1)}h avg
                    </div>
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

export default CategoryPieChart; 