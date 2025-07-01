'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { useState, useCallback } from 'react';
import { useUser } from '@/lib/hooks/useUserWithFamily';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { useSignalRConnectionManager } from '@/lib/hooks/useSignalRConnectionManager';
import { UserAnalyticsDashboard } from './UserAnalyticsDashboard';
import { AdminAnalyticsDashboard } from './AdminAnalyticsDashboard';
import { analyticsService } from '@/lib/services/analyticsService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  Shield, 
  RefreshCw, 
  Clock,
  Download
} from 'lucide-react';
import { AnalyticsDashboardWrapperProps } from '@/lib/types/analytics-components';
import { BackendGamificationEventDTO, BackendTaskCompletionEventDTO } from '@/lib/types/backend-signalr-events';

type TimeRange = '7d' | '30d' | '90d' | '1y';
type DashboardMode = 'user' | 'family' | 'admin';

export function AnalyticsDashboardWrapper({ 
  className,
  userId: propUserId,
  familyId: propFamilyId,
  showPersonalData = true,
  showFamilyData = true,
  showAdminData = true,
  timeRange = 'month' // Available for future use
}: AnalyticsDashboardWrapperProps) {
  const { user, selectedFamily, isGlobalAdmin } = useUser();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use props or fallback to user context
  const userId = propUserId || user?.id;
  const familyId = propFamilyId || selectedFamily?.id;

  // Convert timeRange format for compatibility
  const convertTimeRange = (range: 'week' | 'month' | 'quarter' | 'year'): TimeRange => {
    switch (range) {
      case 'week': return '7d';
      case 'month': return '30d';
      case 'quarter': return '90d';
      case 'year': return '1y';
      default: return '30d';
    }
  };

  // Initialize analytics with proper state management
  const analytics = useAnalytics({
    userId: userId,
    familyId: familyId,
    isAdmin: isGlobalAdmin,
    initialTimeRange: convertTimeRange(timeRange),
    initialMode: familyId ? 'family' : 'user'
  });

  // Real-time analytics updates via SignalR
  const handleGamificationEvent = useCallback((event: BackendGamificationEventDTO) => {
    console.log('🎮 Real-time gamification event in analytics:', event);
    // Refresh analytics data when gamification events occur
    analytics.refreshData();
  }, [analytics]);

  const handleTaskCompletion = useCallback((event: BackendTaskCompletionEventDTO) => {
    console.log('✅ Real-time task completion in analytics:', event);
    // Refresh analytics data when tasks are completed
    analytics.refreshData();
  }, [analytics]);

  // Keep SignalR connection alive for real-time analytics updates
  useSignalRConnectionManager('analytics-dashboard', {
    onReceiveGamificationEvent: handleGamificationEvent,
    onReceiveTaskCompletionEvent: handleTaskCompletion,
    onReceiveFamilyTaskCompletion: handleTaskCompletion,
    onConnected: () => console.log('📡 Analytics dashboard connected to SignalR'),
    onDisconnected: () => console.log('📡 Analytics dashboard disconnected from SignalR'),
  });

  const hasFamilyAccess = (familyId != null) && showFamilyData;

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await analyticsService.refreshAnalyticsCache();
      if (selectedFamily) {
        await analyticsService.refreshFamilyAnalyticsCache(selectedFamily.id);
      }
      await analytics.refreshData();
    } catch (error) {
      console.error('Failed to refresh analytics cache:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Please log in to view analytics.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Dashboard Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          <span className="font-semibold">Analytics Dashboard</span>
          {isGlobalAdmin && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Shield className="h-3 w-3 mr-1" />
              Global Admin
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 border rounded-md p-1">
            {(['7d', '30d', '90d', '1y'] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={analytics.timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => analytics.setTimeRange(range)}
                className="h-7 px-2 text-xs"
              >
                {range === '7d' && '7 Days'}
                {range === '30d' && '30 Days'}
                {range === '90d' && '90 Days'}
                {range === '1y' && '1 Year'}
              </Button>
            ))}
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || analytics.isLoading}
            className="h-7"
          >
            <RefreshCw className={`h-3 w-3 ${(isRefreshing || analytics.isLoading) ? 'animate-spin' : ''}`} />
          </Button>

          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            className="h-7"
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Last updated: {analytics.lastUpdated.toLocaleString()}</span>
        {analytics.hasErrors && (
          <span className="text-red-500 ml-2">⚠️ Some data failed to load</span>
        )}
      </div>

      {/* Dashboard Tabs */}
      <Tabs value={analytics.dashboardMode} onValueChange={(value) => analytics.setDashboardMode(value as DashboardMode)}>
        <TabsList className={`grid w-full ${
          [showPersonalData, hasFamilyAccess, isGlobalAdmin && showAdminData].filter(Boolean).length === 1 ? 'grid-cols-1' :
          [showPersonalData, hasFamilyAccess, isGlobalAdmin && showAdminData].filter(Boolean).length === 2 ? 'grid-cols-2' :
          'grid-cols-3'
        }`}>
          {showPersonalData && (
            <TabsTrigger value="user" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Personal
            </TabsTrigger>
          )}
          
          {hasFamilyAccess && (
            <TabsTrigger value="family" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Family
            </TabsTrigger>
          )}
          
          {isGlobalAdmin && showAdminData && (
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Platform
            </TabsTrigger>
          )}
        </TabsList>

        {/* Personal Analytics */}
        {showPersonalData && (
          <TabsContent value="user" className="space-y-6">
            <UserAnalyticsDashboard 
              analytics={analytics}
              mode="user"
            />
          </TabsContent>
        )}

        {/* Family Analytics */}
        {hasFamilyAccess && (
          <TabsContent value="family" className="space-y-6">
            <UserAnalyticsDashboard 
              analytics={analytics}
              mode="family"
            />
          </TabsContent>
        )}

        {/* Admin Analytics */}
        {isGlobalAdmin && showAdminData && (
          <TabsContent value="admin" className="space-y-6">
            <AdminAnalyticsDashboard 
              analytics={analytics}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
} 