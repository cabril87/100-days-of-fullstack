/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * Admin Analytics Interfaces - Following .cursorrules ZERO TOLERANCE policy
 * ALL interfaces must be in lib/interfaces/ with proper subdirectory structure
 */

import { User } from '@/lib/types/auth/auth';

// Import the interfaces from analytics.interface.ts instead of duplicating
import type {
  PlatformOverviewDTO,
  RevenueAnalyticsDTO,
  SystemPerformanceDTO,
  FeatureUsageDTO
} from './analytics.interface';


// ================================
// ADMIN-SPECIFIC ANALYTICS INTERFACES
// ================================

export interface SystemHealthDTO {
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeConnections: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  databaseHealth: 'healthy' | 'warning' | 'critical';
  cacheHitRate: number;
  pendingJobs: number;
}

export interface UserEngagementDTO {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  retentionRate: number;
  churnRate: number;
  newUserSignups: number;
  userGrowthRate: number;
}

export interface AdminAnalyticsDataDTO {
  platformOverview: PlatformOverviewDTO;
  revenueAnalytics: RevenueAnalyticsDTO;
  systemPerformance: SystemPerformanceDTO;
  systemHealth: SystemHealthDTO;
  userEngagement: UserEngagementDTO;
  topFeatures: FeatureUsageDTO[];
  lastUpdated: string;
} 
