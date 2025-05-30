/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  Clock,
  Target,
  Zap,
  BarChart3,
  Activity,
  RefreshCw,
  Download,
  Calendar
} from 'lucide-react';
import { ProductivityChart } from '@/components/analytics/charts/ProductivityChart';
import { TimeDistributionChart } from '@/components/analytics/charts/TimeDistributionChart';
import { advancedAnalyticsService } from '@/lib/services/analytics';
import { ProductivityMetrics, TimeAnalysis } from '@/lib/types/analytics';

export default function ProductivityPage() {
  const [metrics, setMetrics] = useState<ProductivityMetrics | null>(null);
  const [timeAnalysis, setTimeAnalysis] = useState<TimeAnalysis | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProductivityData();
  }, [timeRange]);

  const loadProductivityData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(timeRange.replace('d', '')));

      const [metricsData, timeData] = await Promise.all([
        advancedAnalyticsService.getProductivityMetrics(startDate, endDate),
        advancedAnalyticsService.getTimeAnalysis(startDate, endDate)
      ]);

      setMetrics(metricsData);
      setTimeAnalysis(timeData);
    } catch (err) {
      setError('Failed to load productivity data');
      console.error('Error loading productivity analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getProductivityLevel = (score: number) => {
    if (score >= 90) return { level: 'Elite', color: 'from-purple-500 to-purple-600', icon: '🏆' };
    if (score >= 80) return { level: 'High', color: 'from-blue-500 to-blue-600', icon: '⚡' };
    if (score >= 70) return { level: 'Good', color: 'from-green-500 to-green-600', icon: '✨' };
    if (score >= 60) return { level: 'Average', color: 'from-yellow-500 to-yellow-600', icon: '📈' };
    return { level: 'Needs Work', color: 'from-red-500 to-red-600', icon: '🎯' };
  };

  const getMostProductiveTime = () => {
    if (!timeAnalysis) return 'N/A';
    const hour = timeAnalysis.mostProductiveHour;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto p-4 max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Productivity Analytics</h1>
            <p className="text-white/70">
              Deep insights into your productivity patterns and performance
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadProductivityData}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 mb-8">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Productivity Dashboard</h2>
                <p className="text-white/80">Monitor your efficiency, time management, and work patterns</p>
              </div>
            </div>
            
            {!isLoading && metrics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <Zap className="h-6 w-6 text-yellow-400" />
                    <div>
                      <div className="text-white/80 text-sm">Efficiency Score</div>
                      <div className="text-white text-xl font-bold">{metrics.efficiencyScore}%</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <Target className="h-6 w-6 text-green-400" />
                    <div>
                      <div className="text-white/80 text-sm">Daily Average</div>
                      <div className="text-white text-lg font-semibold">{metrics.dailyAverage} tasks</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-blue-400" />
                    <div>
                      <div className="text-white/80 text-sm">Peak Time</div>
                      <div className="text-white text-lg font-semibold">{getMostProductiveTime()}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Productivity Score */}
        {!isLoading && metrics && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-6 w-6 text-green-500" />
              <h2 className="text-2xl font-bold text-white">Productivity Assessment</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(() => {
                const level = getProductivityLevel(metrics.efficiencyScore);
                return (
                  <div className={`relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-to-r ${level.color} group cursor-pointer`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-3xl">{level.icon}</div>
                      <div>
                        <div className="text-white font-semibold">{level.level}</div>
                        <div className="text-white/80 text-sm">Performance Level</div>
                      </div>
                    </div>
                    
                    <div className="text-white">
                      <div className="text-3xl font-bold mb-2">{metrics.efficiencyScore}%</div>
                      <Progress 
                        value={metrics.efficiencyScore} 
                        className="h-2 bg-white/20" 
                      />
                    </div>
                  </div>
                );
              })()}

              <div className="relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-to-r from-orange-500 to-red-500 group cursor-pointer">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="h-6 w-6 text-white" />
                  <div>
                    <div className="text-white font-semibold">Daily Tasks</div>
                    <div className="text-white/80 text-sm">Average per day</div>
                  </div>
                </div>
                
                <div className="text-white">
                  <div className="text-3xl font-bold mb-2">{metrics.dailyAverage}</div>
                  <div className="text-white/80 text-sm">tasks completed</div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-to-r from-cyan-500 to-blue-500 group cursor-pointer">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="h-6 w-6 text-white" />
                  <div>
                    <div className="text-white font-semibold">Peak Hour</div>
                    <div className="text-white/80 text-sm">Most productive</div>
                  </div>
                </div>
                
                <div className="text-white">
                  <div className="text-2xl font-bold mb-2">{getMostProductiveTime()}</div>
                  <div className="text-white/80 text-sm">optimal focus time</div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-to-r from-emerald-500 to-green-500 group cursor-pointer">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="h-6 w-6 text-white" />
                  <div>
                    <div className="text-white font-semibold">Best Day</div>
                    <div className="text-white/80 text-sm">Peak performance</div>
                  </div>
                </div>
                
                <div className="text-white">
                  <div className="text-xl font-bold mb-2">{timeAnalysis?.mostProductiveDay || 'Monday'}</div>
                  <div className="text-white/80 text-sm">highest output</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
          <Tabs defaultValue="trends" className="space-y-4">
            <TabsList className="bg-white/10 backdrop-blur-sm border border-white/20">
              <TabsTrigger 
                value="trends"
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
              >
                Productivity Trends
              </TabsTrigger>
              <TabsTrigger 
                value="time"
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
              >
                Time Distribution
              </TabsTrigger>
              <TabsTrigger 
                value="analysis"
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
              >
                Deep Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trends" className="space-y-6">
              <div className="bg-white/5 border-white/10 backdrop-blur-sm rounded-xl p-6 border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Productivity Over Time
                </h3>
                <ProductivityChart 
                  data={metrics?.weeklyTrends || []}
                  isLoading={isLoading}
                  theme="dark"
                  height={400}
                />
              </div>
            </TabsContent>

            <TabsContent value="time" className="space-y-6">
              <div className="bg-white/5 border-white/10 backdrop-blur-sm rounded-xl p-6 border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Time Distribution Analysis
                </h3>
                <TimeDistributionChart 
                  data={timeAnalysis?.timeDistribution || []}
                  isLoading={isLoading}
                  theme="dark"
                  height={400}
                />
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="bg-white/5 border-white/10 backdrop-blur-sm rounded-xl p-6 border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  Advanced Analytics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold">Performance Insights</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-white/80">
                        <span>Total Time Spent</span>
                        <span className="font-semibold text-white">{timeAnalysis?.totalTimeSpent || 0}h</span>
                      </div>
                      <div className="flex justify-between items-center text-white/80">
                        <span>Avg Completion Time</span>
                        <span className="font-semibold text-white">{timeAnalysis?.averageCompletionTime || 0}h</span>
                      </div>
                      <div className="flex justify-between items-center text-white/80">
                        <span>Peak Performance Day</span>
                        <span className="font-semibold text-white">{timeAnalysis?.mostProductiveDay || 'Monday'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold">Optimization Tips</h4>
                    <div className="space-y-2 text-white/80 text-sm">
                      <p>• Your peak time is {getMostProductiveTime()} - schedule important tasks then</p>
                      <p>• {timeAnalysis?.mostProductiveDay || 'Monday'} is your strongest day for challenging work</p>
                      <p>• Consider time-blocking to improve efficiency</p>
                      <p>• Your current productivity level is {getProductivityLevel(metrics?.efficiencyScore || 0).level}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
              <span className="ml-4 text-white">Loading productivity analytics...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 backdrop-blur-sm rounded-xl p-6">
            <div className="text-center py-4">
              <p className="text-red-400 mb-4">{error}</p>
              <Button 
                onClick={loadProductivityData}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 