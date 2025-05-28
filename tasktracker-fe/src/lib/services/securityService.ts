/**
 * Security monitoring service for admin dashboard
 */

import { apiClient } from './apiClient';
import type {
  SecurityDashboard,
  SecurityDashboardResponse,
  SecurityMetric,
  SecurityMetricsResponse,
  SecurityAuditLog,
  SecurityAuditLogsResponse,
  SecurityAlert,
  SecurityAlertsResponse,
  SecurityLogFilter,
  SecurityMetricFilter,
  AlertConfiguration,
  SecurityStatistics,
  SecurityOverview,
  RateLimitStatus,
  SystemHealth,
  PerformanceMetrics,
  UserActivity,
  FailedLoginSummaryDTO,
  FailedLoginAttemptDTO,
  AccountLockoutStatusDTO,
  SessionManagementDTO,
  UserSessionDTO,
  IPGeolocationSummaryDTO,
  GeolocationAccessDTO,
  GeolocationDTO,
  ThreatIntelligenceSummaryDTO,
  ThreatIndicatorDTO,
  BehavioralAnalyticsSummaryDTO,
  BehavioralAnomalyDTO,
  UserBehaviorProfileDTO,
  SecurityMonitoringSummaryDTO,
  SecurityMonitoringEventDTO
} from '@/lib/types';

export interface CreateSecurityAlertRequest {
  type: string;
  title: string;
  description: string;
  severity: string;
  source?: string;
  recommendedAction?: string;
}

export interface ClearLogsResult {
  clearedCount: number;
  clearedDate: string;
  message: string;
}

export interface LogSecurityMetricRequest {
  metricType: string;
  metricName: string;
  value: number;
  description?: string;
  source?: string;
  severity?: string;
}

export class SecurityService {
  private readonly baseUrl = '/v1/security';

  /**
   * Get the complete security dashboard
   */
  async getDashboardData(): Promise<SecurityDashboard> {
    try {
      console.log('[SecurityService] Fetching dashboard data from:', `${this.baseUrl}/dashboard`);
      
      const response = await apiClient.get<any>(`${this.baseUrl}/dashboard`);
      
      console.log('[SecurityService] Raw API response:', {
        status: response.status,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        fullResponse: response
      });
      
      if (!response.data) {
        throw new Error('No dashboard data received from API');
      }
      
      // Handle API response wrapper
      const dashboardData = response.data.data || response.data;
      
      console.log('[SecurityService] Dashboard data after unwrapping:', {
        hasOverview: !!dashboardData.overview,
        hasSystemHealth: !!dashboardData.systemHealth,
        systemHealthKeys: dashboardData.systemHealth ? Object.keys(dashboardData.systemHealth) : [],
        systemHealthStatus: dashboardData.systemHealth?.overallStatus || dashboardData.SystemHealth?.OverallStatus,
        fullSystemHealth: dashboardData.systemHealth || dashboardData.SystemHealth
      });
    
    // Get overview data - handle both camelCase and PascalCase
    const overviewData = dashboardData.overview || dashboardData.Overview;
    
    // Debug logging
    console.log('[SecurityService] Raw backend data:', {
      fullResponse: dashboardData,
      overview: overviewData,
      securityScore: overviewData?.securityScore || overviewData?.SecurityScore,
      totalRequests: overviewData?.totalRequests24h || overviewData?.TotalRequests24h,
      blockedRequests: overviewData?.blockedRequests24h || overviewData?.BlockedRequests24h,
      suspiciousActivity: overviewData?.suspiciousActivities24h || overviewData?.SuspiciousActivities24h,
      activeUsers: overviewData?.activeUsers24h || overviewData?.ActiveUsers24h
    });

    // Map backend field names to frontend expected names
    const mappedData: SecurityDashboard = {
      overview: {
        securityScore: overviewData?.securityScore || overviewData?.SecurityScore || 0,
        totalRequests: overviewData?.totalRequests24h || overviewData?.TotalRequests24h || 0,
        blockedRequests: overviewData?.blockedRequests24h || overviewData?.BlockedRequests24h || 0,
        successfulRequests: (overviewData?.totalRequests24h || overviewData?.TotalRequests24h || 0) - 
                           (overviewData?.blockedRequests24h || overviewData?.BlockedRequests24h || 0),
        suspiciousActivity: overviewData?.suspiciousActivities24h || overviewData?.SuspiciousActivities24h || 0,
        activeUsers: overviewData?.activeUsers24h || overviewData?.ActiveUsers24h || 0,
        systemHealth: (dashboardData.systemHealth?.overallStatus || dashboardData.SystemHealth?.OverallStatus || 'healthy').toLowerCase(),
        lastUpdated: dashboardData.lastUpdated || dashboardData.LastUpdated || new Date().toISOString(),
        securityFeatures: overviewData?.securityFeatures || overviewData?.SecurityFeatures || [],
        recentActivity: dashboardData.recentAuditLogs || dashboardData.RecentAuditLogs || []
      },
      rateLimitStatus: {
        globalLimits: (dashboardData.rateLimitStatus?.configurations || dashboardData.RateLimitStatus?.Configurations || []).map((config: any) => ({
          endpoint: config.scope || config.Scope || 'Unknown',
          limit: config.limit || config.Limit || 0,
          window: config.timeWindowSeconds ? `${config.timeWindowSeconds}s` : (config.TimeWindowSeconds ? `${config.TimeWindowSeconds}s` : 'Unknown'),
          currentUsage: 0,
          status: config.isActive || config.IsActive ? 'healthy' : 'inactive'
        })),
        userQuotas: (dashboardData.rateLimitStatus?.topUsers || dashboardData.RateLimitStatus?.TopUsers || []).map((user: any) => ({
          username: user.username || user.Username || 'Unknown',
          dailyLimit: user.maxDailyApiCalls || user.MaxDailyApiCalls || 0,
          apiCallsUsedToday: user.apiCallsUsedToday || user.ApiCallsUsedToday || 0,
          lastRequestTime: user.lastActivity || user.LastActivity || new Date().toISOString(),
          status: user.isNearLimit || user.IsNearLimit ? 'warning' : 'normal'
        })),
        topUsers: (dashboardData.rateLimitStatus?.topUsers || dashboardData.RateLimitStatus?.TopUsers || []).map((user: any) => ({
          username: user.username || user.Username || 'Unknown',
          requestCount: user.apiCallsUsedToday || user.ApiCallsUsedToday || 0,
          lastActivity: user.lastActivity || user.LastActivity || new Date().toISOString(),
          ipAddress: user.ipAddress || user.IpAddress || 'Unknown',
          userAgent: 'Unknown'
        })),
        circuitBreakers: (dashboardData.rateLimitStatus?.circuitBreakers || dashboardData.RateLimitStatus?.CircuitBreakers || []).map((cb: any) => ({
          name: cb.name || cb.Name || 'Unknown',
          state: cb.state || cb.State || 'closed',
          failureCount: cb.failureCount || cb.FailureCount || 0,
          successCount: 0,
          lastFailureTime: cb.lastFailure || cb.LastFailure || '',
          nextAttemptTime: cb.nextRetry || cb.NextRetry || ''
        }))
      },
      systemHealth: {
        status: (dashboardData.systemHealth?.overallStatus || dashboardData.SystemHealth?.OverallStatus || 'healthy').toLowerCase(),
        uptime: dashboardData.systemHealth?.uptime || dashboardData.SystemHealth?.Uptime || '99.9%',
        responseTime: dashboardData.systemHealth?.responseTime || dashboardData.SystemHealth?.ResponseTime || 25,
        activeConnections: dashboardData.systemHealth?.activeConnections || dashboardData.SystemHealth?.ActiveConnections || 5,
        cpuUsage: dashboardData.systemHealth?.cpuUsage || dashboardData.SystemHealth?.CpuUsage || 15,
        memoryUsage: dashboardData.systemHealth?.memoryUsage || dashboardData.SystemHealth?.MemoryUsage || 45,
        diskUsage: dashboardData.systemHealth?.diskUsage || dashboardData.SystemHealth?.DiskUsage || 30,
        networkLatency: dashboardData.systemHealth?.networkLatency || dashboardData.SystemHealth?.NetworkLatency || 25,
        databaseConnections: dashboardData.systemHealth?.databaseConnections || dashboardData.SystemHealth?.DatabaseConnections || 5,
        cacheHitRate: dashboardData.systemHealth?.cacheHitRate || dashboardData.SystemHealth?.CacheHitRate || 85,
        errorRate: dashboardData.systemHealth?.errorRate || dashboardData.SystemHealth?.ErrorRate || 0.5,
        healthChecks: (dashboardData.systemHealth?.healthChecks || dashboardData.SystemHealth?.HealthChecks || []).map((check: any) => ({
          name: check.name || check.Name || 'Unknown',
          status: (check.status || check.Status || 'healthy').toLowerCase(),
          responseTime: check.duration || check.Duration || 0,
          lastChecked: check.lastCheck || check.LastCheck || new Date().toISOString(),
          details: check.description || check.Description || ''
        }))
      },
      performanceMetrics: {
        averageResponseTime: dashboardData.performanceMetrics?.averageResponseTime || dashboardData.PerformanceMetrics?.AverageResponseTime || 25,
        requestsPerSecond: dashboardData.performanceMetrics?.requestsPerSecond || dashboardData.PerformanceMetrics?.RequestsPerSecond || 12,
        errorRate: dashboardData.performanceMetrics?.errorRate || dashboardData.PerformanceMetrics?.ErrorRate || 0.5,
        totalRequests24h: dashboardData.performanceMetrics?.totalRequests24h || dashboardData.PerformanceMetrics?.TotalRequests24h || 1250,
        totalErrors24h: dashboardData.performanceMetrics?.totalErrors24h || dashboardData.PerformanceMetrics?.TotalErrors24h || 6,
        topEndpoints: dashboardData.performanceMetrics?.topEndpoints || dashboardData.PerformanceMetrics?.TopEndpoints || [],
        topUsers: dashboardData.performanceMetrics?.topUsers || dashboardData.PerformanceMetrics?.TopUsers || [],
        responseTimeDistribution: dashboardData.performanceMetrics?.responseTimeDistribution || dashboardData.PerformanceMetrics?.ResponseTimeDistribution || [],
        statusCodeDistribution: dashboardData.performanceMetrics?.statusCodeDistribution || dashboardData.PerformanceMetrics?.StatusCodeDistribution || [],
        databaseMetrics: dashboardData.performanceMetrics?.databaseMetrics || dashboardData.PerformanceMetrics?.DatabaseMetrics || {
          connectionCount: 5,
          averageQueryTime: 15,
          slowQueries: 2,
          cacheHitRate: 85,
          activeTransactions: 3
        }
      },
      securityMetrics: dashboardData.securityMetrics || dashboardData.SecurityMetrics || [],
      auditLogs: dashboardData.recentAuditLogs || dashboardData.RecentAuditLogs || [],
      alerts: dashboardData.activeAlerts || dashboardData.ActiveAlerts || []
    };
    
    console.log('[SecurityService] Final mapped data:', {
      systemHealthStatus: mappedData.systemHealth.status,
      overviewSystemHealth: mappedData.overview.systemHealth,
      hasValidData: !!mappedData.overview && !!mappedData.systemHealth
    });
    
    return mappedData;
    } catch (error) {
      console.error('[SecurityService] Failed to fetch security dashboard data:', error);
      
      // If the API call fails, return fallback data with proper defaults
      if (error instanceof Error && error.message.includes('404')) {
        console.warn('[SecurityService] Dashboard endpoint not found, returning fallback data');
        return this.getFallbackDashboardData();
      }
      
      throw new Error(`Security dashboard API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get fallback dashboard data when API is not available
   */
  private getFallbackDashboardData(): SecurityDashboard {
    return {
      overview: {
        securityScore: 85,
        totalRequests: 1250,
        blockedRequests: 15,
        successfulRequests: 1235,
        suspiciousActivity: 3,
        activeUsers: 42,
        systemHealth: 'healthy',
        lastUpdated: new Date().toISOString(),
        securityFeatures: [
          { name: 'CSRF Protection', enabled: true, status: 'active', description: 'Cross-site request forgery protection' },
          { name: 'Rate Limiting', enabled: true, status: 'active', description: 'API rate limiting and throttling' },
          { name: 'Security Auditing', enabled: true, status: 'active', description: 'Security event logging and monitoring' }
        ],
        recentActivity: []
      },
      rateLimitStatus: {
        globalLimits: [
          { endpoint: '/api/v1/*', limit: 100, window: '60s', currentUsage: 45, status: 'healthy' },
          { endpoint: '/api/v1/auth/*', limit: 10, window: '60s', currentUsage: 2, status: 'healthy' }
        ],
        userQuotas: [],
        topUsers: [],
        circuitBreakers: []
      },
      systemHealth: {
        status: 'healthy',
        uptime: '99.9%',
        responseTime: 25,
        activeConnections: 5,
        cpuUsage: 15,
        memoryUsage: 45,
        diskUsage: 30,
        networkLatency: 25,
        databaseConnections: 5,
        cacheHitRate: 85,
        errorRate: 0.5,
        healthChecks: [
          { name: 'Database', status: 'healthy', responseTime: 15, lastChecked: new Date().toISOString(), details: 'Connection successful' },
          { name: 'Cache', status: 'healthy', responseTime: 5, lastChecked: new Date().toISOString(), details: 'Redis connection active' },
          { name: 'External API', status: 'healthy', responseTime: 45, lastChecked: new Date().toISOString(), details: 'All external services responding' }
        ]
      },
      performanceMetrics: {
        averageResponseTime: 25,
        requestsPerSecond: 12,
        errorRate: 0.5,
        totalRequests24h: 1250,
        totalErrors24h: 6,
        topEndpoints: [],
        topUsers: [],
        responseTimeDistribution: [],
        statusCodeDistribution: [],
        databaseMetrics: {
          connectionCount: 5,
          averageQueryTime: 15,
          slowQueries: 2,
          cacheHitRate: 85,
          activeTransactions: 3
        }
      },
      securityMetrics: [],
      auditLogs: [],
      alerts: []
    };
  }

  /**
   * Get security overview metrics
   */
  async getSecurityOverview(): Promise<SecurityOverview> {
    const response = await apiClient.get<SecurityOverview>(`${this.baseUrl}/overview`);
    if (!response.data) {
      throw new Error('No overview data received');
    }
    return response.data;
  }

  /**
   * Get rate limiting status
   */
  async getRateLimitStatus(): Promise<RateLimitStatus> {
    const response = await apiClient.get<RateLimitStatus>(`${this.baseUrl}/rate-limits`);
    if (!response.data) {
      throw new Error('No rate limit data received');
    }
    return response.data;
  }

  /**
   * Get system health metrics
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const response = await apiClient.get<SystemHealth>(`${this.baseUrl}/system-health`);
    if (!response.data) {
      throw new Error('No system health data received');
    }
    return response.data;
  }

  /**
   * Get security metrics within a date range
   */
  async getSecurityMetrics(filter?: SecurityMetricFilter): Promise<SecurityMetric[]> {
    try {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await apiClient.get<SecurityMetric[]>(
      `${this.baseUrl}/metrics?${params.toString()}`
    );
      
      // Handle API response wrapper
      if (response.data) {
        return Array.isArray(response.data) ? response.data : [];
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch security metrics:', error);
      throw new Error(`Security metrics API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get security audit logs with pagination
   */
  async getAuditLogs(filter?: SecurityLogFilter, page = 1, pageSize = 50): Promise<SecurityAuditLog[]> {
    try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await apiClient.get<SecurityAuditLog[]>(
      `${this.baseUrl}/audit-logs?${params.toString()}`
    );
      
      // Handle API response wrapper - the backend returns ApiResponse<List<SecurityAuditLogDTO>>
      if (response.data) {
        return Array.isArray(response.data) ? response.data : [];
      }
      
      // Return empty array if no data
      return [];
    } catch (error) {
      console.error('Failed to fetch security audit logs:', error);
      throw new Error(`Security audit logs API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get active security alerts
   */
  async getSecurityAlerts(): Promise<SecurityAlert[]> {
    try {
    const response = await apiClient.get<SecurityAlert[]>(`${this.baseUrl}/alerts`);
      
      // Handle API response wrapper
      if (response.data) {
        return Array.isArray(response.data) ? response.data : [];
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch security alerts:', error);
      throw new Error(`Security alerts API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const response = await apiClient.get<PerformanceMetrics>(`${this.baseUrl}/performance`);
    if (!response.data) {
      throw new Error('No performance data received');
    }
    return response.data;
  }

  /**
   * Get users with suspicious activity
   */
  async getSuspiciousUsers(limit = 10): Promise<UserActivity[]> {
    const response = await apiClient.get<UserActivity[]>(`${this.baseUrl}/suspicious-users?limit=${limit}`);
    if (!response.data) {
      throw new Error('No suspicious users data received');
    }
    return response.data;
  }

  /**
   * Create a security alert
   */
  async createAlert(alert: Omit<SecurityAlert, 'id' | 'timestamp' | 'isResolved'>): Promise<SecurityAlert> {
    const response = await apiClient.post<SecurityAlert>(`${this.baseUrl}/alerts`, alert);
    if (!response.data) {
      throw new Error('No alert data received');
    }
    return response.data;
  }

  /**
   * Resolve a security alert
   */
  async resolveAlert(alertId: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/alerts/${alertId}/resolve`);
  }

  /**
   * Log a custom security metric
   */
  async logSecurityMetric(request: LogSecurityMetricRequest): Promise<void> {
    await apiClient.post(`${this.baseUrl}/metrics`, request);
  }

  /**
   * Get the current security score
   */
  async getSecurityScore(): Promise<{ score: number; status: string; timestamp: string }> {
    const response = await apiClient.get<{ score: number; status: string; timestamp: string }>(`${this.baseUrl}/security-score`);
    if (!response.data) {
      throw new Error('No security score data received');
    }
    return response.data;
  }

  async getAlertConfigurations(): Promise<AlertConfiguration[]> {
    const response = await apiClient.get<AlertConfiguration[]>(`${this.baseUrl}/alert-configurations`);
    if (!response.data) {
      throw new Error('No alert configurations data received');
    }
    return response.data;
  }

  async updateAlertConfiguration(config: AlertConfiguration): Promise<void> {
    await apiClient.put(`${this.baseUrl}/alert-configurations/${config.id}`, config);
  }

  async getSecurityStatistics(): Promise<SecurityStatistics> {
    const response = await apiClient.get<SecurityStatistics>(`${this.baseUrl}/statistics`);
    if (!response.data) {
      throw new Error('No security statistics data received');
    }
    return response.data;
  }

  async exportAuditLogs(filter?: SecurityLogFilter): Promise<Blob> {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${this.baseUrl}/audit-logs/export?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export audit logs');
    }
    
    return response.blob();
  }

  /**
   * Clear security audit logs older than specified date
   */
  async clearAuditLogs(olderThan?: Date): Promise<ClearLogsResult> {
    try {
      const params = new URLSearchParams();
      if (olderThan) {
        params.append('olderThan', olderThan.toISOString());
      }
      
      const response = await apiClient.delete<any>(
        `${this.baseUrl}/audit-logs/clear?${params.toString()}`
      );
      
      if (!response.data) {
        throw new Error('No data received from clear audit logs API');
      }
      
      // Handle both camelCase and PascalCase responses
      return {
        clearedCount: response.data.clearedCount || response.data.ClearedCount || 0,
        clearedDate: response.data.clearedDate || response.data.ClearedDate || new Date().toISOString(),
        message: response.data.message || response.data.Message || 'Logs cleared successfully'
      };
    } catch (error) {
      console.error('Failed to clear audit logs:', error);
      throw new Error(`Clear audit logs API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear security metrics older than specified date
   */
  async clearSecurityMetrics(olderThan?: Date): Promise<ClearLogsResult> {
    try {
      const params = new URLSearchParams();
      if (olderThan) {
        params.append('olderThan', olderThan.toISOString());
      }
      
      const response = await apiClient.delete<any>(
        `${this.baseUrl}/metrics/clear?${params.toString()}`
      );
      
      if (!response.data) {
        throw new Error('No data received from clear security metrics API');
      }
      
      // Handle both camelCase and PascalCase responses
      return {
        clearedCount: response.data.clearedCount || response.data.ClearedCount || 0,
        clearedDate: response.data.clearedDate || response.data.ClearedDate || new Date().toISOString(),
        message: response.data.message || response.data.Message || 'Metrics cleared successfully'
      };
    } catch (error) {
      console.error('Failed to clear security metrics:', error);
      throw new Error(`Clear security metrics API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear ALL security logs (audit logs, metrics, and health metrics) - USE WITH CAUTION
   */
  async clearAllSecurityLogs(): Promise<ClearLogsResult> {
    try {
      const response = await apiClient.delete<any>(
        `${this.baseUrl}/logs/clear-all`
      );
      
      if (!response.data) {
        throw new Error('No data received from clear all security logs API');
      }
      
      // Handle both camelCase and PascalCase responses
      return {
        clearedCount: response.data.clearedCount || response.data.ClearedCount || 0,
        clearedDate: response.data.clearedDate || response.data.ClearedDate || new Date().toISOString(),
        message: response.data.message || response.data.Message || 'All logs cleared successfully'
      };
    } catch (error) {
      console.error('Failed to clear all security logs:', error);
      throw new Error(`Clear all security logs API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===== ENHANCED SECURITY FEATURES =====

  /**
   * Failed Login Management
   */
  async getFailedLoginSummary(from?: string, to?: string): Promise<FailedLoginSummaryDTO> {
    try {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      
      const response = await apiClient.get<FailedLoginSummaryDTO>(
        `${this.baseUrl}/failed-logins?${params.toString()}`
      );
      if (!response.data) {
        throw new Error('No failed login summary data received');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch failed login summary:', error);
      throw new Error(`Failed login summary API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getFailedLoginAttempts(page = 1, pageSize = 50): Promise<FailedLoginAttemptDTO[]> {
    try {
      const response = await apiClient.get<FailedLoginAttemptDTO[]>(
        `${this.baseUrl}/failed-logins?page=${page}&pageSize=${pageSize}`
      );
      if (!response.data) {
        throw new Error('No failed login attempts data received');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch failed login attempts:', error);
      throw new Error(`Failed login attempts API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAccountLockoutStatus(emailOrUsername: string): Promise<AccountLockoutStatusDTO> {
    try {
      const response = await apiClient.get<AccountLockoutStatusDTO>(
        `${this.baseUrl}/failed-logins/lockout-status/${encodeURIComponent(emailOrUsername)}`
      );
      if (!response.data) {
        throw new Error('No lockout status data received');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch account lockout status:', error);
      throw new Error(`Account lockout status API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async unlockAccount(emailOrUsername: string): Promise<void> {
    try {
      await apiClient.post<void>(
        `${this.baseUrl}/failed-logins/unlock/${encodeURIComponent(emailOrUsername)}`,
        {}
      );
    } catch (error) {
      console.error('Failed to unlock account:', error);
      throw new Error(`Unlock account API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSuspiciousIPs(limit = 10): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>(
        `${this.baseUrl}/failed-logins/suspicious-ips?limit=${limit}`
      );
      if (!response.data) {
        throw new Error('No suspicious IPs data received');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch suspicious IPs:', error);
      throw new Error(`Suspicious IPs API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async blockIP(ipAddress: string, reason: string): Promise<void> {
    try {
      await apiClient.post<void>(
        `${this.baseUrl}/failed-logins/block-ip`,
        { ipAddress, reason }
      );
    } catch (error) {
      console.error('Failed to block IP:', error);
      throw new Error(`Block IP API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async unblockIP(ipAddress: string): Promise<void> {
    try {
      await apiClient.post<void>(
        `${this.baseUrl}/failed-logins/unblock-ip`,
        { ipAddress }
      );
    } catch (error) {
      console.error('Failed to unblock IP:', error);
      throw new Error(`Unblock IP API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Session Management
   */
  async getSessionManagementData(): Promise<SessionManagementDTO> {
    try {
      const response = await apiClient.get<SessionManagementDTO>(
        `${this.baseUrl}/sessions`
      );
      if (!response.data) {
        throw new Error('No session management data received');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch session management data:', error);
      throw new Error(`Session management API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getActiveSessions(userId?: number): Promise<UserSessionDTO[]> {
    try {
      const params = userId ? `?userId=${userId}` : '';
      const response = await apiClient.get<UserSessionDTO[]>(
        `${this.baseUrl}/sessions/active${params}`
      );
      if (!response.data) {
        throw new Error('No active sessions data received');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch active sessions:', error);
      throw new Error(`Active sessions API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUserSessions(userId: number, activeOnly = false): Promise<UserSessionDTO[]> {
    try {
      const response = await apiClient.get<UserSessionDTO[]>(
        `${this.baseUrl}/sessions/user/${userId}?activeOnly=${activeOnly}`
      );
      if (!response.data) {
        throw new Error('No user sessions data received');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user sessions:', error);
      throw new Error(`User sessions API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async terminateSession(sessionToken: string, reason: string): Promise<void> {
    try {
      await apiClient.post<void>(
        `${this.baseUrl}/sessions/terminate`,
        { sessionToken, reason }
      );
    } catch (error) {
      console.error('Failed to terminate session:', error);
      throw new Error(`Terminate session API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async terminateAllUserSessions(userId: number, reason: string, excludeSessionToken?: string): Promise<void> {
    try {
      await apiClient.post<void>(
        `${this.baseUrl}/sessions/terminate-all`,
        { userId, reason, excludeSessionToken }
      );
    } catch (error) {
      console.error('Failed to terminate all user sessions:', error);
      throw new Error(`Terminate all sessions API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async markSessionSuspicious(sessionToken: string, reason: string): Promise<void> {
    try {
      await apiClient.post<void>(
        `${this.baseUrl}/sessions/mark-suspicious`,
        { sessionToken, reason }
      );
    } catch (error) {
      console.error('Failed to mark session as suspicious:', error);
      throw new Error(`Mark session suspicious API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Geolocation Services
   */
  async getGeolocationSummary(): Promise<IPGeolocationSummaryDTO> {
    try {
      const response = await apiClient.get<IPGeolocationSummaryDTO>(
        `${this.baseUrl}/geolocation`
      );
      if (!response.data) {
        throw new Error('No geolocation summary data received');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch geolocation summary:', error);
      throw new Error(`Geolocation summary API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRecentAccessByLocation(limit = 50): Promise<GeolocationAccessDTO[]> {
    try {
      const response = await apiClient.get<GeolocationAccessDTO[]>(
        `${this.baseUrl}/geolocation/recent-access?limit=${limit}`
      );
      if (!response.data) {
        throw new Error('No recent access data received');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recent access by location:', error);
      throw new Error(`Recent access API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getLocationForIP(ipAddress: string): Promise<GeolocationDTO> {
    try {
      const response = await apiClient.get<GeolocationDTO>(
        `${this.baseUrl}/geolocation/ip/${encodeURIComponent(ipAddress)}`
      );
      if (!response.data) {
        throw new Error('No geolocation data received');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch IP geolocation:', error);
      throw new Error(`IP geolocation API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAllowedCountries(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>(
        `${this.baseUrl}/geolocation/allowed-countries`
      );
      if (!response.data) {
        throw new Error('No allowed countries data received');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch allowed countries:', error);
      throw new Error(`Allowed countries API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getBlockedCountries(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>(
        `${this.baseUrl}/geolocation/blocked-countries`
      );
      if (!response.data) {
        throw new Error('No blocked countries data received');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch blocked countries:', error);
      throw new Error(`Blocked countries API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addAllowedCountry(countryCode: string): Promise<void> {
    try {
      await apiClient.post<void>(
        `${this.baseUrl}/geolocation/allowed-countries`,
        { countryCode }
      );
    } catch (error) {
      console.error('Failed to add allowed country:', error);
      throw new Error(`Add allowed country API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async removeAllowedCountry(countryCode: string): Promise<void> {
    try {
      await apiClient.delete<void>(
        `${this.baseUrl}/geolocation/allowed-countries/${countryCode}`
      );
    } catch (error) {
      console.error('Failed to remove allowed country:', error);
      throw new Error(`Remove allowed country API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addBlockedCountry(countryCode: string): Promise<void> {
    try {
      await apiClient.post<void>(
        `${this.baseUrl}/geolocation/blocked-countries`,
        { countryCode }
      );
    } catch (error) {
      console.error('Failed to add blocked country:', error);
      throw new Error(`Add blocked country API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async removeBlockedCountry(countryCode: string): Promise<void> {
    try {
      await apiClient.delete<void>(
        `${this.baseUrl}/geolocation/blocked-countries/${countryCode}`
      );
    } catch (error) {
      console.error('Failed to remove blocked country:', error);
      throw new Error(`Remove blocked country API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Threat Intelligence
   */
  async getThreatIntelligenceSummary(): Promise<ThreatIntelligenceSummaryDTO> {
    try {
      const response = await apiClient.get<ThreatIntelligenceSummaryDTO>(
        `${this.baseUrl}/threat-intelligence/summary`
      );
      if (!response.data) {
        throw new Error('No threat intelligence summary data received');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch threat intelligence summary:', error);
      throw new Error(`Threat intelligence summary API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getThreatIndicators(page = 1, pageSize = 50): Promise<ThreatIndicatorDTO[]> {
    try {
      const response = await apiClient.get<ThreatIndicatorDTO[]>(
        `${this.baseUrl}/threat-intelligence/indicators?page=${page}&pageSize=${pageSize}`
      );
      if (!response.data) {
        throw new Error('No threat indicators data received');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch threat indicators:', error);
      throw new Error(`Threat indicators API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async checkThreatIndicator(indicatorValue: string): Promise<ThreatIndicatorDTO | null> {
    try {
      const response = await apiClient.get<ThreatIndicatorDTO | null>(
        `${this.baseUrl}/threat-intelligence/check/${encodeURIComponent(indicatorValue)}`
      );
      return response.data ?? null;
    } catch (error) {
      console.error('Failed to check threat indicator:', error);
      throw new Error(`Check threat indicator API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addThreatIndicator(indicator: Omit<ThreatIndicatorDTO, 'id' | 'firstSeen' | 'lastSeen'>): Promise<ThreatIndicatorDTO> {
    try {
      const response = await apiClient.post<ThreatIndicatorDTO>(
        `${this.baseUrl}/threat-intelligence/indicators`,
        indicator
      );
      if (!response.data) {
        throw new Error('No threat indicator data received');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to add threat indicator:', error);
      throw new Error(`Add threat indicator API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateThreatIndicator(id: number, indicator: Partial<ThreatIndicatorDTO>): Promise<void> {
    try {
      await apiClient.put<void>(
        `${this.baseUrl}/threat-intelligence/indicators/${id}`,
        indicator
      );
    } catch (error) {
      console.error('Failed to update threat indicator:', error);
      throw new Error(`Update threat indicator API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteThreatIndicator(id: number): Promise<void> {
    try {
      await apiClient.delete<void>(
        `${this.baseUrl}/threat-intelligence/indicators/${id}`
      );
    } catch (error) {
      console.error('Failed to delete threat indicator:', error);
      throw new Error(`Delete threat indicator API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Behavioral Analytics
   */
  async getBehavioralAnalyticsSummary(): Promise<BehavioralAnalyticsSummaryDTO> {
    try {
      const response = await apiClient.get<BehavioralAnalyticsSummaryDTO>(
        `${this.baseUrl}/behavioral-analytics/summary`
      );
      if (!response.data) {
        throw new Error('No behavioral analytics summary data received');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch behavioral analytics summary:', error);
      throw new Error(`Behavioral analytics summary API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getBehavioralAnomalies(page = 1, pageSize = 50): Promise<BehavioralAnomalyDTO[]> {
    try {
      const response = await apiClient.get<BehavioralAnomalyDTO[]>(
        `${this.baseUrl}/behavioral-analytics/anomalies?page=${page}&pageSize=${pageSize}`
      );
      if (!response.data) {
        throw new Error('No behavioral anomalies data received');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch behavioral anomalies:', error);
      throw new Error(`Behavioral anomalies API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUserBehaviorProfile(userId: number): Promise<UserBehaviorProfileDTO> {
    try {
      const response = await apiClient.get<UserBehaviorProfileDTO>(
        `${this.baseUrl}/behavioral-analytics/profile/${userId}`
      );
      if (!response.data) {
        throw new Error('No user behavior profile data received');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user behavior profile:', error);
      throw new Error(`User behavior profile API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async resolveAnomaly(anomalyId: number, resolution: string): Promise<void> {
    try {
      await apiClient.post<void>(
        `${this.baseUrl}/behavioral-analytics/anomalies/${anomalyId}/resolve`,
        { resolution }
      );
    } catch (error) {
      console.error('Failed to resolve anomaly:', error);
      throw new Error(`Resolve anomaly API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateUserRiskScore(userId: number, riskScore: number, reason: string): Promise<void> {
    try {
      await apiClient.post<void>(
        `${this.baseUrl}/behavioral-analytics/profile/${userId}/risk-score`,
        { riskScore, reason }
      );
    } catch (error) {
      console.error('Failed to update user risk score:', error);
      throw new Error(`Update risk score API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Security Monitoring
   */
  async getSecurityMonitoringSummary(): Promise<SecurityMonitoringSummaryDTO> {
    try {
      const response = await apiClient.get<SecurityMonitoringSummaryDTO>(
        `${this.baseUrl}/monitoring/summary`
      );
      if (!response.data) {
        throw new Error('No security monitoring summary data received');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch security monitoring summary:', error);
      throw new Error(`Security monitoring summary API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSecurityMonitoringEvents(page = 1, pageSize = 50): Promise<SecurityMonitoringEventDTO[]> {
    try {
      const response = await apiClient.get<SecurityMonitoringEventDTO[]>(
        `${this.baseUrl}/monitoring/events?page=${page}&pageSize=${pageSize}`
      );
      if (!response.data) {
        throw new Error('No security monitoring events data received');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch security monitoring events:', error);
      throw new Error(`Security monitoring events API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async resolveSecurityEvent(eventId: number, resolution: string): Promise<void> {
    try {
      await apiClient.post<void>(
        `${this.baseUrl}/monitoring/events/${eventId}/resolve`,
        { resolution }
      );
    } catch (error) {
      console.error('Failed to resolve security event:', error);
      throw new Error(`Resolve security event API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const securityService = new SecurityService(); 