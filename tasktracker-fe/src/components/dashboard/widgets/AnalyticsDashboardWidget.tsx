'use client';

/*
 * Analytics Dashboard Widget
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  ArrowRight,
  Users,
  Target,
  Clock
} from 'lucide-react';
import { analyticsService } from '@/lib/services/analyticsService';

interface AnalyticsDashboardWidgetProps {
  userId?: number;
  familyId?: number;
  className?: string;
}

interface QuickStats {
  tasksCompleted: number;
  productivityScore: number;
  familyCollaboration: number;
  focusTime: number;
  weeklyGrowth: number;
}

export function AnalyticsDashboardWidget({ 
  userId, 
  familyId, 
  className 
}: AnalyticsDashboardWidgetProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [quickStats, setQuickStats] = useState<QuickStats>({
    tasksCompleted: 0,
    productivityScore: 0,
    familyCollaboration: 0,
    focusTime: 0,
    weeklyGrowth: 0
  });

  const loadQuickStats = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // Get basic analytics for widget preview
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7); // Last 7 days

      const userAnalytics = await analyticsService.getUserDashboard(startDate, endDate);
      
      setQuickStats({
        tasksCompleted: userAnalytics.taskAnalytics.completedTasks || 0,
        productivityScore: Math.round(userAnalytics.productivityMetrics.productivityScore || 0),
        familyCollaboration: userAnalytics.gamificationStats.totalPoints || 0,
        focusTime: userAnalytics.productivityMetrics.focusSessionsCompleted || 0,
        weeklyGrowth: Math.random() * 10 - 5 // Placeholder trend calculation
      });
    } catch (error) {
      console.error('Failed to load quick analytics stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadQuickStats();
  }, [loadQuickStats, familyId]);

  const navigateToAnalytics = () => {
    router.push('/analytics');
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600 dark:text-green-400';
    if (growth < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getProductivityLevel = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'bg-green-500' };
    if (score >= 60) return { label: 'Good', color: 'bg-blue-500' };
    if (score >= 40) return { label: 'Fair', color: 'bg-yellow-500' };
    return { label: 'Needs Focus', color: 'bg-orange-500' };
  };

  const productivityLevel = getProductivityLevel(quickStats.productivityScore);

  return (
    <Card className={`border-2 border-indigo-200 dark:border-indigo-700 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 shadow-lg hover:shadow-xl transition-all duration-300 ${className || ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                Analytics Insights
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your productivity at a glance
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
            INSIGHTS
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
          </div>
        ) : (
          <>
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Tasks</span>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {quickStats.tasksCompleted}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">this week</div>
              </div>
              
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Focus</span>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {quickStats.focusTime}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">sessions</div>
              </div>
            </div>

            {/* Productivity Score */}
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Productivity Score
                  </span>
                </div>
                <Badge className={`text-xs ${productivityLevel.color}`}>
                  {productivityLevel.label}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {quickStats.productivityScore}%
                </div>
                <div className={`text-sm font-medium ${getGrowthColor(quickStats.weeklyGrowth)}`}>
                  {quickStats.weeklyGrowth > 0 ? '+' : ''}{quickStats.weeklyGrowth.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Family Collaboration (if applicable) */}
            {familyId && (
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Family Points
                  </span>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {quickStats.familyCollaboration}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">total earned</div>
              </div>
            )}

            {/* Action Button */}
            <Button 
              onClick={navigateToAnalytics}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-200"
              size="sm"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Full Analytics
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
} 
