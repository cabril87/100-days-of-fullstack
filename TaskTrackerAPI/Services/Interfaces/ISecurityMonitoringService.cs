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
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Security;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services.Interfaces;

public interface ISecurityMonitoringService
{
    Task<SecurityDashboardDTO> GetSecurityDashboardAsync();
    Task<SecurityOverviewDTO> GetSecurityOverviewAsync();
    Task<RateLimitStatusDTO> GetRateLimitStatusAsync();
    Task<SystemHealthDTO> GetSystemHealthAsync();
    Task<List<SecurityMetricDTO>> GetSecurityMetricsAsync(DateTime? from = null, DateTime? to = null);
    Task<List<SecurityAuditLogDTO>> GetSecurityAuditLogsAsync(int page = 1, int pageSize = 50, string? severity = null);
    Task<List<SecurityAlertDTO>> GetActiveSecurityAlertsAsync();
    Task<PerformanceMetricsDTO> GetPerformanceMetricsAsync();
    
    // Logging methods
    Task LogSecurityMetricAsync(string metricType, string metricName, double value, string? description = null, string? source = null, string? severity = null);
    Task LogSecurityAuditAsync(string eventType, string action, string? ipAddress = null, string? userAgent = null, int? userId = null, string? username = null, string? resource = null, string? severity = null, string? details = null, string? status = null, bool isSuccessful = true, bool isSuspicious = false);
    Task LogSystemHealthMetricAsync(string metricName, double value, string? unit = null, string? category = null, string? description = null, bool isHealthy = true, double? thresholdWarning = null, double? thresholdCritical = null);
    
    // Alert methods
    Task CreateSecurityAlertAsync(string type, string title, string description, string severity, string? source = null, string? recommendedAction = null);
    Task ResolveSecurityAlertAsync(int alertId, string resolvedBy);
    
    // Cleanup methods
    Task<int> ClearSecurityAuditLogsAsync(DateTime? olderThan = null);
    Task<int> ClearSecurityMetricsAsync(DateTime? olderThan = null);
    Task<int> ClearAllSecurityLogsAsync();
    
    // Analysis methods
    Task<double> CalculateSecurityScoreAsync();
    Task<bool> DetectSuspiciousActivityAsync(int userId, string ipAddress);
    Task<List<UserActivityDTO>> GetSuspiciousUsersAsync(int limit = 10);
    
    // Security Monitoring methods
    Task<SecurityMonitoringSummaryDTO> GetSecurityMonitoringSummaryAsync();
    
    // Device management methods
    Task<List<UserDeviceDTO>> GetUserDevicesAsync(int userId);
    Task UpdateDeviceTrustAsync(int userId, string deviceId, bool trusted, string? deviceName = null);
    Task RemoveDeviceAsync(int userId, string deviceId);

    // User Security Settings methods
    Task<UserSecuritySettingsDTO> GetUserSecuritySettingsAsync(int userId);
    Task<UserSecuritySettingsDTO> CreateUserSecuritySettingsAsync(int userId, UserSecuritySettingsCreateDTO createDto);
    Task<UserSecuritySettingsDTO> UpdateUserSecuritySettingsAsync(int userId, UserSecuritySettingsUpdateDTO updateDto);
    Task<bool> DeleteUserSecuritySettingsAsync(int userId);
    
    // User Activity Log methods
    Task<bool> DeleteUserActivityLogAsync(int userId);
} 