'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  TrendingUp, 
  Target, 
  Brain, 
  Lightbulb, 
  Calendar,
  BarChart3,
  Zap,
  Trophy,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw
} from 'lucide-react';
import { focusService } from '@/lib/services/focusService';
import { ProductivityInsights } from '@/lib/types/focus';
import { useToast } from '@/lib/hooks/useToast';

interface ProductivityInsightsDashboardProps {
  className?: string;
}

export function ProductivityInsightsDashboard({ className }: ProductivityInsightsDashboardProps) {
  const [insights, setInsights] = useState<ProductivityInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const { showToast } = useToast();
  const isMountedRef = React.useRef(true);

  const loadInsights = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90));
      
      const response = await focusService.getProductivityInsights(
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      if (isMountedRef.current) {
        if (response.data) {
          setInsights(response.data);
        } else {
          // Handle case where API returns success but no data
          console.warn('Insights API returned no data');
          setError('No productivity insights available. Complete some focus sessions to generate insights.');
        }
      }
    } catch (err) {
      console.error('Error loading insights:', err);
      if (isMountedRef.current) {
        // Check if it's a server error vs network error
        const errorMessage = err instanceof Error && err.message.includes('500') 
          ? 'Insights service is temporarily unavailable. Please try again later.'
          : 'Failed to load productivity insights. Please check your connection and try again.';
        setError(errorMessage);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [dateRange]);

  useEffect(() => {
    loadInsights();
  }, [dateRange, loadInsights]);

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const getCorrelationIcon = (correlation: number) => {
    if (correlation > 0.3) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (correlation < -0.3) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getCorrelationText = (correlation: number) => {
    if (correlation > 0.3) return 'Strong Positive';
    if (correlation > 0.1) return 'Weak Positive';
    if (correlation < -0.3) return 'Strong Negative';
    if (correlation < -0.1) return 'Weak Negative';
    return 'No Correlation';
  };

  const getCorrelationColor = (correlation: number) => {
    if (Math.abs(correlation) > 0.3) return 'text-blue-600';
    if (Math.abs(correlation) > 0.1) return 'text-yellow-600';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 ${className}`}>
        <div className="container mx-auto p-4 space-y-6">
          {/* Loading Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-t-xl"></div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl animate-pulse"></div>
                  <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex space-x-2">
                  {['7d', '30d', '90d'].map((range) => (
                    <div key={range} className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Loading Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 rounded-t-xl animate-pulse"></div>
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 ${className}`}>
        <div className="container mx-auto p-4 space-y-6">
          {/* Error Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-t-xl"></div>
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Productivity Insights
                </h2>
              </div>
            </div>
          </div>
          
          {/* Error Content */}
          <div className="bg-white rounded-xl shadow-sm border border-red-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-t-xl"></div>
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-red-600 opacity-[0.05] rounded-full blur-xl"></div>
            
            <div className="relative z-10 p-8">
              <div className="text-center">
                <div className="p-4 rounded-xl bg-gradient-to-br from-red-100 to-red-200 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Lightbulb className="h-10 w-10 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Insights Available</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {error || 'Complete some focus sessions to see your productivity patterns and insights.'}
                </p>
                <Button 
                  onClick={loadInsights} 
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 ${className}`}>
      <div className="container mx-auto p-4 space-y-6">
        {/* Enhanced Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-600 opacity-[0.03] rounded-full blur-2xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-600 opacity-[0.05] rounded-full blur-2xl"></div>
          
          {/* Gradient accent bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-t-xl"></div>
          
          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Productivity Insights
                </h2>
              </div>
              <div className="flex space-x-2">
                {(['7d', '30d', '90d'] as const).map((range) => (
                  <Button
                    key={range}
                    variant={dateRange === range ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDateRange(range)}
                    className={dateRange === range 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border-0'
                      : 'border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300 transition-all duration-300'
                    }
                  >
                    {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
            {/* Subtle decorative elements for tabs */}
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-amber-600 opacity-[0.02] rounded-full blur-xl"></div>
            <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-orange-600 opacity-[0.03] rounded-full blur-xl"></div>
            
            <div className="relative z-10 p-3 ">
              <TabsList className="grid w-full grid-cols-4 gap-2 bg-transparent h-full">
                <TabsTrigger 
                  value="overview"
                  className="p-3 group relative rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:scale-[1.02] data-[state=active]:border-0 flex items-center gap-2 "
                >
                  <div className="p-1.5 rounded-lg bg-white/20 group-data-[state=active]:bg-white/30 transition-all">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Overview</div>
                    <div className="text-xs opacity-80">Key metrics</div>
                  </div>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="timing"
                  className="group relative rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:scale-[1.02] data-[state=active]:border-0 flex items-center gap-2 p-3"
                >
                  <div className="p-1.5 rounded-lg bg-white/20 group-data-[state=active]:bg-white/30 transition-all">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Time Patterns</div>
                    <div className="text-xs opacity-80">Daily rhythm</div>
                  </div>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="correlations"
                  className="group relative rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:scale-[1.02] data-[state=active]:border-0 flex items-center gap-2 p-3"
                >
                  <div className="p-1.5 rounded-lg bg-white/20 group-data-[state=active]:bg-white/30 transition-all">
                    <Brain className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Correlations</div>
                    <div className="text-xs opacity-80">Factor analysis</div>
                  </div>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="recommendations"
                  className="group relative rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:scale-[1.02] data-[state=active]:border-0 flex items-center gap-2 p-3"
                >
                  <div className="p-1.5 rounded-lg bg-white/20 group-data-[state=active]:bg-white/30 transition-all">
                    <Lightbulb className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Insights</div>
                    <div className="text-xs opacity-80">Smart tips</div>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Current Streak */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-orange-600 opacity-[0.05] rounded-full blur-xl"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-xl"></div>
                
                <div className="relative z-10 p-6">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium text-gray-600">Current Streak</h3>
                    <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                      <Zap className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                    {insights.streakData.currentStreak}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Longest: {insights.streakData.longestStreak} days
                  </p>
                </div>
              </div>

              {/* Quality Streak */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-yellow-600 opacity-[0.05] rounded-full blur-xl"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-t-xl"></div>
                
                <div className="relative z-10 p-6">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium text-gray-600">Quality Streak</h3>
                    <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                      <Star className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                    {insights.streakData.qualityStreak}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    High-quality sessions
                  </p>
                </div>
              </div>

              {/* Best Focus Hour */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-blue-600 opacity-[0.05] rounded-full blur-xl"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl"></div>
                
                <div className="relative z-10 p-6">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium text-gray-600">Best Focus Time</h3>
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      <Clock className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                    {formatHour(insights.timeOfDayPatterns.bestFocusHour)}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Quality: {insights.timeOfDayPatterns.bestHourQuality.toFixed(1)}/5
                  </p>
                </div>
              </div>

              {/* Productivity Impact */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-green-600 opacity-[0.05] rounded-full blur-xl"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-xl"></div>
                
                <div className="relative z-10 p-6">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium text-gray-600">Streak Impact</h3>
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {insights.streakData.streakImpactOnProductivity > 0 ? '+' : ''}
                    {insights.streakData.streakImpactOnProductivity.toFixed(1)}%
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Productivity change
                  </p>
                </div>
              </div>
            </div>

            {/* Task Type Insights */}
            {insights.taskTypeInsights.mostFocusedCategory && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-600 opacity-[0.05] rounded-full blur-2xl"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-600 opacity-[0.05] rounded-full blur-2xl"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-600 rounded-t-xl"></div>
                
                <div className="relative z-10 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                      <Target className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Task Category Performance
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
                      <h4 className="font-medium mb-3 text-gray-800">Most Focused Category</h4>
                      <Badge variant="secondary" className="text-sm bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border-purple-300">
                        {insights.taskTypeInsights.mostFocusedCategory}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-2">
                        {insights.taskTypeInsights.categorySessionCounts[insights.taskTypeInsights.mostFocusedCategory]} sessions
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                      <h4 className="font-medium mb-3 text-gray-800">Highest Quality Category</h4>
                      <Badge variant="secondary" className="text-sm bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-300">
                        {insights.taskTypeInsights.highestQualityCategory}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-2">
                        {insights.taskTypeInsights.categoryAverageQuality[insights.taskTypeInsights.highestQualityCategory]?.toFixed(1)}/5 avg quality
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Time Patterns Tab */}
          <TabsContent value="timing" className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-600 opacity-[0.05] rounded-full blur-2xl"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-600 opacity-[0.05] rounded-full blur-2xl"></div>
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-xl"></div>
              
              <div className="relative z-10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Hourly Focus Quality
                    </h3>
                    <p className="text-gray-600">
                      Your focus quality throughout the day
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {Object.entries(insights.timeOfDayPatterns.hourlyQualityRatings)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([hour, quality]) => (
                      <div key={hour} className="flex items-center space-x-4">
                        <div className="w-16 text-sm font-medium text-gray-700">
                          {formatHour(parseInt(hour))}
                        </div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000"
                              style={{ width: `${(quality / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="w-12 text-sm text-right font-semibold text-gray-800">
                          {quality.toFixed(1)}
                        </div>
                        <div className="w-16 text-xs text-gray-500 text-right">
                          {insights.timeOfDayPatterns.hourlySessionCounts[parseInt(hour)] || 0} sessions
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Correlations Tab */}
          <TabsContent value="correlations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-600 opacity-[0.05] rounded-full blur-2xl"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-600 opacity-[0.05] rounded-full blur-2xl"></div>
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 to-blue-600 rounded-t-xl"></div>
                
                <div className="relative z-10 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                      <Brain className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Focus Correlations
                      </h3>
                      <p className="text-gray-600">
                        How different factors affect your focus quality
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                      <span className="text-sm font-medium text-gray-700">Session Length</span>
                      <div className="flex items-center gap-2">
                        {getCorrelationIcon(insights.correlations.sessionLengthQualityCorrelation)}
                        <span className={`text-sm font-semibold ${getCorrelationColor(insights.correlations.sessionLengthQualityCorrelation)}`}>
                          {getCorrelationText(insights.correlations.sessionLengthQualityCorrelation)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-red-200">
                      <span className="text-sm font-medium text-gray-700">Distractions</span>
                      <div className="flex items-center gap-2">
                        {getCorrelationIcon(insights.correlations.distractionQualityCorrelation)}
                        <span className={`text-sm font-semibold ${getCorrelationColor(insights.correlations.distractionQualityCorrelation)}`}>
                          {getCorrelationText(insights.correlations.distractionQualityCorrelation)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <span className="text-sm font-medium text-gray-700">Task Progress</span>
                      <div className="flex items-center gap-2">
                        {getCorrelationIcon(insights.correlations.taskProgressSessionQualityCorrelation)}
                        <span className={`text-sm font-semibold ${getCorrelationColor(insights.correlations.taskProgressSessionQualityCorrelation)}`}>
                          {getCorrelationText(insights.correlations.taskProgressSessionQualityCorrelation)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-600 opacity-[0.05] rounded-full blur-2xl"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-600 opacity-[0.05] rounded-full blur-2xl"></div>
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-t-xl"></div>
                
                <div className="relative z-10 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        Category Effectiveness
                      </h3>
                      <p className="text-gray-600">
                        Tasks completed per hour by category
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.entries(insights.taskTypeInsights.categoryEffectiveness)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([category, effectiveness], index) => (
                        <div key={category} className={`flex items-center justify-between p-3 rounded-lg border ${
                          index === 0 ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200' : 
                          index === 1 ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200' :
                          'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
                        }`}>
                          <span className="text-sm font-medium text-gray-700 truncate">{category}</span>
                          <Badge variant="outline" className={`text-xs font-semibold ${
                            index === 0 ? 'bg-amber-100 text-amber-800 border-amber-300' :
                            index === 1 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                            'bg-gray-100 text-gray-700 border-gray-300'
                          }`}>
                            {effectiveness.toFixed(2)} tasks/hr
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {insights.recommendations.length > 0 ? (
                insights.recommendations
                  .sort((a, b) => a.priority - b.priority)
                  .map((rec, index) => (
                    <div key={rec.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-lg transition-all duration-300 ${
                      index === 0 ? 'ring-2 ring-green-200 bg-gradient-to-br from-green-50 via-white to-emerald-50' : ''
                    }`}>
                      {/* Decorative elements */}
                      <div className={`absolute -top-20 -right-20 w-40 h-40 opacity-[0.05] rounded-full blur-2xl ${
                        index === 0 ? 'bg-green-600' : index === 1 ? 'bg-blue-600' : 'bg-purple-600'
                      }`}></div>
                      <div className={`absolute -bottom-20 -left-20 w-40 h-40 opacity-[0.05] rounded-full blur-2xl ${
                        index === 0 ? 'bg-emerald-600' : index === 1 ? 'bg-indigo-600' : 'bg-blue-600'
                      }`}></div>
                      
                      {/* Gradient accent */}
                      <div className={`absolute top-0 left-0 w-full h-1.5 rounded-t-xl ${
                        index === 0 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 
                        index === 1 ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                        'bg-gradient-to-r from-purple-500 to-purple-600'
                      }`}></div>
                      
                      <div className="relative z-10 p-6">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl text-white shadow-lg ${
                            index === 0 ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 
                            index === 1 ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                            'bg-gradient-to-br from-purple-500 to-purple-600'
                          }`}>
                            <Lightbulb className="h-6 w-6" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className={`text-xl font-semibold ${
                                index === 0 ? 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent' : 
                                index === 1 ? 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent' :
                                'bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent'
                              }`}>
                                {rec.title}
                              </h3>
                              {index === 0 && (
                                <Badge variant="default" className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-md">
                                  🏆 Priority
                                </Badge>
                              )}
                              {index === 1 && (
                                <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-300">
                                  ⭐ Important
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-gray-700 mb-4 leading-relaxed">{rec.description}</p>
                            
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className={`${
                                index === 0 ? 'bg-green-50 text-green-700 border-green-300' : 
                                index === 1 ? 'bg-blue-50 text-blue-700 border-blue-300' :
                                'bg-purple-50 text-purple-700 border-purple-300'
                              }`}>
                                {rec.category}
                              </Badge>
                              
                              <div className="text-xs text-gray-500">
                                Priority: {rec.priority}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-gray-600 opacity-[0.05] rounded-full blur-2xl"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400 to-gray-500 rounded-t-xl"></div>
                  
                  <div className="relative z-10 p-8">
                    <div className="text-center text-gray-500">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <Lightbulb className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No Recommendations Yet</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Complete more focus sessions to get personalized recommendations based on your productivity patterns!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 