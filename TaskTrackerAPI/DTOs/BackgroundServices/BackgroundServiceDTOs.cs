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
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.BackgroundServices
{
    /// <summary>
    /// DTO for background service status information
    /// </summary>
    public class BackgroundServiceStatusDTO
    {
        public string ServiceName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; // Running, Stopped, Error, Idle
        public string? Message { get; set; }
        public DateTime? LastRun { get; set; }
        public DateTime? NextRun { get; set; }
        public bool IsHealthy { get; set; }
        public int ExecutionCount { get; set; }
        public int SuccessCount { get; set; }
        public int ErrorCount { get; set; }
        public double SuccessRate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    /// <summary>
    /// DTO for recording background service execution details
    /// </summary>
    public class BackgroundServiceExecutionDTO
    {
        public int Id { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public DateTime ExecutionTime { get; set; }
        public bool Success { get; set; }
        public string? Details { get; set; }
        public int? RecordsProcessed { get; set; }
        public TimeSpan? Duration { get; set; }
        public string? ErrorMessage { get; set; }
    }

    /// <summary>
    /// DTO for system maintenance notifications
    /// </summary>
    public class SystemMaintenanceNotificationDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // Scheduled, Emergency, Completed
        public string Priority { get; set; } = string.Empty; // Low, Medium, High, Critical
        public DateTime? ScheduledStart { get; set; }
        public DateTime? ScheduledEnd { get; set; }
        public bool IsActive { get; set; }
        public string? AffectedServices { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    /// <summary>
    /// DTO for creating system maintenance notifications
    /// </summary>
    public class CreateMaintenanceNotificationDTO
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(1000)]
        public string Message { get; set; } = string.Empty;
        
        [Required]
        public string Type { get; set; } = string.Empty;
        
        [Required]
        public string Priority { get; set; } = string.Empty;
        
        public DateTime? ScheduledStart { get; set; }
        public DateTime? ScheduledEnd { get; set; }
        public string? AffectedServices { get; set; }
    }

    /// <summary>
    /// DTO for system optimization recommendations
    /// </summary>
    public class SystemOptimizationRecommendationDTO
    {
        public int Id { get; set; }
        public string Category { get; set; } = string.Empty; // Performance, Security, Maintenance, Resource
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Recommendation { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty; // Low, Medium, High, Critical
        public string Impact { get; set; } = string.Empty; // Low, Medium, High
        public bool IsImplemented { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ImplementedAt { get; set; }
        public string? ImplementationNotes { get; set; }
    }

    /// <summary>
    /// DTO for background service metrics summary
    /// </summary>
    public class BackgroundServiceMetricsDTO
    {
        public int TotalServices { get; set; }
        public int RunningServices { get; set; }
        public int ErrorServices { get; set; }
        public int IdleServices { get; set; }
        public double OverallSuccessRate { get; set; }
        public int TotalExecutions { get; set; }
        public int SuccessfulExecutions { get; set; }
        public int FailedExecutions { get; set; }
        public DateTime? LastExecutionTime { get; set; }
        public List<ServiceMetricDTO> ServiceMetrics { get; set; } = new List<ServiceMetricDTO>();
        public DateTime GeneratedAt { get; set; }
    }

    /// <summary>
    /// DTO for individual service metrics
    /// </summary>
    public class ServiceMetricDTO
    {
        public string ServiceName { get; set; } = string.Empty;
        public int ExecutionCount { get; set; }
        public int SuccessCount { get; set; }
        public int ErrorCount { get; set; }
        public double SuccessRate { get; set; }
        public TimeSpan? AverageExecutionTime { get; set; }
        public DateTime? LastExecution { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for priority adjustment notifications from background services
    /// </summary>
    public class PriorityAdjustmentNotificationDTO
    {
        public int UserId { get; set; }
        public int TaskId { get; set; }
        public string TaskTitle { get; set; } = string.Empty;
        public string PreviousPriority { get; set; } = string.Empty;
        public string NewPriority { get; set; } = string.Empty;
        public string AdjustmentReason { get; set; } = string.Empty;
        public DateTime AdjustmentTime { get; set; }
        public bool UserCanOverride { get; set; } = true;
    }

    /// <summary>
    /// DTO for system health check results from background services
    /// </summary>
    public class BackgroundServiceHealthCheckDTO
    {
        public string ServiceName { get; set; } = string.Empty;
        public string HealthStatus { get; set; } = string.Empty; // Healthy, Degraded, Unhealthy
        public string? HealthMessage { get; set; }
        public Dictionary<string, object> HealthData { get; set; } = new Dictionary<string, object>();
        public DateTime CheckTime { get; set; }
        public TimeSpan? ResponseTime { get; set; }
    }
} 