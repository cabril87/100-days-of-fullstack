/*
 * Enterprise Focus Analytics View Component
 * Copyright (c) 2025 Carlos Abril Jr
 * Following .cursorrules Enterprise Standards
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  Zap,
  RefreshCw,
  AlertCircle,
  Trophy,
  Activity
} from 'lucide-react';

// ✅ EXPLICIT TYPES: Following .cursorrules requirements
import type { 
  FocusStatistics, 
  ProductivityInsightsDTO
} from '@/lib/types/focus';

// ✅ ENTERPRISE SERVICES: Real API integration
import { focusService } from '@/lib/services/focusService';
import { useResponsive } from '@/lib/hooks/useResponsive';

// ================================
// EXPLICIT TYPESCRIPT INTERFACES - NO ANY TYPES
// ================================

interface FocusAnalyticsViewProps {
  userId: number;
  className?: string;
}

interface AnalyticsState {
  statistics: FocusStatistics | null;
  insights: ProductivityInsightsDTO | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

type TimeRange = '7d' | '30d' | '90d';

const TIME_RANGES: Record<TimeRange, { label: string; days: number }> = {
  '7d': { label: 'Last 7 days', days: 7 },
  '30d': { label: 'Last 30 days', days: 30 },
  '90d': { label: 'Last 90 days', days: 90 },
};

// ================================
// ENTERPRISE FOCUS ANALYTICS COMPONENT
// ================================

export default function FocusAnalyticsView({
  userId,
  className = ''
}: FocusAnalyticsViewProps): React.ReactElement {

  const [analyticsState, setAnalyticsState] = useState<AnalyticsState>({
    statistics: null,
    insights: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const responsive = useResponsive();

  // ================================
  // DATA FETCHING - REAL API CALLS
  // ================================

  const loadAnalyticsData = useCallback(async () => {
    if (!userId) return;

    setAnalyticsState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const endDate = new Date();
      const startDate = new Date(Date.now() - (TIME_RANGES[timeRange].days * 24 * 60 * 60 * 1000));

      const [statistics, insights] = await Promise.all([
        focusService.getFocusStatistics(startDate, endDate),
        focusService.getProductivityInsights(startDate, endDate)
      ]);

      setAnalyticsState({
        statistics,
        insights,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load analytics data';
      setAnalyticsState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error('Failed to load focus analytics');
    }
  }, [userId, timeRange]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  // ================================
  // ERROR STATE HANDLING
  // ================================

  if (analyticsState.error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Failed to Load Analytics
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                {analyticsState.error}
              </p>
              <Button 
                onClick={loadAnalyticsData}
                variant="outline"
                size="sm"
                className="bg-red-50 hover:bg-red-100 border-red-200 text-red-800"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ================================
  // LOADING STATE
  // ================================

  if (analyticsState.isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = analyticsState.statistics;
  const insights = analyticsState.insights;

  if (!stats) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
            <p className="text-muted-foreground">
              Complete some focus sessions to see analytics here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ================================
  // MAIN RENDER
  // ================================

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Focus Analytics
          </h2>
          <p className="text-sm text-muted-foreground">
            Insights into your focus sessions and productivity patterns
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Time Range Selector */}
          <div className="flex rounded-lg bg-muted p-1">
            {(Object.keys(TIME_RANGES) as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="text-xs h-7"
              >
                {TIME_RANGES[range].label}
              </Button>
            ))}
          </div>

          <Button
            onClick={loadAnalyticsData}
            variant="outline"
            size="sm"
            disabled={analyticsState.isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${analyticsState.isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className={`grid gap-4 ${responsive.isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-200">Total Time</p>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  {Math.floor(stats.totalMinutesFocused / 60)}h {stats.totalMinutesFocused % 60}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-green-800 dark:text-green-200">Sessions</p>
                <p className="text-xl font-bold text-green-900 dark:text-green-100">
                  {stats.sessionCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-purple-800 dark:text-purple-200">Avg Length</p>
                <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                  {Math.round(stats.averageSessionLength)}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-orange-800 dark:text-orange-200">Efficiency</p>
                <p className="text-xl font-bold text-orange-900 dark:text-orange-100">
                  {Math.round(stats.focusEfficiencyScore * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Focus Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Daily Focus Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(stats.dailyFocusMinutes)
              .slice(-7)
              .map(([date, minutes]) => (
                <div key={date} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {new Date(date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                      style={{ 
                        width: `${Math.min((minutes / Math.max(...Object.values(stats.dailyFocusMinutes))) * 100, 100)}%`,
                        minWidth: '20px'
                      }}
                    />
                    <span className="text-sm font-medium w-12 text-right">
                      {minutes}m
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Productivity Score */}
      {insights && (
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
              <Trophy className="h-5 w-5" />
              Productivity Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-emerald-600">
                {insights.productivityScore}
              </div>
              <div className="flex-1">
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Your overall focus productivity rating
                </p>
                <div className="w-full bg-emerald-200 dark:bg-emerald-800 rounded-full h-2 mt-2">
                  <div 
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${insights.productivityScore}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {insights && insights.insights && insights.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.insights.slice(0, 3).map((insight, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    insight.type === 'positive' 
                      ? 'border-l-green-500 bg-green-50 dark:bg-green-900/20' 
                      : insight.type === 'negative'
                      ? 'border-l-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  }`}
                >
                  <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {insight.category}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations from Backend */}
      {insights && insights.recommendations && insights.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.recommendations.slice(0, 3).map((rec, index) => (
                <div 
                  key={index}
                  className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-1">
                        {rec.title}
                      </h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        {rec.description}
                      </p>
                    </div>
                    <Badge 
                      variant={rec.priority === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {rec.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backend Data Preview (for debugging) */}
      {insights && (
        <Card className="bg-gray-50 dark:bg-gray-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Activity className="h-5 w-5" />
              Additional Analytics Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Current Streak */}
              {insights.currentStreak !== undefined && (
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-xs text-orange-800 dark:text-orange-200">Current Streak</p>
                      <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
                        {insights.currentStreak} days
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Longest Streak */}
              {insights.longestStreak !== undefined && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="text-xs text-yellow-800 dark:text-yellow-200">Best Streak</p>
                      <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
                        {insights.longestStreak} days
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Total Sessions */}
              {insights.totalSessions !== undefined && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs text-green-800 dark:text-green-200">Total Sessions</p>
                      <p className="text-lg font-bold text-green-900 dark:text-green-100">
                        {insights.totalSessions}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Average Session Length */}
              {insights.averageSessionLength !== undefined && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-xs text-purple-800 dark:text-purple-200">Avg Session</p>
                      <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                        {Math.round(insights.averageSessionLength)}m
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Debug Info */}
            <details className="mt-4">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                Debug: Backend Response Structure
              </summary>
              <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-2 overflow-auto">
                {JSON.stringify(insights, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}

      {analyticsState.lastUpdated && (
        <p className="text-xs text-muted-foreground text-center">
          Last updated: {analyticsState.lastUpdated.toLocaleString()}
        </p>
      )}
    </div>
  );
}
