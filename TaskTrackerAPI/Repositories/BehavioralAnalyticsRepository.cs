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
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models.Security;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories
{
    /// <summary>
    /// Repository implementation for behavioral analytics data management and analysis
    /// </summary>
    public class BehavioralAnalyticsRepository : IBehavioralAnalyticsRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<BehavioralAnalyticsRepository> _logger;

        public BehavioralAnalyticsRepository(ApplicationDbContext context, ILogger<BehavioralAnalyticsRepository> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<BehavioralAnalytics> CreateBehavioralAnalyticsAsync(BehavioralAnalytics behavioralAnalytics)
        {
            try
            {
                _context.BehavioralAnalytics.Add(behavioralAnalytics);
                await _context.SaveChangesAsync();
                return behavioralAnalytics;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating behavioral analytics record for user {UserId}", behavioralAnalytics.UserId);
                throw;
            }
        }

        public async Task<IEnumerable<BehavioralAnalytics>> GetBehavioralAnalyticsAsync(DateTime from, DateTime to, int limit = 1000)
        {
            try
            {
                return await _context.BehavioralAnalytics
                    .Where(ba => ba.Timestamp >= from && ba.Timestamp <= to)
                    .OrderByDescending(ba => ba.Timestamp)
                    .Take(limit)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving behavioral analytics between {From} and {To}", from, to);
                return Enumerable.Empty<BehavioralAnalytics>();
            }
        }

        public async Task<IEnumerable<BehavioralAnalytics>> GetRecentBehavioralAnalyticsAsync(int daysBack = 7, int limit = 1000)
        {
            try
            {
                DateTime cutoffDate = DateTime.UtcNow.AddDays(-daysBack);
                return await _context.BehavioralAnalytics
                    .Where(ba => ba.Timestamp >= cutoffDate)
                    .OrderByDescending(ba => ba.Timestamp)
                    .Take(limit)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recent behavioral analytics for last {DaysBack} days", daysBack);
                return Enumerable.Empty<BehavioralAnalytics>();
            }
        }

        public async Task<IEnumerable<BehavioralAnalytics>> GetUserBehavioralAnalyticsAsync(int userId, DateTime? from = null, DateTime? to = null, int limit = 100)
        {
            try
            {
                IQueryable<BehavioralAnalytics> query = _context.BehavioralAnalytics.Where(ba => ba.UserId == userId);

                if (from.HasValue)
                    query = query.Where(ba => ba.Timestamp >= from.Value);

                if (to.HasValue)
                    query = query.Where(ba => ba.Timestamp <= to.Value);

                return await query
                    .OrderByDescending(ba => ba.Timestamp)
                    .Take(limit)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving behavioral analytics for user {UserId}", userId);
                return Enumerable.Empty<BehavioralAnalytics>();
            }
        }

        public async Task<IEnumerable<BehavioralAnalytics>> GetAnomalousActivitiesAsync(int limit = 20)
        {
            try
            {
                return await _context.BehavioralAnalytics
                    .Where(ba => ba.IsAnomalous)
                    .OrderByDescending(ba => ba.AnomalyScore)
                    .ThenByDescending(ba => ba.Timestamp)
                    .Take(limit)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving anomalous activities");
                return Enumerable.Empty<BehavioralAnalytics>();
            }
        }

        public async Task<IEnumerable<BehavioralAnalytics>> GetHighRiskActivitiesAsync(int limit = 50)
        {
            try
            {
                return await _context.BehavioralAnalytics
                    .Where(ba => ba.RiskLevel == "Critical" || ba.RiskLevel == "High")
                    .OrderByDescending(ba => ba.AnomalyScore)
                    .ThenByDescending(ba => ba.Timestamp)
                    .Take(limit)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving high-risk activities");
                return Enumerable.Empty<BehavioralAnalytics>();
            }
        }

        public async Task<IEnumerable<BehavioralAnalytics>> GetOffHoursActivitiesAsync(int limit = 50)
        {
            try
            {
                return await _context.BehavioralAnalytics
                    .Where(ba => ba.IsOffHours)
                    .OrderByDescending(ba => ba.Timestamp)
                    .Take(limit)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving off-hours activities");
                return Enumerable.Empty<BehavioralAnalytics>();
            }
        }

        public async Task<IEnumerable<BehavioralAnalytics>> GetNewLocationAccessAsync(int limit = 50)
        {
            try
            {
                return await _context.BehavioralAnalytics
                    .Where(ba => ba.IsNewLocation)
                    .OrderByDescending(ba => ba.Timestamp)
                    .Take(limit)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving new location access activities");
                return Enumerable.Empty<BehavioralAnalytics>();
            }
        }

        public async Task<IEnumerable<BehavioralAnalytics>> GetNewDeviceAccessAsync(int limit = 50)
        {
            try
            {
                return await _context.BehavioralAnalytics
                    .Where(ba => ba.IsNewDevice)
                    .OrderByDescending(ba => ba.Timestamp)
                    .Take(limit)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving new device access activities");
                return Enumerable.Empty<BehavioralAnalytics>();
            }
        }

        public async Task<IEnumerable<BehavioralAnalytics>> GetHighVelocityActivitiesAsync(int limit = 50)
        {
            try
            {
                return await _context.BehavioralAnalytics
                    .Where(ba => ba.IsHighVelocity)
                    .OrderByDescending(ba => ba.Timestamp)
                    .Take(limit)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving high-velocity activities");
                return Enumerable.Empty<BehavioralAnalytics>();
            }
        }

        public async Task<(int TotalActivities, int AnomalousActivities, double AverageAnomalyScore, DateTime LastActivity)> GetUserBehaviorStatisticsAsync(int userId, int daysBack = 30)
        {
            try
            {
                DateTime cutoffDate = DateTime.UtcNow.AddDays(-daysBack);
                List<BehavioralAnalytics> userBehaviors = await _context.BehavioralAnalytics
                    .Where(ba => ba.UserId == userId && ba.Timestamp >= cutoffDate)
                    .ToListAsync();

                if (!userBehaviors.Any())
                {
                    return (0, 0, 0.0, DateTime.MinValue);
                }

                int totalActivities = userBehaviors.Count;
                int anomalousActivities = userBehaviors.Count(ba => ba.IsAnomalous);
                double averageAnomalyScore = userBehaviors.Average(ba => ba.AnomalyScore);
                DateTime lastActivity = userBehaviors.Max(ba => ba.Timestamp);

                return (totalActivities, anomalousActivities, averageAnomalyScore, lastActivity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user behavior statistics for user {UserId}", userId);
                return (0, 0, 0.0, DateTime.MinValue);
            }
        }

        public async Task<IEnumerable<BehavioralAnalytics>> GetUserBaselineBehaviorAsync(int userId, string actionType, int daysBack = 30)
        {
            try
            {
                DateTime cutoffDate = DateTime.UtcNow.AddDays(-daysBack);
                return await _context.BehavioralAnalytics
                    .Where(ba => ba.UserId == userId && 
                                ba.ActionType == actionType && 
                                ba.Timestamp >= cutoffDate)
                    .OrderBy(ba => ba.Timestamp)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user baseline behavior for user {UserId} and action {ActionType}", userId, actionType);
                return Enumerable.Empty<BehavioralAnalytics>();
            }
        }

        public async Task<IEnumerable<(string Country, string City, int Count)>> GetUserHistoricalLocationsAsync(int userId, int daysBack = 90)
        {
            try
            {
                DateTime cutoffDate = DateTime.UtcNow.AddDays(-daysBack);
                var locations = await _context.BehavioralAnalytics
                    .Where(ba => ba.UserId == userId && 
                                ba.Timestamp >= cutoffDate && 
                                !string.IsNullOrEmpty(ba.Country) && 
                                !string.IsNullOrEmpty(ba.City))
                    .GroupBy(ba => new { ba.Country, ba.City })
                    .Select(g => new { g.Key.Country, g.Key.City, Count = g.Count() })
                    .OrderByDescending(x => x.Count)
                    .ToListAsync();

                return locations.Select(x => (x.Country, x.City, x.Count));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user historical locations for user {UserId}", userId);
                return Enumerable.Empty<(string, string, int)>();
            }
        }

        public async Task<IEnumerable<(string DeviceType, string Browser, int Count)>> GetUserHistoricalDevicesAsync(int userId, int daysBack = 90)
        {
            try
            {
                DateTime cutoffDate = DateTime.UtcNow.AddDays(-daysBack);
                IEnumerable<object> devices = await _context.BehavioralAnalytics
                    .Where(ba => ba.UserId == userId && 
                                ba.Timestamp >= cutoffDate && 
                                !string.IsNullOrEmpty(ba.DeviceType) && 
                                !string.IsNullOrEmpty(ba.Browser))
                    .GroupBy(ba => new { ba.DeviceType, ba.Browser })
                    .Select(g => new { g.Key.DeviceType, g.Key.Browser, Count = g.Count() })
                    .OrderByDescending(x => x.Count)
                    .ToListAsync();

                return devices.Cast<dynamic>().Select(x => ((string)x.DeviceType, (string)x.Browser, (int)x.Count));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user historical devices for user {UserId}", userId);
                return Enumerable.Empty<(string, string, int)>();
            }
        }

        public async Task<IEnumerable<(int Hour, int Count)>> GetUserActiveHoursPatternAsync(int userId, int daysBack = 30)
        {
            try
            {
                DateTime cutoffDate = DateTime.UtcNow.AddDays(-daysBack);
                IEnumerable<object> activeHours = await _context.BehavioralAnalytics
                    .Where(ba => ba.UserId == userId && ba.Timestamp >= cutoffDate)
                    .GroupBy(ba => ba.Timestamp.Hour)
                    .Select(g => new { Hour = g.Key, Count = g.Count() })
                    .OrderBy(x => x.Hour)
                    .ToListAsync();

                return activeHours.Cast<dynamic>().Select(x => ((int)x.Hour, (int)x.Count));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user active hours pattern for user {UserId}", userId);
                return Enumerable.Empty<(int, int)>();
            }
        }

        public async Task<IEnumerable<BehavioralAnalytics>> GetUserActivityVelocityPatternAsync(int userId, DateTime timestamp, int minutesRange = 5)
        {
            try
            {
                DateTime startTime = timestamp.AddMinutes(-minutesRange);
                DateTime endTime = timestamp.AddMinutes(minutesRange);

                return await _context.BehavioralAnalytics
                    .Where(ba => ba.UserId == userId && 
                                ba.Timestamp >= startTime && 
                                ba.Timestamp <= endTime)
                    .OrderBy(ba => ba.Timestamp)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user activity velocity pattern for user {UserId} around {Timestamp}", userId, timestamp);
                return Enumerable.Empty<BehavioralAnalytics>();
            }
        }

        public async Task<IEnumerable<(string ActionType, string Pattern, int Count, double RiskScore)>> GetCommonBehaviorPatternsAsync(int daysBack = 7, int limit = 10)
        {
            try
            {
                DateTime cutoffDate = DateTime.UtcNow.AddDays(-daysBack);
                var patterns = await _context.BehavioralAnalytics
                    .Where(ba => ba.Timestamp >= cutoffDate && !string.IsNullOrEmpty(ba.BehaviorMetadata))
                    .GroupBy(ba => new { ba.ActionType, Pattern = ba.BehaviorMetadata })
                    .Select(g => new 
                    { 
                        ActionType = g.Key.ActionType, 
                        Pattern = g.Key.Pattern, 
                        Count = g.Count(),
                        RiskScore = g.Average(ba => ba.AnomalyScore)
                    })
                    .OrderByDescending(x => x.Count)
                    .Take(limit)
                    .ToListAsync();

                return patterns.Select(x => (x.ActionType, x.Pattern, x.Count, x.RiskScore));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving common behavior patterns");
                return Enumerable.Empty<(string, string, int, double)>();
            }
        }

        public async Task<IEnumerable<(string AnomalyReason, int Count)>> GetTopAnomalyReasonsAsync(int daysBack = 7, int limit = 10)
        {
            try
            {
                DateTime cutoffDate = DateTime.UtcNow.AddDays(-daysBack);
                var reasons = await _context.BehavioralAnalytics
                    .Where(ba => ba.Timestamp >= cutoffDate && 
                                ba.IsAnomalous && 
                                !string.IsNullOrEmpty(ba.AnomalyReason))
                    .GroupBy(ba => ba.AnomalyReason)
                    .Select(g => new { AnomalyReason = g.Key, Count = g.Count() })
                    .OrderByDescending(x => x.Count)
                    .Take(limit)
                    .ToListAsync();

                return reasons.Select(x => (x.AnomalyReason, x.Count));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving top anomaly reasons");
                return Enumerable.Empty<(string, int)>();
            }
        }

        public async Task<IEnumerable<(int UserId, string Username, int TotalActivities, int AnomalousActivities, double AnomalyPercentage)>> GetTopAnomalousUsersAsync(int daysBack = 7, int limit = 10)
        {
            try
            {
                DateTime cutoffDate = DateTime.UtcNow.AddDays(-daysBack);
                var users = await _context.BehavioralAnalytics
                    .Where(ba => ba.Timestamp >= cutoffDate)
                    .GroupBy(ba => new { ba.UserId, ba.Username })
                    .Select(g => new 
                    { 
                        g.Key.UserId, 
                        g.Key.Username,
                        TotalActivities = g.Count(),
                        AnomalousActivities = g.Count(ba => ba.IsAnomalous)
                    })
                    .Where(x => x.TotalActivities > 0)
                    .OrderByDescending(x => (double)x.AnomalousActivities / x.TotalActivities)
                    .Take(limit)
                    .ToListAsync();

                return users.Select(x => 
                    (x.UserId, x.Username, x.TotalActivities, x.AnomalousActivities, 
                     (double)x.AnomalousActivities / x.TotalActivities * 100));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving top anomalous users");
                return Enumerable.Empty<(int, string, int, int, double)>();
            }
        }

        public async Task<int> CleanupOldBehaviorDataAsync(int daysOld = 30)
        {
            try
            {
                DateTime cutoffDate = DateTime.UtcNow.AddDays(-daysOld);
                List<BehavioralAnalytics> oldRecords = await _context.BehavioralAnalytics
                    .Where(ba => ba.Timestamp < cutoffDate)
                    .ToListAsync();

                if (oldRecords.Any())
                {
                    _context.BehavioralAnalytics.RemoveRange(oldRecords);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Cleaned up {Count} old behavioral analytics records older than {DaysOld} days", oldRecords.Count, daysOld);
                }

                return oldRecords.Count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up old behavior data");
                return 0;
            }
        }

        public async Task<bool> UpdateBehaviorRiskAssessmentAsync(int id, string riskLevel, bool isAnomalous, double anomalyScore)
        {
            try
            {
                BehavioralAnalytics? record = await _context.BehavioralAnalytics.FindAsync(id);
                if (record == null)
                {
                    return false;
                }

                record.RiskLevel = riskLevel;
                record.IsAnomalous = isAnomalous;
                record.AnomalyScore = anomalyScore;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating behavior risk assessment for record {Id}", id);
                return false;
            }
        }

        public async Task<int> BulkCreateBehavioralAnalyticsAsync(IEnumerable<BehavioralAnalytics> behavioralAnalytics)
        {
            try
            {
                List<BehavioralAnalytics> analyticsToAdd = behavioralAnalytics.ToList();
                if (!analyticsToAdd.Any())
                {
                    return 0;
                }

                _context.BehavioralAnalytics.AddRange(analyticsToAdd);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Bulk created {Count} behavioral analytics records", analyticsToAdd.Count);
                return analyticsToAdd.Count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error bulk creating behavioral analytics records");
                return 0;
            }
        }

        public async Task<(int TotalRecords, int AnomalousRecords, int CriticalRecords, int HighRiskRecords, double AverageAnomalyScore)> GetBehavioralAnalyticsStatisticsAsync(int daysBack = 7)
        {
            try
            {
                DateTime cutoffDate = DateTime.UtcNow.AddDays(-daysBack);
                List<BehavioralAnalytics> records = await _context.BehavioralAnalytics
                    .Where(ba => ba.Timestamp >= cutoffDate)
                    .ToListAsync();

                if (!records.Any())
                {
                    return (0, 0, 0, 0, 0.0);
                }

                int totalRecords = records.Count;
                int anomalousRecords = records.Count(ba => ba.IsAnomalous);
                int criticalRecords = records.Count(ba => ba.RiskLevel == "Critical");
                int highRiskRecords = records.Count(ba => ba.RiskLevel == "High");
                double averageAnomalyScore = records.Average(ba => ba.AnomalyScore);

                return (totalRecords, anomalousRecords, criticalRecords, highRiskRecords, averageAnomalyScore);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving behavioral analytics statistics");
                return (0, 0, 0, 0, 0.0);
            }
        }
    }
} 