'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Users, TrendingUp, Server, DollarSign, Shield, Activity, UserCheck, Globe, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { AnalyticsCard } from './AnalyticsCard';
import { AdminAnalyticsDashboardProps } from '@/lib/props/components/analytics.props';

export function AdminAnalyticsDashboard({ 
  analytics,
  className 
}: AdminAnalyticsDashboardProps) {
  // Extract data from centralized analytics state
  const {
    adminAnalytics: adminData,
    systemHealth,
    userEngagement,
    loading,
    errors
  } = analytics;

  const isLoading = loading.admin;
  const error = errors.admin;

  if (isLoading) {
    return <AdminAnalyticsSkeleton />;
  }

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!adminData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No admin analytics data available.</AlertDescription>
      </Alert>
    );
  }

  const { platformOverview, revenueAnalytics, systemPerformance } = adminData;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Platform Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          title="Total Users"
          value={platformOverview.totalUsers.toLocaleString()}
          description={`${platformOverview.newUsersThisMonth} new this month`}
          trend="up"
          icon={<Users className="h-4 w-4" />}
        />
        
        <AnalyticsCard
          title="Active Users"
          value={platformOverview.activeUsers.toLocaleString()}
          description={`${((platformOverview.activeUsers / platformOverview.totalUsers) * 100).toFixed(1)}% active`}
          trend={platformOverview.userRetentionRate > 75 ? 'up' : 'stable'}
          icon={<UserCheck className="h-4 w-4" />}
        />
        
        <AnalyticsCard
          title="Total Families"
          value={platformOverview.totalFamilies.toLocaleString()}
          description="Family units registered"
          trend="up"
          icon={<Globe className="h-4 w-4" />}
        />
        
        <AnalyticsCard
          title="Monthly Revenue"
          value={`$${revenueAnalytics.monthlyRecurringRevenue.toLocaleString()}`}
          description={`${revenueAnalytics.revenueGrowth.toFixed(1)}% growth`}
          trend={revenueAnalytics.revenueGrowth > 0 ? 'up' : 'down'}
          icon={<DollarSign className="h-4 w-4" />}
        />
      </div>

      {/* System Health Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Health Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Health Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemHealth && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Overall Health Score</span>
                  <Badge 
                    variant={systemHealth.overallHealthScore > 90 ? 'default' : 
                             systemHealth.overallHealthScore > 70 ? 'secondary' : 'destructive'}
                  >
                    {systemHealth.overallHealthScore}%
                  </Badge>
                </div>
                <Progress value={systemHealth.overallHealthScore} className="h-2" />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Response Time</p>
                    <p className="font-medium">{systemHealth.apiResponseTime}ms</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Error Rate</p>
                    <p className="font-medium">{systemHealth.errorRate.toFixed(2)}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Active Services</p>
                    <p className="font-medium">{systemHealth.activeBackgroundServices}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Failed Services</p>
                    <p className="font-medium text-red-600">{systemHealth.failedServices}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* System Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>CPU Usage</span>
                  <span>{systemPerformance.cpuUsage.toFixed(1)}%</span>
                </div>
                <Progress value={systemPerformance.cpuUsage} className="h-2" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Memory Usage</span>
                  <span>{systemPerformance.memoryUsage.toFixed(1)}%</span>
                </div>
                <Progress value={systemPerformance.memoryUsage} className="h-2" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Disk Usage</span>
                  <span>{systemPerformance.diskUsage.toFixed(1)}%</span>
                </div>
                <Progress value={systemPerformance.diskUsage} className="h-2" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Cache Hit Rate</span>
                  <span>{systemPerformance.cacheHitRate.toFixed(1)}%</span>
                </div>
                <Progress value={systemPerformance.cacheHitRate} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Engagement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              User Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {userEngagement && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Daily Active</p>
                  <p className="font-medium">{userEngagement.dailyActiveUsers.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Weekly Active</p>
                  <p className="font-medium">{userEngagement.weeklyActiveUsers.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Monthly Active</p>
                  <p className="font-medium">{userEngagement.monthlyActiveUsers.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Avg Session</p>
                  <p className="font-medium">{Math.round(userEngagement.averageSessionDuration)}min</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Total Revenue</p>
                <p className="font-medium">${revenueAnalytics.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">MRR</p>
                <p className="font-medium">${revenueAnalytics.monthlyRecurringRevenue.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Active Subs</p>
                <p className="font-medium">{revenueAnalytics.activeSubscriptions.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Churn Rate</p>
                <p className="font-medium">{revenueAnalytics.churnRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Platform Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Growth</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Growth Rate</span>
                <Badge variant={platformOverview.platformGrowthRate > 10 ? 'default' : 'secondary'}>
                  {platformOverview.platformGrowthRate.toFixed(1)}%
                </Badge>
              </div>
              <Progress value={Math.min(platformOverview.platformGrowthRate, 100)} className="h-2" />
            </div>
            
            <div className="space-y-1 text-xs">
              <p>📈 New users today: {platformOverview.newUsersToday}</p>
              <p>📊 New users this week: {platformOverview.newUsersThisWeek}</p>
              <p>🚀 New users this month: {platformOverview.newUsersThisMonth}</p>
            </div>
          </CardContent>
        </Card>

        {/* Service Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Service Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {systemHealth?.serviceHealth.slice(0, 5).map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm truncate">{service.serviceName}</span>
                <div className="flex items-center gap-2">
                  {service.status === 'Healthy' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : service.status === 'Warning' ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {service.responseTime && `${service.responseTime}ms`}
                  </span>
                </div>
              </div>
            )) || (
              <p className="text-sm text-muted-foreground">No service data available</p>
            )}
          </CardContent>
        </Card>

        {/* Top Features */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {userEngagement?.topFeatures.slice(0, 5).map((feature, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="truncate">{feature.featureName}</span>
                  <span>{feature.usagePercentage.toFixed(1)}%</span>
                </div>
                <Progress value={feature.usagePercentage} className="h-1" />
              </div>
            )) || (
              <p className="text-sm text-muted-foreground">No feature usage data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function AdminAnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Key Metrics Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 
