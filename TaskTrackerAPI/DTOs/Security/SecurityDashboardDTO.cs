/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */
using System;
using System.Collections.Generic;

namespace TaskTrackerAPI.DTOs.Security;

public class SecurityDashboardDTO
{
    public SecurityOverviewDTO Overview { get; set; } = new();
    public RateLimitStatusDTO RateLimitStatus { get; set; } = new();
    public SystemHealthDTO SystemHealth { get; set; } = new();
    public List<SecurityMetricDTO> SecurityMetrics { get; set; } = new();
    public List<SecurityAuditLogDTO> RecentAuditLogs { get; set; } = new();
    public List<SecurityAlertDTO> ActiveAlerts { get; set; } = new();
    public PerformanceMetricsDTO PerformanceMetrics { get; set; } = new();
    
    // Enhanced security features
    public FailedLoginSummaryDTO FailedLoginSummary { get; set; } = new();
    public SessionManagementDTO SessionManagement { get; set; } = new();
    public IPGeolocationSummaryDTO GeolocationSummary { get; set; } = new();
    
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}

public class SecurityOverviewDTO
{
    public int TotalRequests24h { get; set; }
    public int BlockedRequests24h { get; set; }
    public int SuspiciousActivities24h { get; set; }
    public int ActiveUsers24h { get; set; }
    public double SecurityScore { get; set; }
    public string SecurityStatus { get; set; } = "Good";
    public List<SecurityFeatureDTO> SecurityFeatures { get; set; } = new();
    public List<SecurityAuditLogDTO> RecentActivity { get; set; } = new();
    public bool CsrfProtectionEnabled { get; set; }
    public bool RateLimitingEnabled { get; set; }
    public bool SecurityAuditingEnabled { get; set; }
}

public class SecurityFeatureDTO
{
    public string Name { get; set; } = string.Empty;
    public bool Enabled { get; set; }
    public string Status { get; set; } = "active";
    public string Description { get; set; } = string.Empty;
}

public class RateLimitStatusDTO
{
    public bool IsEnabled { get; set; }
    public List<RateLimitConfigDTO> Configurations { get; set; } = new();
    public List<UserQuotaStatusDTO> TopUsers { get; set; } = new();
    public int TotalRequestsBlocked24h { get; set; }
    public double AverageRequestsPerMinute { get; set; }
    public List<CircuitBreakerStatusDTO> CircuitBreakers { get; set; } = new();
}

public class RateLimitConfigDTO
{
    public string Name { get; set; } = string.Empty;
    public int Limit { get; set; }
    public int TimeWindowSeconds { get; set; }
    public string Scope { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class UserQuotaStatusDTO
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string SubscriptionTier { get; set; } = string.Empty;
    public int ApiCallsUsedToday { get; set; }
    public int MaxDailyApiCalls { get; set; }
    public double UsagePercentage { get; set; }
    public DateTime LastActivity { get; set; }
    public bool IsNearLimit { get; set; }
    public bool IsExempt { get; set; }
}

public class CircuitBreakerStatusDTO
{
    public string Name { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public bool IsOpen { get; set; }
    public int FailureCount { get; set; }
    public DateTime? LastFailure { get; set; }
    public DateTime? NextRetry { get; set; }
}

public class SystemHealthDTO
{
    public string OverallStatus { get; set; } = "Healthy";
    public double CpuUsage { get; set; }
    public double MemoryUsage { get; set; }
    public double DiskUsage { get; set; }
    public int ActiveConnections { get; set; }
    public double ResponseTime { get; set; }
    public double Uptime { get; set; }
    public List<HealthCheckDTO> HealthChecks { get; set; } = new();
    public List<SystemMetricDTO> Metrics { get; set; } = new();
}

public class HealthCheckDTO
{
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TimeSpan Duration { get; set; }
    public DateTime LastCheck { get; set; }
}

public class SystemMetricDTO
{
    public string Name { get; set; } = string.Empty;
    public double Value { get; set; }
    public string? Unit { get; set; }
    public string? Category { get; set; }
    public bool IsHealthy { get; set; }
    public DateTime Timestamp { get; set; }
}

public class SecurityMetricDTO
{
    public int Id { get; set; }
    public DateTime Timestamp { get; set; }
    public string MetricType { get; set; } = string.Empty;
    public string MetricName { get; set; } = string.Empty;
    public double Value { get; set; }
    public string? Description { get; set; }
    public string? Source { get; set; }
    public string? Severity { get; set; }
}

public class SecurityAuditLogDTO
{
    public int Id { get; set; }
    public DateTime Timestamp { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public int? UserId { get; set; }
    public string? Username { get; set; }
    public string? Resource { get; set; }
    public string? Severity { get; set; }
    public string? Details { get; set; }
    public string? Status { get; set; }
    public bool IsSuccessful { get; set; }
    public bool IsSuspicious { get; set; }
}

public class SecurityAlertDTO
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public bool IsActive { get; set; }
    public string? Source { get; set; }
    public string? RecommendedAction { get; set; }
}

public class PerformanceMetricsDTO
{
    public double AverageResponseTime { get; set; }
    public double RequestsPerSecond { get; set; }
    public double ErrorRate { get; set; }
    public int TotalRequests24h { get; set; }
    public int TotalErrors24h { get; set; }
    public List<EndpointPerformanceDTO> TopEndpoints { get; set; } = new();
    public List<UserActivityDTO> TopUsers { get; set; } = new();
    public List<ResponseTimeMetricDTO> ResponseTimeDistribution { get; set; } = new();
    public List<StatusCodeDistributionDTO> StatusCodeDistribution { get; set; } = new();
    public DatabaseMetricsDTO DatabaseMetrics { get; set; } = new();
}

public class EndpointPerformanceDTO
{
    public string Endpoint { get; set; } = string.Empty;
    public int RequestCount { get; set; }
    public double AverageResponseTime { get; set; }
    public double ErrorRate { get; set; }
    public DateTime LastAccessed { get; set; }
}

public class UserActivityDTO
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public int RequestCount { get; set; }
    public DateTime LastActivity { get; set; }
    public string? IpAddress { get; set; }
    public bool IsSuspicious { get; set; }
}

public class ResponseTimeMetricDTO
{
    public DateTime Timestamp { get; set; }
    public double AverageTime { get; set; }
    public int RequestCount { get; set; }
}

public class StatusCodeDistributionDTO
{
    public int StatusCode { get; set; }
    public int Count { get; set; }
    public double Percentage { get; set; }
}

public class DatabaseMetricsDTO
{
    public int ConnectionCount { get; set; }
    public double AverageQueryTime { get; set; }
    public int SlowQueries { get; set; }
    public double CacheHitRate { get; set; }
    public int ActiveTransactions { get; set; }
} 