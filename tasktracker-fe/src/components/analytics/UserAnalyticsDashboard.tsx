'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Star, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { AnalyticsCard } from './AnalyticsCard';
import { ProductivityChart } from './charts/ProductivityChart';
import { TaskCompletionChart } from './charts/TaskCompletionChart';
import { GamificationChart } from './charts/GamificationChart';
import { FamilyCollaborationChart } from './charts/FamilyCollaborationChart';
import { UserAnalyticsDashboardProps } from '@/lib/types/analytics';

function AnalyticsDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function UserAnalyticsDashboard({ 
  analytics,
  mode = 'user',
  className 
}: UserAnalyticsDashboardProps) {
  const {
    userAnalytics,
    familyAnalytics,
    recommendations,
    loading,
    errors,
    timeRange
  } = analytics;

  const isLoading = mode === 'user' ? loading.user : loading.family;
  const error = mode === 'user' ? errors.user : errors.family;
  const recommendationsList = recommendations?.recommendations || [];

  if (isLoading) {
    return <AnalyticsDashboardSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Failed to load analytics: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle different data types for user vs family mode
  let taskAnalytics, productivityMetrics, gamificationStats;
  
  if (mode === 'family' && familyAnalytics) {
    // For family mode, we need to aggregate or use family-specific data
    // Note: This assumes the backend provides appropriate family analytics structure
    taskAnalytics = {
      completionRate: familyAnalytics.overview.totalTasks > 0 
        ? (familyAnalytics.overview.completedTasks / familyAnalytics.overview.totalTasks) * 100 
        : 0,
      tasksByPriority: { high: 0, medium: 0, low: 0 }, // Family analytics might not have this breakdown
      tasksByCategory: { work: 0, personal: 0, family: 0 } // Family analytics might not have this breakdown
    };
    productivityMetrics = {
      productivityScore: familyAnalytics.overview.familyProductivityScore
    };
    gamificationStats = {
      totalPoints: familyAnalytics.memberAnalytics.reduce((sum, member) => sum + member.pointsEarned, 0),
      currentStreak: familyAnalytics.overview.currentStreak,
      recentAchievements: [] // Family analytics might not have individual achievements
    };
  } else if (userAnalytics) {
    // For user mode, use user analytics directly
    taskAnalytics = userAnalytics.taskAnalytics;
    productivityMetrics = userAnalytics.productivityMetrics;
    gamificationStats = userAnalytics.gamificationStats;
  } else {
    // No data available
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No analytics data available for the selected time period.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Completion Rate"
          value={`${taskAnalytics.completionRate.toFixed(1)}%`}
          description="Tasks completed successfully"
          trend={taskAnalytics.completionRate > 75 ? 'up' : 'down'}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        
        <AnalyticsCard
          title="Productivity Score"
          value={productivityMetrics.productivityScore.toString()}
          description="Overall productivity rating"
          trend={productivityMetrics.productivityScore > 80 ? 'up' : 'stable'}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        
        <AnalyticsCard
          title="Current Streak"
          value={`${gamificationStats.currentStreak} days`}
          description="Consecutive active days"
          trend={gamificationStats.currentStreak > 7 ? 'up' : 'stable'}
          icon={<Star className="h-4 w-4" />}
        />
        
        <AnalyticsCard
          title="Total Points"
          value={gamificationStats.totalPoints.toLocaleString()}
          description="Gamification points earned"
          trend="up"
          icon={<Star className="h-4 w-4" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Chart */}
        {mode === 'user' && userAnalytics && (
          <ProductivityChart
            data={userAnalytics.productivityMetrics}
            timeRange={timeRange}
          />
        )}

        {/* Task Completion Chart */}
        {mode === 'user' && userAnalytics && (
          <TaskCompletionChart
            data={userAnalytics.taskAnalytics}
            timeRange={timeRange}
          />
        )}

        {/* Gamification Chart */}
        {mode === 'user' && userAnalytics && (
          <GamificationChart
            data={userAnalytics.gamificationStats}
            timeRange={timeRange}
          />
        )}

        {/* Family Collaboration Chart (only in family mode) */}
        {mode === 'family' && familyAnalytics && (
          <FamilyCollaborationChart
            familyData={familyAnalytics}
            timeRange={timeRange}
          />
        )}
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
          <CardDescription>
            Personalized suggestions to improve your productivity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendationsList.length > 0 ? (
            recommendationsList.slice(0, 3).map((rec, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-start gap-2">
                  <Badge
                    variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}
                    className="mt-1"
                  >
                    {rec.priority}
                  </Badge>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-4">
              <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recommendations available at this time.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Achievements
          </CardTitle>
          <CardDescription>
            Your latest accomplishments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {gamificationStats.recentAchievements && gamificationStats.recentAchievements.length > 0 ? (
            <div className="space-y-3">
              {gamificationStats.recentAchievements.slice(0, 5).map((achievement, index) => (
                <div key={index} className="flex items-center gap-3 p-2 border rounded-lg">
                  <div className="flex-shrink-0">
                    <Badge variant="secondary">{achievement.points} pts</Badge>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{achievement.name}</p>
                    {achievement.description && (
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(achievement.earnedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              <TrendingDown className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent achievements to display.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Breakdown */}
      {mode === 'user' && userAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Priority */}
          <Card>
            <CardHeader>
              <CardTitle>Tasks by Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(userAnalytics.taskAnalytics.tasksByPriority).map(([priority, count]) => (
                  <div key={priority} className="flex items-center justify-between">
                    <span className="capitalize">{priority}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* By Category */}
          <Card>
            <CardHeader>
              <CardTitle>Tasks by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(userAnalytics.taskAnalytics.tasksByCategory).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="capitalize">{category}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 