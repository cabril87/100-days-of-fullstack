'use client';

import React, { useState, useEffect } from 'react';
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
  Minus
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

  useEffect(() => {
    loadInsights();
  }, [dateRange]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      const endDate = new Date().toISOString();
      const startDate = new Date();
      
      switch (dateRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
      }

      const response = await focusService.getProductivityInsights(
        startDate.toISOString(),
        endDate
      );

      if (response.data) {
        setInsights(response.data);
      } else {
        setError(response.error || 'Failed to load insights');
      }
    } catch (err) {
      console.error('Error loading productivity insights:', err);
      setError('Failed to load productivity insights');
      showToast('Failed to load productivity insights', 'error');
    } finally {
      setLoading(false);
    }
  };

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
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Productivity Insights</h2>
          <div className="flex space-x-2">
            {['7d', '30d', '90d'].map((range) => (
              <div key={range} className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-8 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Productivity Insights</h2>
        </div>
        <Alert>
          <AlertDescription>
            {error || 'No insights available. Complete some focus sessions to see your productivity patterns.'}
          </AlertDescription>
        </Alert>
        <Button onClick={loadInsights} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Productivity Insights</h2>
        <div className="flex space-x-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateRange(range)}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timing">Time Patterns</TabsTrigger>
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
          <TabsTrigger value="recommendations">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Current Streak */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <Zap className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{insights.streakData.currentStreak}</div>
                <p className="text-xs text-muted-foreground">
                  Longest: {insights.streakData.longestStreak} days
                </p>
              </CardContent>
            </Card>

            {/* Quality Streak */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quality Streak</CardTitle>
                <Star className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{insights.streakData.qualityStreak}</div>
                <p className="text-xs text-muted-foreground">
                  High-quality sessions
                </p>
              </CardContent>
            </Card>

            {/* Best Focus Hour */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Focus Time</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatHour(insights.timeOfDayPatterns.bestFocusHour)}</div>
                <p className="text-xs text-muted-foreground">
                  Quality: {insights.timeOfDayPatterns.bestHourQuality.toFixed(1)}/5
                </p>
              </CardContent>
            </Card>

            {/* Productivity Impact */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Streak Impact</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {insights.streakData.streakImpactOnProductivity > 0 ? '+' : ''}
                  {insights.streakData.streakImpactOnProductivity.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Productivity change
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Task Type Insights */}
          {insights.taskTypeInsights.mostFocusedCategory && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Task Category Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Most Focused Category</h4>
                    <Badge variant="secondary" className="text-sm">
                      {insights.taskTypeInsights.mostFocusedCategory}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insights.taskTypeInsights.categorySessionCounts[insights.taskTypeInsights.mostFocusedCategory]} sessions
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Highest Quality Category</h4>
                    <Badge variant="secondary" className="text-sm">
                      {insights.taskTypeInsights.highestQualityCategory}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insights.taskTypeInsights.categoryAverageQuality[insights.taskTypeInsights.highestQualityCategory]?.toFixed(1)}/5 avg quality
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Time Patterns Tab */}
        <TabsContent value="timing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Hourly Focus Quality
              </CardTitle>
              <CardDescription>
                Your focus quality throughout the day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(insights.timeOfDayPatterns.hourlyQualityRatings)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([hour, quality]) => (
                    <div key={hour} className="flex items-center space-x-4">
                      <div className="w-16 text-sm font-medium">
                        {formatHour(parseInt(hour))}
                      </div>
                      <div className="flex-1">
                        <Progress value={(quality / 5) * 100} className="h-2" />
                      </div>
                      <div className="w-12 text-sm text-right">
                        {quality.toFixed(1)}
                      </div>
                      <div className="w-16 text-xs text-muted-foreground text-right">
                        {insights.timeOfDayPatterns.hourlySessionCounts[parseInt(hour)] || 0} sessions
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Correlations Tab */}
        <TabsContent value="correlations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Focus Correlations
                </CardTitle>
                <CardDescription>
                  How different factors affect your focus quality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Session Length</span>
                    <div className="flex items-center gap-2">
                      {getCorrelationIcon(insights.correlations.sessionLengthQualityCorrelation)}
                      <span className={`text-sm ${getCorrelationColor(insights.correlations.sessionLengthQualityCorrelation)}`}>
                        {getCorrelationText(insights.correlations.sessionLengthQualityCorrelation)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Distractions</span>
                    <div className="flex items-center gap-2">
                      {getCorrelationIcon(insights.correlations.distractionQualityCorrelation)}
                      <span className={`text-sm ${getCorrelationColor(insights.correlations.distractionQualityCorrelation)}`}>
                        {getCorrelationText(insights.correlations.distractionQualityCorrelation)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Task Progress</span>
                    <div className="flex items-center gap-2">
                      {getCorrelationIcon(insights.correlations.taskProgressSessionQualityCorrelation)}
                      <span className={`text-sm ${getCorrelationColor(insights.correlations.taskProgressSessionQualityCorrelation)}`}>
                        {getCorrelationText(insights.correlations.taskProgressSessionQualityCorrelation)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Category Effectiveness
                </CardTitle>
                <CardDescription>
                  Tasks completed per hour by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(insights.taskTypeInsights.categoryEffectiveness)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([category, effectiveness]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm truncate">{category}</span>
                        <Badge variant="outline" className="text-xs">
                          {effectiveness.toFixed(2)} tasks/hr
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {insights.recommendations.length > 0 ? (
              insights.recommendations
                .sort((a, b) => a.priority - b.priority)
                .map((rec, index) => (
                  <Card key={rec.id} className={index === 0 ? 'border-blue-200 bg-blue-50' : ''}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className={`h-5 w-5 ${index === 0 ? 'text-blue-600' : 'text-yellow-500'}`} />
                        {rec.title}
                        {index === 0 && <Badge variant="default" className="ml-2">Priority</Badge>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                      <Badge variant="outline" className="mt-2">
                        {rec.category}
                      </Badge>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Complete more focus sessions to get personalized recommendations!</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 