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
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.DTOs.Security;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Utils;
using AutoMapper;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Services;

public class SecurityMonitoringService : ISecurityMonitoringService
{
    private readonly ISecurityMonitoringRepository _securityMonitoringRepository;
    private readonly IGeolocationRepository _geolocationRepository;
    private readonly IUserSubscriptionRepository _userSubscriptionRepository;
    private readonly ILogger<SecurityMonitoringService> _logger;
    private readonly IMapper _mapper;
    private readonly IUserSubscriptionService _userSubscriptionService;
    private readonly IFailedLoginService _failedLoginService;
    private readonly ISessionManagementService _sessionManagementService;
    private readonly IGeolocationService _geolocationService;

    public SecurityMonitoringService(
        ISecurityMonitoringRepository securityMonitoringRepository,
        IGeolocationRepository geolocationRepository,
        IUserSubscriptionRepository userSubscriptionRepository,
        ILogger<SecurityMonitoringService> logger,
        IMapper mapper,
        IUserSubscriptionService userSubscriptionService,
        IFailedLoginService failedLoginService,
        ISessionManagementService sessionManagementService,
        IGeolocationService geolocationService)
    {
        _securityMonitoringRepository = securityMonitoringRepository ?? throw new ArgumentNullException(nameof(securityMonitoringRepository));
        _geolocationRepository = geolocationRepository ?? throw new ArgumentNullException(nameof(geolocationRepository));
        _userSubscriptionRepository = userSubscriptionRepository ?? throw new ArgumentNullException(nameof(userSubscriptionRepository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _userSubscriptionService = userSubscriptionService ?? throw new ArgumentNullException(nameof(userSubscriptionService));
        _failedLoginService = failedLoginService ?? throw new ArgumentNullException(nameof(failedLoginService));
        _sessionManagementService = sessionManagementService ?? throw new ArgumentNullException(nameof(sessionManagementService));
        _geolocationService = geolocationService ?? throw new ArgumentNullException(nameof(geolocationService));
    }

    public async Task<SecurityDashboardDTO> GetSecurityDashboardAsync()
    {
        try
        {
            // Get security metrics for the last 7 days to ensure we have trend data
            List<SecurityMetricDTO> securityMetrics = await GetSecurityMetricsAsync(DateTime.UtcNow.AddDays(-7), DateTime.UtcNow);
            
            SecurityDashboardDTO dashboard = new SecurityDashboardDTO
            {
                Overview = await GetSecurityOverviewAsync(),
                RateLimitStatus = await GetRateLimitStatusAsync(),
                SystemHealth = await GetSystemHealthAsync(),
                SecurityMetrics = securityMetrics,
                RecentAuditLogs = await GetSecurityAuditLogsAsync(1, 20),
                ActiveAlerts = await GetActiveSecurityAlertsAsync(),
                PerformanceMetrics = await GetPerformanceMetricsAsync(),
                
                // Enhanced security features
                FailedLoginSummary = await GetFailedLoginSummaryAsync(),
                SessionManagement = await GetSessionManagementDataAsync(),
                GeolocationSummary = await GetGeolocationSummaryAsync(),
                
                LastUpdated = DateTime.UtcNow
            };
            
            _logger.LogInformation($"[SecurityDashboard] Dashboard prepared with {securityMetrics.Count} security metrics");

            return dashboard;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting security dashboard");
            throw;
        }
    }

    public async Task<SecurityOverviewDTO> GetSecurityOverviewAsync()
    {
        try
        {
            DateTime yesterday = DateTime.UtcNow.AddDays(-1);
            
            // Get real metrics from audit logs only
            List<SecurityAuditLog> auditLogs = await _securityMonitoringRepository.GetSecurityAuditLogsAsync(yesterday, yesterday);

            int totalRequests = auditLogs.Count;
            int blockedRequests = auditLogs.Count(log => !log.IsSuccessful);
            int suspiciousActivities = auditLogs.Count(log => log.IsSuspicious);
            
            // Get active users (using UpdatedAt as proxy for last activity)
            int activeUsers = await _securityMonitoringRepository.GetActiveUsersAsync(yesterday);

            // Calculate security score based on real data
            double securityScore = await CalculateSecurityScoreAsync();
            _logger.LogInformation($"[SecurityOverview] Real calculated score: {securityScore}");

            // Get recent activity from real data
            List<SecurityAuditLogDTO> recentActivity = await GetSecurityAuditLogsAsync(1, 10);

            SecurityOverviewDTO overview = new SecurityOverviewDTO
            {
                TotalRequests24h = totalRequests,
                BlockedRequests24h = blockedRequests,
                SuspiciousActivities24h = suspiciousActivities,
                ActiveUsers24h = activeUsers,
                SecurityScore = securityScore,
                SecurityStatus = GetSecurityStatus(securityScore),
                SecurityFeatures = GetEnabledSecurityFeatures(),
                RecentActivity = recentActivity,
                CsrfProtectionEnabled = true,
                RateLimitingEnabled = true,
                SecurityAuditingEnabled = true
            };

            _logger.LogInformation($"[SecurityOverview] Real overview data: TotalRequests={totalRequests}, BlockedRequests={blockedRequests}, SuspiciousActivities={suspiciousActivities}, ActiveUsers={activeUsers}, SecurityScore={overview.SecurityScore}");
            return overview;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting security overview");
            throw;
        }
    }

    public async Task<RateLimitStatusDTO> GetRateLimitStatusAsync()
    {
        try
        {
            List<RateLimitTierConfig> configs = await _securityMonitoringRepository.GetRateLimitTierConfigsAsync();

            List<UserApiQuota> quotas = await _userSubscriptionRepository.GetUserApiQuotasAsync(10);

            DateTime yesterday = DateTime.UtcNow.AddDays(-1);
            int blockedRequests = await _securityMonitoringRepository.GetBlockedRequestsAsync(yesterday, "rate limit");

            // Get user activity from audit logs if no quota data exists
            List<UserQuotaStatusDTO> topUsersFromQuotas = quotas.Select(q => new UserQuotaStatusDTO
            {
                UserId = q.UserId,
                Username = q.User?.Username ?? "Unknown",
                SubscriptionTier = q.SubscriptionTier?.Name ?? "Unknown",
                ApiCallsUsedToday = q.ApiCallsUsedToday,
                MaxDailyApiCalls = q.MaxDailyApiCalls,
                UsagePercentage = q.MaxDailyApiCalls > 0 ? Math.Round((double)q.ApiCallsUsedToday / q.MaxDailyApiCalls * 100, 2) : 0,
                LastActivity = q.LastUpdatedTime,
                IsNearLimit = q.MaxDailyApiCalls > 0 && (double)q.ApiCallsUsedToday / q.MaxDailyApiCalls > 0.8,
                IsExempt = q.IsExemptFromQuota
            }).ToList();

            // If no quota data, generate from audit logs
            if (!topUsersFromQuotas.Any())
            {
                List<UserQuotaStatusDTO> userActivity = await _securityMonitoringRepository.GetUserActivityAsync(yesterday, "rate limit");

                topUsersFromQuotas = userActivity;
            }

            RateLimitStatusDTO rateLimitStatus = new RateLimitStatusDTO
            {
                IsEnabled = true,
                Configurations = configs.Select(c => new RateLimitConfigDTO
                {
                    Name = c.SubscriptionTier?.Name ?? "Unknown",
                    Limit = c.RateLimit,
                    TimeWindowSeconds = c.TimeWindowSeconds,
                    Scope = c.EndpointPattern ?? "Global",
                    IsActive = true
                }).ToList(),
                TopUsers = topUsersFromQuotas,
                TotalRequestsBlocked24h = blockedRequests,
                AverageRequestsPerMinute = await CalculateAverageRequestsPerMinute(),
                CircuitBreakers = await GetEnhancedCircuitBreakerStatus()
            };

            return rateLimitStatus;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting rate limit status");
            throw;
        }
    }

    public async Task<SystemHealthDTO> GetSystemHealthAsync()
    {
        try
        {
            List<SystemHealthMetrics> healthMetrics = await _securityMonitoringRepository.GetSystemHealthMetricsAsync(DateTime.UtcNow.AddHours(-1));

            SystemHealthDTO systemHealth = new SystemHealthDTO
            {
                OverallStatus = "Healthy",
                CpuUsage = GetLatestMetricValue(healthMetrics, "CPU_Usage") ?? 0,
                MemoryUsage = GetLatestMetricValue(healthMetrics, "Memory_Usage") ?? 0,
                DiskUsage = GetLatestMetricValue(healthMetrics, "Disk_Usage") ?? 0,
                ActiveConnections = (int)(GetLatestMetricValue(healthMetrics, "Active_Connections") ?? 0),
                ResponseTime = GetLatestMetricValue(healthMetrics, "Response_Time") ?? 0,
                Uptime = GetLatestMetricValue(healthMetrics, "Uptime") ?? 0,
                HealthChecks = GetHealthChecks(),
                Metrics = healthMetrics.Select(m => new SystemMetricDTO
                {
                    Name = m.MetricName,
                    Value = m.Value,
                    Unit = m.Unit,
                    Category = m.Category,
                    IsHealthy = m.IsHealthy,
                    Timestamp = m.Timestamp
                }).ToList()
            };

            // Determine overall status
            if (systemHealth.CpuUsage > 90 || systemHealth.MemoryUsage > 90 || systemHealth.DiskUsage > 90)
            {
                systemHealth.OverallStatus = "Critical";
            }
            else if (systemHealth.CpuUsage > 70 || systemHealth.MemoryUsage > 70 || systemHealth.DiskUsage > 70)
            {
                systemHealth.OverallStatus = "Warning";
            }

            return systemHealth;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting system health");
            throw;
        }
    }

    public async Task<List<SecurityMetricDTO>> GetSecurityMetricsAsync(DateTime? from = null, DateTime? to = null)
    {
        _logger.LogInformation($"[SecurityMetrics] GetSecurityMetricsAsync called with from={from}, to={to}");
        try
        {
            from ??= DateTime.UtcNow.AddDays(-7);
            to ??= DateTime.UtcNow;

            _logger.LogInformation($"[SecurityMetrics] Querying real metrics from {from} to {to}");

            // Get only real metrics from database - no sample data generation
            List<SecurityMetrics> metrics = await _securityMonitoringRepository.GetSecurityMetricsAsync(from, to);

            _logger.LogInformation($"[SecurityMetrics] Found {metrics.Count} real metrics in database");

            List<SecurityMetricDTO> result = _mapper.Map<List<SecurityMetricDTO>>(metrics);
            _logger.LogInformation($"[SecurityMetrics] Returning {result.Count} real security metrics to client");
            
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[SecurityMetrics] Error in GetSecurityMetricsAsync");
            throw;
        }
    }

    public async Task<List<SecurityAuditLogDTO>> GetSecurityAuditLogsAsync(int page = 1, int pageSize = 50, string? severity = null)
    {
        try
        {
            IQueryable<SecurityAuditLog> query = await _securityMonitoringRepository.GetSecurityAuditLogsAsync();

            if (!string.IsNullOrEmpty(severity))
            {
                query = query.Where(log => log.Severity == severity);
            }

            List<SecurityAuditLog> logs = await query
                .OrderByDescending(log => log.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return _mapper.Map<List<SecurityAuditLogDTO>>(logs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting security audit logs");
            throw;
        }
    }

    public async Task<List<SecurityAlertDTO>> GetActiveSecurityAlertsAsync()
    {
        try
        {
            // For now, generate alerts based on recent suspicious activity
            List<SecurityAlertDTO> alerts = new List<SecurityAlertDTO>();
            
            List<IGrouping<string, SecurityAuditLog>> recentSuspiciousGroups = await _securityMonitoringRepository.GetRecentSuspiciousGroupsAsync(DateTime.UtcNow.AddHours(-24));

            foreach (var group in recentSuspiciousGroups)
            {
                if (group.Count() > 5) // More than 5 suspicious events of same type
                {
                    alerts.Add(new SecurityAlertDTO
                    {
                        Id = alerts.Count + 1,
                        Type = "Suspicious Activity",
                        Title = $"Multiple {group.Key} Events Detected",
                        Description = $"Detected {group.Count()} suspicious {group.Key} events in the last 24 hours",
                        Severity = group.Count() > 20 ? "Critical" : group.Count() > 10 ? "High" : "Medium",
                        Timestamp = group.Max(g => g.Timestamp),
                        IsActive = true,
                        Source = "Security Monitoring",
                        RecommendedAction = "Review logs and consider blocking suspicious IPs"
                    });
                }
            }

            return alerts;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active security alerts");
            throw;
        }
    }

    public async Task<PerformanceMetricsDTO> GetPerformanceMetricsAsync()
    {
        try
        {
            DateTime yesterday = DateTime.UtcNow.AddDays(-1);
            
            // Get all audit logs for total counts
            List<SecurityAuditLog> allAuditLogs = await _securityMonitoringRepository.GetAllSecurityAuditLogsAsync(yesterday);

            // Get filtered logs for performance calculations (excluding WebSocket connections)
            List<SecurityAuditLog> apiAuditLogs = await _securityMonitoringRepository.GetApiAuditLogsAsync(yesterday);

            int totalRequests = allAuditLogs.Count;
            int totalErrors = allAuditLogs.Count(log => !log.IsSuccessful);
            int apiRequests = apiAuditLogs.Count;
            double errorRate = totalRequests > 0 ? Math.Round((double)totalErrors / totalRequests * 100, 2) : 0;

            PerformanceMetricsDTO performance = new PerformanceMetricsDTO
            {
                AverageResponseTime = await CalculateAverageResponseTimeAsync(),
                RequestsPerSecond = Math.Round(apiRequests / (24.0 * 60 * 60), 4), // API requests per second over 24 hours
                ErrorRate = errorRate,
                TotalRequests24h = totalRequests,
                TotalErrors24h = totalErrors,
                TopEndpoints = await GetTopEndpointsAsync(),
                TopUsers = await GetTopUsersAsync(),
                ResponseTimeDistribution = await GetResponseTimeDistributionAsync(),
                StatusCodeDistribution = await GetStatusCodeDistributionAsync(),
                DatabaseMetrics = await GetDatabaseMetricsAsync()
            };

            return performance;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting performance metrics");
            throw;
        }
    }

    // Logging methods implementation
    public async Task LogSecurityMetricAsync(string metricType, string metricName, double value, string? description = null, string? source = null, string? severity = null)
    {
        try
        {
            SecurityMetrics metric = new SecurityMetrics
            {
                Timestamp = DateTime.UtcNow,
                MetricType = metricType,
                MetricName = metricName,
                Value = value,
                Description = description,
                Source = source,
                Severity = severity
            };

            await _securityMonitoringRepository.AddSecurityMetricAsync(metric);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging security metric");
        }
    }

    public async Task LogSecurityAuditAsync(string eventType, string action, string? ipAddress = null, string? userAgent = null, int? userId = null, string? username = null, string? resource = null, string? severity = null, string? details = null, string? status = null, bool isSuccessful = true, bool isSuspicious = false)
    {
        try
        {
            SecurityAuditLog auditLog = new SecurityAuditLog
            {
                Timestamp = DateTime.UtcNow,
                EventType = eventType,
                Action = action,
                IpAddress = ipAddress,
                UserAgent = userAgent,
                UserId = userId,
                Username = username,
                Resource = resource,
                Severity = severity,
                Details = details,
                Status = status,
                IsSuccessful = isSuccessful,
                IsSuspicious = isSuspicious
            };

            await _securityMonitoringRepository.AddSecurityAuditLogAsync(auditLog);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging security audit");
        }
    }

    public async Task LogSystemHealthMetricAsync(string metricName, double value, string? unit = null, string? category = null, string? description = null, bool isHealthy = true, double? thresholdWarning = null, double? thresholdCritical = null)
    {
        try
        {
            SystemHealthMetrics healthMetric = new SystemHealthMetrics
            {
                Timestamp = DateTime.UtcNow,
                MetricName = metricName,
                Value = value,
                Unit = unit,
                Category = category,
                Description = description,
                IsHealthy = isHealthy,
                ThresholdWarning = thresholdWarning,
                ThresholdCritical = thresholdCritical
            };

            await _securityMonitoringRepository.AddSystemHealthMetricAsync(healthMetric);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging system health metric");
        }
    }

    public async Task CreateSecurityAlertAsync(string type, string title, string description, string severity, string? source = null, string? recommendedAction = null)
    {
        try
        {
            // For now, just log as a security metric
            await LogSecurityMetricAsync("Alert", type, 1, $"{title}: {description}", source, severity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating security alert");
        }
    }

    public async Task ResolveSecurityAlertAsync(int alertId, string resolvedBy)
    {
        try
        {
            // Implementation would mark alert as resolved
            await LogSecurityMetricAsync("Alert", "Resolved", alertId, $"Alert {alertId} resolved by {resolvedBy}", "Security Dashboard", "Info");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resolving security alert");
        }
    }

    // Cleanup methods implementation
    public async Task<int> ClearSecurityAuditLogsAsync(DateTime? olderThan = null)
    {
        try
        {
            olderThan ??= DateTime.UtcNow.AddDays(-30); // Default: clear logs older than 30 days
            
            List<SecurityAuditLog> logsToDelete = await _securityMonitoringRepository.GetSecurityAuditLogsAsync(olderThan);
            
            int count = logsToDelete.Count;
            _securityMonitoringRepository.RemoveSecurityAuditLogs(logsToDelete);
            await _securityMonitoringRepository.SaveChangesAsync();
            
            _logger.LogInformation($"Cleared {count} security audit logs older than {olderThan}");
            
            // Log the cleanup action
            await LogSecurityAuditAsync(
                eventType: "ADMIN_ACTION",
                action: "CLEAR_AUDIT_LOGS",
                severity: "INFO",
                details: $"Cleared {count} audit logs older than {olderThan}",
                isSuccessful: true,
                isSuspicious: false
            );
            
            return count;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing security audit logs");
            throw;
        }
    }

    public async Task<int> ClearSecurityMetricsAsync(DateTime? olderThan = null)
    {
        try
        {
            olderThan ??= DateTime.UtcNow.AddDays(-30); // Default: clear metrics older than 30 days
            
            List<SecurityMetrics> metricsToDelete = await _securityMonitoringRepository.GetSecurityMetricsAsync(olderThan);
            
            int count = metricsToDelete.Count;
            _securityMonitoringRepository.RemoveSecurityMetrics(metricsToDelete);
            await _securityMonitoringRepository.SaveChangesAsync();
            
            _logger.LogInformation($"Cleared {count} security metrics older than {olderThan}");
            
            // Log the cleanup action
            await LogSecurityAuditAsync(
                eventType: "ADMIN_ACTION",
                action: "CLEAR_SECURITY_METRICS",
                severity: "INFO",
                details: $"Cleared {count} security metrics older than {olderThan}",
                isSuccessful: true,
                isSuspicious: false
            );
            
            return count;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing security metrics");
            throw;
        }
    }

    public async Task<int> ClearAllSecurityLogsAsync()
    {
        try
        {
            // Get counts before deletion
            int auditLogCount = await _securityMonitoringRepository.GetSecurityAuditLogsCountAsync();
            int metricsCount = await _securityMonitoringRepository.GetSecurityMetricsCountAsync();
            int healthMetricsCount = await _securityMonitoringRepository.GetSystemHealthMetricsCountAsync();
            
            // Clear all security-related logs
            _securityMonitoringRepository.RemoveAllSecurityLogs();
            
            await _securityMonitoringRepository.SaveChangesAsync();
            
            int totalCleared = auditLogCount + metricsCount + healthMetricsCount;
            
            _logger.LogWarning($"Cleared ALL security logs: {auditLogCount} audit logs, {metricsCount} metrics, {healthMetricsCount} health metrics");
            
            // Log the cleanup action (this will be the only log after clearing)
            await LogSecurityAuditAsync(
                eventType: "ADMIN_ACTION",
                action: "CLEAR_ALL_SECURITY_LOGS",
                severity: "HIGH",
                details: $"Cleared ALL security logs: {auditLogCount} audit logs, {metricsCount} metrics, {healthMetricsCount} health metrics",
                isSuccessful: true,
                isSuspicious: false
            );
            
            return totalCleared;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing all security logs");
            throw;
        }
    }

    public async Task<double> CalculateSecurityScoreAsync()
    {
        try
        {
            DateTime yesterday = DateTime.UtcNow.AddDays(-1);
            
            List<SecurityAuditLog> auditLogs = await _securityMonitoringRepository.GetSecurityAuditLogsAsync(yesterday, yesterday);

            _logger.LogInformation($"[SecurityScore] Found {auditLogs.Count} audit logs in last 24h");

            if (!auditLogs.Any())
            {
                _logger.LogInformation("[SecurityScore] No audit logs found, returning perfect score: 100.0");
                return 100.0; // Perfect score if no activity
            }

            int totalRequests = auditLogs.Count;
            int successfulRequests = auditLogs.Count(log => log.IsSuccessful);
            int suspiciousRequests = auditLogs.Count(log => log.IsSuspicious);

            // Calculate score based on success rate and suspicious activity
            double successRate = (double)successfulRequests / totalRequests;
            double suspiciousRate = (double)suspiciousRequests / totalRequests;

            double score = (successRate * 70) + ((1 - suspiciousRate) * 30);
            double finalScore = Math.Round(score, 2);
            
            _logger.LogInformation($"[SecurityScore] Calculated score: {finalScore} (success: {successRate:P}, suspicious: {suspiciousRate:P})");
            
            return finalScore; // Score should be 0-100, not 0-10000
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating security score");
            return 50.0; // Default score on error
        }
    }

    public async Task<bool> DetectSuspiciousActivityAsync(int userId, string ipAddress)
    {
        try
        {
            DateTime lastHour = DateTime.UtcNow.AddHours(-1);
            
            int recentActivity = await _securityMonitoringRepository.GetRecentActivityAsync(lastHour, userId, ipAddress);

            // Consider suspicious if more than 100 requests in last hour
            return recentActivity > 100;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error detecting suspicious activity");
            return false;
        }
    }

    public async Task<List<UserActivityDTO>> GetSuspiciousUsersAsync(int limit = 10)
    {
        try
        {
            DateTime yesterday = DateTime.UtcNow.AddDays(-1);
            
            List<UserActivityDTO> suspiciousUsers = await _securityMonitoringRepository.GetSuspiciousUsersAsync(yesterday, limit);

            return suspiciousUsers;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting suspicious users");
            return new List<UserActivityDTO>();
        }
    }

    // Helper methods
    private string GetSecurityStatus(double score)
    {
        return score switch
        {
            >= 90 => "Excellent",
            >= 80 => "Good",
            >= 70 => "Fair",
            >= 60 => "Poor",
            _ => "Critical"
        };
    }

    private List<SecurityFeatureDTO> GetEnabledSecurityFeatures()
    {
        return new List<SecurityFeatureDTO>
        {
            new SecurityFeatureDTO { 
                Name = "Content Security Policy", 
                Enabled = true, 
                Status = "active",
                Description = "Prevents XSS attacks by controlling resource loading"
            },
            new SecurityFeatureDTO { 
                Name = "CSRF Protection", 
                Enabled = true, 
                Status = "active",
                Description = "Protects against Cross-Site Request Forgery attacks"
            },
            new SecurityFeatureDTO { 
                Name = "Rate Limiting", 
                Enabled = true, 
                Status = "active",
                Description = "Controls API request frequency to prevent abuse"
            },
            new SecurityFeatureDTO { 
                Name = "Security Auditing", 
                Enabled = true, 
                Status = "active",
                Description = "Comprehensive logging of security events"
            },
            new SecurityFeatureDTO { 
                Name = "XSS Protection", 
                Enabled = true, 
                Status = "active",
                Description = "Browser-level protection against script injection"
            },
            new SecurityFeatureDTO { 
                Name = "Frame Options", 
                Enabled = true, 
                Status = "active",
                Description = "Prevents clickjacking attacks via iframe embedding"
            },
            new SecurityFeatureDTO { 
                Name = "HTTPS Enforcement", 
                Enabled = true, 
                Status = "active",
                Description = "Forces secure connections and encrypts data in transit"
            }
        };
    }

    private List<CircuitBreakerStatusDTO> GetCircuitBreakerStatus()
    {
        try
        {
            var circuitBreakers = CircuitBreaker.GetAll();
            return circuitBreakers.Select(cb => new CircuitBreakerStatusDTO
            {
                Name = cb.Key,
                State = cb.Value.State.ToString(),
                IsOpen = cb.Value.State == CircuitState.Open,
                FailureCount = 0, 
                LastFailure = null,
                NextRetry = null
            }).ToList();
        }
        catch
        {
            return new List<CircuitBreakerStatusDTO>();
        }
    }

    private Task<List<CircuitBreakerStatusDTO>> GetEnhancedCircuitBreakerStatus()
    {
        try
        {
            // Get actual circuit breaker data only
            List<CircuitBreakerStatusDTO> circuitBreakers = GetCircuitBreakerStatus();
            return Task.FromResult(circuitBreakers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting enhanced circuit breaker status");
            return Task.FromResult(new List<CircuitBreakerStatusDTO>());
        }
    }

    private async Task<double> CalculateAverageRequestsPerMinute()
    {
        try
        {
            DateTime lastHour = DateTime.UtcNow.AddHours(-1);
            int requestCount = await _securityMonitoringRepository.GetRecentActivityAsync(lastHour);
            
            return requestCount / 60.0; // Requests per minute over last hour
        }
        catch
        {
            return 0;
        }
    }

    private double? GetLatestMetricValue(List<SystemHealthMetrics> metrics, string metricName)
    {
        return metrics
            .Where(m => m.MetricName == metricName)
            .OrderByDescending(m => m.Timestamp)
            .FirstOrDefault()?.Value;
    }

    private List<HealthCheckDTO> GetHealthChecks()
    {
        // Return empty list - no simulated health checks
        return new List<HealthCheckDTO>();
    }

    private async Task<double> CalculateAverageResponseTimeAsync()
    {
        try
        {
            DateTime yesterday = DateTime.UtcNow.AddDays(-1);
            
            // Extract response times from audit log details, excluding WebSocket and long-running connections
            List<SecurityAuditLog> auditLogs = await _securityMonitoringRepository.GetResponseTimeAuditLogsAsync(yesterday);
            
            if (!auditLogs.Any())
                return 150.0; // Default if no data
            
            List<double> responseTimes = new List<double>();
            
            foreach (SecurityAuditLog log in auditLogs)
            {
                if (log.Details != null && log.Details.Contains("Elapsed:"))
                {
                    // Extract response time from details like "Response: 200, Elapsed: 150ms"
                    System.Text.RegularExpressions.Match match = System.Text.RegularExpressions.Regex.Match(log.Details, @"Elapsed:\s*(\d+(?:\.\d+)?)ms");
                    if (match.Success && double.TryParse(match.Groups[1].Value, out double responseTime))
                    {
                        // Filter out extremely high response times (likely WebSocket connections)
                        if (responseTime <= 10000) // Max 10 seconds for normal API calls
                        {
                            responseTimes.Add(responseTime);
                        }
                    }
                }
            }
            
            return responseTimes.Any() ? Math.Round(responseTimes.Average(), 2) : 150.0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating average response time");
            return 150.0; // Default on error
        }
    }

    private async Task<List<EndpointPerformanceDTO>> GetTopEndpointsAsync()
    {
        try
        {
            DateTime yesterday = DateTime.UtcNow.AddDays(-1);
            
            // Filter out WebSocket and long-running connections for better performance metrics
            List<SecurityAuditLog> auditLogs = await _securityMonitoringRepository.GetTopEndpointsAuditLogsAsync(yesterday);
            
            List<IGrouping<string?, SecurityAuditLog>> endpointGroups = auditLogs.GroupBy(log => log.Resource).ToList();
            
            List<EndpointPerformanceDTO> endpoints = new List<EndpointPerformanceDTO>();
            
            foreach (var group in endpointGroups)
            {
                List<double> responseTimes = new List<double>();
                
                foreach (var log in group)
                {
                    if (log.Details != null && log.Details.Contains("Elapsed:"))
                    {
                        System.Text.RegularExpressions.Match match = System.Text.RegularExpressions.Regex.Match(log.Details, @"Elapsed:\s*(\d+(?:\.\d+)?)ms");
                        if (match.Success && double.TryParse(match.Groups[1].Value, out double responseTime))
                        {
                            // Filter out extremely high response times
                            if (responseTime <= 10000) // Max 10 seconds for normal API calls
                            {
                                responseTimes.Add(responseTime);
                            }
                        }
                    }
                }
                
                endpoints.Add(new EndpointPerformanceDTO
                {
                    Endpoint = group.Key ?? "Unknown",
                    RequestCount = group.Count(),
                    AverageResponseTime = responseTimes.Any() ? Math.Round(responseTimes.Average(), 2) : 150.0,
                    ErrorRate = Math.Round(group.Count(log => !log.IsSuccessful) / (double)group.Count() * 100, 2),
                    LastAccessed = group.Max(log => log.Timestamp)
                });
            }

            return endpoints.OrderByDescending(e => e.RequestCount).Take(10).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting top endpoints");
            return new List<EndpointPerformanceDTO>();
        }
    }

    private async Task<List<UserActivityDTO>> GetTopUsersAsync()
    {
        try
        {
            DateTime yesterday = DateTime.UtcNow.AddDays(-1);
            
            List<UserActivityDTO> users = await _securityMonitoringRepository.GetTopUsersAsync(yesterday, 10);

            return users;
        }
        catch
        {
            return new List<UserActivityDTO>();
        }
    }

    private async Task<List<ResponseTimeMetricDTO>> GetResponseTimeDistributionAsync()
    {
        try
        {
            DateTime yesterday = DateTime.UtcNow.AddDays(-1);
            
            // Filter out WebSocket and long-running connections for better metrics
            List<SecurityAuditLog> auditLogs = await _securityMonitoringRepository.GetResponseTimeAuditLogsAsync(yesterday);
            
            // Group by hour and calculate average response times
            List<ResponseTimeMetricDTO> hourlyData = auditLogs
                .GroupBy(log => new DateTime(log.Timestamp.Year, log.Timestamp.Month, log.Timestamp.Day, log.Timestamp.Hour, 0, 0))
                .Select(group => new ResponseTimeMetricDTO
                {
                    Timestamp = group.Key,
                    RequestCount = group.Count(),
                    AverageTime = Math.Round(group.Select(log =>
                    {
                        if (log.Details != null && log.Details.Contains("Elapsed:"))
                        {
                            System.Text.RegularExpressions.Match match = System.Text.RegularExpressions.Regex.Match(log.Details, @"Elapsed:\s*(\d+(?:\.\d+)?)ms");
                            if (match.Success && double.TryParse(match.Groups[1].Value, out double responseTime))
                            {
                                // Filter out extremely high response times
                                return responseTime <= 10000 ? responseTime : 150.0;
                            }
                        }
                        return 150.0; // Default
                    }).Average(), 2)
                })
                .OrderBy(x => x.Timestamp)
                .ToList();
            
            return hourlyData;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting response time distribution");
            return new List<ResponseTimeMetricDTO>();
        }
    }

    private async Task<List<StatusCodeDistributionDTO>> GetStatusCodeDistributionAsync()
    {
        try
        {
            DateTime yesterday = DateTime.UtcNow.AddDays(-1);
            
            List<SecurityAuditLog> auditLogs = await _securityMonitoringRepository.GetStatusCodeAuditLogsAsync(yesterday);
            
            if (!auditLogs.Any())
                return new List<StatusCodeDistributionDTO>();
            
            Dictionary<int, int> statusCodes = new Dictionary<int, int>();
            
            foreach (var log in auditLogs)
            {
                if (log.Details != null && log.Details.Contains("Response:"))
                {
                    System.Text.RegularExpressions.Match match = System.Text.RegularExpressions.Regex.Match(log.Details, @"Response:\s*(\d+)");
                    if (match.Success && int.TryParse(match.Groups[1].Value, out int statusCode))
                    {
                        statusCodes[statusCode] = statusCodes.GetValueOrDefault(statusCode, 0) + 1;
                    }
                }
            }
            
            int totalRequests = statusCodes.Values.Sum();
            
            return statusCodes.Select(kvp => new StatusCodeDistributionDTO
            {
                StatusCode = kvp.Key,
                Count = kvp.Value,
                Percentage = Math.Round((double)kvp.Value / totalRequests * 100, 2)
            })
            .OrderBy(x => x.StatusCode)
            .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting status code distribution");
            return new List<StatusCodeDistributionDTO>();
        }
    }

    private async Task<DatabaseMetricsDTO> GetDatabaseMetricsAsync()
    {
        try
        {
            List<SystemHealthMetrics> healthMetrics = await _securityMonitoringRepository.GetSystemHealthMetricsAsync(DateTime.UtcNow.AddHours(-1));
            
            // Return real data only - no sample data generation
            return new DatabaseMetricsDTO
            {
                ConnectionCount = (int)(GetLatestMetricValue(healthMetrics, "Database_Connections") ?? 0),
                AverageQueryTime = GetLatestMetricValue(healthMetrics, "Average_Query_Time") ?? 0,
                SlowQueries = (int)(GetLatestMetricValue(healthMetrics, "Slow_Queries") ?? 0),
                CacheHitRate = GetLatestMetricValue(healthMetrics, "Cache_Hit_Rate") ?? 0,
                ActiveTransactions = (int)(GetLatestMetricValue(healthMetrics, "Active_Transactions") ?? 0)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting database metrics");
            return new DatabaseMetricsDTO
            {
                ConnectionCount = 0,
                AverageQueryTime = 0,
                SlowQueries = 0,
                CacheHitRate = 0,
                ActiveTransactions = 0
            };
        }
    }

    // Wrapper methods for enhanced security features
    private async Task<FailedLoginSummaryDTO> GetFailedLoginSummaryAsync()
    {
        try
        {
            return await _failedLoginService.GetFailedLoginSummaryAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting failed login summary");
            
            // Return empty summary on error
            return new FailedLoginSummaryDTO
            {
                TotalAttempts = 0,
                UniqueIPs = 0,
                SuspiciousAttempts = 0,
                TopTargetedAccounts = new List<string>(),
                TopAttackingIPs = new List<string>(),
                RecentAttempts = new List<FailedLoginAttemptDTO>()
            };
        }
    }
    
    private async Task<SessionManagementDTO> GetSessionManagementDataAsync()
    {
        try
        {
            return await _sessionManagementService.GetSessionManagementDataAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting session management data");
            
            // Return empty data on error
            return new SessionManagementDTO
            {
                TotalActiveSessions = 0,
                MaxConcurrentSessions = 5,
                DefaultSessionTimeout = TimeSpan.FromMinutes(120),
                ActiveSessions = new List<UserSessionDTO>(),
                RecentSessions = new List<UserSessionDTO>(),
                SecuritySummary = new SessionSecuritySummaryDTO()
            };
        }
    }
    
    private async Task<IPGeolocationSummaryDTO> GetGeolocationSummaryAsync()
    {
        try
        {
            return await _geolocationService.GetGeolocationSummaryAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting geolocation summary");
            
            // Return empty summary on error
            return new IPGeolocationSummaryDTO
            {
                TotalUniqueIPs = 0,
                SuspiciousIPs = 0,
                BlockedCountriesCount = 0,
                AllowedCountries = new List<string>(),
                BlockedCountries = new List<string>(),
                RecentAccess = new List<GeolocationAccessDTO>()
            };
        }
    }

    public async Task<SecurityMonitoringSummaryDTO> GetSecurityMonitoringSummaryAsync()
    {
        try
        {
            DateTime yesterday = DateTime.UtcNow.AddDays(-1);
            
            // Get all security events from audit logs only (SecurityAlerts table doesn't exist)
            List<SecurityAuditLog> auditLogs = await _securityMonitoringRepository.GetAllSecurityAuditLogsAsync(yesterday);
            
            // Calculate event statistics based on audit logs only
            int totalEvents = auditLogs.Count;
            int criticalEvents = auditLogs.Count(log => log.Severity == "Critical");
            int highRiskEvents = auditLogs.Count(log => log.IsSuspicious || log.Severity == "High");
            int resolvedEvents = auditLogs.Count(log => log.IsSuccessful);
            
            // Calculate average resolution time based on successful vs failed events
            List<SecurityAuditLog> failedEvents = auditLogs.Where(log => !log.IsSuccessful).ToList();
            List<SecurityAuditLog> successfulEvents = auditLogs.Where(log => log.IsSuccessful).ToList();
            TimeSpan averageResolutionTime = TimeSpan.Zero;
            
            if (failedEvents.Any() && successfulEvents.Any())
            {
                // Estimate resolution time as the average time between failed and successful events
                double avgFailedTime = failedEvents.Average(log => log.Timestamp.Ticks);
                double avgSuccessfulTime = successfulEvents.Average(log => log.Timestamp.Ticks);
                double timeDifference = Math.Abs(avgSuccessfulTime - avgFailedTime);
                averageResolutionTime = TimeSpan.FromTicks((long)timeDifference);
            }
            
            // Group events by type
            List<SecurityEventTypeStatDTO> eventsByType = auditLogs
                .GroupBy(log => log.EventType)
                .Select(group => new SecurityEventTypeStatDTO
                {
                    EventType = group.Key,
                    Count = group.Count(),
                    Percentage = totalEvents > 0 ? Math.Round((double)group.Count() / totalEvents * 100, 2) : 0
                })
                .OrderByDescending(stat => stat.Count)
                .ToList();
            
            // Group events by severity
            List<SecurityEventSeverityStatDTO> eventsBySeverity = auditLogs
                .Where(log => !string.IsNullOrEmpty(log.Severity))
                .GroupBy(log => log.Severity!)
                .Select(group => new SecurityEventSeverityStatDTO
                {
                    Severity = group.Key,
                    Count = group.Count(),
                    Percentage = totalEvents > 0 ? Math.Round((double)group.Count() / totalEvents * 100, 2) : 0
                })
                .OrderByDescending(stat => stat.Count)
                .ToList();
            
            // Get recent events (last 20)
            List<SecurityMonitoringEventDTO> recentEvents = auditLogs
                .OrderByDescending(log => log.Timestamp)
                .Take(20)
                .Select(log => new SecurityMonitoringEventDTO
                {
                    Id = log.Id,
                    EventType = log.EventType,
                    Severity = log.Severity ?? "Info",
                    Description = log.Action,
                    Source = log.Resource ?? "System",
                    Timestamp = log.Timestamp,
                    UserId = log.UserId,
                    Username = log.Username,
                    IpAddress = log.IpAddress,
                    UserAgent = log.UserAgent,
                    Metadata = log.Details,
                    IsResolved = log.IsSuccessful,
                    ResolvedAt = log.IsSuccessful ? log.Timestamp : null,
                    ResolvedBy = log.IsSuccessful ? "System" : null
                })
                .ToList();
            
            SecurityMonitoringSummaryDTO summary = new SecurityMonitoringSummaryDTO
            {
                TotalEvents = totalEvents,
                CriticalEvents = criticalEvents,
                HighRiskEvents = highRiskEvents,
                ResolvedEvents = resolvedEvents,
                AverageResolutionTime = averageResolutionTime.ToString(@"hh\:mm\:ss"),
                EventsByType = eventsByType,
                EventsBySeverity = eventsBySeverity,
                RecentEvents = recentEvents
            };
            
            _logger.LogInformation($"[SecurityMonitoring] Summary generated: {totalEvents} total events, {criticalEvents} critical, {highRiskEvents} high-risk");
            
            return summary;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting security monitoring summary");
            
            // Return empty summary on error
            return new SecurityMonitoringSummaryDTO
            {
                TotalEvents = 0,
                CriticalEvents = 0,
                HighRiskEvents = 0,
                ResolvedEvents = 0,
                AverageResolutionTime = "00:00:00",
                EventsByType = new List<SecurityEventTypeStatDTO>(),
                EventsBySeverity = new List<SecurityEventSeverityStatDTO>(),
                RecentEvents = new List<SecurityMonitoringEventDTO>()
            };
        }
    }
} 