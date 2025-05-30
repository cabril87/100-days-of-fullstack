'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/providers/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  RadarChart,
  TimelineChart,
  FamilyComparisonChart
} from '@/components/analytics';
import type { ProductivityInsight, TrendAnalysis, PerformanceScore } from '@/lib/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  BrainIcon, 
  TrendingUpIcon,
  TrendingDownIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  LightbulbIcon,
  TargetIcon,
  SparklesIcon,
  BarChart3Icon
} from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsInsightsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('insights');
  const [insights, setInsights] = useState<ProductivityInsight[]>([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/analytics/insights');
    }
  }, [authLoading, user, router]);

  // Mock insights data
  useEffect(() => {
    const mockInsights: ProductivityInsight[] = [
      {
        type: 'productivity-trend',
        title: 'Productivity Increasing',
        description: 'Your task completion rate has improved by 23% over the last month',
        impact: 'high',
        actionable: true,
        recommendations: [
          'Continue your current workflow patterns',
          'Consider documenting your successful strategies',
          'Share best practices with team members'
        ],
        data: { trend: 'up', percentage: 23, period: 'month' }
      },
      {
        type: 'time-optimization',
        title: 'Peak Performance Window',
        description: 'You are 40% more productive between 9-11 AM',
        impact: 'high',
        actionable: true,
        recommendations: [
          'Schedule important tasks during 9-11 AM',
          'Block this time for deep work',
          'Avoid meetings during peak hours'
        ],
        data: { peakHours: '9-11 AM', efficiency: 40 }
      },
      {
        type: 'category-efficiency',
        title: 'Work Tasks Delayed',
        description: 'Work category tasks take 35% longer than personal tasks',
        impact: 'medium',
        actionable: true,
        recommendations: [
          'Break down work tasks into smaller chunks',
          'Set more realistic time estimates',
          'Review work task complexity'
        ],
        data: { category: 'Work', delay: 35 }
      },
      {
        type: 'collaboration-opportunity',
        title: 'Team Collaboration Gap',
        description: 'Only 15% of your tasks involve team collaboration',
        impact: 'medium',
        actionable: true,
        recommendations: [
          'Identify tasks suitable for collaboration',
          'Reach out to team members for support',
          'Consider pair programming or task sharing'
        ],
        data: { collaborationRate: 15 }
      },
      {
        type: 'goal-achievement',
        title: 'Monthly Goal Progress',
        description: 'You are on track to exceed your monthly task goal by 12%',
        impact: 'high',
        actionable: false,
        recommendations: [
          'Maintain current momentum',
          'Consider setting more challenging goals',
          'Help team members reach their goals'
        ],
        data: { progress: 112, target: 100 }
      },
      {
        type: 'workload-balance',
        title: 'Weekend Overwork',
        description: 'You complete 23% of tasks on weekends, affecting work-life balance',
        impact: 'medium',
        actionable: true,
        recommendations: [
          'Better time management during weekdays',
          'Set boundaries for weekend work',
          'Review task prioritization'
        ],
        data: { weekendWork: 23 }
      }
    ];

    setInsights(mockInsights);
  }, []);

  // Get insight icon
  const getInsightIcon = (type: string, impact: string) => {
    const icons = {
      'productivity-trend': <TrendingUpIcon className="h-5 w-5" />,
      'time-optimization': <TargetIcon className="h-5 w-5" />,
      'category-efficiency': <BarChart3Icon className="h-5 w-5" />,
      'collaboration-opportunity': <SparklesIcon className="h-5 w-5" />,
      'goal-achievement': <CheckCircleIcon className="h-5 w-5" />,
      'workload-balance': <AlertTriangleIcon className="h-5 w-5" />
    };
    
    return icons[type as keyof typeof icons] || <LightbulbIcon className="h-5 w-5" />;
  };

  // Get insight color class
  const getInsightColor = (impact: string) => {
    const colors = {
      high: 'bg-green-50 border-green-200 text-green-800',
      medium: 'bg-orange-50 border-orange-200 text-orange-800',
      low: 'bg-blue-50 border-blue-200 text-blue-800'
    };
    
    return colors[impact as keyof typeof colors] || colors.low;
  };

  // Performance score data
  const performanceScore: PerformanceScore = {
    overall: 78,
    categories: {
      completion: 85,
      efficiency: 72,
      consistency: 76,
      collaboration: 65
    },
    benchmarks: {
      personal: 78,
      family: 71,
      global: 65
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto p-4 max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-gray-300 rounded"></div>
            <div className="h-96 bg-gray-300 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/analytics">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Analytics
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">AI-Powered Insights</h1>
              <p className="text-gray-500">
                Discover patterns and get recommendations to improve your productivity
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <BrainIcon className="h-3 w-3" />
                AI Powered
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <LightbulbIcon className="h-4 w-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <TargetIcon className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUpIcon className="h-4 w-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4" />
              Actions
            </TabsTrigger>
          </TabsList>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6">
              {/* Insight summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Insight Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {insights.filter(i => i.impact === 'high').length}
                      </div>
                      <div className="text-sm text-gray-600">High Impact</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {insights.filter(i => i.impact === 'medium').length}
                      </div>
                      <div className="text-sm text-gray-600">Medium Impact</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {insights.filter(i => i.actionable).length}
                      </div>
                      <div className="text-sm text-gray-600">Actionable</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {insights.length}
                      </div>
                      <div className="text-sm text-gray-600">Total Insights</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Insights list */}
              <div className="grid gap-4">
                {insights.map((insight, index) => (
                  <Card key={index} className={`border-l-4 ${getInsightColor(insight.impact)}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getInsightIcon(insight.type, insight.impact)}
                          <div>
                            <CardTitle className="text-lg">{insight.title}</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={insight.impact === 'high' ? 'default' : 'secondary'}>
                            {insight.impact} impact
                          </Badge>
                          {insight.actionable && (
                            <Badge variant="outline">Actionable</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <h4 className="font-medium mb-2">Recommendations:</h4>
                        <ul className="space-y-1">
                          {insight.recommendations.map((rec, recIndex) => (
                            <li key={recIndex} className="text-sm flex items-start gap-2">
                              <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid gap-6">
              {/* Overall performance score */}
              <Card>
                <CardHeader>
                  <CardTitle>Overall Performance Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {performanceScore.overall}%
                    </div>
                    <p className="text-gray-600">Above average performance</p>
                  </div>
                  
                  <div className="space-y-4">
                    {Object.entries(performanceScore.categories).map(([category, score]) => (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{category}</span>
                          <span>{score}%</span>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance radar chart */}
              <RadarChart theme="light" period="month" />
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <TimelineChart theme="light" period="month" />
            <FamilyComparisonChart theme="light" />
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid gap-4">
              {insights
                .filter(insight => insight.actionable)
                .map((insight, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {getInsightIcon(insight.type, insight.impact)}
                        Action Plan: {insight.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-800 mb-1">Problem</h4>
                          <p className="text-sm text-blue-700">{insight.description}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium">Action Steps</h4>
                          <div className="grid gap-2">
                            {insight.recommendations.map((rec, recIndex) => (
                              <div key={recIndex} className="flex items-center gap-3 p-2 border rounded">
                                <input 
                                  type="checkbox" 
                                  className="w-4 h-4 text-blue-600 rounded"
                                />
                                <span className="text-sm">{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            Mark Complete
                          </Button>
                          <Button size="sm">
                            Start Action
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 