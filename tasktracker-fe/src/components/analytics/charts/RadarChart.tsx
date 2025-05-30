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
import type { AdvancedAnalytics, PerformanceScore, ChartData } from '@/lib/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadarIcon, TargetIcon, TrendingUpIcon, AwardIcon } from 'lucide-react';
import { format, subMonths } from 'date-fns';

interface RadarChartProps {
  className?: string;
  theme?: 'light' | 'dark' | 'blue' | 'green';
  period?: 'week' | 'month' | 'quarter';
}

export const RadarChart: React.FC<RadarChartProps> = ({
  className = '',
  theme = 'light',
  period = 'month'
}) => {
  const [data, setData] = useState<AdvancedAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [comparisonMode, setComparisonMode] = useState<'personal' | 'family' | 'benchmark'>('personal');

  // Fetch analytics data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endDate = new Date();
      let startDate: Date;
      
      switch (selectedPeriod) {
        case 'week':
          startDate = subMonths(endDate, 0.25);
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
      setData(analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  // Calculate performance scores from analytics data
  const calculatePerformanceScores = (): PerformanceScore => {
    if (!data) {
      return {
        overall: 0,
        categories: { completion: 0, efficiency: 0, consistency: 0, collaboration: 0 },
        benchmarks: { personal: 0, family: 0, global: 0 }
      };
    }

    // Calculate completion score based on task trends
    const completionRate = data.taskTrends.length > 0 
      ? data.taskTrends.reduce((sum, trend) => sum + trend.completionRate, 0) / data.taskTrends.length 
      : 0;

    // Calculate efficiency score from productivity metrics
    const efficiencyScore = data.productivityMetrics.efficiencyScore || 0;

    // Calculate consistency score based on daily variance
    const consistency = data.productivityMetrics.dailyAverage > 0 ? 
      Math.min(100, (data.productivityMetrics.dailyAverage / 10) * 100) : 0;

    // Calculate collaboration score (mock data since we don't have family analytics here)
    const collaboration = 75; // Mock collaboration score

    const overall = (completionRate + efficiencyScore + consistency + collaboration) / 4;

    return {
      overall,
      categories: {
        completion: completionRate,
        efficiency: efficiencyScore,
        consistency,
        collaboration
      },
      benchmarks: {
        personal: overall,
        family: overall * 0.9, // Family average slightly lower
        global: 65 // Global benchmark
      }
    };
  };

  // Get radar chart options
  const getRadarOptions = () => ({
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

  // Prepare radar chart data
  const prepareRadarData = (): ChartData => {
    const scores = calculatePerformanceScores();
    
    const labels = ['Completion Rate', 'Efficiency', 'Consistency', 'Collaboration'];
    const currentData = [
      scores.categories.completion,
      scores.categories.efficiency,
      scores.categories.consistency,
      scores.categories.collaboration
    ];

    const datasets = [{
      label: 'Current Performance',
      data: currentData,
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: '#3B82F6',
      borderWidth: 3,
      pointBackgroundColor: '#3B82F6',
      pointBorderColor: '#3B82F6',
      pointRadius: 6,
      pointHoverRadius: 8
    }];

    // Add comparison data based on selected mode
    if (comparisonMode === 'family') {
      datasets.push({
        label: 'Family Average',
        data: [
          scores.benchmarks.family,
          scores.benchmarks.family * 0.95,
          scores.benchmarks.family * 1.05,
          scores.benchmarks.family * 0.9
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderColor: '#22C55E',
        borderWidth: 2,
        pointBackgroundColor: '#22C55E',
        pointBorderColor: '#22C55E',
        pointRadius: 4,
        pointHoverRadius: 6
      });
    } else if (comparisonMode === 'benchmark') {
      datasets.push({
        label: 'Global Benchmark',
        data: [65, 70, 60, 68], // Global benchmark values
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderColor: '#F97316',
        borderWidth: 2,
        pointBackgroundColor: '#F97316',
        pointBorderColor: '#F97316',
        pointRadius: 4,
        pointHoverRadius: 6
      });
    }

    return { 
      labels, 
      datasets,
      type: 'radar',
      options: getRadarOptions()
    };
  };

  // Get performance insights
  const getPerformanceInsights = () => {
    const scores = calculatePerformanceScores();
    const insights = [];

    // Find strengths and weaknesses
    const categories = Object.entries(scores.categories);
    const strongest = categories.reduce((max, cat) => cat[1] > max[1] ? cat : max);
    const weakest = categories.reduce((min, cat) => cat[1] < min[1] ? cat : min);

    insights.push(`Strongest area: ${strongest[0]} (${strongest[1].toFixed(1)}%)`);
    insights.push(`Growth opportunity: ${weakest[0]} (${weakest[1].toFixed(1)}%)`);

    // Overall performance level
    if (scores.overall >= 80) {
      insights.push('Exceptional performance across all areas');
    } else if (scores.overall >= 60) {
      insights.push('Strong performance with room for optimization');
    } else {
      insights.push('Multiple areas for significant improvement');
    }

    return insights;
  };

  const chartData = prepareRadarData();
  const scores = calculatePerformanceScores();
  const insights = getPerformanceInsights();

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RadarIcon className="h-5 w-5" />
            Performance Radar
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
            <RadarIcon className="h-5 w-5" />
            Performance Radar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8">
            <p>Error loading performance data: {error}</p>
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
            <RadarIcon className="h-5 w-5" />
            Performance Radar
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Comparison mode selector */}
            <Select value={comparisonMode} onValueChange={(value: any) => setComparisonMode(value)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="family">vs Family</SelectItem>
                <SelectItem value="benchmark">vs Benchmark</SelectItem>
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
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Performance score summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {scores.overall.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Overall</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {scores.categories.completion.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Completion</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {scores.categories.efficiency.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Efficiency</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {scores.categories.consistency.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Consistency</div>
          </div>
          <div className="text-center p-3 bg-pink-50 rounded-lg">
            <div className="text-2xl font-bold text-pink-600">
              {scores.categories.collaboration.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Collaboration</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Radar Chart */}
          <div style={{ height: 400 }}>
            <ChartRenderer
              type="radar"
              data={chartData}
              theme={theme}
              responsive={true}
              maintainAspectRatio={false}
              options={getRadarOptions()}
            />
          </div>

          {/* Performance insights and recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Performance insights */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TargetIcon className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Performance Insights</span>
              </div>
              <div className="space-y-1">
                {insights.map((insight, index) => (
                  <div key={index} className="text-sm text-blue-700">
                    • {insight}
                  </div>
                ))}
              </div>
            </div>

            {/* Performance ranking */}
            <div className={`bg-gradient-to-r ${
              scores.overall >= 80 ? 'from-green-50 to-green-100 border-green-200' :
              scores.overall >= 60 ? 'from-yellow-50 to-yellow-100 border-yellow-200' :
              'from-red-50 to-red-100 border-red-200'
            } border rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <AwardIcon className={`h-5 w-5 ${
                  scores.overall >= 80 ? 'text-green-600' :
                  scores.overall >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`} />
                <span className={`font-medium ${
                  scores.overall >= 80 ? 'text-green-800' :
                  scores.overall >= 60 ? 'text-yellow-800' :
                  'text-red-800'
                }`}>
                  Performance Level
                </span>
              </div>
              <div className={`text-lg font-bold ${
                scores.overall >= 80 ? 'text-green-900' :
                scores.overall >= 60 ? 'text-yellow-900' :
                'text-red-900'
              }`}>
                {scores.overall >= 80 ? 'Exceptional' :
                 scores.overall >= 60 ? 'Strong' : 'Developing'}
              </div>
              <div className={`text-sm ${
                scores.overall >= 80 ? 'text-green-700' :
                scores.overall >= 60 ? 'text-yellow-700' :
                'text-red-700'
              }`}>
                {scores.overall >= 80 ? 'Top 10% performance' :
                 scores.overall >= 60 ? 'Above average performance' :
                 'Focus on key improvements'}
              </div>
            </div>
          </div>

          {/* Detailed metrics breakdown */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Performance Breakdown</h4>
            <div className="grid gap-3">
              {Object.entries(scores.categories).map(([category, score]) => {
                const percentage = score;
                const categoryNames = {
                  completion: 'Completion Rate',
                  efficiency: 'Task Efficiency',
                  consistency: 'Daily Consistency',
                  collaboration: 'Team Collaboration'
                };
                
                return (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        percentage >= 80 ? 'bg-green-500' :
                        percentage >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <span className="font-medium">{categoryNames[category as keyof typeof categoryNames]}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            percentage >= 80 ? 'bg-green-500' :
                            percentage >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        ></div>
                      </div>
                      <Badge variant="outline" className="min-w-16 justify-center">
                        {percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RadarChart; 