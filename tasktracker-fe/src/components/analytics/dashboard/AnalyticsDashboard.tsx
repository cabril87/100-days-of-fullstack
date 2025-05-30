'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect } from 'react';
import { TaskTrendChart } from '../charts/TaskTrendChart';
import { ChartRenderer } from '../charts/ChartRenderer';
import { advancedAnalyticsService, dataVisualizationService } from '@/lib/services/analytics';
import type { AdvancedAnalytics, ProductivityMetrics, CategoryBreakdown } from '@/lib/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3Icon, 
  PieChartIcon, 
  TrendingUpIcon, 
  ClockIcon,
  UsersIcon,
  CalendarIcon,
  RefreshCwIcon,
  DownloadIcon,
  SettingsIcon
} from 'lucide-react';
import { format, subMonths } from 'date-fns';

interface AnalyticsDashboardProps {
  className?: string;
  theme?: 'light' | 'dark' | 'blue' | 'green';
  showExportControls?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // in seconds
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  className = '',
  theme = 'light',
  showExportControls = true,
  autoRefresh = false,
  refreshInterval = 300 // 5 minutes
}) => {
  const [analytics, setAnalytics] = useState<AdvancedAnalytics | null>(null);
  const [productivityMetrics, setProductivityMetrics] = useState<ProductivityMetrics | null>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('overview');

  // Data validation helpers
  const hasValidData = () => {
    return (analytics && Object.keys(analytics).length > 0) ||
           (productivityMetrics && Object.keys(productivityMetrics).length > 0) ||
           (categoryBreakdown && categoryBreakdown.length > 0);
  };

  const getDataStatus = () => {
    const hasAnalytics = analytics && Object.keys(analytics).length > 0;
    const hasProductivity = productivityMetrics && Object.keys(productivityMetrics).length > 0;
    const hasCategories = categoryBreakdown && categoryBreakdown.length > 0;
    
    return {
      hasAnalytics,
      hasProductivity,
      hasCategories,
      hasAnyData: hasAnalytics || hasProductivity || hasCategories,
      dataSourcesCount: [hasAnalytics, hasProductivity, hasCategories].filter(Boolean).length
    };
  };

  // Fetch all analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endDate = new Date();
      const startDate = subMonths(endDate, 1);

      // Fetch all analytics data in parallel with proper error handling
      const [analyticsResult, productivityResult, categoryResult] = await Promise.allSettled([
        advancedAnalyticsService.getAdvancedAnalytics(startDate, endDate),
        advancedAnalyticsService.getProductivityMetrics(startDate, endDate),
        advancedAnalyticsService.getCategoryBreakdown(startDate, endDate)
      ]);

      // Handle analytics data
      if (analyticsResult.status === 'fulfilled') {
        setAnalytics(analyticsResult.value);
      } else {
        console.warn('Failed to fetch analytics data:', analyticsResult.reason);
        setAnalytics(null);
      }

      // Handle productivity data
      if (productivityResult.status === 'fulfilled') {
        setProductivityMetrics(productivityResult.value);
      } else {
        console.warn('Failed to fetch productivity data:', productivityResult.reason);
        setProductivityMetrics(null);
      }

      // Handle category data
      if (categoryResult.status === 'fulfilled') {
        setCategoryBreakdown(categoryResult.value || []);
      } else {
        console.warn('Failed to fetch category data:', categoryResult.reason);
        setCategoryBreakdown([]);
      }

      setLastUpdated(new Date());
      
      // Only set error if all requests failed
      const allFailed = [analyticsResult, productivityResult, categoryResult]
        .every(result => result.status === 'rejected');
      
      if (allFailed) {
        setError('Failed to fetch any analytics data. Please check your connection and try again.');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics data';
      setError(errorMessage);
      console.error('Analytics data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh functionality
  useEffect(() => {
    fetchAnalyticsData();

    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchAnalyticsData, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // Export dashboard data
  const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
    try {
      const endDate = new Date();
      const startDate = subMonths(endDate, 1);
      
      await advancedAnalyticsService.exportAnalytics(format, startDate, endDate, true);
      // Note: The actual file download would be handled by the service
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  // Prepare chart data for category breakdown with proper empty state handling
  const getCategoryChartData = () => {
    if (loading) return null;
    
    if (!categoryBreakdown || categoryBreakdown.length === 0) {
      return null; // Will show empty state component
    }
    
    return {
      labels: categoryBreakdown.map(item => item.category),
      datasets: [{
        label: 'Tasks by Category',
        data: categoryBreakdown.map(item => item.count),
        backgroundColor: [
          '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
          '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
        ]
      }],
      type: 'doughnut' as const,
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    };
  };

  // Prepare productivity metrics chart data with proper empty state handling
  const getProductivityChartData = () => {
    if (loading) return null;
    
    if (!productivityMetrics || !productivityMetrics.weeklyTrends || productivityMetrics.weeklyTrends.length === 0) {
      return null; // Will show empty state component
    }
    
    return {
      labels: productivityMetrics.weeklyTrends.map(item => item.week),
      datasets: [{
        label: 'Productivity Score',
        data: productivityMetrics.weeklyTrends.map(item => item.productivityScore),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true
      }],
      type: 'area' as const,
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    };
  };

  // Prepare category completion rates chart data
  const getCategoryCompletionChartData = () => {
    if (loading) return null;
    
    if (!categoryBreakdown || categoryBreakdown.length === 0) {
      return null; // Will show empty state component
    }
    
    return {
      labels: categoryBreakdown.map(item => item.category),
      datasets: [{
        label: 'Completion Rate (%)',
        data: categoryBreakdown.map(item => item.completionRate || 0),
        backgroundColor: '#10B981'
      }],
      type: 'bar' as const,
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    };
  };

  // Empty state component
  const EmptyChartState = ({ title, message }: { title: string; message: string }) => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-4">
      <div className="rounded-full bg-gray-100 p-4 mb-4">
        <BarChart3Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">{title}</h3>
      <p className="text-sm text-center max-w-sm text-gray-600 mb-4 leading-relaxed">{message}</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={fetchAnalyticsData}
          variant="outline"
          size="sm"
        >
          <RefreshCwIcon className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
        <Button
          onClick={() => window.location.href = '/tasks'}
          variant="default"
          size="sm"
        >
          Create Tasks
        </Button>
      </div>
    </div>
  );

  // Loading state component
  const LoadingChartState = () => (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm">Loading chart data...</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={`analytics-dashboard ${className}`}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading analytics dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`analytics-dashboard ${className}`}>
        <div className="bg-white rounded-xl p-6 border border-red-200 shadow-sm">
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">
              Error loading analytics: {error}
            </p>
            <Button 
              onClick={fetchAnalyticsData} 
              variant="outline"
            >
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`analytics-dashboard space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-gray-500">
              Last updated: {format(lastUpdated, 'MMM dd, yyyy HH:mm')}
            </p>
            {!loading && (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${hasValidData() ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {hasValidData() 
                    ? `${getDataStatus().dataSourcesCount}/3 data sources active`
                    : 'No data available - create some tasks to get started'
                  }
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchAnalyticsData}
            variant="outline"
            size="sm"
          >
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          {showExportControls && (
            <div className="flex gap-1">
              <Button
                onClick={() => handleExport('json')}
                variant="outline"
                size="sm"
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                JSON
              </Button>
              <Button
                onClick={() => handleExport('csv')}
                variant="outline"
                size="sm"
              >
                CSV
              </Button>
              <Button
                onClick={() => handleExport('pdf')}
                variant="outline"
                size="sm"
              >
                PDF
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 group cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-white/20">
              <BarChart3Icon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="text-white">
            <div className="text-2xl font-bold mb-1">
              {analytics?.taskTrends?.length || '—'}
            </div>
            <div className="text-white/80 text-sm">Task Trends</div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-to-r from-green-500 to-green-600 group cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-white/20">
              <TrendingUpIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="text-white">
            <div className="text-2xl font-bold mb-1">
              {productivityMetrics?.efficiencyScore?.toFixed(0) || '—'}
              {productivityMetrics?.efficiencyScore ? '%' : ''}
            </div>
            <div className="text-white/80 text-sm">Efficiency Score</div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 group cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-white/20">
              <PieChartIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="text-white">
            <div className="text-2xl font-bold mb-1">
              {categoryBreakdown?.length || '—'}
            </div>
            <div className="text-white/80 text-sm">Active Categories</div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 group cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-white/20">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="text-white">
            <div className="text-2xl font-bold mb-1">
              {analytics?.timeAnalysis?.averageCompletionTime?.toFixed(1) || '—'}
              {analytics?.timeAnalysis?.averageCompletionTime ? 'h' : ''}
            </div>
            <div className="text-white/80 text-sm">Avg Completion</div>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white border border-gray-200 shadow-sm">
          <TabsTrigger value="overview">
            Overview
          </TabsTrigger>
          <TabsTrigger value="trends">
            Trends
          </TabsTrigger>
          <TabsTrigger value="productivity">
            Productivity
          </TabsTrigger>
          <TabsTrigger value="categories">
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Trends Chart */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                <BarChart3Icon className="h-5 w-5 text-blue-500" />
                Task Trends
              </h3>
              <TaskTrendChart 
                theme="light"
                height={300}
                showControls={false}
              />
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                <PieChartIcon className="h-5 w-5 text-purple-500" />
                Category Distribution
              </h3>
              <div style={{ height: 300 }}>
                {loading ? (
                  <LoadingChartState />
                ) : getCategoryChartData() ? (
                  <ChartRenderer
                    type="pie"
                    data={getCategoryChartData()!}
                    theme="light"
                    responsive={true}
                    maintainAspectRatio={false}
                    options={{
                      plugins: {
                        legend: {
                          labels: {
                            color: '#374151'
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <EmptyChartState 
                    title="No Category Data" 
                    message="Create tasks in different categories to see your distribution." 
                  />
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
              <TrendingUpIcon className="h-5 w-5 text-green-500" />
              Task Trends Analysis
            </h3>
            <TaskTrendChart 
              theme="light"
              height={400}
              showControls={true}
            />
          </div>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
              <TrendingUpIcon className="h-5 w-5 text-orange-500" />
              Productivity Trends
            </h3>
            <div style={{ height: 400 }}>
              {loading ? (
                <LoadingChartState />
              ) : getProductivityChartData() ? (
                <ChartRenderer
                  type="area"
                  data={getProductivityChartData()!}
                  theme="light"
                  responsive={true}
                  maintainAspectRatio={false}
                  options={{
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                          display: true,
                          text: 'Productivity Score',
                          color: '#374151'
                        },
                        grid: {
                          color: '#e5e7eb'
                        },
                        ticks: {
                          color: '#374151'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Week',
                          color: '#374151'
                        },
                        grid: {
                          color: '#e5e7eb'
                        },
                        ticks: {
                          color: '#374151'
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        labels: {
                          color: '#374151'
                        }
                      }
                    }
                  }}
                />
              ) : (
                <EmptyChartState 
                  title="No Productivity Data" 
                  message="Complete tasks regularly to track your productivity trends over time." 
                />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Pie Chart */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Category Distribution
              </h3>
              <div style={{ height: 300 }}>
                {loading ? (
                  <LoadingChartState />
                ) : getCategoryChartData() ? (
                  <ChartRenderer
                    type="pie"
                    data={getCategoryChartData()!}
                    theme="light"
                    responsive={true}
                    maintainAspectRatio={false}
                    options={{
                      plugins: {
                        legend: {
                          labels: {
                            color: '#374151'
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <EmptyChartState 
                    title="No Category Data" 
                    message="Create tasks in different categories to see your distribution." 
                  />
                )}
              </div>
            </div>

            {/* Category Bar Chart */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Category Completion Rates
              </h3>
              <div style={{ height: 300 }}>
                {loading ? (
                  <LoadingChartState />
                ) : getCategoryCompletionChartData() ? (
                  <ChartRenderer
                    type="bar"
                    data={getCategoryCompletionChartData()!}
                    theme="light"
                    responsive={true}
                    maintainAspectRatio={false}
                    options={{
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          title: {
                            display: true,
                            text: 'Completion Rate (%)',
                            color: '#374151'
                          },
                          grid: {
                            color: '#e5e7eb'
                          },
                          ticks: {
                            color: '#374151'
                          }
                        },
                        x: {
                          grid: {
                            color: '#e5e7eb'
                          },
                          ticks: {
                            color: '#374151'
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          labels: {
                            color: '#374151'
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <EmptyChartState 
                    title="No Completion Data" 
                    message="Complete tasks in different categories to see completion rates." 
                  />
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard; 