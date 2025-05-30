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
import type { FamilyAnalytics, MemberComparison, ChartData } from '@/lib/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UsersIcon, TrophyIcon, TrendingUpIcon, ClockIcon } from 'lucide-react';
import { format, subMonths } from 'date-fns';

interface FamilyComparisonChartProps {
  className?: string;
  theme?: 'light' | 'dark' | 'blue' | 'green';
  chartType?: 'bar' | 'radar' | 'line';
}

export const FamilyComparisonChart: React.FC<FamilyComparisonChartProps> = ({
  className = '',
  theme = 'light',
  chartType = 'bar'
}) => {
  const [data, setData] = useState<FamilyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChart, setSelectedChart] = useState(chartType);
  const [selectedMetric, setSelectedMetric] = useState<'completion' | 'productivity' | 'time'>('completion');

  // Fetch family analytics data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endDate = new Date();
      const startDate = subMonths(endDate, 1);
      
      const familyData = await advancedAnalyticsService.getFamilyAnalytics(startDate, endDate);
      setData(familyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch family analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Prepare chart data based on selected metric
  const prepareChartData = (): ChartData => {
    if (!data || !data.memberComparisons) {
      return { labels: [], datasets: [] };
    }

    const members = data.memberComparisons;
    const labels = members.map(member => member.memberName);

    switch (selectedMetric) {
      case 'completion':
        return {
          labels,
          datasets: [{
            label: 'Completion Rate (%)',
            data: members.map(member => member.completionRate),
            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
            borderColor: ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED'],
            borderWidth: 2
          }]
        };
      
      case 'productivity':
        return {
          labels,
          datasets: [{
            label: 'Productivity Score',
            data: members.map(member => member.productivityScore),
            backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'],
            borderColor: ['#059669', '#2563EB', '#D97706', '#DC2626', '#7C3AED'],
            borderWidth: 2
          }]
        };
      
      case 'time':
        return {
          labels,
          datasets: [{
            label: 'Average Completion Time (hours)',
            data: members.map(member => member.averageCompletionTime),
            backgroundColor: ['#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6'],
            borderColor: ['#D97706', '#2563EB', '#059669', '#DC2626', '#7C3AED'],
            borderWidth: 2
          }]
        };
      
      default:
        return { labels: [], datasets: [] };
    }
  };

  // Get chart options based on selected chart type
  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: selectedChart !== 'bar'
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const member = data?.memberComparisons[context.dataIndex];
              if (!member) return '';
              
              switch (selectedMetric) {
                case 'completion':
                  return `${member.memberName}: ${member.completionRate.toFixed(1)}% (${member.tasksCompleted} tasks)`;
                case 'productivity':
                  return `${member.memberName}: ${member.productivityScore.toFixed(1)} points`;
                case 'time':
                  return `${member.memberName}: ${member.averageCompletionTime.toFixed(1)} hours`;
                default:
                  return '';
              }
            }
          }
        }
      }
    };

    if (selectedChart === 'bar') {
      return {
        ...baseOptions,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: selectedMetric === 'completion' ? 'Completion Rate (%)' :
                    selectedMetric === 'productivity' ? 'Productivity Score' :
                    'Average Time (hours)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Family Members'
            }
          }
        }
      };
    }

    if (selectedChart === 'radar') {
      return {
        ...baseOptions,
        scales: {
          r: {
            beginAtZero: true,
            max: selectedMetric === 'completion' ? 100 : 
                 selectedMetric === 'productivity' ? 100 : 10
          }
        }
      };
    }

    return baseOptions;
  };

  // Get top performer
  const getTopPerformer = (): MemberComparison | null => {
    if (!data?.memberComparisons) return null;
    
    return data.memberComparisons.reduce((top, member) => {
      switch (selectedMetric) {
        case 'completion':
          return member.completionRate > top.completionRate ? member : top;
        case 'productivity':
          return member.productivityScore > top.productivityScore ? member : top;
        case 'time':
          return member.averageCompletionTime < top.averageCompletionTime ? member : top;
        default:
          return top;
      }
    });
  };

  // Get performance insights
  const getPerformanceInsights = () => {
    if (!data?.memberComparisons) return [];
    
    const insights = [];
    const members = data.memberComparisons;
    const avgCompletion = members.reduce((sum, m) => sum + m.completionRate, 0) / members.length;
    const avgProductivity = members.reduce((sum, m) => sum + m.productivityScore, 0) / members.length;
    
    // Find members above/below average
    const aboveAvg = members.filter(m => m.completionRate > avgCompletion);
    const belowAvg = members.filter(m => m.completionRate < avgCompletion);
    
    if (aboveAvg.length > 0) {
      insights.push(`${aboveAvg.length} member(s) performing above average`);
    }
    
    if (belowAvg.length > 0) {
      insights.push(`${belowAvg.length} member(s) could use support`);
    }
    
    return insights;
  };

  const chartData = prepareChartData();
  const topPerformer = getTopPerformer();
  const insights = getPerformanceInsights();

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Family Comparison
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
            <UsersIcon className="h-5 w-5" />
            Family Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8">
            <p>Error loading family data: {error}</p>
            <Button onClick={fetchData} variant="outline" className="mt-4">
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
            <UsersIcon className="h-5 w-5" />
            Family Comparison
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Metric selector */}
            <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completion">Completion Rate</SelectItem>
                <SelectItem value="productivity">Productivity</SelectItem>
                <SelectItem value="time">Time Efficiency</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Chart type selector */}
            <Select value={selectedChart} onValueChange={(value: any) => setSelectedChart(value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar</SelectItem>
                <SelectItem value="radar">Radar</SelectItem>
                <SelectItem value="line">Line</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Family stats */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {data.familyProductivity.totalTasks}
              </div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {data.familyProductivity.familyCompletionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Family Rate</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {data.familyProductivity.averageTasksPerMember.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg per Member</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {data.collaborationMetrics.teamEfficiencyScore.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Team Score</div>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Chart */}
          <div style={{ height: 300 }}>
            <ChartRenderer
              type={selectedChart as any}
              data={chartData}
              theme={theme}
              responsive={true}
              maintainAspectRatio={false}
              options={getChartOptions()}
            />
          </div>

          {/* Top performer and insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top performer */}
            {topPerformer && (
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrophyIcon className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">
                    {selectedMetric === 'completion' ? 'Highest Completion Rate' :
                     selectedMetric === 'productivity' ? 'Most Productive' :
                     'Most Time Efficient'}
                  </span>
                </div>
                <div className="text-lg font-bold text-yellow-900">
                  {topPerformer.memberName}
                </div>
                <div className="text-sm text-yellow-700">
                  {selectedMetric === 'completion' && `${topPerformer.completionRate.toFixed(1)}% completion`}
                  {selectedMetric === 'productivity' && `${topPerformer.productivityScore.toFixed(1)} points`}
                  {selectedMetric === 'time' && `${topPerformer.averageCompletionTime.toFixed(1)} hours avg.`}
                </div>
              </div>
            )}

            {/* Insights */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUpIcon className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Insights</span>
              </div>
              {insights.length > 0 ? (
                <div className="space-y-1">
                  {insights.map((insight, index) => (
                    <div key={index} className="text-sm text-blue-700">
                      • {insight}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-blue-700">
                  All family members are performing well!
                </div>
              )}
            </div>
          </div>

          {/* Member details */}
          {data?.memberComparisons && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Member Performance</h4>
              <div className="grid gap-2">
                {data.memberComparisons.map((member, index) => (
                  <div key={member.memberId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full`} style={{
                        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index] || '#6B7280'
                      }}></div>
                      <span className="font-medium">{member.memberName}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">
                        {member.tasksCompleted} tasks
                      </Badge>
                      <Badge variant="outline">
                        {member.completionRate.toFixed(1)}%
                      </Badge>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        {member.averageCompletionTime.toFixed(1)}h
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FamilyComparisonChart; 