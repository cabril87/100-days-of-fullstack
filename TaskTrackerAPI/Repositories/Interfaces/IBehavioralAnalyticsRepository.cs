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
using TaskTrackerAPI.Models.Security;

namespace TaskTrackerAPI.Repositories.Interfaces
{
    /// <summary>
    /// Repository interface for behavioral analytics data management and analysis
    /// </summary>
    public interface IBehavioralAnalyticsRepository
    {
        // Core behavioral analytics data operations
        
        /// <summary>
        /// Creates a new behavioral analytics record
        /// </summary>
        Task<BehavioralAnalytics> CreateBehavioralAnalyticsAsync(BehavioralAnalytics behavioralAnalytics);
        
        /// <summary>
        /// Gets behavioral analytics records within a date range
        /// </summary>
        Task<IEnumerable<BehavioralAnalytics>> GetBehavioralAnalyticsAsync(DateTime from, DateTime to, int limit = 1000);
        
        /// <summary>
        /// Gets recent behavioral analytics records for the last specified number of days
        /// </summary>
        Task<IEnumerable<BehavioralAnalytics>> GetRecentBehavioralAnalyticsAsync(int daysBack = 7, int limit = 1000);
        
        /// <summary>
        /// Gets behavioral analytics records for a specific user
        /// </summary>
        Task<IEnumerable<BehavioralAnalytics>> GetUserBehavioralAnalyticsAsync(int userId, DateTime? from = null, DateTime? to = null, int limit = 100);
        
        /// <summary>
        /// Gets all anomalous activities ordered by anomaly score
        /// </summary>
        Task<IEnumerable<BehavioralAnalytics>> GetAnomalousActivitiesAsync(int limit = 20);
        
        /// <summary>
        /// Gets high-risk activities (critical and high risk levels)
        /// </summary>
        Task<IEnumerable<BehavioralAnalytics>> GetHighRiskActivitiesAsync(int limit = 50);
        
        /// <summary>
        /// Gets off-hours activities
        /// </summary>
        Task<IEnumerable<BehavioralAnalytics>> GetOffHoursActivitiesAsync(int limit = 50);
        
        /// <summary>
        /// Gets activities from new locations
        /// </summary>
        Task<IEnumerable<BehavioralAnalytics>> GetNewLocationAccessAsync(int limit = 50);
        
        /// <summary>
        /// Gets activities from new devices
        /// </summary>
        Task<IEnumerable<BehavioralAnalytics>> GetNewDeviceAccessAsync(int limit = 50);
        
        /// <summary>
        /// Gets high-velocity activities
        /// </summary>
        Task<IEnumerable<BehavioralAnalytics>> GetHighVelocityActivitiesAsync(int limit = 50);
        
        // User behavior analysis methods
        
        /// <summary>
        /// Gets user behavior statistics for summary purposes
        /// </summary>
        Task<(int TotalActivities, int AnomalousActivities, double AverageAnomalyScore, DateTime LastActivity)> GetUserBehaviorStatisticsAsync(int userId, int daysBack = 30);
        
        /// <summary>
        /// Gets user's baseline behavior patterns for a specific action type
        /// </summary>
        Task<IEnumerable<BehavioralAnalytics>> GetUserBaselineBehaviorAsync(int userId, string actionType, int daysBack = 30);
        
        /// <summary>
        /// Gets user's historical locations for location anomaly detection
        /// </summary>
        Task<IEnumerable<(string Country, string City, int Count)>> GetUserHistoricalLocationsAsync(int userId, int daysBack = 90);
        
        /// <summary>
        /// Gets user's historical devices for device anomaly detection
        /// </summary>
        Task<IEnumerable<(string DeviceType, string Browser, int Count)>> GetUserHistoricalDevicesAsync(int userId, int daysBack = 90);
        
        /// <summary>
        /// Gets user's active hours pattern for off-hours detection
        /// </summary>
        Task<IEnumerable<(int Hour, int Count)>> GetUserActiveHoursPatternAsync(int userId, int daysBack = 30);
        
        /// <summary>
        /// Gets user's activity velocity patterns for high-velocity detection
        /// </summary>
        Task<IEnumerable<BehavioralAnalytics>> GetUserActivityVelocityPatternAsync(int userId, DateTime timestamp, int minutesRange = 5);
        
        // Pattern analysis methods
        
        /// <summary>
        /// Gets common behavior patterns across all users
        /// </summary>
        Task<IEnumerable<(string ActionType, string Pattern, int Count, double RiskScore)>> GetCommonBehaviorPatternsAsync(int daysBack = 7, int limit = 10);
        
        /// <summary>
        /// Gets top anomaly reasons with their frequencies
        /// </summary>
        Task<IEnumerable<(string AnomalyReason, int Count)>> GetTopAnomalyReasonsAsync(int daysBack = 7, int limit = 10);
        
        /// <summary>
        /// Gets users with highest anomaly rates
        /// </summary>
        Task<IEnumerable<(int UserId, string Username, int TotalActivities, int AnomalousActivities, double AnomalyPercentage)>> GetTopAnomalousUsersAsync(int daysBack = 7, int limit = 10);
        
        // Data management methods
        
        /// <summary>
        /// Cleans up old behavioral analytics records
        /// </summary>
        Task<int> CleanupOldBehaviorDataAsync(int daysOld = 30);
        
        /// <summary>
        /// Updates the risk level and anomaly status of a behavioral analytics record
        /// </summary>
        Task<bool> UpdateBehaviorRiskAssessmentAsync(int id, string riskLevel, bool isAnomalous, double anomalyScore);
        
        /// <summary>
        /// Bulk inserts behavioral analytics records for performance
        /// </summary>
        Task<int> BulkCreateBehavioralAnalyticsAsync(IEnumerable<BehavioralAnalytics> behavioralAnalytics);
        
        /// <summary>
        /// Gets behavioral analytics statistics for dashboard purposes
        /// </summary>
        Task<(int TotalRecords, int AnomalousRecords, int CriticalRecords, int HighRiskRecords, double AverageAnomalyScore)> GetBehavioralAnalyticsStatisticsAsync(int daysBack = 7);
    }
} 