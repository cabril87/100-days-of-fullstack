'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useFocus } from '@/lib/providers/FocusContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Brain, TrendingUp, Target, Clock, Calendar, AlertTriangle, Star, Lightbulb, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { FocusSession, FocusStatistics } from '@/lib/types/focus';

interface TimeRange {
  label: string;
  days: number;
}

interface Insight {
  id: string;
  type: 'positive' | 'neutral' | 'negative';
  title: string;
  description: string;
  value?: string;
  trend?: 'up' | 'down' | 'stable';
}

interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action?: string;
}

const timeRanges: TimeRange[] = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 }
];

export function FocusInsights() {
  const { 
    fetchStatistics, 
    fetchHistory, 
    isLoading: contextLoading,
    statistics: contextStatistics,
    history: contextHistory
  } = useFocus();
  
  const [selectedRange, setSelectedRange] = useState<TimeRange>(timeRanges[1]); // 30 days default
  const [statistics, setStatistics] = useState<FocusStatistics | null>(contextStatistics);
  const [history, setHistory] = useState<FocusSession[]>(contextHistory || []);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Load insights data from API
  const loadInsightsData = useCallback(async () => {
    if (isDataLoading) return;

    setIsDataLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - selectedRange.days * 24 * 60 * 60 * 1000);

      console.log('[FocusInsights] Loading data for', selectedRange.label);

      // Load both statistics and detailed history
      const [statsData, historyData] = await Promise.all([
        fetchStatistics(startDate, endDate),
        fetchHistory()
      ]);

      if (statsData) {
        console.log('[FocusInsights] Statistics loaded:', statsData);
        setStatistics(statsData);
      } else {
        console.log('[FocusInsights] No statistics data');
        setStatistics(null);
      }

      if (historyData) {
        // Filter history to selected range
        const filteredHistory = historyData.filter(session => {
          const sessionDate = new Date(session.startTime);
          return sessionDate >= startDate && sessionDate <= endDate;
        });
        console.log('[FocusInsights] History loaded:', filteredHistory.length, 'sessions in range');
        setHistory(filteredHistory);
      } else {
        console.log('[FocusInsights] No history data');
        setHistory([]);
      }
    } catch (error) {
      console.error('[FocusInsights] Error loading data:', error);
      setStatistics(null);
      setHistory([]);
    } finally {
      setIsDataLoading(false);
    }
  }, [selectedRange, fetchStatistics, fetchHistory, isDataLoading]);

  // Generate insights from REAL API data
  const insights = useMemo((): Insight[] => {
    if (!statistics || !history.length) {
      return [{
        id: 'no-data',
        type: 'neutral',
        title: 'No Data Available',
        description: 'Complete some focus sessions to generate insights from your real usage patterns.'
      }];
    }

    const insights: Insight[] = [];

    // Session completion insights
    const completedSessions = history.filter(s => s.status === 'Completed').length;
    const completionRate = history.length > 0 ? (completedSessions / history.length) * 100 : 0;
    
    if (completionRate >= 80) {
      insights.push({
        id: 'completion-rate-good',
        type: 'positive',
        title: 'Excellent Session Completion',
        description: `You complete ${Math.round(completionRate)}% of your focus sessions. Great consistency!`,
        value: `${Math.round(completionRate)}%`,
        trend: 'up'
      });
    } else if (completionRate >= 50) {
      insights.push({
        id: 'completion-rate-ok',
        type: 'neutral',
        title: 'Good Session Completion',
        description: `You complete ${Math.round(completionRate)}% of your sessions. Room for improvement.`,
        value: `${Math.round(completionRate)}%`,
        trend: 'stable'
      });
    } else {
      insights.push({
        id: 'completion-rate-low',
        type: 'negative',
        title: 'Low Session Completion',
        description: `Only ${Math.round(completionRate)}% of sessions are completed. Consider shorter sessions.`,
        value: `${Math.round(completionRate)}%`,
        trend: 'down'
      });
    }

    // Average session length insights
    if (statistics.averageSessionLength > 0) {
      if (statistics.averageSessionLength >= 45) {
        insights.push({
          id: 'session-length-long',
          type: 'positive',
          title: 'Deep Focus Sessions',
          description: `Your average session is ${Math.round(statistics.averageSessionLength)} minutes. Perfect for deep work!`,
          value: `${Math.round(statistics.averageSessionLength)}m`
        });
      } else if (statistics.averageSessionLength >= 25) {
        insights.push({
          id: 'session-length-good',
          type: 'positive',
          title: 'Optimal Session Length',
          description: `${Math.round(statistics.averageSessionLength)} minute average sessions align with productivity research.`,
          value: `${Math.round(statistics.averageSessionLength)}m`
        });
      } else {
        insights.push({
          id: 'session-length-short',
          type: 'neutral',
          title: 'Short Focus Sessions',
          description: `Your ${Math.round(statistics.averageSessionLength)} minute sessions could be extended for deeper focus.`,
          value: `${Math.round(statistics.averageSessionLength)}m`
        });
      }
    }

    // Distraction insights
    if (statistics.sessionCount > 0) {
      const distractionsPerSession = statistics.distractionCount / statistics.sessionCount;
      
      if (distractionsPerSession <= 1) {
        insights.push({
          id: 'distractions-low',
          type: 'positive',
          title: 'Excellent Focus Control',
          description: `Only ${statistics.distractionCount} distractions across ${statistics.sessionCount} sessions. Outstanding!`,
          value: `${Math.round(distractionsPerSession * 10) / 10}/session`
        });
      } else if (distractionsPerSession <= 3) {
        insights.push({
          id: 'distractions-moderate',
          type: 'neutral',
          title: 'Moderate Distractions',
          description: `${Math.round(distractionsPerSession * 10) / 10} distractions per session. Consider distraction-blocking techniques.`,
          value: `${Math.round(distractionsPerSession * 10) / 10}/session`
        });
      } else {
        insights.push({
          id: 'distractions-high',
          type: 'negative',
          title: 'High Distraction Rate',
          description: `${Math.round(distractionsPerSession * 10) / 10} distractions per session indicates focus challenges.`,
          value: `${Math.round(distractionsPerSession * 10) / 10}/session`,
          trend: 'down'
        });
      }
    }

    // Daily consistency insights
    if (statistics.dailyFocusMinutes && Object.keys(statistics.dailyFocusMinutes).length > 0) {
      const dailyMinutes = Object.values(statistics.dailyFocusMinutes);
      const activeDays = dailyMinutes.filter(min => min > 0).length;
      const totalDays = Math.min(selectedRange.days, Object.keys(statistics.dailyFocusMinutes).length);
      const consistencyRate = (activeDays / totalDays) * 100;

      if (consistencyRate >= 70) {
        insights.push({
          id: 'consistency-high',
          type: 'positive',
          title: 'Great Consistency',
          description: `You focused on ${activeDays} out of ${totalDays} days. Excellent habit building!`,
          value: `${Math.round(consistencyRate)}%`
        });
      } else if (consistencyRate >= 40) {
        insights.push({
          id: 'consistency-moderate',
          type: 'neutral',
          title: 'Moderate Consistency',
          description: `Focus sessions on ${activeDays} out of ${totalDays} days. Try building a daily habit.`,
          value: `${Math.round(consistencyRate)}%`
        });
      } else {
        insights.push({
          id: 'consistency-low',
          type: 'negative',
          title: 'Inconsistent Practice',
          description: `Only ${activeDays} focus days out of ${totalDays}. Daily practice builds better habits.`,
          value: `${Math.round(consistencyRate)}%`
        });
      }
    }

    // Top distraction category insight
    if (statistics.distractionsByCategory && Object.keys(statistics.distractionsByCategory).length > 0) {
      const topCategory = Object.entries(statistics.distractionsByCategory)
        .reduce((a, b) => a[1] > b[1] ? a : b);
      
      insights.push({
        id: 'top-distraction',
        type: 'neutral',
        title: 'Primary Distraction Source',
        description: `"${topCategory[0]}" accounts for ${topCategory[1]} of your ${statistics.distractionCount} distractions.`,
        value: `${topCategory[1]} times`
      });
    }

    return insights;
  }, [statistics, history, selectedRange.days]);

  // Generate recommendations from REAL API data
  const recommendations = useMemo((): Recommendation[] => {
    if (!statistics || !history.length) {
      return [{
        id: 'start-focusing',
        priority: 'high',
        title: 'Start Your Focus Journey',
        description: 'Begin with a 25-minute focus session to establish your baseline.',
        action: 'Start Focus Session'
      }];
    }

    const recommendations: Recommendation[] = [];

    // Session length recommendations
    if (statistics.averageSessionLength < 25) {
      recommendations.push({
        id: 'extend-sessions',
        priority: 'high',
        title: 'Extend Session Duration',
        description: 'Try increasing your sessions to 25-30 minutes for deeper focus states.',
        action: 'Set longer session goals'
      });
    } else if (statistics.averageSessionLength > 90) {
      recommendations.push({
        id: 'shorten-sessions',
        priority: 'medium',
        title: 'Consider Shorter Sessions',
        description: 'Very long sessions can lead to diminishing returns. Try 45-60 minute blocks.',
        action: 'Break into shorter sessions'
      });
    }

    // Distraction recommendations
    if (statistics.sessionCount > 0) {
      const distractionsPerSession = statistics.distractionCount / statistics.sessionCount;
      
      if (distractionsPerSession > 2) {
        recommendations.push({
          id: 'reduce-distractions',
          priority: 'high',
          title: 'Implement Distraction Blocking',
          description: 'High distraction rate suggests need for environmental controls.',
          action: 'Set up distraction blockers'
        });
      }

      // Category-specific recommendations
      if (statistics.distractionsByCategory) {
        const topCategory = Object.entries(statistics.distractionsByCategory)
          .reduce((a, b) => a[1] > b[1] ? a : b, ['', 0]);
        
        if (topCategory[1] >= 3) {
          switch (topCategory[0].toLowerCase()) {
            case 'social media':
              recommendations.push({
                id: 'block-social-media',
                priority: 'high',
                title: 'Block Social Media',
                description: `Social media caused ${topCategory[1]} distractions. Use website blockers during focus time.`,
                action: 'Install social media blocker'
              });
              break;
            case 'email':
              recommendations.push({
                id: 'schedule-email',
                priority: 'medium',
                title: 'Schedule Email Checks',
                description: `${topCategory[1]} email distractions. Check email only at designated times.`,
                action: 'Set email checking schedule'
              });
              break;
            case 'noise':
              recommendations.push({
                id: 'noise-solution',
                priority: 'medium',
                title: 'Address Noise Issues',
                description: `Noise caused ${topCategory[1]} distractions. Consider noise-canceling headphones.`,
                action: 'Get noise-canceling headphones'
              });
              break;
          }
        }
      }
    }

    // Consistency recommendations
    if (statistics.dailyFocusMinutes && Object.keys(statistics.dailyFocusMinutes).length > 0) {
      const dailyMinutes = Object.values(statistics.dailyFocusMinutes);
      const activeDays = dailyMinutes.filter(min => min > 0).length;
      const totalDays = Math.min(selectedRange.days, Object.keys(statistics.dailyFocusMinutes).length);
      const consistencyRate = (activeDays / totalDays) * 100;

      if (consistencyRate < 50) {
        recommendations.push({
          id: 'build-consistency',
          priority: 'high',
          title: 'Build Daily Habit',
          description: 'Low consistency suggests need for habit formation. Start with 15 minutes daily.',
          action: 'Set daily focus reminder'
        });
      }
    }

    // Time-based recommendations
    const totalHours = statistics.totalMinutesFocused / 60;
    const dailyAverage = totalHours / selectedRange.days;
    
    if (dailyAverage < 1) {
      recommendations.push({
        id: 'increase-daily-focus',
        priority: 'medium',
        title: 'Increase Daily Focus Time',
        description: `Aim for at least 2 hours of focused work daily. Currently averaging ${Math.round(dailyAverage * 10) / 10} hours.`,
        action: 'Set 2-hour daily goal'
      });
    }

    return recommendations;
  }, [statistics, history, selectedRange.days]);

  // Calculate productivity score from REAL data
  const productivityScore = useMemo((): number => {
    if (!statistics || !history.length) return 0;

    let score = 0;
    const maxScore = 100;

    // Completion rate (0-25 points)
    const completedSessions = history.filter(s => s.status === 'Completed').length;
    const completionRate = completedSessions / history.length;
    score += completionRate * 25;

    // Session length optimization (0-25 points)
    const optimalLength = statistics.averageSessionLength >= 25 && statistics.averageSessionLength <= 60;
    if (optimalLength) {
      score += 25;
    } else {
      score += Math.max(0, 25 - Math.abs(statistics.averageSessionLength - 40) / 2);
    }

    // Distraction management (0-25 points)
    const distractionsPerSession = statistics.distractionCount / statistics.sessionCount;
    score += Math.max(0, 25 - (distractionsPerSession * 5));

    // Consistency (0-25 points)
    if (statistics.dailyFocusMinutes) {
      const dailyMinutes = Object.values(statistics.dailyFocusMinutes);
      const activeDays = dailyMinutes.filter(min => min > 0).length;
      const totalDays = Math.min(selectedRange.days, Object.keys(statistics.dailyFocusMinutes).length);
      const consistencyRate = activeDays / totalDays;
      score += consistencyRate * 25;
    }

    return Math.round(Math.min(maxScore, score));
  }, [statistics, history, selectedRange.days]);

  // Process time distribution data
  const timeDistributionData = useMemo(() => {
    if (!statistics?.dailyFocusMinutes) return [];

    return Object.entries(statistics.dailyFocusMinutes)
      .map(([date, minutes]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        minutes: minutes,
        hours: Math.round((minutes / 60) * 10) / 10
      }))
      .slice(-14); // Last 14 days
  }, [statistics?.dailyFocusMinutes]);

  // Load data when range changes
  useEffect(() => {
    loadInsightsData();
  }, [selectedRange]);

  // Use context data when available
  useEffect(() => {
    if (contextStatistics) {
      setStatistics(contextStatistics);
    }
    if (contextHistory) {
      setHistory(contextHistory);
    }
  }, [contextStatistics, contextHistory]);

  const isLoading = contextLoading || isDataLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Analyzing your focus patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-navy-dark">Focus Insights</h2>
          <p className="text-gray-600">AI-powered insights from your real focus data</p>
        </div>
        
        <Select 
          value={selectedRange.days.toString()} 
          onValueChange={(value) => setSelectedRange(timeRanges.find(r => r.days === parseInt(value)) || timeRanges[1])}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeRanges.map((range) => (
              <SelectItem key={range.days} value={range.days.toString()}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Productivity Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Productivity Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Performance</span>
                <span className="text-2xl font-bold text-blue-600">{productivityScore}/100</span>
              </div>
              <Progress value={productivityScore} className="h-3" />
            </div>
            <div className="text-center">
              {productivityScore >= 80 && (
                <Badge variant="default" className="bg-green-100 text-green-800">Excellent</Badge>
              )}
              {productivityScore >= 60 && productivityScore < 80 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">Good</Badge>
              )}
              {productivityScore >= 40 && productivityScore < 60 && (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Fair</Badge>
              )}
              {productivityScore < 40 && (
                <Badge variant="destructive" className="bg-red-100 text-red-800">Needs Work</Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Based on completion rate, session length, distraction management, and consistency
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">Key Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight) => (
              <Card key={insight.id} className={`border-l-4 ${
                insight.type === 'positive' ? 'border-l-green-500 bg-green-50' :
                insight.type === 'negative' ? 'border-l-red-500 bg-red-50' :
                'border-l-blue-500 bg-blue-50'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Brain className="h-4 w-4 mr-2" />
                        <h3 className="font-medium text-sm">{insight.title}</h3>
                        {insight.trend && (
                          <TrendingUp className={`h-3 w-3 ml-2 ${
                            insight.trend === 'up' ? 'text-green-600' :
                            insight.trend === 'down' ? 'text-red-600' :
                            'text-gray-600'
                          }`} />
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{insight.description}</p>
                    </div>
                    {insight.value && (
                      <div className="text-right">
                        <span className="text-lg font-bold text-gray-900">{insight.value}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <Card key={rec.id} className={`border-l-4 ${
                rec.priority === 'high' ? 'border-l-red-500' :
                rec.priority === 'medium' ? 'border-l-yellow-500' :
                'border-l-green-500'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        <h3 className="font-medium text-sm">{rec.title}</h3>
                        <Badge 
                          variant={rec.priority === 'high' ? 'destructive' : 
                                  rec.priority === 'medium' ? 'outline' : 'secondary'}
                          className="ml-2 text-xs"
                        >
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{rec.description}</p>
                    </div>
                    {rec.action && (
                      <Button size="sm" variant="outline" className="ml-4">
                        {rec.action}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Focus Patterns (Real Data)</CardTitle>
            </CardHeader>
            <CardContent>
              {timeDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="minutes" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No pattern data available</p>
                    <p className="text-sm">Complete more focus sessions to see patterns</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Stats */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold">{Math.round(statistics.totalMinutesFocused / 60)}h</p>
                  <p className="text-sm text-gray-600">Total Focus Time</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold">{statistics.sessionCount}</p>
                  <p className="text-sm text-gray-600">Sessions Completed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold">{Math.round(statistics.averageSessionLength)}m</p>
                  <p className="text-sm text-gray-600">Average Session</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <p className="text-2xl font-bold">{statistics.distractionCount}</p>
                  <p className="text-sm text-gray-600">Total Distractions</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Raw API Data (Development) */}
      {process.env.NODE_ENV === 'development' && statistics && (
        <Card>
          <CardHeader>
            <CardTitle>Raw API Analysis Data (Dev Only)</CardTitle>
          </CardHeader>
          <CardContent>
            <details>
              <summary className="cursor-pointer text-sm font-medium mb-2">
                View analysis data sources
              </summary>
              <div className="space-y-2 text-xs">
                <div>
                  <strong>Statistics:</strong>
                  <pre className="bg-gray-100 p-2 rounded mt-1">{JSON.stringify(statistics, null, 2)}</pre>
                </div>
                <div>
                  <strong>History ({history.length} sessions):</strong>
                  <pre className="bg-gray-100 p-2 rounded mt-1 max-h-32 overflow-y-auto">
                    {JSON.stringify(history.slice(0, 3), null, 2)}
                    {history.length > 3 && `\n... and ${history.length - 3} more sessions`}
                  </pre>
                </div>
              </div>
            </details>
          </CardContent>
        </Card>
      )}
    </div>
  );
}